import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const { user }   = useAuth()
  const navigate   = useNavigate()
  const [query, setQuery] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    if (!query.trim()) return

    // Navigate to browse page with search query in URL
    // Browse page will read this and auto-trigger search
    navigate(`/browse?search=${encodeURIComponent(query.trim())}`)
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* Hero Section */}
      <div className="max-w-5xl mx-auto px-4 py-24 text-center">

        <div className="inline-block bg-teal-500/10 border border-teal-500/30 text-teal-400 text-sm font-medium px-4 py-2 rounded-full mb-8">
          ✨ Free study materials for all BTech students
        </div>

        <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
          Study Smarter,
          <span className="text-teal-400"> Score Higher</span>
        </h1>

        <p className="text-gray-400 text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
          Upload and access notes, previous year questions, lab manuals and slides —
          organised by department, year, semester and subject.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-6">
          <div className="flex items-center bg-gray-900 border border-gray-700 rounded-2xl px-5 py-4 focus-within:border-teal-500 transition-colors gap-3">
            <span className="text-gray-500 text-xl flex-shrink-0">🔍</span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search any subject, e.g. Data Structures, Machine Learning..."
              className="flex-1 bg-transparent text-white placeholder-gray-500 text-base focus:outline-none"
            />
            <button
              type="submit"
              disabled={!query.trim()}
              className="bg-teal-500 hover:bg-teal-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors flex-shrink-0"
            >
              Search
            </button>
          </div>

          {/* Quick search suggestions */}
          <div className="flex flex-wrap gap-2 justify-center mt-4">
            {[
              'Data Structures',
              'Machine Learning',
              'Computer Networks',
              'DBMS',
              'Operating Systems',
              'Deep Learning',
            ].map(suggestion => (
              <button
                key={suggestion}
                type="button"
                onClick={() => navigate(`/browse?search=${encodeURIComponent(suggestion)}`)}
                className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-400 hover:text-white text-xs px-3 py-1.5 rounded-full transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </form>

        {/* CTA Buttons */}
        <div className="flex gap-4 justify-center flex-wrap mt-8">
          <Link
            to="/browse"
            className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white font-bold px-8 py-4 rounded-xl text-lg transition-colors"
          >
            Browse by Department
          </Link>
          {!user && (
            <Link
              to="/register"
              className="border border-gray-700 hover:border-gray-500 text-white font-bold px-8 py-4 rounded-xl text-lg transition-colors"
            >
              Create Account
            </Link>
          )}
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-4xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Departments', value: '8',   icon: '🏛️' },
            { label: 'Subjects',    value: '320+', icon: '📚' },
            { label: 'BTech Years', value: '4',   icon: '🎓' },
            { label: 'Semesters',   value: '8',   icon: '📅' },
          ].map(stat => (
            <div
              key={stat.label}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center"
            >
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-3xl font-black text-teal-400">{stat.value}</div>
              <div className="text-gray-500 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-5xl mx-auto px-4 pb-24">
        <h2 className="text-3xl font-bold text-center mb-12">Everything you need</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: '📝',
              title: 'Notes & Slides',
              desc: 'Access handwritten notes and presentation slides shared by seniors and classmates'
            },
            {
              icon: '📋',
              title: 'Previous Year Questions',
              desc: 'Practice with real exam papers from previous years to ace your exams'
            },
            {
              icon: '🧪',
              title: 'Lab Manuals',
              desc: 'Complete lab manuals and experiment guides for every subject'
            },
          ].map(feature => (
            <div
              key={feature.title}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-8"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}