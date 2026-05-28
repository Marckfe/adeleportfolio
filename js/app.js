document.addEventListener('DOMContentLoaded', () => {
    // Current year in footer
    document.getElementById('currentYear').textContent = new Date().getFullYear();

    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const nav = document.querySelector('.nav');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
            if(nav.style.display === 'flex') {
                nav.style.flexDirection = 'column';
                nav.style.position = 'absolute';
                nav.style.top = '100%';
                nav.style.left = '0';
                nav.style.width = '100%';
                nav.style.backgroundColor = 'white';
                nav.style.padding = '20px';
                nav.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
            }
        });
    }

    // Load data from JSON (or localStorage if edited)
    loadPortfolioData();

    // Handle contact form submission
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Messaggio inviato con successo! Ti ricontatterò presto.');
            contactForm.reset();
        });
    }

    // --- ANIMAZIONI ---
    
    // Header Shrink on scroll
    const header = document.getElementById('mainHeader');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Intersection Observer per animazioni Reveal
    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealObserver = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        });
    }, revealOptions);

    // Osserva tutti gli elementi con le classi reveal
    const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    reveals.forEach(el => revealObserver.observe(el));
});

async function loadPortfolioData() {
    try {
        // First check localStorage for any local edits from admin
        const localData = localStorage.getItem('adele_portfolio_data');
        let data;

        if (localData) {
            data = JSON.parse(localData);
            console.log("Dati caricati dalla cache locale.");
        } else {
            // Fetch from projects.json
            const response = await fetch('projects.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            data = await response.json();
            // Save to local storage for future instant loads and admin edits
            localStorage.setItem('adele_portfolio_data', JSON.stringify(data));
        }

        populateUI(data);

    } catch (error) {
        console.error("Errore nel caricamento del file JSON:", error);
        document.getElementById('portfolioGrid').innerHTML = 
            '<p style="text-align: center; color: red;">Si è verificato un errore nel caricamento dei progetti.</p>';
    }
}

function populateUI(data) {
    const profile = data.profile;

    // Populate Bio Section
    if (profile) {
        document.getElementById('profileName').textContent = profile.name;
        document.getElementById('profileTitle').textContent = profile.title;
        document.getElementById('profileBio').textContent = profile.bio;

        // Populate Contact Info
        const contactDetails = document.getElementById('contactDetails');
        contactDetails.innerHTML = `
            <div class="contact-item">
                <div class="contact-icon">@</div>
                <div class="contact-text">${profile.contacts.email}</div>
            </div>
            <div class="contact-item">
                <div class="contact-icon">📞</div>
                <div class="contact-text">${profile.contacts.phone}</div>
            </div>
            <div class="contact-item">
                <div class="contact-icon">📍</div>
                <div class="contact-text">${profile.contacts.location}</div>
            </div>
        `;

        // Populate Education
        const eduList = document.getElementById('educationList');
        eduList.innerHTML = profile.education.map(edu => `
            <li>
                <div class="timeline-year">${edu.year}</div>
                <div class="timeline-title">${edu.title}</div>
                <div class="timeline-subtitle">${edu.school}</div>
            </li>
        `).join('');

        // Populate Experience
        const expList = document.getElementById('experienceList');
        expList.innerHTML = profile.experience.map(exp => `
            <li>
                <div class="timeline-year">${exp.period}</div>
                <div class="timeline-title">${exp.company}</div>
                <div class="timeline-subtitle">${exp.role}</div>
            </li>
        `).join('');

        // Populate Skills
        const skillsList = document.getElementById('skillsList');
        skillsList.innerHTML = profile.skills.map(skill => `
            <div class="skill-tag">${skill}</div>
        `).join('');
    }

    // Populate Projects
    renderProjects(data.projects, 'all');

    // Setup Filters
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Remove active class
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add to clicked
            e.target.classList.add('active');
            
            const category = e.target.getAttribute('data-filter');
            renderProjects(data.projects, category);
        });
    });
}

function renderProjects(projects, filterCategory) {
    const grid = document.getElementById('portfolioGrid');
    grid.innerHTML = '';

    const filtered = filterCategory === 'all' 
        ? projects 
        : projects.filter(p => p.category === filterCategory);

    if (filtered.length === 0) {
        grid.innerHTML = '<p style="text-align: center; width: 100%; grid-column: 1 / -1;">Nessun progetto trovato in questa categoria.</p>';
        return;
    }

    filtered.forEach(project => {
        const hasImage = project.image && project.image !== "assets/placeholder.jpg";
        
        const imageHTML = hasImage 
            ? `<img src="${project.image}" alt="${project.title}" class="project-image">`
            : `<div class="project-placeholder">${project.title.substring(0,2).toUpperCase()}</div>`;

        const card = document.createElement('div');
        card.className = 'project-card';
        card.innerHTML = `
            <div class="project-image-wrapper">
                ${imageHTML}
            </div>
            <div class="project-content">
                <span class="project-category">${project.category}</span>
                <h3 class="project-title">${project.title}</h3>
                <p class="project-description">${project.description}</p>
            </div>
        `;
        grid.appendChild(card);
    });
}
