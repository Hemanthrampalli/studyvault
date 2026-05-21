// Browse.jsx
// Main navigation page
// User selects: Department → Year → Semester → Subject
// Each selection filters the next level

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDepartments, getSubjects } from '../api'

// Year and semester options
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

  // Selection state — tracks what user has picked
  const [selectedDept, setSelectedDept] = useState(null)
  const [selectedYear, setSelectedYear] = useState(null)
  const [selectedSem,  setSelectedSem ] = useState(null)

  // Data from backend
  const [departments, setDepartments] = useState([])
  const [subjects,    setSubjects    ] = useState([])

  // Loading states
  const [loadingDepts,    setLoadingDepts   ] = useState(true)
  const [loadingSubjects, setLoadingSubjects] = useState(false)

  // Load departments once on page load
  useEffect(() => {
    getDepartments()
      .then(res => setDepartments(res.data))
      .finally(() => setLoadingDepts(false))
  }, [])

  // Load subjects whenever dept + year + semester are all selected
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

  // When department changes, reset everything below it
  const handleDeptSelect = (dept) => {
    setSelectedDept(dept)
    setSelectedYear(null)
    setSelectedSem(null)
    setSubjects([])
  }

  // When year changes, reset semester and subjects
  const handleYearSelect = (year) => {
    setSelectedYear(year)
    setSelectedSem(null)
    setSubjects([])
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-10">

        <h1 className="text-3xl font-black mb-2">Browse Materials</h1>
        <p className="text-gray-400 mb-10">
          Select your department, year and semester to find study materials
        </p>

        {/* ── STEP 1: Department ────────────────────────── */}
        <section className="mb-10">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
            Step 1 — Select Department
          </h2>

          {loadingDepts ? (
            <p className="text-gray-500">Loading departments...</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {departments.map(dept => (
                <button
                  key={dept.id}
                  onClick={() => handleDeptSelect(dept)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    selectedDept?.id === dept.id
                      ? 'bg-teal-500/20 border-teal-500 text-teal-300'
                      : 'bg-gray-900 border-gray-800 text-gray-300 hover:border-gray-600'
                  }`}
                >
                  <div className="font-bold text-sm">{dept.code}</div>
                  <div className="text-xs text-gray-500 mt-1 leading-snug">{dept.name}</div>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* ── STEP 2: Year ──────────────────────────────── */}
        {selectedDept && (
          <section className="mb-10">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
              Step 2 — Select Year
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {YEARS.map(y => (
                <button
                  key={y.value}
                  onClick={() => handleYearSelect(y.value)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    selectedYear === y.value
                      ? 'bg-teal-500/20 border-teal-500 text-teal-300'
                      : 'bg-gray-900 border-gray-800 text-gray-300 hover:border-gray-600'
                  }`}
                >
                  <div className="text-2xl mb-1">{y.icon}</div>
                  <div className="font-bold text-sm">{y.label}</div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ── STEP 3: Semester ──────────────────────────── */}
        {selectedYear && (
          <section className="mb-10">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
              Step 3 — Select Semester
            </h2>
            <div className="flex gap-3">
              {SEMESTERS[selectedYear].map(sem => (
                <button
                  key={sem}
                  onClick={() => setSelectedSem(sem)}
                  className={`px-6 py-3 rounded-xl border font-bold transition-all ${
                    selectedSem === sem
                      ? 'bg-teal-500/20 border-teal-500 text-teal-300'
                      : 'bg-gray-900 border-gray-800 text-gray-300 hover:border-gray-600'
                  }`}
                >
                  Semester {sem}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ── STEP 4: Subjects ──────────────────────────── */}
        {selectedSem && (
          <section>
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
              Step 4 — Select Subject
            </h2>

            {loadingSubjects ? (
              <p className="text-gray-500">Loading subjects...</p>
            ) : subjects.length === 0 ? (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center">
                <div className="text-4xl mb-3">📭</div>
                <p className="text-gray-400">No subjects found for this selection</p>
              </div>
            ) : (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                {subjects.map((subject, index) => (
                  <button
                    key={subject.id}
                    onClick={() => navigate(`/subject/${subject.id}`)}
                    className={`w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-800 transition-colors ${
                      index !== subjects.length - 1 ? 'border-b border-gray-800' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Subject icon */}
                      <div className="w-10 h-10 bg-teal-500/10 rounded-xl flex items-center justify-center text-lg">
                        📘
                      </div>
                      <div>
                        <div className="font-semibold text-white">{subject.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {subject.code} · Sem {subject.semester}
                        </div>
                      </div>
                    </div>
                    <span className="text-gray-600">→</span>
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

      </div>
    </div>
  )
}