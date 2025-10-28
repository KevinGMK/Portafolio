import React, { useEffect, useRef, useState } from "react";
import { fetchProjectsJson } from "../utils/fetchProjects";
import type { ProyectoJSON } from "../utils/fetchProjects";

const GAP = 16;

type RepoData = {
  id: string | number;
  name: string;
  html_url: string;
  status: string | null;
  preview: string | null;
  finalDescription: string | null;
};

type ProjectSection = {
  title: string;
  data: RepoData[];
  ref: React.RefObject<HTMLDivElement | null>;
  canScrollLeft: boolean;
  canScrollRight: boolean;
};

export default function ProyectosPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const terminadosRef = useRef<HTMLDivElement | null>(null);
  const enProcesoRef = useRef<HTMLDivElement | null>(null);
  const abandonadosRef = useRef<HTMLDivElement | null>(null);

  const [sections, setSections] = useState<Record<string, ProjectSection>>({
    terminados: {
      title: "Proyectos Terminados",
      data: [],
      ref: terminadosRef,
      canScrollLeft: false,
      canScrollRight: false,
    },
    enProceso: {
      title: "Proyectos en Proceso",
      data: [],
      ref: enProcesoRef,
      canScrollLeft: false,
      canScrollRight: false,
    },
    abandonados: {
      title: "Proyectos Abandonados",
      data: [],
      ref: abandonadosRef,
      canScrollLeft: false,
      canScrollRight: false,
    },
  });

  function getStep(carousel: HTMLDivElement) {
    const first = carousel.querySelector(".repo-box") as HTMLElement | null;
    return first ? first.offsetWidth + GAP : 320;
  }

  function scrollByIndex(sectionKey: string, dir: number) {
    const carousel = sections[sectionKey]?.ref.current;
    if (!carousel) return;
    const step = getStep(carousel);
    const maxScroll = carousel.scrollWidth - carousel.clientWidth;
    const current = carousel.scrollLeft;
    const idx = Math.round(current / step);
    const targetIdx = Math.max(0, Math.min(idx + dir, Math.ceil(carousel.scrollWidth / step)));
    const target = Math.max(0, Math.min(targetIdx * step, maxScroll));
    carousel.scrollTo({ left: target, behavior: "smooth" });
  }

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const list = await fetchProjectsJson();
        if (!mounted) return;

        const mapped: RepoData[] = (list as ProyectoJSON[]).map((p) => ({
          id: p.id ?? p.name,
          name: p.name,
          html_url: p.html_url,
          status: (p.status ?? null) && String(p.status).toLowerCase().trim(),
          preview: p.preview ?? null,
          finalDescription: p.description ?? null,
        }));

        setSections((prev) => ({
          ...prev,
          terminados: {
            ...prev.terminados,
            data: mapped.filter((m) => m.status === "terminado"),
          },
          enProceso: {
            ...prev.enProceso,
            data: mapped.filter((m) => m.status === "en proceso"),
          },
          abandonados: {
            ...prev.abandonados,
            data: mapped.filter((m) => m.status === "abandonado"),
          },
        }));
      } catch (err: any) {
        console.error("Error cargando projects.json:", err);
        setError(String(err ?? "Error desconocido"));
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // Scroll detection
  useEffect(() => {
    const cleanups: (() => void)[] = [];

    Object.entries(sections).forEach(([key, section]) => {
      const carousel = section.ref.current;
      if (!carousel) return;

      const update = () => {
        const canScrollLeft = carousel.scrollLeft > 0;
        const canScrollRight =
          carousel.scrollLeft + carousel.clientWidth < carousel.scrollWidth - 1;

        setSections((prev) => {
          const cur = prev[key];
          if (!cur) return prev;
          if (
            cur.canScrollLeft === canScrollLeft &&
            cur.canScrollRight === canScrollRight
          )
            return prev;
          return {
            ...prev,
            [key]: { ...cur, canScrollLeft, canScrollRight },
          };
        });
      };

      carousel.addEventListener("scroll", update);
      cleanups.push(() => carousel.removeEventListener("scroll", update));

      window.addEventListener("resize", update);
      cleanups.push(() => window.removeEventListener("resize", update));

      carousel.querySelectorAll("img").forEach((img) => {
        if (!img.complete) {
          const handler = () => update();
          img.addEventListener("load", handler);
          cleanups.push(() => img.removeEventListener("load", handler));
        }
      });

      requestAnimationFrame(update);
    });

    return () => cleanups.forEach((fn) => fn());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    sections.terminados.data.length,
    sections.enProceso.data.length,
    sections.abandonados.data.length,
  ]);

  function openProject(d: RepoData) {
    const link = d.html_url || (d.name ? `https://${d.name}` : "#");
    window.open(link, "_blank", "noopener,noreferrer");
  }

  function makeCard(d: RepoData) {
    const img = d.preview ? (
      <img src={d.preview} className="repo-preview" alt={`Preview ${d.name}`} />
    ) : null;

    return (
      <div
        className="repo-box project-card"
        key={d.id}
        role="link"
        tabIndex={0}
        onClick={() => openProject(d)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") openProject(d);
        }}
        style={{ cursor: "pointer" }}
        aria-label={`Abrir proyecto ${d.name}`}
      >
        {img}
        <h3>
          <span>{d.name}</span>
        </h3>
        <p>{d.finalDescription ?? "Sin descripción"}</p>
      </div>
    );
  }

  return (
    <section className="section projects container">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
        }}
      >
        <h1>Todos mis Proyectos</h1>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            className="btn"
            onClick={() => window.location.reload()}
            disabled={loading}
          >
            {loading ? "Cargando..." : "Recargar"}
          </button>
        </div>
      </div>

      {loading && <p>Cargando proyectos desde el JSON...</p>}
      {error && <p style={{ color: "var(--danger)" }}>Error: {error}</p>}

      {!loading && !error && (
        <>
          {Object.entries(sections).map(([key, section]) => (
            <div key={key} className="carousel-wrapper" style={{ marginTop: 16 }}>
              <div
                className="carousel-header"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h2>
                  {section.title}{" "}
                  <small
                    style={{
                      color: "var(--muted)",
                      fontSize: 12,
                      marginLeft: 8,
                    }}
                  >
                    ({section.data.length})
                  </small>
                </h2>
                <div className="carousel-controls">
                  <button
                    className="arrow-btn left"
                    aria-label="Anterior"
                    onClick={() => scrollByIndex(key, -1)}
                    disabled={!section.canScrollLeft}
                  >
                    ◀
                  </button>
                  <button
                    className="arrow-btn right"
                    aria-label="Siguiente"
                    onClick={() => scrollByIndex(key, 1)}
                    disabled={!section.canScrollRight}
                  >
                    ▶
                  </button>
                </div>
              </div>

              <div className="repo-carousel" ref={section.ref}>
                {section.data.length === 0 && (
                  <p className="muted">
                    No se encontraron proyectos en esta categoría
                  </p>
                )}
                {section.data.map((d) => makeCard(d))}
              </div>
            </div>
          ))}
        </>
      )}
    </section>
  );
}
