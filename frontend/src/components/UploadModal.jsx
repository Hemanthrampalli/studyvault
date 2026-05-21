// UploadModal.jsx
// Modal popup for uploading a new material
// Only shown to logged in users

import { useState, useRef } from 'react'
import { uploadMaterial } from '../api'

const MATERIAL_TYPES = [
  { value: 'notes',     label: 'Notes',      icon: '📝' },
  { value: 'pyq',       label: 'PYQ',        icon: '📋' },
  { value: 'lab',       label: 'Lab Manual', icon: '🧪' },
  { value: 'slides',    label: 'Slides',     icon: '🖥️' },
  { value: 'reference', label: 'Reference',  icon: '📚' },
]

export default function UploadModal({ subjectId, onClose, onSuccess }) {
  const fileRef = useRef()

  const [form, setForm] = useState({
    title:         '',
    description:   '',
    material_type: 'notes',
  })
  const [file,     setFile    ] = useState(null)
  const [loading,  setLoading ] = useState(false)
  const [error,    setError   ] = useState('')
  const [dragOver, setDragOver] = useState(false)

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  // Handle drag and drop
  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) setFile(dropped)
  }

  const handleSubmit = async () => {
    if (!file)             return setError('Please select a file')
    if (!form.title)       return setError('Please enter a title')
    if (!form.material_type) return setError('Please select material type')

    setLoading(true)
    setError('')

    // FormData is used for sending files (can't use regular JSON)
    // Think of it like a form with file attached
    const formData = new FormData()
    formData.append('file',          file)
    formData.append('subject_id',    subjectId)
    formData.append('title',         form.title)
    formData.append('description',   form.description)
    formData.append('material_type', form.material_type)

    try {
      const res = await uploadMaterial(formData)
      onSuccess(res.data)  // pass new material back to parent
      onClose()
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    // Backdrop — clicking outside closes modal
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white text-xl font-bold">Upload Material</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">

          {/* File drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
              dragOver
                ? 'border-teal-500 bg-teal-500/5'
                : 'border-gray-700 hover:border-gray-600'
            }`}
          >
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              accept=".pdf,.ppt,.pptx,.doc,.docx,.zip"
              onChange={(e) => setFile(e.target.files[0])}
            />
            <div className="text-3xl mb-2">{file ? '✅' : '📁'}</div>
            <div className="text-white text-sm font-medium">
              {file ? file.name : 'Drop file here or click to browse'}
            </div>
            <div className="text-gray-500 text-xs mt-1">
              {file
                ? `${(file.size / (1024*1024)).toFixed(2)} MB`
                : 'PDF, PPT, DOC, ZIP · Max 50MB'}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-gray-400 text-sm font-medium block mb-2">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Unit 1 Notes - Matrices"
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-teal-500 transition-colors"
            />
          </div>

          {/* Material Type */}
          <div>
            <label className="text-gray-400 text-sm font-medium block mb-2">
              Material Type
            </label>
            <div className="flex flex-wrap gap-2">
              {MATERIAL_TYPES.map(t => (
                <button
                  key={t.value}
                  onClick={() => setForm(prev => ({ ...prev, material_type: t.value }))}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    form.material_type === t.value
                      ? 'bg-teal-500 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description (optional) */}
          <div>
            <label className="text-gray-400 text-sm font-medium block mb-2">
              Description <span className="text-gray-600">(optional)</span>
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Brief description of what's covered..."
              rows={2}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-teal-500 transition-colors resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-3 rounded-xl transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-2 flex-grow-[2] bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors text-sm"
            >
              {loading ? 'Uploading...' : '⬆ Upload'}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}