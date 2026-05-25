const express = require('express')
const multer = require('multer')
const router = express.Router()
const supabase = require('../supabase')
const requireAuth = require('../middleware/auth')

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/zip',
      'image/jpeg',
      'image/png',
    ]

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Only PDF, PPT, DOC, ZIP and images are allowed'), false)
    }
  },
})

const MATERIAL_SELECT = `
  *,
  subjects (
    id,
    name,
    code,
    year,
    semester,
    departments ( id, name, code )
  ),
  profiles ( name, roll_number )
`

async function getSubjectIds({ department_id, year, semester }) {
  if (!department_id && !year && !semester) return null

  let query = supabase.from('subjects').select('id')
  if (department_id) query = query.eq('department_id', department_id)
  if (year) query = query.eq('year', parseInt(year, 10))
  if (semester) query = query.eq('semester', parseInt(semester, 10))

  const { data, error } = await query
  if (error) throw error
  return data.map((subject) => subject.id)
}

router.get('/', async (req, res) => {
  const {
    department_id,
    year,
    semester,
    subject_id,
    material_type,
    search,
    limit,
  } = req.query

  try {
    const subjectIds = subject_id
      ? [subject_id]
      : await getSubjectIds({ department_id, year, semester })

    if (subjectIds && subjectIds.length === 0) {
      return res.json([])
    }

    let query = supabase
      .from('materials')
      .select(MATERIAL_SELECT)
      .eq('is_approved', true)
      .order('created_at', { ascending: false })

    if (subjectIds) query = query.in('subject_id', subjectIds)
    if (material_type) query = query.eq('material_type', material_type)
    if (search) query = query.ilike('title', `%${search}%`)
    if (limit) query = query.limit(Math.min(parseInt(limit, 10) || 20, 50))

    const { data, error } = await query

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    res.json(data)
  } catch (err) {
    console.error('Materials list error:', err)
    res.status(500).json({ error: 'Could not load materials' })
  }
})

router.get('/my-uploads', requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from('materials')
    .select(MATERIAL_SELECT)
    .eq('uploader_id', req.user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.json(data)
})

router.post('/upload', requireAuth, upload.single('file'), async (req, res) => {
  const { subject_id, title, description, material_type, anonymous } = req.body
  const file = req.file

  if (!file) {
    return res.status(400).json({ error: 'Please select a file to upload' })
  }

  if (!subject_id || !title || !material_type) {
    return res.status(400).json({ error: 'subject_id, title and material_type are required' })
  }

  const fileExt = file.originalname.split('.').pop().toLowerCase()
  const safeName = file.originalname
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-z0-9_-]+/gi, '-')
    .slice(0, 60)
  const filePath = `${subject_id}/${req.user.id}-${Date.now()}-${safeName}.${fileExt}`

  const { error: storageError } = await supabase.storage
    .from('materials')
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    })

  if (storageError) {
    return res.status(500).json({ error: storageError.message })
  }

  const { data: urlData } = supabase.storage
    .from('materials')
    .getPublicUrl(filePath)

  const { data: profile } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', req.user.id)
    .single()

  const { data, error } = await supabase
    .from('materials')
    .insert({
      subject_id,
      uploader_id: req.user.id,
      uploader_name: anonymous === 'true' ? 'Anonymous' : profile?.name || 'Anonymous',
      title,
      description,
      material_type,
      file_url: urlData.publicUrl,
      file_path: filePath,
      file_size: file.size,
      file_type: fileExt,
      is_approved: true,
      downloads: 0,
    })
    .select(MATERIAL_SELECT)
    .single()

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.json(data)
})

router.patch('/:id/download', requireAuth, async (req, res) => {
  const { id } = req.params

  const { error: rpcError } = await supabase.rpc('increment_downloads', { material_id: id })

  if (rpcError) {
    const { data: material } = await supabase
      .from('materials')
      .select('downloads')
      .eq('id', id)
      .single()

    await supabase
      .from('materials')
      .update({ downloads: Number(material?.downloads || 0) + 1 })
      .eq('id', id)
  }

  await supabase
    .from('download_history')
    .insert({
      material_id: id,
      user_id: req.user.id,
    })

  res.json({ success: true })
})

router.get('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('materials')
    .select(MATERIAL_SELECT)
    .eq('id', req.params.id)
    .single()

  if (error) {
    return res.status(404).json({ error: error.message })
  }

  if (data?.id) {
    await supabase
      .from('materials')
      .update({ views: Number(data.views || 0) + 1 })
      .eq('id', data.id)
  }

  res.json(data)
})

module.exports = router
