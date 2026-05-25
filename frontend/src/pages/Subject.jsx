import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getMaterials, getSubject } from '../api'
import MaterialCard from '../components/MaterialCard'
import UploadModal from '../components/UploadModal'
import { useAuth } from '../context/AuthContext'

const TYPE_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'notes', label: 'Notes' },
  { value: 'pyq', label: 'PYQ' },
  { value: 'lab', label: 'Lab' },
  { value: 'slides', label: 'Slides' },
  { value: 'reference', label: 'Reference' },
]

export default function Subject() {
  const { subject_id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [materials, setMaterials] = useState([])
  const [subject, setSubject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [showUpload, setShowUpload] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    Promise.all([getMaterials({ subject_id }), getSubject(subject_id)])
      .then(([materialsRes, subjectRes]) => {
        setMaterials(materialsRes.data)
        setSubject(subjectRes.data)
      })
      .catch((err) => setError(err.response?.data?.error || 'Could not load subject materials.'))
      .finally(() => setLoading(false))
  }, [subject_id])

  const subjectInfo = subject || materials[0]?.subjects
  const filteredMaterials = useMemo(
    () =>
      materials
        .filter((material) => filter === 'all' || material.material_type === filter)
        .filter((material) => material.title.toLowerCase().includes(search.toLowerCase())),
    [filter, materials, search],
  )

  const handleUploadSuccess = (newMaterial) => {
    setMaterials((prev) => [newMaterial, ...prev])
  }

  const handleDownload = (materialId) => {
    setMaterials((prev) =>
      prev.map((material) =>
        material.id === materialId ? { ...material, downloads: Number(material.downloads || 0) + 1 } : material,
      ),
    )
  }

  return (
    <div>
      <button
        className="mb-6 flex items-center gap-2 text-sm font-bold text-[#565e74] transition hover:text-[#0052ff]"
        onClick={() => navigate('/browse')}
        type="button"
      >
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        Back to browser
      </button>

      <section className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#0052ff]">
            {subjectInfo?.departments?.name || 'StudyVault'} / Semester {subjectInfo?.semester || '-'}
          </p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-[#0b1c30] sm:text-5xl">
            {subjectInfo?.name || 'Subject Materials'}
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-[#565e74]">
            {filteredMaterials.length} approved resources available for this subject.
          </p>
        </div>
        {user ? (
          <button
            className="flex w-fit items-center gap-3 rounded-lg bg-[#005bbf] px-6 py-4 font-extrabold text-white shadow-xl shadow-blue-900/10 transition hover:bg-[#0052ff]"
            onClick={() => setShowUpload(true)}
            type="button"
          >
            <span className="material-symbols-outlined">upload</span>
            Upload Material
          </button>
        ) : (
          <Link className="rounded-lg border border-[#0052ff] px-6 py-4 font-extrabold text-[#003ec7]" to="/login">
            Login to Upload
          </Link>
        )}
      </section>

      <div className="mb-8 flex flex-col gap-3 lg:flex-row">
        <label className="relative flex-1">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#737688]">search</span>
          <input
            className="h-12 w-full rounded-full border-0 bg-[#f2f3ff] pl-12 pr-4 outline-none ring-1 ring-transparent transition focus:ring-[#0052ff]/30"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search materials..."
            type="search"
            value={search}
          />
        </label>
        <div className="flex flex-wrap gap-2">
          {TYPE_FILTERS.map((item) => (
            <button
              className={`rounded-lg px-4 py-3 text-sm font-bold transition ${
                filter === item.value ? 'bg-[#0052ff] text-white' : 'bg-white text-[#434656] ring-1 ring-[#c3c5d9]'
              }`}
              key={item.value}
              onClick={() => setFilter(item.value)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}

      {loading ? (
        <div className="academic-card rounded-lg p-12 text-center text-[#565e74]">Loading materials...</div>
      ) : filteredMaterials.length === 0 ? (
        <div className="academic-card rounded-lg p-12 text-center">
          <span className="material-symbols-outlined mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-[#dde1ff] text-[#003ec7]">
            inventory_2
          </span>
          <h2 className="text-2xl font-extrabold text-[#0b1c30]">No matching materials</h2>
          <p className="mt-2 text-[#565e74]">Upload the first resource or adjust your filters.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredMaterials.map((material) => (
            <MaterialCard key={material.id} material={material} onDownload={handleDownload} />
          ))}
        </div>
      )}

      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onSuccess={handleUploadSuccess}
          subjectId={subject_id}
        />
      )}
    </div>
  )
}
