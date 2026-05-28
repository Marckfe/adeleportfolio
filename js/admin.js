let portfolioData = null;

async function checkLogin() {
    const pass = document.getElementById('passcode').value;
    
    // Hash della password inserita (SHA-256) per confrontarla con il target
    const encoder = new TextEncoder();
    const data = encoder.encode(pass);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Hash segreto (la vera password non è nel codice)
    const targetHash = 'f34943cdb461b7268d321cc2702ee9ad3682e6984057ceabea556afce5c28cd6';

    if (hashHex === targetHash) {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('dashboardScreen').style.display = 'block';
        loadAdminData();
    } else {
        document.getElementById('loginError').style.display = 'block';
    }
}

async function loadAdminData() {
    const localData = localStorage.getItem('adele_portfolio_data_v3');
    if (localData) {
        portfolioData = JSON.parse(localData);
        renderAdminList();
    } else {
        fetch('projects.json')
            .then(res => res.json())
            .then(data => {
                portfolioData = data;
                renderAdminList();
            });
    }
}

function renderAdminList() {
    const list = document.getElementById('adminProjectList');
    list.innerHTML = '';
    
    if (!portfolioData || !portfolioData.projects) return;

    // Show newest first
    const projects = [...portfolioData.projects].reverse();

    projects.forEach(p => {
        const item = document.createElement('div');
        item.className = 'project-list-item';
        item.innerHTML = `
            <div class="project-info">
                <h4>${p.title}</h4>
                <small>${p.category}</small>
            </div>
            <div class="project-actions">
                <button class="btn btn-outline" style="padding: 5px 15px;" onclick="editProject('${p.id}')">Modifica</button>
                <button class="btn btn-outline" style="padding: 5px 15px; color: red; border-color: red;" onclick="deleteProject('${p.id}')">Elimina</button>
            </div>
        `;
        list.appendChild(item);
    });
}

// Modal functions
function openModal() {
    document.getElementById('projectForm').reset();
    document.getElementById('projId').value = '';
    document.getElementById('modalTitle').textContent = 'Aggiungi Progetto';
    document.getElementById('imageListContainer').innerHTML = '';
    addImageInput();
    document.getElementById('projectModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('projectModal').style.display = 'none';
}

function editProject(id) {
    const proj = portfolioData.projects.find(p => p.id === id);
    if (!proj) return;
    
    document.getElementById('projId').value = proj.id;
    document.getElementById('projTitle').value = proj.title;
    document.getElementById('projCategory').value = proj.category;
    document.getElementById('projDesc').value = proj.description;
    
    const container = document.getElementById('imageListContainer');
    container.innerHTML = '';
    if (proj.images && proj.images.length > 0) {
        proj.images.forEach(img => addImageInput(img));
    } else {
        addImageInput();
    }
    
    document.getElementById('modalTitle').textContent = 'Modifica Progetto';
    document.getElementById('projectModal').style.display = 'flex';
}

function addImageInput(val = '') {
    const container = document.getElementById('imageListContainer');
    const div = document.createElement('div');
    div.style.display = 'flex';
    div.style.gap = '5px';
    div.innerHTML = `
        <input type="text" class="proj-img-input" placeholder="es: assets/foto.jpg" value="${val}" style="flex:1;">
        <button type="button" class="btn btn-outline" style="padding:0 10px;" onclick="moveImageUp(this)">↑</button>
        <button type="button" class="btn btn-outline" style="padding:0 10px;" onclick="moveImageDown(this)">↓</button>
        <button type="button" class="btn btn-outline" style="padding:0 10px; color:red; border-color:red;" onclick="this.parentElement.remove()">X</button>
    `;
    container.appendChild(div);
}

function moveImageUp(btn) {
    const item = btn.parentElement;
    if (item.previousElementSibling) {
        item.parentElement.insertBefore(item, item.previousElementSibling);
    }
}

function moveImageDown(btn) {
    const item = btn.parentElement;
    if (item.nextElementSibling) {
        item.parentElement.insertBefore(item.nextElementSibling, item);
    }
}

document.getElementById('projectForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const id = document.getElementById('projId').value;
    
    const imgInputs = document.querySelectorAll('.proj-img-input');
    const images = Array.from(imgInputs).map(inp => inp.value).filter(val => val.trim() !== '');

    const newProj = {
        id: id ? id : Date.now().toString(),
        title: document.getElementById('projTitle').value,
        category: document.getElementById('projCategory').value,
        description: document.getElementById('projDesc').value,
        images: images
    };
    
    if (id) {
        const idx = portfolioData.projects.findIndex(p => p.id === id);
        portfolioData.projects[idx] = newProj;
    } else {
        portfolioData.projects.push(newProj);
    }
    
    saveDataLocally();
    closeModal();
    renderAdminList();
});

function deleteProject(id) {
    if(confirm('Sei sicuro di voler eliminare questo progetto?')) {
        portfolioData.projects = portfolioData.projects.filter(p => p.id !== id);
        saveDataLocally();
        renderAdminList();
    }
}

function saveDataLocally() {
    localStorage.setItem('adele_portfolio_data_v3', JSON.stringify(portfolioData));
}

// Export JSON
function exportData() {
    if (!portfolioData) return;
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(portfolioData, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "projects.json");
    dlAnchorElem.click();
}
