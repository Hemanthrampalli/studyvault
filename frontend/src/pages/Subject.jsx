import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getMaterials, getSubjects } from '../api'
import Material from '../components/Material'
import UploadModal from '../components/UploaModal'
import { useAuth } from '../context/AuthContext'

export default function Subject() {
  const { subject_id } = useParams()
  const { user } = useAuth()
  const [subject, setSubject] = useState(null)
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploadOpen, setUploadOpen] = useState(false)

  // Fetch subject name and materials
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Get subject name (all subjects, then filter)
        const subjectsRes = await getSubjects({})
        const found = subjectsRes.data.find(s => s.id === subject_id)
        setSubject(found)

        // Get materials for this subject
        const materialsRes = await getMaterials(subject_id)
        setMaterials(materialsRes.data)
      } catch (err) {
        console.error('Error fetching:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [subject_id])

  // Refresh materials after upload
  const handleUploadSuccess = async () => {
    try {
      const res = await getMaterials(subject_id)
      setMaterials(res.data)
    } catch (err) {
      console.error('Error refreshing materials:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-12">

        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">{subject?.name || 'Subject'}</h1>
            <p className="text-gray-400">
              {materials.length} materials available
            </p>
          </div>

          {/* Upload Button - Only for logged in users */}
          {user && (
            <button
              onClick={() => setUploadOpen(true)}
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-3 rounded-lg transition"
            >
              📤 Upload Material
            </button>
          )}
        </div>

        {/* Materials Grid */}
        {materials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {materials.map(material => (
              <Material key={material.id} material={material} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-900 rounded-lg border border-gray-800">
            <p className="text-gray-400 text-lg">
              No materials uploaded yet for this subject.
            </p>
            {user && (
              <button
                onClick={() => setUploadOpen(true)}
                className="mt-4 text-teal-400 hover:text-teal-300 font-bold"
              >
                Be the first to upload →
              </button>
            )}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
        subject_id={subject_id}
        onSuccess={handleUploadSuccess}
      />
    </div>
  )
}