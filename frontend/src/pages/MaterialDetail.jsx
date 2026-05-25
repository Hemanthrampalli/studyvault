import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getMaterial, getMaterials, trackDownload } from '../api'
import MaterialCard, { formatDate, formatSize, getTypeInfo } from '../components/MaterialCard'
import { useAuth } from '../context/AuthContext'

export default function MaterialDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [material, setMaterial] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    getMaterial(id)
      .then((res) => {
        setMaterial(res.data)
        if (res.data?.subject_id) {
          return getMaterials({ subject_id: res.data.subject_id, limit: 3 }).then((relatedRes) =>
            setRelated(relatedRes.data.filter((item) => item.id !== res.data.id)),
          )
        }
        return null
      })
      .catch((err) => setError(err.response?.data?.error || 'Could not load this material.'))
      .finally(() => setLoading(false))
  }, [id])

  const typeInfo = useMemo(() => getTypeInfo(material?.material_type), [material?.material_type])
  const isImage = material?.file_type && ['png', 'jpg', 'jpeg', 'webp'].includes(material.file_type.toLowerCase())

  const handleDownload = async () => {
    if (!material?.file_url) return

    if (user) {
      try {
        await trackDownload(material.id)
        setMaterial((prev) => ({ ...prev, downloads: Number(prev.downloads || 0) + 1 }))
      } catch (err) {
        console.warn('Download tracking failed:', err)
      }
    }

    window.open(material.file_url, '_blank', 'noopener,noreferrer')
  }

  if (loading) {
    return <div className="py-20 text-center text-[#565e74]">Loading material...</div>
  }

  if (error || !material) {
    return (
      <div className="academic-card rounded-lg p-12 text-center">
        <h1 className="text-3xl font-extrabold text-[#0b1c30]">Material unavailable</h1>
        <p className="mt-3 text-[#565e74]">{error || 'This resource could not be found.'}</p>
        <button className="mt-6 rounded-lg bg-[#003ec7] px-6 py-3 font-bold text-white" onClick={() => navigate('/browse')} type="button">
          Back to Browser
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <button
        className="flex items-center gap-2 text-sm font-bold text-[#565e74] transition hover:text-[#0052ff]"
        onClick={() => navigate(-1)}
        type="button"
      >
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        Back
      </button>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_24rem]">
        <section className="academic-card overflow-hidden rounded-lg">
          <div className="flex flex-col justify-between gap-4 border-b border-[#c3c5d9]/70 bg-[#f2f3ff] px-6 py-5 lg:flex-row lg:items-center">
            <div>
              <span className={`mb-3 inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-extrabold ${typeInfo.tone}`}>
                <span className="material-symbols-outlined text-[18px]">{typeInfo.icon}</span>
                {typeInfo.label}
              </span>
              <h1 className="text-3xl font-extrabold leading-tight text-[#0b1c30]">{material.title}</h1>
            </div>
            <div className="flex gap-2">
              <button className="rounded-lg bg-white p-3 text-[#434656] ring-1 ring-[#c3c5d9]" type="button">
                <span className="material-symbols-outlined">print</span>
              </button>
              <button className="rounded-lg bg-white p-3 text-[#434656] ring-1 ring-[#c3c5d9]" type="button">
                <span className="material-symbols-outlined">fullscreen</span>
              </button>
            </div>
          </div>

          <div className="min-h-[34rem] bg-[#dce9ff] p-6">
            {isImage ? (
              <img alt={material.title} className="mx-auto max-h-[44rem] rounded-lg object-contain shadow-xl" src={material.file_url} />
            ) : (
              <div className="flex min-h-[32rem] flex-col items-center justify-center rounded-lg border border-[#c3c5d9] bg-white text-center">
                <span className="material-symbols-outlined mb-5 text-[80px] text-[#0052ff]">description</span>
                <h2 className="text-2xl font-extrabold text-[#0b1c30]">Preview opens in a new tab</h2>
                <p className="mt-3 max-w-md text-[#565e74]">
                  Browser preview depends on the file type. Download or open the resource to inspect the full material.
                </p>
                <button className="mt-6 rounded-lg bg-[#003ec7] px-6 py-3 font-extrabold text-white" onClick={handleDownload} type="button">
                  Open Resource
                </button>
              </div>
            )}
          </div>
        </section>

        <aside className="space-y-5">
          <div className="academic-card rounded-lg p-6">
            <h2 className="text-2xl font-extrabold text-[#0b1c30]">Resource Details</h2>
            <p className="mt-4 leading-7 text-[#565e74]">
              {material.description || 'No description was provided by the uploader.'}
            </p>

            <button
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-[#005bbf] px-5 py-4 font-extrabold text-white shadow-lg shadow-blue-900/10 transition hover:bg-[#0052ff]"
              onClick={handleDownload}
              type="button"
            >
              <span className="material-symbols-outlined">download</span>
              Download Resource
            </button>
          </div>

          <div className="academic-card rounded-lg p-6">
            <h2 className="mb-5 text-xl font-extrabold text-[#0b1c30]">Metadata</h2>
            <dl className="space-y-4 text-sm">
              {[
                ['Uploader', material.uploader_name || material.profiles?.name || 'Anonymous'],
                ['Subject', material.subjects?.name || 'Not linked'],
                ['Department', material.subjects?.departments?.code || 'N/A'],
                ['File Size', formatSize(material.file_size)],
                ['Downloads', Number(material.downloads || 0)],
                ['Uploaded', formatDate(material.created_at)],
              ].map(([label, value]) => (
                <div className="flex items-start justify-between gap-4 border-b border-[#c3c5d9]/50 pb-3" key={label}>
                  <dt className="font-bold text-[#737688]">{label}</dt>
                  <dd className="text-right font-semibold text-[#0b1c30]">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="flex flex-wrap gap-2">
            {['verified', 'academic', material.file_type || 'resource'].map((tag) => (
              <span className="rounded-full bg-[#e5eeff] px-3 py-1 text-xs font-bold text-[#565e74]" key={tag}>
                #{tag}
              </span>
            ))}
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-3xl font-extrabold text-[#0b1c30]">Related Materials</h2>
            <Link className="font-extrabold text-[#0052ff]" to={`/subject/${material.subject_id}`}>
              View subject
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {related.map((item) => (
              <MaterialCard key={item.id} material={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
