// src/utils/fetchProjects.ts
export type ProyectoJSON = {
  id: string | number;
  name: string;         // nombre del repo / slug
  html_url: string;     // url al repo o a la página del proyecto
  status?: string | null;
  preview?: string | null;       // url absoluta de la imagen (en la nube)
  description?: string | null;
};

export async function fetchProjectsJson(): Promise<ProyectoJSON[]> {
  // Intentamos importar el JSON desde build (Vite entiende imports dinámicos de JSON)
  try {
    const mod = await import('../utils/projects.json');
    // si el JSON está exportado como default (normal con import JSON)
    const list: ProyectoJSON[] = (mod && (mod.default || mod)) ?? [];
    if (!Array.isArray(list)) return [];
    return list;
  } catch (err) {
    // Fallback: intentar fetch relativo al root (útil si colocas projects.json en public/)
    try {
      const r = await fetch('/projects.json');
      if (!r.ok) return [];
      const data = await r.json();
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }
}
