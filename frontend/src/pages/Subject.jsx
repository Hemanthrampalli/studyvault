import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getMaterials, getSubject } from '../api'
import { useAuth } from '../context/AuthContext'
import MaterialCard from '../components/MaterialCard'
import UploadModal from '../components/UploadModal'

const TYPE_FILTERS = [
  { value: 'all',       label: 'All'         },
  { value: 'notes',     label: '📝 Notes'    },
  { value: 'pyq',       label: '📋 PYQs'     },
  { value: 'lab',       label: '🧪 Lab'      },
  { value: 'slides',    label: '🖥️ Slides'   },
  { value: 'reference', label: '📚 Reference' },
]

export default function Subject() {
  const { subject_id } = useParams()
  const navigate        = useNavigate()
  const { user }        = useAuth()

  const [materials,   setMaterials  ] = useState([])
  const [subjectName, setSubjectName] = useState('')
  const [loading,     setLoading    ] = useState(true)
  const [error,       setError      ] = useState('')
  const [filter,      setFilter     ] = useState('all')
  const [search,      setSearch     ] = useState('')
  const [showUpload,  setShowUpload ] = useState(false)

  useEffect(() => {
    if (!subject_id) return

    setLoading(true)
    setError('')

    // Fetch materials for this subject
    getMaterials({ subject_id })
      .then(res => {
        console.log('Materials loaded:', res.data)
        setMaterials(res.data || [])
      })
      .catch(err => {
        console.log('Materials error:', err)
        setError('Could not load materials')
      })
      .finally(() => setLoading(false))

    // Fetch subject name separately
    getSubject(subject_id)
      .then(res => res.data)
      .then(data => {
        if (data?.name) setSubjectName(data.name)
      })
      .catch(() => {})

  }, [subject_id])

  // Add new material to top of list after upload
  const handleUploadSuccess = (newMaterial) => {
    setMaterials(prev => [newMaterial, ...prev])
  }

  // Increment download count in UI
  const handleDownload = (materialId) => {
    setMaterials(prev =>
      prev.map(m =>
        m.id === materialId
          ? { ...m, downloads: m.downloads + 1 }
          : m
      )
    )
  }

  // Apply filter and search
  const filtered = materials
    .filter(m => filter === 'all' || m.material_type === filter)
    .filter(m => m.title.toLowerCase().includes(search.toLowerCase()))

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400">
          <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          Loading materials...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen  text-white">
      <div className="max-w-6xl mx-auto px-4 py-10">

        {/* Back button */}
        <button
          onClick={() => navigate('/browse')}
          className="text-gray-500 hover:text-white text-sm mb-6 flex items-center gap-2 transition-colors"
        >
          ← Back to Browse
        </button>

        {/* Header */}
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-black mb-1">
              {subjectName || 'Subject Materials'}
            </h1>
            <p className="text-gray-400 text-sm">
              {materials.length} material{materials.length !== 1 ? 's' : ''} available
            </p>
          </div>

          {user ? (
            <button
              onClick={() => setShowUpload(true)}
              className="bg-teal-500 hover:bg-teal-600 text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm"
            >
              ⬆ Upload Material
            </button>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="border border-gray-700 hover:border-gray-500 text-gray-400 font-medium px-6 py-3 rounded-xl transition-colors text-sm"
            >
              Login to Upload
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Search and Filter */}
        <div className="flex flex-wrap gap-3 mb-8">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search materials..."
            className="flex-1 min-w-48  border border-gray-800 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500 transition-colors"
          />
          <div className="flex flex-wrap gap-2">
            {TYPE_FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  filter === f.value
                    ? 'bg-teal-500 text-white'
                    : 'border border-gray-800 text-gray-400 hover:border-gray-600'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Materials Grid */}
        {filtered.length === 0 ? (
          <div className="border border-gray-800 rounded-2xl p-16 text-center">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-gray-400 font-medium text-lg">
              {materials.length === 0
                ? 'No materials uploaded yet'
                : 'No materials match your search'
              }
            </p>
            <p className="text-gray-600 text-sm mt-2">
              {user
                ? 'Be the first to upload!'
                : 'Login to upload materials'
              }
            </p>
            {user && materials.length === 0 && (
              <button
                onClick={() => setShowUpload(true)}
                className="mt-6 bg-teal-500 hover:bg-teal-600 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors"
              >
                ⬆ Upload First Material
              </button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(material => (
              <MaterialCard
                key={material.id}
                material={material}
                onDownload={handleDownload}
              />
            ))}
          </div>
        )}

      </div>

      {showUpload && (
        <UploadModal
          subjectId={subject_id}
          onClose={() => setShowUpload(false)}
          onSuccess={handleUploadSuccess}
        />
      )}

    </div>
  )
}
