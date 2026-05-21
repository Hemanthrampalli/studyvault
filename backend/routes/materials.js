// routes/materials.js
// Handles listing, uploading and download tracking of materials

const express = require('express')
const router = express.Router()
const supabase = require('../supabase')
const multer = require('multer')
const requireAuth = require('../middleware/auth')

// multer setup
// memoryStorage = file stays in RAM temporarily
// We then send it straight to Supabase Storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max file size

  // fileFilter runs for every upload
  // cb(null, true) = accept the file
  // cb(error, false) = reject the file
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/zip',
      'image/jpeg',
      'image/png'
    ]
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Only PDF, PPT, DOC, ZIP and images are allowed'), false)
    }
  }
})

// ─── LIST MATERIALS ───────────────────────────────────────────
// GET /api/materials?subject_id=xxx
// Public — anyone can view the list
router.get('/', async (req, res) => {
  const { subject_id } = req.query

  if (!subject_id) {
    return res.status(400).json({ error: 'subject_id is required' })
  }

  const { data, error } = await supabase
    .from('materials')
    .select(`
      *,
      profiles ( name, roll_number )
    `)
    .eq('subject_id', subject_id)
    .eq('is_approved', true)  // only show approved files
    .order('created_at', { ascending: false })  // newest first

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// ─── UPLOAD MATERIAL ──────────────────────────────────────────
// POST /api/materials/upload
// requireAuth runs first → checks login → then upload.single runs → then our function
router.post('/upload', requireAuth, upload.single('file'), async (req, res) => {
  const { subject_id, title, description, material_type } = req.body
  const file = req.file  // multer puts the uploaded file here

  // Validation
  if (!file) {
    return res.status(400).json({ error: 'Please select a file to upload' })
  }
  if (!subject_id || !title || !material_type) {
    return res.status(400).json({ error: 'subject_id, title and material_type are required' })
  }

  // Build unique file path inside storage bucket
  // Format: subjectId/userId-timestamp.extension
  // This guarantees no two files ever have the same path
  const fileExt = file.originalname.split('.').pop().toLowerCase()
  const filePath = `${subject_id}/${req.user.id}-${Date.now()}.${fileExt}`

  // Upload file buffer to Supabase Storage
  const { error: storageError } = await supabase.storage
    .from('materials')
    .upload(filePath, file.buffer, {
      contentType: file.mimetype
    })

  if (storageError) {
    return res.status(500).json({ error: storageError.message })
  }

  // Get public download URL for this file
  const { data: urlData } = supabase.storage
    .from('materials')
    .getPublicUrl(filePath)

  // Get uploader's name from their profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', req.user.id)
    .single()

  // Save all metadata to materials table in database
  const { data, error } = await supabase
    .from('materials')
    .insert({
      subject_id,
      uploader_id:   req.user.id,
      uploader_name: profile?.name || 'Anonymous',
      title,
      description,
      material_type,
      file_url:  urlData.publicUrl,
      file_path: filePath,
      file_size: file.size,
      file_type: fileExt
    })
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// ─── TRACK DOWNLOAD ───────────────────────────────────────────
// PATCH /api/materials/:id/download
// Called when user clicks download button
router.patch('/:id/download', requireAuth, async (req, res) => {
  const { id } = req.params

  // Increment the downloads counter
  await supabase.rpc('increment_downloads', { material_id: id })

  // Save to download history
  await supabase
    .from('download_history')
    .insert({
      material_id: id,
      user_id: req.user.id
    })

  res.json({ success: true })
})

module.exports = router