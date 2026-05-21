import { useState, useEffect } from 'react'
import { getDepartments, getSubjects, getMaterials } from '../api'
import Material from '../components/Material'
import UploadModal from '../components/UploaModal'
import { useAuth } from '../context/AuthContext'

export default function Browse() {
  const { user } = useAuth()
  
  // Filter states
  const [departments, setDepartments] = useState([])
  const [selectedDept, setSelectedDept] = useState('')

  const [years, setYears] = useState([])
  const [selectedYear, setSelectedYear] = useState('')

  const [semesters, setSemesters] = useState([])
  const [selectedSemester, setSelectedSemester] = useState('')

  const [subjects, setSubjects] = useState([])
  const [selectedSubject, setSelectedSubject] = useState(null)

  const [materials, setMaterials] = useState([])
  const [uploadOpen, setUploadOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // Load departments on mount
  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const res = await getDepartments()
        setDepartments(res.data)
      } catch (err) {
        console.error('Error loading departments:', err)
      }
    }
    loadDepartments()
  }, [])

  // When department changes, load subjects for that dept + extract years
  useEffect(() => {
    if (!selectedDept) {
      setYears([])
      setSelectedYear('')
      setSemesters([])
      setSelectedSemester('')
      setSubjects([])
      setSelectedSubject(null)
      setMaterials([])
      return
    }

    const loadSubjects = async () => {
      try {
        setLoading(true)
        const res = await getSubjects({ department_id: selectedDept })
        setSubjects(res.data)

        // Extract unique years
        const uniqueYears = [...new Set(res.data.map(s => s.year))].sort()
        setYears(uniqueYears)
        setSelectedYear('')
        setSemesters([])
        setSelectedSemester('')
      } catch (err) {
        console.error('Error loading subjects:', err)
      } finally {
        setLoading(false)
      }
    }

    loadSubjects()
  }, [selectedDept])

  // When year changes, extract semesters
  useEffect(() => {
    if (!selectedYear) {
      setSemesters([])
      setSelectedSemester('')
      setSelectedSubject(null)
      setMaterials([])
      return
    }

    const filtered = subjects.filter(s => s.year === parseInt(selectedYear))
    const uniqueSemesters = [...new Set(filtered.map(s => s.semester))].sort()
    setSemesters(uniqueSemesters)
    setSelectedSemester('')
  }, [selectedYear, subjects])

  // When semester changes, filter subjects
  useEffect(() => {
    if (!selectedSemester) {
      setSelectedSubject(null)
      setMaterials([])
      return
    }

    const filtered = subjects.filter(
      s => s.year === parseInt(selectedYear) && s.semester === parseInt(selectedSemester)
    )
    // Automatically load materials if only 1 subject
    if (filtered.length === 1) {
      setSelectedSubject(filtered[0])
      loadMaterials(filtered[0].id)
    }
  }, [selectedSemester])

  // When subject changes, load its materials
  const handleSubjectClick = (subject) => {
    setSelectedSubject(subject)
    loadMaterials(subject.id)
  }

  const loadMaterials = async (subject_id) => {
    try {
      setLoading(true)
      const res = await getMaterials(subject_id)
      setMaterials(res.data)
    } catch (err) {
      console.error('Error loading materials:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUploadSuccess = () => {
    if (selectedSubject) {
      loadMaterials(selectedSubject.id)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-12">

        <h1 className="text-4xl font-bold mb-2">Browse Materials</h1>
        <p className="text-gray-400 mb-8">
          Find study materials by department, year, semester and subject
        </p>

        {/* Filters Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">

          {/* Department */}
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">
              Department
            </label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded focus:outline-none focus:border-teal-500"
            >
              <option value="">Select Department</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          {/* Year */}
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">
              Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              disabled={!selectedDept}
              className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded focus:outline-none focus:border-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Select Year</option>
              {years.map(year => (
                <option key={year} value={year}>
                  Year {year}
                </option>
              ))}
            </select>
          </div>

          {/* Semester */}
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">
              Semester
            </label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              disabled={!selectedYear}
              className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded focus:outline-none focus:border-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Select Semester</option>
              {semesters.map(sem => (
                <option key={sem} value={sem}>
                  Semester {sem}
                </option>
              ))}
            </select>
          </div>

          {/* Upload Button */}
          {user && selectedSubject && (
            <div className="flex items-end">
              <button
                onClick={() => setUploadOpen(true)}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold px-4 py-2 rounded transition"
              >
                📤 Upload
              </button>
            </div>
          )}
        </div>

        {/* Subjects List */}
        {selectedYear && selectedSemester && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Subjects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {subjects
                .filter(s => s.year === parseInt(selectedYear) && s.semester === parseInt(selectedSemester))
                .map(subject => (
                  <button
                    key={subject.id}
                    onClick={() => handleSubjectClick(subject)}
                    className={`p-4 rounded-lg border transition text-left font-bold ${
                      selectedSubject?.id === subject.id
                        ? 'bg-teal-600 border-teal-500'
                        : 'bg-gray-900 border-gray-700 hover:border-teal-500'
                    }`}
                  >
                    {subject.name}
                  </button>
                ))}
            </div>
          </div>
        )}

        {/* Materials Grid */}
        {selectedSubject && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold">{selectedSubject.name}</h2>
                <p className="text-gray-400">
                  {materials.length} materials available
                </p>
              </div>
            </div>

            {loading ? (
              <p className="text-center text-gray-400">Loading materials...</p>
            ) : materials.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {materials.map(material => (
                  <Material key={material.id} material={material} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-900 rounded-lg border border-gray-800">
                <p className="text-gray-400">No materials uploaded yet</p>
              </div>
            )}
          </div>
        )}

        {!selectedSubject && (
          <div className="text-center py-12 text-gray-400">
            Select filters above to browse materials
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
        subject_id={selectedSubject?.id}
        onSuccess={handleUploadSuccess}
      />
    </div>
  )
}