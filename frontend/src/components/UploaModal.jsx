import { useState } from 'react'
import { uploadMaterial } from '../api'

export default function UploadModal({ isOpen, onClose, subject_id, onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    material_type: 'Notes',
    file: null
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      file: e.target.files[0]
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!formData.title.trim()) {
      setError('Please enter a title')
      return
    }
    if (!formData.file) {
      setError('Please select a file')
      return
    }

    try {
      setLoading(true)

      // Build FormData (needed for file upload)
      const form = new FormData()
      form.append('title', formData.title)
      form.append('description', formData.description)
      form.append('material_type', formData.material_type)
      form.append('subject_id', subject_id)
      form.append('file', formData.file)

      // Upload
      const response = await uploadMaterial(form)
      
      // Success
      alert('Material uploaded! (Waiting for admin approval)')
      setFormData({ title: '', description: '', material_type: 'Notes', file: null })
      onClose()
      onSuccess() // Refresh materials list
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-lg max-w-md w-full p-6">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Upload Material</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-200 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Title */}
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-1">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Data Structures Chapter 5"
              className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="e.g., Handwritten notes from class..."
              rows="3"
              className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded focus:outline-none focus:border-teal-500 resize-none"
            />
          </div>

          {/* Material Type */}
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-1">
              Type *
            </label>
            <select
              name="material_type"
              value={formData.material_type}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded focus:outline-none focus:border-teal-500"
            >
              <option>Notes</option>
              <option>Previous Year Question</option>
              <option>Slides</option>
              <option>Lab Manual</option>
              <option>Tutorial</option>
              <option>Other</option>
            </select>
          </div>

          {/* File Input */}
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-1">
              File * (Max 50MB)
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded"
            />
            {formData.file && (
              <p className="text-xs text-teal-400 mt-1">
                ✓ {formData.file.name}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-bold px-4 py-2 rounded transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold px-4 py-2 rounded transition"
            >
              {loading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}