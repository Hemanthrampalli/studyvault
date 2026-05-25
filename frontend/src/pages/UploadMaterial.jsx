import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getDepartments, getSubjects, uploadMaterial } from '../api'

const TYPES = [
  { value: 'notes', label: 'Lecture Note' },
  { value: 'pyq', label: 'Question Paper' },
  { value: 'lab', label: 'Lab Manual' },
  { value: 'slides', label: 'Slides' },
  { value: 'reference', label: 'Reference' },
]

const YEARS = [1, 2, 3, 4]
const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8]

export default function UploadMaterial() {
  const navigate = useNavigate()
  const location = useLocation()
  const fileRef = useRef(null)
  const querySubjectId = new URLSearchParams(location.search).get('subject_id') || ''

  const [departments, setDepartments] = useState([])
  const [subjects, setSubjects] = useState([])
  const [file, setFile] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [form, setForm] = useState({
    department_id: '',
    year: '',
    semester: '',
    subject_id: querySubjectId,
    title: '',
    material_type: 'notes',
    description: '',
    anonymous: false,
    consent: true,
  })
  const [loading, setLoading] = useState(false)
  const [loadingSubjects, setLoadingSubjects] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    getDepartments()
      .then((res) => setDepartments(res.data))
      .catch(() => setError('Could not load departments. Check backend and Supabase settings.'))
  }, [])

  useEffect(() => {
    if (!form.department_id) return

    setLoadingSubjects(true)
    getSubjects({
      department_id: form.department_id,
      year: form.year || undefined,
      semester: form.semester || undefined,
    })
      .then((res) => setSubjects(res.data))
      .catch(() => setSubjects([]))
      .finally(() => setLoadingSubjects(false))
  }, [form.department_id, form.year, form.semester])

  const selectedDepartment = useMemo(
    () => departments.find((department) => department.id === form.department_id),
    [departments, form.department_id],
  )

  const updateField = (event) => {
    const { checked, name, type, value } = event.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'department_id' || name === 'year' || name === 'semester' ? { subject_id: '' } : {}),
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!file) return setError('Please select a file to upload.')
    if (!form.title.trim()) return setError('Please enter a resource title.')
    if (!form.subject_id) return setError('Please select the subject for this resource.')
    if (!form.consent) return setError('Please confirm attribution/usage consent.')

    const formData = new FormData()
    formData.append('file', file)
    formData.append('subject_id', form.subject_id)
    formData.append('title', form.title.trim())
    formData.append('description', form.description.trim())
    formData.append('material_type', form.material_type)
    formData.append('anonymous', String(form.anonymous))

    setLoading(true)
    try {
      const res = await uploadMaterial(formData)
      setSuccess('Material uploaded successfully.')
      setTimeout(() => navigate(`/materials/${res.data.id}`), 800)
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const saveDraft = () => {
    localStorage.setItem(
      'studyvault_upload_draft',
      JSON.stringify({ ...form, fileName: file?.name || '', savedAt: new Date().toISOString() }),
    )
    setSuccess('Draft saved in this browser.')
  }

  return (
    <form className="space-y-8" onSubmit={handleSubmit}>
      <section>
        <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#0052ff]">Community contribution</p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-[#0b1c30] sm:text-5xl">Upload Academic Material</h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-[#565e74]">
          Contribute to your scholarly community by sharing clean, labeled, and useful study resources.
        </p>
      </section>

      {(error || success) && (
        <div
          className={`rounded-lg px-4 py-3 text-sm font-semibold ${
            error ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
          }`}
        >
          {error || success}
        </div>
      )}

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.5fr)_28rem]">
        <div className="space-y-6">
          <section
            className={`rounded-lg border-2 border-dashed bg-white p-10 text-center transition ${
              dragOver ? 'border-[#0052ff] bg-[#eff4ff]' : 'border-[#c3c5d9]'
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
            <span className="material-symbols-outlined mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#dde1ff] text-[42px] text-[#003ec7]">
              upload_file
            </span>
            <h2 className="text-3xl font-extrabold text-[#0b1c30]">{file ? file.name : 'Drag and drop files'}</h2>
            <p className="mt-3 text-[#565e74]">Support for PDF, DOCX, PPTX, ZIP, and high-res images. Max 50 MB.</p>
            <button className="mt-6 rounded-lg bg-[#005bbf] px-8 py-3 font-extrabold text-white" type="button">
              Select Files
            </button>
          </section>

          <section className="academic-card rounded-lg p-6">
            <h2 className="text-2xl font-extrabold text-[#0b1c30]">Resource Details</h2>
            <div className="mt-5 grid gap-5">
              <label className="block">
                <span className="mb-1 block text-xs font-extrabold uppercase tracking-[0.14em] text-[#565e74]">
                  Resource Title
                </span>
                <input
                  className="h-12 w-full rounded-lg border border-[#c3c5d9] px-4 outline-none focus:border-[#0052ff] focus:ring-2 focus:ring-[#0052ff]/10"
                  name="title"
                  onChange={updateField}
                  placeholder="Advanced Thermodynamics Lecture Notes"
                  value={form.title}
                />
              </label>

              <div className="grid gap-5 md:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-xs font-extrabold uppercase tracking-[0.14em] text-[#565e74]">
                    Category
                  </span>
                  <select
                    className="h-12 w-full rounded-lg border border-[#c3c5d9] px-4 outline-none focus:border-[#0052ff]"
                    name="material_type"
                    onChange={updateField}
                    value={form.material_type}
                  >
                    {TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-extrabold uppercase tracking-[0.14em] text-[#565e74]">
                    Subject
                  </span>
                  <select
                    className="h-12 w-full rounded-lg border border-[#c3c5d9] px-4 outline-none focus:border-[#0052ff]"
                    disabled={!form.department_id || loadingSubjects}
                    name="subject_id"
                    onChange={updateField}
                    value={form.subject_id}
                  >
                    <option value="">
                      {!form.department_id ? 'Choose classification first' : loadingSubjects ? 'Loading subjects...' : 'Select Subject'}
                    </option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name} ({subject.code})
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="mb-1 block text-xs font-extrabold uppercase tracking-[0.14em] text-[#565e74]">
                  Description & Uploader Notes
                </span>
                <textarea
                  className="w-full resize-none rounded-lg border border-[#c3c5d9] px-4 py-3 outline-none focus:border-[#0052ff] focus:ring-2 focus:ring-[#0052ff]/10"
                  name="description"
                  onChange={updateField}
                  placeholder="Briefly describe the content, key topics, or specific exam years."
                  rows={5}
                  value={form.description}
                />
              </label>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="academic-card rounded-lg p-6">
            <h2 className="text-2xl font-extrabold text-[#0b1c30]">Classification</h2>
            <div className="mt-5 space-y-5">
              <label className="block">
                <span className="mb-1 block text-xs font-extrabold uppercase tracking-[0.14em] text-[#565e74]">
                  Branch / Department
                </span>
                <select
                  className="h-12 w-full rounded-lg border border-[#c3c5d9] px-4 outline-none focus:border-[#0052ff]"
                  name="department_id"
                  onChange={updateField}
                  value={form.department_id}
                >
                  <option value="">Select Department</option>
                  {departments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name} ({department.code})
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="mb-1 block text-xs font-extrabold uppercase tracking-[0.14em] text-[#565e74]">
                    Year
                  </span>
                  <select
                    className="h-12 w-full rounded-lg border border-[#c3c5d9] px-4 outline-none focus:border-[#0052ff]"
                    name="year"
                    onChange={updateField}
                    value={form.year}
                  >
                    <option value="">Any</option>
                    {YEARS.map((year) => (
                      <option key={year} value={year}>
                        {year} Year
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-extrabold uppercase tracking-[0.14em] text-[#565e74]">
                    Semester
                  </span>
                  <select
                    className="h-12 w-full rounded-lg border border-[#c3c5d9] px-4 outline-none focus:border-[#0052ff]"
                    name="semester"
                    onChange={updateField}
                    value={form.semester}
                  >
                    <option value="">Any</option>
                    {SEMESTERS.map((semester) => (
                      <option key={semester} value={semester}>
                        Sem {semester}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <p className="rounded-lg bg-[#eff4ff] px-4 py-3 text-sm font-semibold text-[#565e74]">
                {selectedDepartment ? `Selected: ${selectedDepartment.name}` : 'Select a branch to load subjects.'}
              </p>

              <label className="flex items-start gap-3">
                <input
                  checked={form.anonymous}
                  className="mt-1 h-5 w-5 rounded border-[#c3c5d9] text-[#0052ff]"
                  name="anonymous"
                  onChange={updateField}
                  type="checkbox"
                />
                <span>
                  <span className="block font-extrabold text-[#0b1c30]">Anonymous Upload</span>
                  <span className="text-sm text-[#565e74]">Hide my profile name from this resource.</span>
                </span>
              </label>

              <label className="flex items-start gap-3">
                <input
                  checked={form.consent}
                  className="mt-1 h-5 w-5 rounded border-[#c3c5d9] text-[#0052ff]"
                  name="consent"
                  onChange={updateField}
                  type="checkbox"
                />
                <span>
                  <span className="block font-extrabold text-[#0b1c30]">Attribution Consent</span>
                  <span className="text-sm text-[#565e74]">I confirm I can share this material for study purposes.</span>
                </span>
              </label>
            </div>
          </section>

          <section className="rounded-lg bg-[#d8e2ff] p-6">
            <h2 className="flex items-center gap-2 text-xl font-extrabold text-[#003ec7]">
              <span className="material-symbols-outlined">gavel</span>
              Community Guidelines
            </h2>
            <ul className="mt-5 space-y-4 text-sm leading-6 text-[#131b2e]">
              <li>Ensure scanned documents are clear and correctly oriented.</li>
              <li>Label question papers with the exam month or year.</li>
              <li>Do not upload copyrighted textbooks or paid courses.</li>
            </ul>
          </section>

          <div className="flex gap-3">
            <button
              className="flex-1 rounded-lg border border-[#0052ff] px-4 py-3 font-extrabold text-[#003ec7] transition hover:bg-[#eff4ff]"
              onClick={saveDraft}
              type="button"
            >
              Save as Draft
            </button>
            <button
              className="flex-[1.6] rounded-lg bg-[#005bbf] px-4 py-3 font-extrabold text-white shadow-lg shadow-blue-900/10 transition hover:bg-[#0052ff] disabled:opacity-60"
              disabled={loading}
              type="submit"
            >
              {loading ? 'Publishing...' : 'Publish Material'}
            </button>
          </div>
        </aside>
      </div>
    </form>
  )
}
