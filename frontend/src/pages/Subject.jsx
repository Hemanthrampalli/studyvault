// Subject.jsx
// Shows all materials for a specific subject
// Allows filtering by type and searching by name
// Logged in users can upload new materials

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getMaterials, getSubjects } from '../api'
import { useAuth } from '../context/AuthContext'
import MaterialCard from '../components/MaterialCard'
import UploadModal from '../components/UploadModal'

const TYPE_FILTERS = [
  { value: 'all',       label: 'All'        },
  { value: 'notes',     label: '📝 Notes'   },
  { value: 'pyq',       label: '📋 PYQs'    },
  { value: 'lab',       label: '🧪 Lab'     },
  { value: 'slides',    label: '🖥️ Slides'  },
  { value: 'reference', label: '📚 Reference'},
]

export default function Subject() {
  // useParams reads the :subject_id from the URL
  const { subject_id } = useParams()
  const navigate        = useNavigate()
  const { user }        = useAuth()

  const [materials,    setMaterials   ] = useState([])
  const [subject,      setSubject     ] = useState(null)
  const [loading,      setLoading     ] = useState(true)
  const [filter,       setFilter      ] = useState('all')
  const [search,       setSearch      ] = useState('')
  const [showUpload,   setShowUpload  ] = useState(false)

  // Load subject info and materials on page load
  useEffect(() => {
    Promise.all([
      getMaterials(subject_id),
    ]).then(([matsRes]) => {
      setMaterials(matsRes.data)
    }).finally(() => setLoading(false))
  }, [subject_id])

  // Called when a new material is uploaded successfully
  // Adds it to the top of the list without reloading
  const handleUploadSuccess = (newMaterial) => {
    setMaterials(prev => [newMaterial, ...prev])
  }

  // Update download count in UI when user downloads
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
        <p className="text-gray-400">Loading materials...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
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
              {subject?.name || 'Subject Materials'}
            </h1>
            <p className="text-gray-400 text-sm">
              {materials.length} materials available
            </p>
          </div>

          {/* Upload button — only for logged in users */}
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

        {/* Search and Filter bar */}
        <div className="flex flex-wrap gap-3 mb-8">
          {/* Search input */}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search materials..."
            className="flex-1 min-w-48 bg-gray-900 border border-gray-800 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500 transition-colors"
          />

          {/* Type filter buttons */}
          <div className="flex flex-wrap gap-2">
            {TYPE_FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  filter === f.value
                    ? 'bg-teal-500 text-white'
                    : 'bg-gray-900 border border-gray-800 text-gray-400 hover:border-gray-600'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Materials Grid */}
        {filtered.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-16 text-center">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-gray-400 font-medium">No materials found</p>
            <p className="text-gray-600 text-sm mt-1">
              {user ? 'Be the first to upload!' : 'Login to upload materials'}
            </p>
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

      {/* Upload Modal */}
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