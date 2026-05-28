let revealObserver;

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

    // Handle contact form submission for Formspree
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(contactForm);
            
            // Invio AJAX a Formspree (il form ha l'action url corretto in HTML)
            try {
                const response = await fetch(contactForm.action, {
                    method: 'POST',
                    body: formData,
                    headers: { 'Accept': 'application/json' }
                });
                
                if (response.ok) {
                    alert("Messaggio inviato con successo! Ti ricontatterò presto.");
                    contactForm.reset();
                } else {
                    alert("Oops! C'è stato un problema con l'invio. Riprova.");
                }
            } catch (err) {
                alert('Errore di connessione. Riprova più tardi.');
            }
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
        threshold: 0.1,
        rootMargin: "0px"
    };

    revealObserver = new IntersectionObserver(function(entries, observer) {
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
        const localData = localStorage.getItem('adele_portfolio_data_v8');
        let data;

        if (localData) {
            data = JSON.parse(localData);
            console.log("Dati caricati dalla cache locale.");
        } else {
            // Fetch from projects.json
            const response = await fetch('projects.json?v=8');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            data = await response.json();
            // Save to local storage for future instant loads and admin edits
            localStorage.setItem('adele_portfolio_data_v8', JSON.stringify(data));
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
        renderSkills(profile.skills);
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

    filtered.forEach((project, index) => {
        const card = document.createElement('div');
        
        // Assegna reveal-left o reveal-right in base all'indice (pari o dispari) per l'effetto zig-zag su mobile
        const revealClass = (index % 2 === 0) ? 'reveal-left' : 'reveal-right';
        card.className = `project-card ${revealClass}`;
        
        const hasImages = project.images && project.images.length > 0;
        let imageHTML = `<div class="project-placeholder">${project.title.substring(0,2).toUpperCase()}</div>`;
        
        if (hasImages) {
            if (project.images.length === 1) {
                imageHTML = `<img src="${project.images[0]}" alt="${project.title}" class="project-image">`;
            } else {
                let imgs = project.images.map((img, i) => `<img src="${img}" class="carousel-img ${i===0?'active':''}" alt="Slide ${i}">`).join('');
                imageHTML = `<div class="project-carousel">${imgs}</div>`;
            }
        }
        
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
        
        // Nuova logica: Apri la modale al click
        card.addEventListener('click', () => openProjectModal(project));
        
        grid.appendChild(card);
        
        if (revealObserver) revealObserver.observe(card);
    });
    
    // Avvia i caroselli se presenti
    const carousels = document.querySelectorAll('.project-carousel');
    carousels.forEach(c => {
        const imgs = c.querySelectorAll('.carousel-img');
        if (imgs.length > 1) {
            let idx = 0;
            setInterval(() => {
                imgs[idx].classList.remove('active');
                idx = (idx + 1) % imgs.length;
                imgs[idx].classList.add('active');
            }, 3000 + Math.random() * 1500); 
        }
    });
}

function renderSkills(skills) {
    const container = document.getElementById("skillsList");
    container.innerHTML = "";
    container.className = "skills-marquee-wrapper";
    
    // Pulizia delle skills (splittiamo la stringa "Adobe: ..." per avere tag separati)
    let cleanSkills = [];
    skills.forEach(s => {
        if (s.toLowerCase().includes("adobe:")) {
            const parts = s.split(":");
            cleanSkills.push(parts[0].trim()); // "Adobe"
            parts[1].split(",").forEach(p => cleanSkills.push(p.trim()));
        } else {
            cleanSkills.push(s);
        }
    });

    // Dividiamo in due righe per farle scorrere in direzioni opposte
    const half = Math.ceil(cleanSkills.length / 2);
    const row1 = cleanSkills.slice(0, half);
    const row2 = cleanSkills.slice(half);

    // Helper per costruire il binario scorrevole
    const buildTrack = (items, direction) => {
        const trackWrapper = document.createElement("div");
        trackWrapper.className = "marquee-track-wrapper reveal";
        
        const track = document.createElement("div");
        track.className = `marquee-track scroll-${direction}`;
        
        // Duplichiamo 3 volte per un loop infinito senza scatti (33.33% in CSS)
        const allItems = [...items, ...items, ...items];
        
        track.innerHTML = allItems.map(s => `<span class="skill-tag marquee-tag">${s}</span>`).join('');
        trackWrapper.appendChild(track);
        return trackWrapper;
    };
    
    const track1 = buildTrack(row1, 'left');
    const track2 = buildTrack(row2, 'right');
    
    container.appendChild(track1);
    container.appendChild(track2);
    
    if (revealObserver) {
        revealObserver.observe(track1);
        revealObserver.observe(track2);
    }
}

// --- MODAL LOGIC (BEHANCE STYLE) ---
function openProjectModal(project) {
    const modal = document.getElementById('projectModal');
    document.getElementById('modalCategory').textContent = project.category;
    document.getElementById('modalTitle').textContent = project.title;
    document.getElementById('modalDescription').textContent = project.description;
    
    const gallery = document.getElementById('modalGallery');
    if (project.images && project.images.length > 0) {
        gallery.innerHTML = project.images.map(img => `<img src="${img}" alt="${project.title}">`).join('');
    } else {
        gallery.innerHTML = '<p>Nessuna immagine disponibile.</p>';
    }
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Blocca lo scroll della pagina
}

function closeProjectModal() {
    document.getElementById('projectModal').classList.remove('active');
    document.body.style.overflow = '';
}

// Listener per chiusura modale (eseguiti perché lo script è a fine body)
const modalClose = document.getElementById('modalClose');
const modalBackdrop = document.getElementById('modalBackdrop');
if (modalClose) modalClose.addEventListener('click', closeProjectModal);
if (modalBackdrop) modalBackdrop.addEventListener('click', closeProjectModal);

// --- MOBILE MENU LOGIC ---
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const nav = document.getElementById('nav');
if (mobileMenuBtn && nav) {
    mobileMenuBtn.addEventListener('click', () => {
        nav.classList.toggle('active');
        mobileMenuBtn.classList.toggle('active');
    });
    
    // Chiudi il menu quando si clicca su un link
    nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('active');
            mobileMenuBtn.classList.remove('active');
        });
    });
}

