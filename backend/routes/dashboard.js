const express = require('express')
const router = express.Router()
const supabase = require('../supabase')
const requireAuth = require('../middleware/auth')

router.get('/', requireAuth, async (req, res) => {
  try {
    const [
      profileResult,
      myUploadsResult,
      recentMaterialsResult,
      materialCountResult,
      subjectCountResult,
    ] = await Promise.all([
      supabase
        .from('profiles')
        .select('*, departments(name, code)')
        .eq('id', req.user.id)
        .single(),
      supabase
        .from('materials')
        .select('*, subjects(name, code, year, semester, departments(name, code))')
        .eq('uploader_id', req.user.id)
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('materials')
        .select('*, subjects(name, code, year, semester, departments(name, code)), profiles(name, roll_number)')
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .limit(6),
      supabase
        .from('materials')
        .select('id', { count: 'exact', head: true })
        .eq('is_approved', true),
      supabase
        .from('subjects')
        .select('id', { count: 'exact', head: true }),
    ])

    if (profileResult.error) {
      return res.status(500).json({ error: profileResult.error.message })
    }

    if (myUploadsResult.error) {
      return res.status(500).json({ error: myUploadsResult.error.message })
    }

    if (recentMaterialsResult.error) {
      return res.status(500).json({ error: recentMaterialsResult.error.message })
    }

    const downloads = (myUploadsResult.data || []).reduce(
      (sum, material) => sum + Number(material.downloads || 0),
      0,
    )

    res.json({
      profile: profileResult.data,
      stats: {
        uploads: myUploadsResult.data?.length || 0,
        downloads,
        materials: materialCountResult.count || 0,
        subjects: subjectCountResult.count || 0,
      },
      myUploads: myUploadsResult.data || [],
      recentMaterials: recentMaterialsResult.data || [],
    })
  } catch (err) {
    console.error('Dashboard error:', err)
    res.status(500).json({ error: 'Could not load dashboard data' })
  }
})

module.exports = router
