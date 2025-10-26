import { useEffect, useRef, useState } from 'react'

const USERNAME = 'KevinGMK'
const MAX_SHOW = 4

type Repo = any
type RepoData = {
  repo: Repo
  preview: string | null
  finalDescription: string | null
  status: string | null
}

export default function Proyectos() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [recent, setRecent] = useState<RepoData[]>([])
  const carouselRef = useRef<HTMLDivElement | null>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const GAP = 16
  function getStep() {
    const carousel = carouselRef.current
    if (!carousel) return 320
    const first = carousel.querySelector('.repo-box') as HTMLElement | null
    if (!first) return 320
    const w = first.offsetWidth
    return w + GAP
  }

  function scrollByIndex(dir: number) {
    const carousel = carouselRef.current
    if (!carousel) return
    const step = getStep()
    const maxScroll = carousel.scrollWidth - carousel.clientWidth
    const current = carousel.scrollLeft
    const idx = Math.round(current / step)
    const targetIdx = Math.max(0, Math.min(idx + dir, Math.ceil(carousel.scrollWidth / step)))
    const target = Math.max(0, Math.min(targetIdx * step, maxScroll))
    carousel.scrollTo({ left: target, behavior: 'smooth' })
  }

  useEffect(() => {
    let cancelled = false

    async function loadRecent() {
      try {
        const res = await fetch(`https://api.github.com/users/${USERNAME}/repos?per_page=100&sort=updated`)
        const repos: Repo[] = await res.json()
        if (!Array.isArray(repos)) throw new Error('Respuesta inesperada de GitHub')

        // ordenar por fecha de actualización
        repos.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        const slice = repos.slice(0, MAX_SHOW * 2) // tomamos más por si algunos se filtran

        const dataArr = await Promise.all(slice.map(fetchRepoData))
        // Filtrar solo los que tienen status válido
        const valid = dataArr.filter(d => d.status && d.status.trim() !== '')
        if (!cancelled) setRecent(valid.slice(0, MAX_SHOW))
      } catch (err: any) {
        console.error('Error cargando repositorios:', err)
        if (!cancelled) setError(String(err))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadRecent()
    return () => { cancelled = true }
  }, [])

  async function fetchRepoData(repo: Repo): Promise<RepoData> {
    const base = `https://raw.githubusercontent.com/${USERNAME}/${repo.name}/main/`
    const data: RepoData = {
      repo,
      preview: null,
      finalDescription: repo.description || 'Sin descripción',
      status: null
    }

    try {
      const s = await fetch(base + 'status.txt')
      if (s.ok) data.status = (await s.text()).trim()
    } catch {}

    try {
      const p = await fetch(base + 'preview.png')
      if (p.ok) data.preview = base + 'preview.png'
    } catch {}

    try {
      const d = await fetch(base + 'description.txt')
      if (d.ok) data.finalDescription = await d.text()
    } catch {}

    return data
  }

  useEffect(() => {
    const carousel = carouselRef.current
    if (!carousel) return

    const update = () => {
      setCanScrollLeft(carousel.scrollLeft > 0)
      setCanScrollRight(carousel.scrollLeft + carousel.clientWidth < carousel.scrollWidth - 1)
    }

    carousel.addEventListener('scroll', update)
    window.addEventListener('resize', update)
    carousel.querySelectorAll('img').forEach(img => img.complete ? null : img.addEventListener('load', update))
    update()

    return () => {
      carousel.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [recent.length])

  function makeCard(d: RepoData) {
    const link = d.repo.has_pages
      ? `https://${USERNAME}.github.io/${d.repo.name}`
      : d.repo.html_url
    const img = d.preview
      ? <img src={d.preview} className="repo-preview" alt={`Preview ${d.repo.name}`} />
      : null
    return (
      <div className="repo-box project-card" key={d.repo.id}>
        {img}
        <h3><a href={link} target="_blank" rel="noreferrer">{d.repo.name}</a></h3>
        <p>{d.finalDescription}</p>
        <span className="status-tag">{d.status}</span>
      </div>
    )
  }

  return (
    <section className="section projects container" aria-labelledby="projects-title">
      <h2 id="projects-title">Proyectos recientes</h2>
      {loading && <p>Cargando proyectos recientes desde GitHub...</p>}
      {error && <p style={{ color: 'var(--danger)' }}>Error: {error}</p>}

      {!loading && !error && (
        <div className="carousel-wrapper">
          <div className="carousel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p className="muted">Mostrando {recent.length} proyectos con estado</p>
            <div className="carousel-controls">
              <button className="arrow-btn left" aria-label="Anterior" onClick={() => scrollByIndex(-1)} disabled={!canScrollLeft}>◀</button>
              <button className="arrow-btn right" aria-label="Siguiente" onClick={() => scrollByIndex(1)} disabled={!canScrollRight}>▶</button>
            </div>
          </div>

          <div className="repo-carousel" ref={carouselRef}>
            {recent.length === 0 && <p className="muted">No se encontraron proyectos con estado</p>}
            {recent.map(d => makeCard(d))}
          </div>
        </div>
      )}
    </section>
  )
}
