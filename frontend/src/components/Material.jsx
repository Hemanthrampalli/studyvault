import { useState } from 'react'
import { downloadMaterial } from '../api'

export default function Material({ material }) {
  const [downloading, setDownloading] = useState(false)

  // Get file icon based on type
  const getFileIcon = (fileType) => {
    const icons = {
      pdf: '📄',
      ppt: '🎯',
      doc: '📝',
      docx: '📝',
      zip: '📦',
      jpg: '🖼️',
      png: '🖼️',
      xlsx: '📊',
    }
    return icons[fileType?.toLowerCase()] || '📎'
  }

  // Handle download
  const handleDownload = async () => {
    try {
      setDownloading(true)
      await downloadMaterial(material.id)
      // Open file in new tab
      window.open(material.file_url, '_blank')
    } catch (err) {
      alert('Download failed: ' + err.message)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-teal-500 transition">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1">
          <span className="text-2xl">{getFileIcon(material.file_type)}</span>
          <div className="flex-1">
            <h3 className="font-bold text-white truncate">{material.title}</h3>
            <p className="text-sm text-gray-400">{material.uploader_name}</p>
          </div>
        </div>
        <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">
          {material.file_type?.toUpperCase()}
        </span>
      </div>

      {/* Description */}
      {material.description && (
        <p className="text-sm text-gray-400 mb-3 line-clamp-2">
          {material.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-800">
        <div className="text-xs text-gray-500">
          📥 {material.downloads || 0} downloads
        </div>
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-sm font-bold px-3 py-1 rounded transition"
        >
          {downloading ? 'Downloading...' : 'Download'}
        </button>
      </div>
    </div>
  )
}