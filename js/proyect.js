function loadAllProjects() {
    const username = 'KevinGMK'; // Tu usuario de GitHub
    const url = `https://api.github.com/users/${username}/repos?per_page=100`;

    fetch(url)
        .then(response => response.json())
        .then(repos => {
            return Promise.all(repos.map(repo => fetchRepoData(repo, username)));
        })
        .then(repoDataArray => {
            const terminados = [];
            const enProceso = [];
            const abandonados = [];

            repoDataArray.forEach(data => {
                switch (data.status) {
                    case 'terminado':
                        terminados.push(data);
                        break;
                    case 'en proceso':
                        enProceso.push(data);
                        break;
                    case 'abandonado':
                        abandonados.push(data);
                        break;
                    default:
                        break;
                }
            });

            buildProjectLists(terminados, enProceso, abandonados);
        })
        .catch(error => console.error('Error cargando repositorios:', error));
}

function fetchRepoData(repo, username) {
    const statusUrl = `https://raw.githubusercontent.com/${username}/${repo.name}/main/status.txt`;
    const previewUrl = `https://raw.githubusercontent.com/${username}/${repo.name}/main/preview.png`;
    const descUrl = `https://raw.githubusercontent.com/${username}/${repo.name}/main/description.txt`;

    const data = {
        repo,
        preview: null,
        finalDescription: null,
        status: null
    };

    const checkStatus = fetch(statusUrl, { method: 'HEAD' })
        .then(res => {
            if (res.ok) {
                return fetch(statusUrl)
                    .then(r => r.text())
                    .then(txt => {
                        data.status = txt.trim().toLowerCase();
                    });
            }
        })
        .catch(() => {});

    const checkPreview = fetch(previewUrl, { method: 'HEAD' })
        .then(res => {
            if (res.ok) {
                data.preview = previewUrl;
            }
        })
        .catch(() => {});

    const checkDescription = fetch(descUrl, { method: 'HEAD' })
        .then(res => {
            if (res.ok) {
                return fetch(descUrl).then(r => r.text()).then(txt => {
                    data.finalDescription = txt;
                });
            } else {
                data.finalDescription = repo.description ? repo.description : 'Sin descripción';
            }
        })
        .catch(() => {
            data.finalDescription = repo.description ? repo.description : 'Sin descripción';
        });

    return Promise.all([checkStatus, checkPreview, checkDescription]).then(() => {
        if (!data.finalDescription) {
            data.finalDescription = repo.description ? repo.description : 'Sin descripción';
        }
        return data;
    });
}

function buildProjectLists(terminados, enProceso, abandonados) {
    const termContainer = document.getElementById('terminadosContainer');
    const procContainer = document.getElementById('enProcesoContainer');
    const abanContainer = document.getElementById('abandonadosContainer');

    termContainer.innerHTML = '<h2>Proyectos Terminados</h2><div class="carousel-inner" id="terminadosList"></div>';
    procContainer.innerHTML = '<h2>Proyectos en Proceso</h2><div class="carousel-inner" id="enProcesoList"></div>';
    abanContainer.innerHTML = '<h2>Proyectos Abandonados</h2><div class="carousel-inner" id="abandonadosList"></div>';

    function createRepoHTML(data) {
        let link = data.repo.html_url;
        if (data.repo.has_pages) {
            link = `https://${data.repo.owner.login}.github.io/${data.repo.name}`;
        }

        let previewImg = data.preview ? `<img src="${data.preview}" alt="Vista previa" class="repo-preview" />` : '';

        return `
            <div class="repo-box">
                ${previewImg}
                <h3><a href="${link}" target="_blank">${data.repo.name}</a></h3>
                <p>${data.finalDescription}</p>
            </div>
        `;
    }

    terminados.forEach(d => document.getElementById('terminadosList').innerHTML += createRepoHTML(d));
    enProceso.forEach(d => document.getElementById('enProcesoList').innerHTML += createRepoHTML(d));
    abandonados.forEach(d => document.getElementById('abandonadosList').innerHTML += createRepoHTML(d));
}

document.addEventListener('DOMContentLoaded', () => {
    loadAllProjects();
});
