const USERNAME = 'KevinGMK';
const SCROLL_STEP = 150; // px por clic

// 1) Carga y filtra repos
function loadAllProjects() {
  fetch(`https://api.github.com/users/${USERNAME}/repos?per_page=100`)
    .then(r => r.json())
    .then(repos => Promise.all(repos.map(fetchRepoData)))
    .then(repoDataArray => {
      const terminados  = [];
      const enProceso   = [];
      const abandonados = [];

      repoDataArray.forEach(data => {
        if (!data.status) return;
        switch (data.status) {
          case 'terminado':   terminados.push(data);   break;
          case 'en proceso':  enProceso.push(data);    break;
          case 'abandonado':  abandonados.push(data);  break;
        }
      });

      buildProjectLists(terminados, enProceso, abandonados);
      setupCarouselButtons();
    })
    .catch(err => console.error('Error cargando repositorios:', err));
}

// 2) Obtiene status, preview y descripción
function fetchRepoData(repo) {
  const base = `https://raw.githubusercontent.com/${USERNAME}/${repo.name}/main/`;
  const data = { repo, status: null, preview: null, finalDescription: null };

  const pStatus = fetch(base + 'status.txt', { method:'HEAD' })
    .then(r => r.ok && fetch(base + 'status.txt').then(t=>t.text()).then(t=> data.status = t.trim().toLowerCase()))
    .catch(() => {});
  const pPrev = fetch(base + 'preview.png', { method:'HEAD' })
    .then(r => r.ok && (data.preview = base + 'preview.png'))
    .catch(() => {});
  const pDesc = fetch(base + 'description.txt', { method:'HEAD' })
    .then(r => r.ok
      ? fetch(base + 'description.txt').then(t=>t.text()).then(t=> data.finalDescription = t)
      : data.finalDescription = repo.description || 'Sin descripción')
    .catch(() => data.finalDescription = repo.description || 'Sin descripción');

  return Promise.all([pStatus,pPrev,pDesc]).then(() => data);
}

// 3) Renderiza tarjetas en los three carruseles
function buildProjectLists(terminados, enProceso, abandonados) {
  const termList = document.getElementById('terminadosList');
  const procList = document.getElementById('enProcesoList');
  const abanList = document.getElementById('abandonadosList');

  termList.innerHTML = '';
  procList.innerHTML = '';
  abanList.innerHTML = '';

  function makeCard(d) {
    const link = d.repo.has_pages
      ? `https://${USERNAME}.github.io/${d.repo.name}`
      : d.repo.html_url;
    const img  = d.preview ? `<img src="${d.preview}" class="repo-preview" alt="Vista previa">` : '';
    return `
      <div class="repo-box">
        ${img}
        <h3><a href="${link}" target="_blank">${d.repo.name}</a></h3>
        <p>${d.finalDescription}</p>
      </div>`;
  }

  terminados.forEach(d => termList.insertAdjacentHTML('beforeend', makeCard(d)));
  enProceso.forEach(d  => procList.insertAdjacentHTML('beforeend', makeCard(d)));
  abandonados.forEach(d=> abanList.insertAdjacentHTML('beforeend', makeCard(d)));
}

// 4) Flechas que desplazan 150px
function setupCarouselButtons () {
  document.querySelectorAll('.carousel-wrapper').forEach(wrapper => {
    const carousel = wrapper.querySelector('.repo-carousel');
    const btnL     = wrapper.querySelector('.arrow-btn.left');
    const btnR     = wrapper.querySelector('.arrow-btn.right');

    const update = () => {
      btnL.disabled = carousel.scrollLeft <= 0;
      btnR.disabled = carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - 1;
    };

    /* --- CLICK --- */
    btnL.addEventListener('click', () => {
      carousel.scrollBy({ left: -SCROLL_STEP, behavior: 'smooth' });
    });
    btnR.addEventListener('click', () => {
      carousel.scrollBy({ left:  SCROLL_STEP, behavior: 'smooth' });
    });

    /* --- SINCRONIZAR --- */
    carousel.addEventListener('scroll', update);
    window.addEventListener('resize', update);

    /* Cuando cada imagen preview termine de cargar */
    carousel.querySelectorAll('img').forEach(img =>
      img.complete ? null : img.addEventListener('load', update));

    /* Primera sincronización */
    update();
  });
}


// 5) Inicializa
document.addEventListener('DOMContentLoaded', loadAllProjects);
