import { useEffect, useRef, useState } from "react";

const USERNAME = "KevinGMK";
const GAP = 16;

type Repo = any;
type RepoData = {
  repo: Repo;
  status: string | null;
  preview: string | null;
  finalDescription: string | null;
}

type ProjectSection = {
  title: string;
  data: RepoData[];
  ref: React.RefObject<HTMLDivElement | null>;
  canScrollLeft: boolean;
  canScrollRight: boolean;
}

export default function ProyectosPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Crear refs fuera del estado
  const terminadosRef = useRef<HTMLDivElement>(null);
  const enProcesoRef = useRef<HTMLDivElement>(null);
  const abandonadosRef = useRef<HTMLDivElement>(null);

  const [sections, setSections] = useState<{[key: string]: ProjectSection}>({
    terminados: {
      title: "Proyectos Terminados",
      data: [],
      ref: terminadosRef,
      canScrollLeft: false,
      canScrollRight: false
    },
    enProceso: {
      title: "Proyectos en Proceso",
      data: [],
      ref: enProcesoRef,
      canScrollLeft: false,
      canScrollRight: false
    },
    abandonados: {
      title: "Proyectos Abandonados",
      data: [],
      ref: abandonadosRef,
      canScrollLeft: false,
      canScrollRight: false
    }
  });

  function getStep(carousel: HTMLDivElement) {
    const first = carousel.querySelector(".repo-box") as HTMLElement | null;
    if (!first) return 320;
    return first.offsetWidth + GAP;
  }

  function scrollByIndex(sectionKey: string, dir: number) {
    const carousel = sections[sectionKey].ref.current;
    if (!carousel) return;
    const step = getStep(carousel);
    const maxScroll = carousel.scrollWidth - carousel.clientWidth;
    const current = carousel.scrollLeft;
    const idx = Math.round(current / step);
    const targetIdx = Math.max(0, Math.min(idx + dir, Math.ceil(carousel.scrollWidth / step)));
    const target = Math.max(0, Math.min(targetIdx * step, maxScroll));
    carousel.scrollTo({ left: target, behavior: "smooth" });
  }

  async function fetchRepoData(repo: Repo): Promise<RepoData> {
    const base = `https://raw.githubusercontent.com/${USERNAME}/${repo.name}/main/`;
    const data: RepoData = { 
      repo, 
      status: null,
      preview: null, 
      finalDescription: repo.description || "Sin descripci�n" 
    };

    try {
      const s = await fetch(base + "status.txt");
      if (s.ok) data.status = (await s.text()).trim().toLowerCase();
    } catch {}

    try {
      const p = await fetch(base + "preview.png");
      if (p.ok) data.preview = base + "preview.png";
    } catch {}

    try {
      const d = await fetch(base + "description.txt");
      if (d.ok) data.finalDescription = await d.text();
    } catch {}

    return data;
  }

  useEffect(() => {
    let cancelled = false;

    async function loadProjects() {
      try {
        const res = await fetch(`https://api.github.com/users/${USERNAME}/repos?per_page=100`);
        const repos: Repo[] = await res.json();
        if (!Array.isArray(repos)) throw new Error("Respuesta inesperada de GitHub");

        const dataArr = await Promise.all(repos.map(fetchRepoData));
        
        if (!cancelled) {
          setSections(prev => ({
            ...prev,
            terminados: { 
              ...prev.terminados, 
              data: dataArr.filter(d => d.status === "terminado")
            },
            enProceso: {
              ...prev.enProceso,
              data: dataArr.filter(d => d.status === "en proceso")
            },
            abandonados: {
              ...prev.abandonados,
              data: dataArr.filter(d => d.status === "abandonado")
            }
          }));
        }
      } catch (err: any) {
        console.error("Error cargando repositorios:", err);
        if (!cancelled) setError(String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProjects();
    return () => { cancelled = true };
  }, []);

  useEffect(() => {
    const cleanups: (() => void)[] = [];
    
    Object.entries(sections).forEach(([key, section]) => {
      const carousel = section.ref.current;
      if (!carousel) return;

      const update = () => {
        const canScrollLeft = carousel.scrollLeft > 0;
        const canScrollRight = carousel.scrollLeft + carousel.clientWidth < carousel.scrollWidth - 1;
        
        if (sections[key].canScrollLeft !== canScrollLeft || sections[key].canScrollRight !== canScrollRight) {
          setSections(prev => ({
            ...prev,
            [key]: {
              ...prev[key],
              canScrollLeft,
              canScrollRight
            }
          }));
        }
      };

      // Manejar el scroll
      carousel.addEventListener("scroll", update);
      cleanups.push(() => carousel.removeEventListener("scroll", update));

      // Manejar el resize
      window.addEventListener("resize", update);
      cleanups.push(() => window.removeEventListener("resize", update));

      // Manejar la carga de imágenes
      const imageLoadHandlers: { img: HTMLImageElement; handler: () => void }[] = [];
      carousel.querySelectorAll("img").forEach(img => {
        if (!img.complete) {
          const handler = () => update();
          img.addEventListener("load", handler);
          imageLoadHandlers.push({ img, handler });
        }
      });
      
      cleanups.push(() => {
        imageLoadHandlers.forEach(({ img, handler }) => {
          img.removeEventListener("load", handler);
        });
      });

      // Actualización inicial
      requestAnimationFrame(update);
    });

    return () => cleanups.forEach(cleanup => cleanup());
  }, [Object.keys(sections).length]); // Solo se ejecuta cuando cambia el número de secciones

  function makeCard(d: RepoData) {
    const link = d.repo.has_pages 
      ? `https://${USERNAME}.github.io/${d.repo.name}` 
      : d.repo.html_url;
    const img = d.preview 
      ? <img src={d.preview} className="repo-preview" alt={`Preview ${d.repo.name}`} /> 
      : null;
    return (
      <div className="repo-box project-card" key={d.repo.id}>
        {img}
        <h3><a href={link} target="_blank" rel="noreferrer">{d.repo.name}</a></h3>
        <p>{d.finalDescription}</p>
      </div>
    );
  }

  return (
    <section className="section projects container">
      <h1>Todos mis Proyectos</h1>
      {loading && <p>Cargando proyectos desde GitHub...</p>}
      {error && <p style={{color:"var(--danger)"}}>Error: {error}</p>}

      {!loading && !error && Object.entries(sections).map(([key, section]) => (
        <div key={key} className="carousel-wrapper">
          <div className="carousel-header" style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <h2>{section.title}</h2>
            <div className="carousel-controls">
              <button 
                className="arrow-btn left" 
                aria-label="Anterior"
                onClick={() => scrollByIndex(key, -1)}
                disabled={!section.canScrollLeft}
              >
                
              </button>
              <button 
                className="arrow-btn right" 
                aria-label="Siguiente"
                onClick={() => scrollByIndex(key, 1)}
                disabled={!section.canScrollRight}
              >
                
              </button>
            </div>
          </div>

          <div className="repo-carousel" ref={section.ref}>
            {section.data.length === 0 && (
              <p className="muted">No se encontraron proyectos en esta categoria</p>
            )}
            {section.data.map(d => makeCard(d))}
          </div>
        </div>
      ))}
    </section>
  );
}
