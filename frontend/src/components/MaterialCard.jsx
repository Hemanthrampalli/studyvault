import { Link } from 'react-router-dom'
import { trackDownload } from '../api'
import { useAuth } from '../context/AuthContext'

const TYPE_CONFIG = {
  notes: { icon: 'description', label: 'Notes', tone: 'bg-blue-50 text-blue-700' },
  lecture_note: { icon: 'description', label: 'Lecture Note', tone: 'bg-blue-50 text-blue-700' },
  pyq: { icon: 'assignment', label: 'PYQ', tone: 'bg-amber-50 text-amber-700' },
  lab: { icon: 'science', label: 'Lab Manual', tone: 'bg-red-50 text-red-700' },
  slides: { icon: 'slideshow', label: 'Slides', tone: 'bg-orange-50 text-orange-700' },
  reference: { icon: 'menu_book', label: 'Reference', tone: 'bg-violet-50 text-violet-700' },
  dataset: { icon: 'table_chart', label: 'Dataset', tone: 'bg-emerald-50 text-emerald-700' },
}

export function formatSize(bytes) {
  if (!bytes) return 'Unknown size'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function formatDate(dateStr) {
  if (!dateStr) return 'Unknown date'
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function getTypeInfo(type) {
  return TYPE_CONFIG[type] || TYPE_CONFIG.notes
}

export default function MaterialCard({ material, onDownload }) {
  const { user } = useAuth()
  const typeInfo = getTypeInfo(material.material_type)

  const handleDownload = async (event) => {
    event.preventDefault()
    event.stopPropagation()

    if (user) {
      try {
        await trackDownload(material.id)
      } catch (err) {
        console.warn('Download tracking failed:', err)
      }
    }

    onDownload?.(material.id)
    window.open(material.file_url, '_blank', 'noopener,noreferrer')
  }

  return (
    <Link
      className="academic-card group flex min-h-[19rem] flex-col rounded-lg p-5 transition hover:-translate-y-0.5 hover:border-[#0052ff]/45 hover:shadow-xl hover:shadow-blue-900/10"
      to={`/materials/${material.id}`}
    >
      <div className="mb-5 flex items-start justify-between gap-3">
        <span className={`inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-extrabold ${typeInfo.tone}`}>
          <span className="material-symbols-outlined text-[18px]">{typeInfo.icon}</span>
          {typeInfo.label}
        </span>
        <span className="flex items-center gap-1 text-sm font-bold text-[#9e4300]">
          <span className="material-symbols-outlined icon-filled text-[18px]">star</span>
          {material.rating || '4.8'}
        </span>
      </div>

      <h3 className="line-clamp-2 text-xl font-bold leading-snug text-[#0b1c30]">{material.title}</h3>
      <p className="line-clamp-3 mt-3 flex-1 text-sm leading-6 text-[#565e74]">
        {material.description || 'Community-contributed academic material for this subject.'}
      </p>

      <div className="mt-5 flex items-end justify-between gap-4 border-t border-[#c3c5d9]/70 pt-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[#0b1c30]">
            {material.uploader_name || material.profiles?.name || 'Anonymous'}
          </p>
          <p className="mt-1 text-xs text-[#737688]">{formatDate(material.created_at)}</p>
        </div>
        <button
          className="flex shrink-0 items-center gap-2 rounded-lg bg-[#eff4ff] px-3 py-2 text-sm font-extrabold text-[#005bbf] transition group-hover:bg-[#005bbf] group-hover:text-white"
          onClick={handleDownload}
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">download</span>
          {formatSize(material.file_size)}
        </button>
      </div>
    </Link>
  )
}
