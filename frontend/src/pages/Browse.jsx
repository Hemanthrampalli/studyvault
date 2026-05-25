import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getDepartments, getMaterials, getSubjects } from '../api'
import MaterialCard from '../components/MaterialCard'
import { useAuth } from '../context/AuthContext'

const YEARS = [
  { value: '', label: 'All Years' },
  { value: 1, label: '1st Year' },
  { value: 2, label: '2nd Year' },
  { value: 3, label: '3rd Year' },
  { value: 4, label: '4th Year' },
]

const SEMESTERS = ['', 1, 2, 3, 4, 5, 6, 7, 8]

const TYPES = [
  { value: '', label: 'All Types' },
  { value: 'notes', label: 'Notes' },
  { value: 'pyq', label: 'PYQ' },
  { value: 'lab', label: 'Lab Manual' },
  { value: 'slides', label: 'Slides' },
  { value: 'reference', label: 'Reference' },
]

export default function Browse() {
  const { user } = useAuth()
  const [departments, setDepartments] = useState([])
  const [subjects, setSubjects] = useState([])
  const [materials, setMaterials] = useState([])
  const [filters, setFilters] = useState({
    department_id: '',
    year: '',
    semester: '',
    subject_id: '',
    material_type: '',
    search: '',
  })
  const [loading, setLoading] = useState(true)
  const [loadingSubjects, setLoadingSubjects] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getDepartments()
      .then((res) => setDepartments(res.data))
      .catch(() => setError('Could not load departments. Check backend and Supabase configuration.'))
  }, [])

  useEffect(() => {
    if (!filters.department_id) {
      setSubjects([])
      if (filters.subject_id) {
        setFilters((prev) => ({ ...prev, subject_id: '' }))
      }
      return
    }

    setLoadingSubjects(true)
    getSubjects({
      department_id: filters.department_id,
      year: filters.year || undefined,
      semester: filters.semester || undefined,
    })
      .then((res) => setSubjects(res.data))
      .catch(() => setSubjects([]))
      .finally(() => setLoadingSubjects(false))
  }, [filters.department_id, filters.year, filters.semester, filters.subject_id])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setLoading(true)
      getMaterials({
        department_id: filters.department_id || undefined,
        year: filters.year || undefined,
        semester: filters.semester || undefined,
        subject_id: filters.subject_id || undefined,
        material_type: filters.material_type || undefined,
        search: filters.search || undefined,
      })
        .then((res) => setMaterials(res.data))
        .catch((err) => setError(err.response?.data?.error || 'Could not load materials.'))
        .finally(() => setLoading(false))
    }, 250)

    return () => clearTimeout(timeoutId)
  }, [filters])

  const selectedDepartment = useMemo(
    () => departments.find((department) => department.id === filters.department_id),
    [departments, filters.department_id],
  )

  const updateFilter = (key, value) => {
    setError('')
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      ...(key === 'department_id' || key === 'year' || key === 'semester' ? { subject_id: '' } : {}),
    }))
  }

  const clearFilters = () => {
    setFilters({ department_id: '', year: '', semester: '', subject_id: '', material_type: '', search: '' })
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[20rem_minmax(0,1fr)]">
      <aside className="academic-card h-fit rounded-lg p-6 xl:sticky xl:top-24">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-extrabold text-[#0b1c30]">Filters</h2>
          <button className="text-sm font-extrabold text-[#0052ff]" onClick={clearFilters} type="button">
            Clear all
          </button>
        </div>

        <div className="space-y-6">
          <label className="block">
            <span className="mb-2 block text-xs font-extrabold uppercase tracking-[0.16em] text-[#565e74]">
              Department / Branch
            </span>
            <select
              className="w-full rounded-lg border border-[#c3c5d9] bg-white px-3 py-3 outline-none focus:border-[#0052ff]"
              onChange={(event) => updateFilter('department_id', event.target.value)}
              value={filters.department_id}
            >
              <option value="">All departments</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name} ({department.code})
                </option>
              ))}
            </select>
          </label>

          <div>
            <span className="mb-2 block text-xs font-extrabold uppercase tracking-[0.16em] text-[#565e74]">
              Academic Year
            </span>
            <div className="grid grid-cols-2 gap-2">
              {YEARS.map((year) => (
                <button
                  className={`rounded-lg border px-3 py-2 text-sm font-bold transition ${
                    String(filters.year) === String(year.value)
                      ? 'border-[#0052ff] bg-[#dde1ff] text-[#003ec7]'
                      : 'border-[#c3c5d9] bg-white text-[#434656]'
                  }`}
                  key={year.label}
                  onClick={() => updateFilter('year', year.value)}
                  type="button"
                >
                  {year.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="mb-2 block text-xs font-extrabold uppercase tracking-[0.16em] text-[#565e74]">
              Semester
            </span>
            <div className="grid grid-cols-3 gap-2">
              {SEMESTERS.map((semester) => (
                <button
                  className={`rounded-lg border px-3 py-2 text-sm font-bold transition ${
                    String(filters.semester) === String(semester)
                      ? 'border-[#0052ff] bg-[#0052ff] text-white'
                      : 'border-[#c3c5d9] bg-white text-[#434656]'
                  }`}
                  key={semester || 'all'}
                  onClick={() => updateFilter('semester', semester)}
                  type="button"
                >
                  {semester || 'All'}
                </button>
              ))}
            </div>
          </div>

          <label className="block">
            <span className="mb-2 block text-xs font-extrabold uppercase tracking-[0.16em] text-[#565e74]">
              Subject
            </span>
            <select
              className="w-full rounded-lg border border-[#c3c5d9] bg-white px-3 py-3 outline-none focus:border-[#0052ff]"
              disabled={!filters.department_id || loadingSubjects}
              onChange={(event) => updateFilter('subject_id', event.target.value)}
              value={filters.subject_id}
            >
              <option value="">
                {!filters.department_id ? 'Select department first' : loadingSubjects ? 'Loading subjects...' : 'All subjects'}
              </option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name} ({subject.code})
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-extrabold uppercase tracking-[0.16em] text-[#565e74]">
              Resource Type
            </span>
            <select
              className="w-full rounded-lg border border-[#c3c5d9] bg-white px-3 py-3 outline-none focus:border-[#0052ff]"
              onChange={(event) => updateFilter('material_type', event.target.value)}
              value={filters.material_type}
            >
              {TYPES.map((type) => (
                <option key={type.value || 'all'} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </aside>

      <section>
        <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#0052ff]">
              StudyVault / Library {selectedDepartment ? `/ ${selectedDepartment.code}` : ''}
            </p>
            <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-[#0b1c30] sm:text-5xl">Material Browser</h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-[#565e74]">
              Explore approved notes, papers, guides, and student uploads from Supabase.
            </p>
          </div>
          <Link
            className="flex w-fit items-center gap-3 rounded-lg bg-[#005bbf] px-6 py-4 font-extrabold text-white shadow-xl shadow-blue-900/10 transition hover:bg-[#0052ff]"
            to={user ? '/upload' : '/login'}
          >
            <span className="material-symbols-outlined">upload</span>
            Upload Material
          </Link>
        </div>

        <div className="mb-6">
          <label className="relative block">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#737688]">search</span>
            <input
              className="h-12 w-full rounded-full border-0 bg-[#f2f3ff] pl-12 pr-4 outline-none ring-1 ring-transparent transition focus:ring-[#0052ff]/30"
              onChange={(event) => updateFilter('search', event.target.value)}
              placeholder="Search by resource title..."
              type="search"
              value={filters.search}
            />
          </label>
        </div>

        {error && <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}

        {loading ? (
          <div className="academic-card rounded-lg p-12 text-center text-[#565e74]">Loading materials...</div>
        ) : materials.length === 0 ? (
          <div className="academic-card rounded-lg p-12 text-center">
            <span className="material-symbols-outlined mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-[#dde1ff] text-[#003ec7]">
              inventory_2
            </span>
            <h2 className="text-2xl font-extrabold text-[#0b1c30]">No materials found</h2>
            <p className="mt-2 text-[#565e74]">Try changing filters or upload a resource for this subject.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {materials.map((material) => (
              <MaterialCard key={material.id} material={material} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
