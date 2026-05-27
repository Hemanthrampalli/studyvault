// Browse.jsx
// Department → Year → Semester → Subject navigation
// PLUS a global search bar that searches subjects and uploaded materials.

import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getDepartments, getMaterials, getSubjects } from '../api'
import MaterialCard from '../components/MaterialCard'

const YEARS = [
  { value: 1, label: '1st Year', icon: '🌱' },
  { value: 2, label: '2nd Year', icon: '📗' },
  { value: 3, label: '3rd Year', icon: '🔬' },
  { value: 4, label: '4th Year', icon: '🎓' },
]

const SEMESTERS = {
  1: [1, 2],
  2: [3, 4],
  3: [5, 6],
  4: [7, 8],
}

export default function Browse() {
  const navigate = useNavigate()

  // ── Browse state ──────────────────────────────────────────
  const [selectedDept, setSelectedDept] = useState(null)
  const [selectedYear, setSelectedYear] = useState(null)
  const [selectedSem,  setSelectedSem ] = useState(null)
  const [departments,  setDepartments ] = useState([])
  const [subjects,     setSubjects    ] = useState([])
  const [recentMaterials, setRecentMaterials] = useState([])
  const [loadingDepts,    setLoadingDepts   ] = useState(true)
  const [loadingSubjects, setLoadingSubjects] = useState(false)
  const [loadingMaterials, setLoadingMaterials] = useState(true)

  // ── Search state ──────────────────────────────────────────
  const [searchQuery,   setSearchQuery  ] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [materialResults, setMaterialResults] = useState([])
  const [searching,     setSearching    ] = useState(false)
  const [searchMode,    setSearchMode   ] = useState(false)
  // searchMode = true means user is actively searching
  // and we show search results instead of browse steps

  // Load departments once on mount
  // Read ?search= from URL (coming from Home page search)
  const [searchParams] = useSearchParams()
  const initialSearch = searchParams.get('search') || ''

  // Load departments on mount
  useEffect(() => {
    getDepartments()
      .then(res => {
        setDepartments(res.data)
        // If URL has ?search=something, pre-fill the search box
        if (initialSearch) {
          setSearchQuery(initialSearch)
        }
      })
      .finally(() => setLoadingDepts(false))
  }, [initialSearch])

  useEffect(() => {
    getMaterials({ limit: 12 })
      .then(res => setRecentMaterials(res.data || []))
      .catch(() => setRecentMaterials([]))
      .finally(() => setLoadingMaterials(false))
  }, [])

  // Load subjects when dept + year + sem are all selected
  useEffect(() => {
    if (!selectedDept || !selectedYear || !selectedSem) return
    setLoadingSubjects(true)
    getSubjects({
      department_id: selectedDept.id,
      year:          selectedYear,
      semester:      selectedSem
    })
      .then(res => setSubjects(res.data))
      .finally(() => setLoadingSubjects(false))
  }, [selectedDept, selectedYear, selectedSem])

  // ── Search logic ──────────────────────────────────────────
  // useCallback prevents this function from being recreated on every render
  const handleSearch = useCallback(async (query) => {
    setSearchQuery(query)

    // If query is empty → go back to normal browse mode
    if (!query.trim()) {
      setSearchMode(false)
      setSearchResults([])
      setMaterialResults([])
      return
    }

    // Enter search mode
    setSearchMode(true)
    setSearching(true)

    try {
      // Search across ALL departments at once
      // We fetch subjects from all departments and filter by name
      // getSubjects without department_id returns all subjects
      // We need to search across all departments
      // So we fetch for each department in parallel using Promise.all
      const subjectPromises = departments.map(dept =>
        getSubjects({ department_id: dept.id })
          .then(res => res.data.map(subject => ({
            ...subject,
            // Attach department info to each subject for display
            department_name: dept.name,
            department_code: dept.code,
          })))
          .catch(() => []) // if one dept fails, don't break everything
      )

      const materialsPromise = getMaterials({ search: query, limit: 50 })
        .then(res => res.data || [])
        .catch(() => [])

      const [results, materials] = await Promise.all([
        Promise.all(subjectPromises),
        materialsPromise,
      ])

      // Flatten array of arrays into one array
      // [ [subj1, subj2], [subj3] ] → [subj1, subj2, subj3]
      const allSubjects = results.flat()

      // Filter by search query (case insensitive)
      const filtered = allSubjects.filter(subject =>
        subject.name.toLowerCase().includes(query.toLowerCase()) ||
        subject.code?.toLowerCase().includes(query.toLowerCase()) ||
        subject.department_name?.toLowerCase().includes(query.toLowerCase()) ||
        subject.department_code?.toLowerCase().includes(query.toLowerCase())
      )

      setSearchResults(filtered)
      setMaterialResults(materials)
    } catch (err) {
      console.log('Search error:', err)
      setSearchResults([])
      setMaterialResults([])
    } finally {
      setSearching(false)
    }
  }, [departments])

  // Debounce search — wait 400ms after user stops typing before searching
  // This prevents making an API call on every single keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) handleSearch(searchQuery)
    }, 400)

    // Cleanup — cancel the timer if user types again before 400ms
    return () => clearTimeout(timer)
  }, [searchQuery, handleSearch])

  // Reset browse selections when dept changes
  const handleDeptSelect = (dept) => {
    setSelectedDept(dept)
    setSelectedYear(null)
    setSelectedSem(null)
    setSubjects([])
  }

  const handleYearSelect = (year) => {
    setSelectedYear(year)
    setSelectedSem(null)
    setSubjects([])
  }

  // Clear search and go back to browse
  const clearSearch = () => {
    setSearchQuery('')
    setSearchMode(false)
    setSearchResults([])
    setMaterialResults([])
  }

  // Group search results by department for better display
  const groupedResults = searchResults.reduce((groups, subject) => {
    const key = subject.department_code
    if (!groups[key]) {
      groups[key] = {
        name: subject.department_name,
        code: subject.department_code,
        subjects: []
      }
    }
    groups[key].subjects.push(subject)
    return groups
  }, {})

  const totalSearchResults = searchResults.length + materialResults.length

  return (
    <div className="min-h-screen text-[#131b2e]">
      <div className="max-w-6xl mx-auto px-4 py-10">

        {/* ── Header ──────────────────────────────────────── */}
        <h1 className="text-3xl font-black mb-2 text-[#0b1c30]">Browse Materials</h1>
        <p className="text-[#565e74] mb-8">
          Search for any uploaded material or navigate by department
        </p>

        {/* ── Search Bar ──────────────────────────────────── */}
        <div className="relative mb-10">
          <div className="academic-card flex items-center rounded-lg px-5 py-4 transition-colors focus-within:border-[#0052ff]/45">

            {/* Search icon */}
            <span className="text-[#737688] text-xl mr-3">🔍</span>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search material title, subject, code, or department..."
              className="flex-1 bg-transparent text-[#131b2e] placeholder-[#737688] text-base focus:outline-none"
            />

            {/* Clear button — only shows when there's a query */}
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="text-[#737688] hover:text-[#003ec7] ml-3 text-xl transition-colors"
              >
                ✕
              </button>
            )}
          </div>

          {/* Search hint */}
          {!searchMode && (
            <p className="text-[#737688] text-xs mt-2 ml-1">
              Try a material title, "Data Structures", "CS201", or "ECE"
            </p>
          )}
        </div>

        {/* ── SEARCH RESULTS MODE ─────────────────────────── */}
        {searchMode && (
          <div>
            {/* Back to browse button */}
            <button
              onClick={clearSearch}
              className="text-[#737688] hover:text-[#003ec7] text-sm mb-6 flex items-center gap-2 transition-colors"
            >
              ← Back to Browse
            </button>

            {/* Searching spinner */}
            {searching && (
              <div className="flex items-center gap-3 text-[#565e74] mb-6">
                <div className="w-4 h-4 border-2 border-[#0052ff] border-t-transparent rounded-full animate-spin" />
                Searching uploaded materials and subjects...
              </div>
            )}

            {/* Results count */}
            {!searching && (
              <p className="text-[#565e74] text-sm mb-6">
                {totalSearchResults === 0
                  ? `No results found for "${searchQuery}"`
                  : `${totalSearchResults} result${totalSearchResults !== 1 ? 's' : ''} found for "${searchQuery}"`
                }
              </p>
            )}

            {/* No results state */}
            {!searching && totalSearchResults === 0 && (
              <div className="academic-card rounded-lg p-16 text-center">
                <div className="text-5xl mb-4">🔍</div>
                <p className="text-[#565e74] font-medium text-lg">No materials or subjects found</p>
                <p className="text-[#737688] text-sm mt-2">
                  Try a different keyword or browse by department below
                </p>
                <button
                  onClick={clearSearch}
                  className="mt-6 bg-[#003ec7] hover:bg-[#0052ff] text-white font-bold px-6 py-2.5 rounded-lg text-sm transition-colors"
                >
                  Browse by Department
                </button>
              </div>
            )}

            {/* Uploaded material results */}
            {!searching && materialResults.length > 0 && (
              <section className="mb-8">
                <div className="flex items-center gap-3 mb-3">
                  <span className="bg-[#e2e7ff] border border-[#c3c5d9] text-[#003ec7] text-xs font-bold px-3 py-1 rounded-full">
                    MATERIALS
                  </span>
                  <span className="text-[#565e74] text-sm">
                    Uploaded files matching your search
                  </span>
                  <span className="text-[#737688] text-xs">
                    {materialResults.length} result{materialResults.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {materialResults.map(material => (
                    <MaterialCard key={material.id} material={material} />
                  ))}
                </div>
              </section>
            )}

            {/* Grouped results by department */}
            {!searching && Object.values(groupedResults).map(group => (
              <div key={group.code} className="mb-8">

                {/* Department header */}
                <div className="flex items-center gap-3 mb-3">
                  <span className="bg-[#e2e7ff] border border-[#c3c5d9] text-[#003ec7] text-xs font-bold px-3 py-1 rounded-full">
                    {group.code}
                  </span>
                  <span className="text-[#565e74] text-sm">{group.name}</span>
                  <span className="text-[#737688] text-xs">
                    {group.subjects.length} result{group.subjects.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Subjects in this department */}
                <div className="academic-card rounded-lg overflow-hidden">
                  {group.subjects.map((subject, index) => (
                    <button
                      key={subject.id}
                      onClick={() => navigate(`/subject/${subject.id}`)}
                      className={`w-full flex items-center justify-between px-6 py-4 text-left hover:bg-[#f2f3ff] transition-colors ${
                        index !== group.subjects.length - 1
                          ? 'border-b border-[#c3c5d9]/70'
                          : ''
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#e2e7ff] rounded-lg flex items-center justify-center text-lg flex-shrink-0">
                          📘
                        </div>
                        <div>
                          {/* Highlight matching text in subject name */}
                          <div className="font-semibold text-[#0b1c30]">
                            {highlightMatch(subject.name, searchQuery)}
                          </div>
                          <div className="text-xs text-[#737688] mt-0.5">
                            {subject.code} · Year {subject.year} · Sem {subject.semester}
                          </div>
                        </div>
                      </div>
                      <span className="text-[#737688] flex-shrink-0">→</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── BROWSE MODE ─────────────────────────────────── */}
        {!searchMode && (
          <div>
            <section className="mb-10">
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-xs font-bold text-[#737688] uppercase tracking-widest">
                    Latest Uploaded Materials
                  </h2>
                  <p className="mt-2 text-sm text-[#565e74]">
                    Newest approved files from the StudyVault library
                  </p>
                </div>
              </div>

              {loadingMaterials ? (
                <div className="flex items-center gap-3 text-[#565e74]">
                  <div className="w-4 h-4 border-2 border-[#0052ff] border-t-transparent rounded-full animate-spin" />
                  Loading uploads...
                </div>
              ) : recentMaterials.length === 0 ? (
                <div className="academic-card rounded-lg p-8 text-center text-[#565e74]">
                  No uploaded materials yet.
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {recentMaterials.map(material => (
                    <MaterialCard key={material.id} material={material} />
                  ))}
                </div>
              )}
            </section>

            {/* Step 1 — Department */}
            <section className="mb-10">
              <h2 className="text-xs font-bold text-[#737688] uppercase tracking-widest mb-4">
                Step 1 — Select Department
              </h2>
              {loadingDepts ? (
                <p className="text-[#565e74]">Loading departments...</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {departments.map(dept => (
                    <button
                      key={dept.id}
                      onClick={() => handleDeptSelect(dept)}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        selectedDept?.id === dept.id
                          ? 'bg-[#e2e7ff] border-[#0052ff] text-[#003ec7] shadow-sm'
                          : 'bg-white/90 border-[#c3c5d9]/80 text-[#434656] hover:bg-[#f2f3ff] hover:border-[#0052ff]/45'
                      }`}
                    >
                      <div className="font-bold text-sm">{dept.code}</div>
                      <div className="text-xs text-[#737688] mt-1 leading-snug">
                        {dept.name}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </section>

            {/* Step 2 — Year */}
            {selectedDept && (
              <section className="mb-10">
                <h2 className="text-xs font-bold text-[#737688] uppercase tracking-widest mb-4">
                  Step 2 — Select Year
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {YEARS.map(y => (
                    <button
                      key={y.value}
                      onClick={() => handleYearSelect(y.value)}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        selectedYear === y.value
                          ? 'bg-[#e2e7ff] border-[#0052ff] text-[#003ec7] shadow-sm'
                          : 'bg-white/90 border-[#c3c5d9]/80 text-[#434656] hover:bg-[#f2f3ff] hover:border-[#0052ff]/45'
                      }`}
                    >
                      <div className="text-2xl mb-1">{y.icon}</div>
                      <div className="font-bold text-sm">{y.label}</div>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Step 3 — Semester */}
            {selectedYear && (
              <section className="mb-10">
                <h2 className="text-xs font-bold text-[#737688] uppercase tracking-widest mb-4">
                  Step 3 — Select Semester
                </h2>
                <div className="flex gap-3">
                  {SEMESTERS[selectedYear].map(sem => (
                    <button
                      key={sem}
                      onClick={() => setSelectedSem(sem)}
                      className={`px-6 py-3 rounded-xl border font-bold transition-all ${
                        selectedSem === sem
                          ? 'bg-[#e2e7ff] border-[#0052ff] text-[#003ec7] shadow-sm'
                          : 'bg-white/90 border-[#c3c5d9]/80 text-[#434656] hover:bg-[#f2f3ff] hover:border-[#0052ff]/45'
                      }`}
                    >
                      Semester {sem}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Step 4 — Subjects */}
            {selectedSem && (
              <section>
                <h2 className="text-xs font-bold text-[#737688] uppercase tracking-widest mb-4">
                  Step 4 — Select Subject
                </h2>

                {loadingSubjects ? (
                  <div className="flex items-center gap-3 text-[#565e74]">
                    <div className="w-4 h-4 border-2 border-[#0052ff] border-t-transparent rounded-full animate-spin" />
                    Loading subjects...
                  </div>
                ) : subjects.length === 0 ? (
                  <div className="academic-card rounded-lg p-12 text-center">
                    <div className="text-4xl mb-3">📭</div>
                    <p className="text-[#565e74]">No subjects found</p>
                  </div>
                ) : (
                  <div className="academic-card rounded-lg overflow-hidden">
                    {subjects.map((subject, index) => (
                      <button
                        key={subject.id}
                        onClick={() => navigate(`/subject/${subject.id}`)}
                        className={`w-full flex items-center justify-between px-6 py-4 text-left hover:bg-[#f2f3ff] transition-colors ${
                          index !== subjects.length - 1
                            ? 'border-b border-[#c3c5d9]/70'
                            : ''
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-[#e2e7ff] rounded-lg flex items-center justify-center text-lg">
                            📘
                          </div>
                          <div>
                            <div className="font-semibold text-[#0b1c30]">
                              {subject.name}
                            </div>
                            <div className="text-xs text-[#737688] mt-0.5">
                              {subject.code} · Sem {subject.semester}
                            </div>
                          </div>
                        </div>
                        <span className="text-[#737688]">→</span>
                      </button>
                    ))}
                  </div>
                )}
              </section>
            )}

          </div>
        )}

      </div>
    </div>
  )
}

// Helper function — highlights the matching part of text in yellow
// e.g. searching "data" in "Data Structures" wraps "Data" in a yellow span
function highlightMatch(text, query) {
  if (!query) return text

  // Find where the match starts (case insensitive)
  const index = text.toLowerCase().indexOf(query.toLowerCase())

  if (index === -1) return text  // no match found

  // Split into three parts: before match, the match, after match
  const before = text.substring(0, index)
  const match  = text.substring(index, index + query.length)
  const after  = text.substring(index + query.length)

  return (
    <>
      {before}
      <span className="bg-[#e2e7ff] text-[#003ec7] rounded px-0.5">
        {match}
      </span>
      {after}
    </>
  )
}
