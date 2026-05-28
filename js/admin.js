let portfolioData = null;

function checkLogin() {
    const pass = document.getElementById('passcode').value;
    if (pass === 'adele2026') {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('dashboardScreen').style.display = 'block';
        loadAdminData();
    } else {
        document.getElementById('loginError').style.display = 'block';
    }
}

async function loadAdminData() {
    // Try to load from localStorage first
    const local = localStorage.getItem('adele_portfolio_data');
    if (local) {
        portfolioData = JSON.parse(local);
        renderAdminList();
    } else {
        // Fetch from file if no local edits exist
        try {
            const res = await fetch('projects.json');
            portfolioData = await res.json();
            renderAdminList();
        } catch (e) {
            alert("Errore caricamento database. Assicurati di essere su un server locale.");
        }
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
    document.getElementById('projImage').value = proj.image;
    
    document.getElementById('modalTitle').textContent = 'Modifica Progetto';
    document.getElementById('projectModal').style.display = 'flex';
}

document.getElementById('projectForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const id = document.getElementById('projId').value;
    const newProj = {
        id: id ? id : Date.now().toString(),
        title: document.getElementById('projTitle').value,
        category: document.getElementById('projCategory').value,
        description: document.getElementById('projDesc').value,
        image: document.getElementById('projImage').value
    };
    
    if (id) {
        // Edit
        const idx = portfolioData.projects.findIndex(p => p.id === id);
        portfolioData.projects[idx] = newProj;
    } else {
        // Add
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
    localStorage.setItem('adele_portfolio_data', JSON.stringify(portfolioData));
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
