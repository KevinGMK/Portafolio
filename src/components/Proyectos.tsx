// src/components/Proyectos.tsx
import React, { useEffect, useRef, useState } from "react";
import { fetchProjectsJson } from "../utils/fetchProjects";
import type { ProyectoJSON } from "../utils/fetchProjects";

const MAX_SHOW_DESKTOP = 4;
const MAX_SHOW_MOBILE = 2;
const MOBILE_BREAKPOINT = 768;
const GAP = 16;
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 600;

type EnrichedProyecto = ProyectoJSON & {
  lastUpdated: string | null;
};

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchWithRetry(url: string, options?: RequestInit, retries = MAX_RETRIES): Promise<Response | null> {
  let attempt = 0;
  while (attempt <= retries) {
    try {
      const res = await fetch(url, options);
      if (res.status === 429) {
        const delay = BASE_DELAY_MS * Math.pow(2, attempt);
        console.warn(`[Proyectos] 429 para ${url}, backoff ${delay}ms (attempt ${attempt})`);
        await sleep(delay);
        attempt++;
        continue;
      }
      return res;
    } catch (err) {
      const delay = BASE_DELAY_MS * Math.pow(2, attempt);
      console.warn(`[Proyectos] fetch error ${String(err)}, reintentando en ${delay}ms`);
      await sleep(delay);
      attempt++;
    }
  }
  console.warn(`[Proyectos] fallo definitivo en fetch ${url} tras ${retries} reintentos`);
  return null;
}

function extractOwnerRepoFromUrl(htmlUrl: string | undefined): { owner: string; repo: string } | null {
  if (!htmlUrl) return null;
  try {
    const u = new URL(htmlUrl);
    const host = u.hostname.toLowerCase();
    const parts = u.pathname.split("/").filter(Boolean);

    if (host === "github.com" && parts.length >= 2) {
      return { owner: parts[0], repo: parts[1] };
    }
    if (host.endsWith("github.io") && parts.length >= 1) {
      const owner = host.split(".")[0];
      return { owner, repo: parts[0] };
    }
    if (parts.length >= 1 && host.includes("github")) {
      const owner = host.split(".")[0];
      return { owner, repo: parts[0] };
    }
    return null;
  } catch {
    return null;
  }
}

async function getRepoLastUpdated(owner: string, repo: string, ghToken?: string): Promise<string | null> {
  const headers = ghToken ? { Authorization: `token ${ghToken}` } : undefined;
  const repoUrl = `https://api.github.com/repos/${owner}/${repo}`;

  const r1 = await fetchWithRetry(repoUrl, headers ? { headers } : undefined);
  if (!r1) return null;
  if (!r1.ok) {
    console.warn(`[Proyectos] repo not found or inaccessible: ${owner}/${repo} -> ${r1.status}`);
    return null;
  }

  const repoObj: any = await r1.json();
  if (repoObj?.pushed_at) return repoObj.pushed_at;

  const commitsUrl = `${repoUrl}/commits?per_page=1`;
  const r2 = await fetchWithRetry(commitsUrl, headers ? { headers } : undefined);
  if (!r2 || !r2.ok) return null;
  const commits: any = await r2.json();
  if (Array.isArray(commits) && commits.length > 0) {
    const date = commits[0]?.commit?.author?.date ?? commits[0]?.commit?.committer?.date ?? null;
    return date || null;
  }
  return null;
}

