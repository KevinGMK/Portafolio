function loadGithubProjects() {
  const username = 'KevinGMK';
  const url = `https://api.github.com/users/${username}/repos?sort=created&direction=desc&per_page=2`;
  
  fetch(url)
    .then(response => response.json())
    .then(repos => {
      const repoList = document.getElementById('repoList');
      repoList.innerHTML = ''; // Limpia el contenedor

      repos.forEach(repo => {
        // Determinamos el link principal (Pages o repo)
        let link;
        if (repo.name.toLowerCase() === `${username.toLowerCase()}.github.io`) {
          link = `https://${username}.github.io/`;
        } else if (repo.has_pages) {
          link = `https://${username}.github.io/${repo.name}`;
        } else {
          link = repo.html_url;
        }

        // Creamos un contenedor para cada repo
        const repoItem = document.createElement('div');
        repoItem.classList.add('repo');

        // URLs de archivos en la rama `main`
        const previewFileUrl = `https://raw.githubusercontent.com/${username}/${repo.name}/main/preview.png`;
        const descFileUrl    = `https://raw.githubusercontent.com/${username}/${repo.name}/main/description.txt`;

        // Variables donde guardaremos el resultado final
        let hasPreview = false; 
        let previewContent = '';
        let finalDescription = '';

        // 1. Verificamos preview.png con HEAD
        fetch(previewFileUrl, { method: 'HEAD' })
          .then(res => {
            if (res.ok) {
              hasPreview = true; // Existe preview.png
            }
            // 2. Verificamos description.txt con HEAD
            return fetch(descFileUrl, { method: 'HEAD' });
          })
          .then(resDesc => {
            if (resDesc.ok) {
              // Si existe, lo descargamos como texto
              return fetch(descFileUrl).then(r => r.text());
            } else {
              return null; // No hay description.txt
            }
          })
          .then(descTextFile => {
            if (descTextFile) {
              // Si description.txt existe y se descargó
              finalDescription = descTextFile;
            } else {
              // Si no hay description.txt, usamos la description del repo
              finalDescription = repo.description ? repo.description : 'Sin descripción';
            }

            // Construimos el bloque HTML final
            // Imagen de vista previa si existe
            if (hasPreview) {
              previewContent = `
                <img src="${previewFileUrl}" alt="Vista previa" class="repo-preview" />
              `;
            }

            // Insertamos todo dentro de un .repo-box
            repoItem.innerHTML = `
              <div class="repo-box">
                ${previewContent}
                <h3><a href="${link}" target="_blank">${repo.name}</a></h3>
                <p>${finalDescription}</p>
              </div>
            `;
          })
          .catch(err => {
            // Si ocurre algún error, muestra algo básico
            repoItem.innerHTML = `
              <div class="repo-box">
                <h3><a href="${link}" target="_blank">${repo.name}</a></h3>
                <p>${repo.description ? repo.description : 'Sin descripción'}</p>
              </div>
            `;
          })
          .finally(() => {
            // Agregamos el contenedor al DOM
            repoList.appendChild(repoItem);
          });
      });
    })
    .catch(error => console.error('Error cargando repositorios:', error));
}

document.addEventListener('DOMContentLoaded', () => {
  loadGithubProjects();
});
