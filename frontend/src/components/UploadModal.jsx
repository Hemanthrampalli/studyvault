import { useRef, useState } from 'react'
import { uploadMaterial } from '../api'

const MATERIAL_TYPES = [
  { value: 'notes', label: 'Notes' },
  { value: 'pyq', label: 'Previous Questions' },
  { value: 'lab', label: 'Lab Manual' },
  { value: 'slides', label: 'Slides' },
  { value: 'reference', label: 'Reference' },
]

export default function UploadModal({ subjectId, onClose, onSuccess }) {
  const fileRef = useRef(null)
  const [form, setForm] = useState({ title: '', description: '', material_type: 'notes' })
  const [file, setFile] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const updateField = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }))
  }

  const handleSubmit = async () => {
    if (!file) return setError('Please select a file.')
    if (!form.title.trim()) return setError('Please enter a resource title.')

    const formData = new FormData()
    formData.append('file', file)
    formData.append('subject_id', subjectId)
    formData.append('title', form.title.trim())
    formData.append('description', form.description.trim())
    formData.append('material_type', form.material_type)

    setLoading(true)
    setError('')
    try {
      const res = await uploadMaterial(formData)
      onSuccess?.(res.data)
      onClose()
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#131b2e]/70 p-4 backdrop-blur-sm"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="w-full max-w-xl rounded-lg bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-[#131b2e]">Upload Material</h2>
            <p className="mt-1 text-sm text-[#565e74]">Share notes, slides, question papers, or lab files.</p>
          </div>
          <button className="rounded-full p-2 text-[#737688] hover:bg-[#f2f3ff]" onClick={onClose} type="button">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}

        <div className="space-y-4">
          <div
            className={`rounded-lg border-2 border-dashed p-6 text-center transition ${
              dragOver ? 'border-[#0052ff] bg-[#eff4ff]' : 'border-[#c3c5d9] bg-[#faf8ff]'
            }`}
            onClick={() => fileRef.current?.click()}
            onDragLeave={() => setDragOver(false)}
            onDragOver={(event) => {
              event.preventDefault()
              setDragOver(true)
            }}
            onDrop={(event) => {
              event.preventDefault()
              setDragOver(false)
              setFile(event.dataTransfer.files?.[0] || null)
            }}
          >
            <input
              ref={fileRef}
              accept=".pdf,.ppt,.pptx,.doc,.docx,.zip,.png,.jpg,.jpeg"
              className="hidden"
              onChange={(event) => setFile(event.target.files?.[0] || null)}
              type="file"
            />
            <span className="material-symbols-outlined mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-lg bg-[#dde1ff] text-[#003ec7]">
              upload_file
            </span>
            <p className="font-bold text-[#131b2e]">{file ? file.name : 'Drag and drop files'}</p>
            <p className="mt-1 text-sm text-[#565e74]">PDF, DOCX, PPTX, ZIP, or images up to 50 MB</p>
          </div>

          <label className="block">
            <span className="mb-1 block text-xs font-extrabold uppercase tracking-[0.14em] text-[#565e74]">
              Resource Title
            </span>
            <input
              className="w-full rounded-lg border border-[#c3c5d9] px-4 py-3 outline-none transition focus:border-[#0052ff] focus:ring-2 focus:ring-[#0052ff]/10"
              name="title"
              onChange={updateField}
              placeholder="Advanced Thermodynamics Lecture Notes"
              value={form.title}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-extrabold uppercase tracking-[0.14em] text-[#565e74]">
              Resource Type
            </span>
            <select
              className="w-full rounded-lg border border-[#c3c5d9] px-4 py-3 outline-none transition focus:border-[#0052ff] focus:ring-2 focus:ring-[#0052ff]/10"
              name="material_type"
              onChange={updateField}
              value={form.material_type}
            >
              {MATERIAL_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-extrabold uppercase tracking-[0.14em] text-[#565e74]">
              Description
            </span>
            <textarea
              className="w-full resize-none rounded-lg border border-[#c3c5d9] px-4 py-3 outline-none transition focus:border-[#0052ff] focus:ring-2 focus:ring-[#0052ff]/10"
              name="description"
              onChange={updateField}
              placeholder="Mention key units, exam year, or important topics."
              rows={3}
              value={form.description}
            />
          </label>

          <div className="flex gap-3 pt-2">
            <button
              className="flex-1 rounded-lg border border-[#0052ff] px-4 py-3 font-bold text-[#003ec7] transition hover:bg-[#eff4ff]"
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
            <button
              className="flex-[2] rounded-lg bg-[#003ec7] px-4 py-3 font-bold text-white shadow-lg shadow-blue-900/10 transition hover:bg-[#0052ff] disabled:opacity-60"
              disabled={loading}
              onClick={handleSubmit}
              type="button"
            >
              {loading ? 'Uploading...' : 'Publish Material'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