export default function Proyectos(): React.ReactElement {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<EnrichedProyecto[]>([]);
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // visible count responsive
  const [visibleCount, setVisibleCount] = useState<number>(() => {
    if (typeof window === "undefined") return MAX_SHOW_DESKTOP;
    return window.innerWidth < MOBILE_BREAKPOINT ? MAX_SHOW_MOBILE : MAX_SHOW_DESKTOP;
  });

  useEffect(() => {
    const onResize = () => {
      const newCount = window.innerWidth < MOBILE_BREAKPOINT ? MAX_SHOW_MOBILE : MAX_SHOW_DESKTOP;
      setVisibleCount(newCount);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const formatDate = (iso: string | null) => {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
    } catch {
      return "";
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const raw = await fetchProjectsJson();
        if (!Array.isArray(raw) || raw.length === 0) {
          if (mounted) setProjects([]);
          return;
        }

        const GH_TOKEN = (import.meta as any).env?.VITE_GH_TOKEN || undefined;
        const concurrency = 5;
        const enriched: EnrichedProyecto[] = [];

        for (let i = 0; i < raw.length; i += concurrency) {
          const batch = raw.slice(i, i + concurrency);
          const promises = batch.map(async (p) => {
            let lastUpdated: string | null = null;
            const parsed = extractOwnerRepoFromUrl(p.html_url);
            if (parsed) {
              lastUpdated = await getRepoLastUpdated(parsed.owner, parsed.repo, GH_TOKEN);
            } else {
              lastUpdated = null;
            }
            return { ...p, lastUpdated } as EnrichedProyecto;
          });

          const results = await Promise.all(promises);
          enriched.push(...results);
          await sleep(150);
        }

        enriched.sort((a, b) => {
          if (!a.lastUpdated && !b.lastUpdated) return 0;
          if (!a.lastUpdated) return 1;
          if (!b.lastUpdated) return -1;
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
        });

        if (mounted) setProjects(enriched);
      } catch (err: any) {
        console.error("Error cargando projects.json o GitHub API:", err);
        if (mounted) setError(String(err ?? "Error desconocido"));
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  function getStep() {
    const carousel = carouselRef.current;
    if (!carousel) return 320;
    const first = carousel.querySelector(".repo-box") as HTMLElement | null;
    if (!first) return 320;
    return first.offsetWidth + GAP;
  }

  function scrollByIndex(dir: number) {
    const carousel = carouselRef.current;
    if (!carousel) return;
    const step = getStep();
    const maxScroll = carousel.scrollWidth - carousel.clientWidth;
    const current = carousel.scrollLeft;
    const idx = Math.round(current / step);
    const targetIdx = Math.max(0, Math.min(idx + dir, Math.ceil(carousel.scrollWidth / step)));
    const target = Math.max(0, Math.min(targetIdx * step, maxScroll));
    carousel.scrollTo({ left: target, behavior: "smooth" });
  }

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const update = () => {
      setCanScrollLeft(carousel.scrollLeft > 0);
      setCanScrollRight(carousel.scrollLeft + carousel.clientWidth < carousel.scrollWidth - 1);
    };

    carousel.addEventListener("scroll", update);
    window.addEventListener("resize", update);
    carousel.querySelectorAll("img").forEach((img) => {
      if (!img.complete) img.addEventListener("load", update);
    });

    requestAnimationFrame(update);

    return () => {
      carousel.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      carousel.querySelectorAll("img").forEach((img) => {
        img.removeEventListener("load", update);
      });
    };
  }, [projects.length]);

  function makeCard(p: EnrichedProyecto) {
    const link = p.html_url ?? "#";
    return (
      <div className="repo-box project-card" key={p.id ?? p.name}>
        {p.preview && <img src={p.preview} className="repo-preview" alt={`Preview ${p.name}`} />}
        <h3><a href={link} target="_blank" rel="noreferrer">{p.name}</a></h3>
        <p>{p.description ?? "Sin descripción"}</p>
        {p.status && <span className="status-tag">{p.status}</span>}
        {p.lastUpdated && <div style={{ fontSize: 12, marginTop: 6 }}>Última actualización: {formatDate(p.lastUpdated)}</div>}
      </div>
    );
  }

  const toShow = projects.slice(0, visibleCount);

  return (
    <section className="section projects container" aria-labelledby="projects-title">
      <h2 id="projects-title">Proyectos recientes</h2>
      {loading && <p>Cargando proyectos...</p>}
      {error && <p style={{ color: "var(--danger)" }}>Error: {error}</p>}

      {!loading && !error && (
        <div className="carousel-wrapper">
          <div className="carousel-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p className="muted">Mostrando {toShow.length} proyectos (máx. {visibleCount}) ordenados por última actualización</p>
            <div className="carousel-controls">
              <button className="arrow-btn left" aria-label="Anterior" onClick={() => scrollByIndex(-1)} disabled={!canScrollLeft}>◀</button>
              <button className="arrow-btn right" aria-label="Siguiente" onClick={() => scrollByIndex(1)} disabled={!canScrollRight}>▶</button>
            </div>
          </div>

          <div className="repo-carousel" ref={carouselRef as any}>
            {toShow.length === 0 && <p className="muted">No hay proyectos en projects.json</p>}
            {toShow.map((p) => makeCard(p))}
          </div>
        </div>
      )}
    </section>
  );
}
