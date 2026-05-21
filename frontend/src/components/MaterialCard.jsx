// MaterialCard.jsx
// Reusable card component for displaying a single material
// Used in Subject.jsx

import { downloadMaterial } from '/src/api.js';
import { useAuth } from '../context/AuthContext'

// Material type config — icon and color for each type
const TYPE_CONFIG = {
  notes:     { icon: '📝', label: 'Notes',     color: 'teal'   },
  pyq:       { icon: '📋', label: 'PYQ',       color: 'yellow' },
  lab:       { icon: '🧪', label: 'Lab Manual', color: 'red'    },
  slides:    { icon: '🖥️', label: 'Slides',    color: 'blue'   },
  reference: { icon: '📚', label: 'Reference', color: 'purple' },
}

// Converts bytes to readable size e.g. 2457600 → "2.3 MB"
function formatSize(bytes) {
  if (!bytes) return 'Unknown size'
  if (bytes < 1024)        return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

// Formats date e.g. "2024-08-15" → "15 Aug 2024"
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day:   'numeric',
    month: 'short',
    year:  'numeric'
  })
}

export default function MaterialCard({ material, onDownload }) {
  const { user }  = useAuth()
  const typeInfo  = TYPE_CONFIG[material.material_type] || TYPE_CONFIG.notes

  const handleDownload = async () => {
    // If user is logged in, track the download
    if (user) {
      try { await trackDownload(material.id) } catch {}
    }

    // Notify parent to update download count in UI
    onDownload?.(material.id)

    // Open file in new tab
    window.open(material.file_url, '_blank')
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-all">

      {/* Top row — icon + title + type badge */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-11 h-11 bg-gray-800 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
          {typeInfo.icon}
        </div>
        <div className="flex-1 min-w-0">
          {/* min-w-0 allows text to truncate properly */}
          <h3 className="text-white font-semibold text-sm leading-snug mb-1 line-clamp-2">
            {material.title}
          </h3>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-md bg-${typeInfo.color}-500/10 text-${typeInfo.color}-400`}>
            {typeInfo.label}
          </span>
        </div>
      </div>

      {/* Description if present */}
      {material.description && (
        <p className="text-gray-500 text-xs mb-4 line-clamp-2">
          {material.description}
        </p>
      )}

      {/* Meta info */}
      <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-4">
        <span>👤 {material.uploader_name || 'Anonymous'}</span>
        <span>📦 {formatSize(material.file_size)}</span>
        <span>⬇️ {material.downloads} downloads</span>
        <span>📅 {formatDate(material.created_at)}</span>
      </div>

      {/* Download button */}
      <button
        onClick={handleDownload}
        className="w-full bg-teal-500 hover:bg-teal-600 text-white text-sm font-bold py-2.5 rounded-xl transition-colors"
      >
        ⬇ Download {material.file_type?.toUpperCase()}
      </button>

    </div>
  )
}