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
        const localData = localStorage.getItem('adele_portfolio_data_v14');
        let data;

        if (localData) {
            data = JSON.parse(localData);
            console.log("Dati caricati dalla cache locale.");
        } else {
            // Fetch from projects.json
            const response = await fetch('projects.json?v=14');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            data = await response.json();
            // Save to local storage for future instant loads and admin edits
            localStorage.setItem('adele_portfolio_data_v14', JSON.stringify(data));
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
                <div class="contact-icon" style="display: flex; align-items: center; justify-content: center;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                </div>
                <div class="contact-text"><a href="mailto:${profile.contacts.email}" style="color: inherit; text-decoration: none;">${profile.contacts.email}</a></div>
            </div>
            <div class="contact-item">
                <div class="contact-icon" style="display: flex; align-items: center; justify-content: center;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                </div>
                <div class="contact-text"><a href="tel:${profile.contacts.phone.replace(/\s+/g, '')}" style="color: inherit; text-decoration: none;">${profile.contacts.phone}</a></div>
            </div>
            <div class="contact-item">
                <div class="contact-icon" style="display: flex; align-items: center; justify-content: center;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                </div>
                <div class="contact-text">${profile.contacts.location}</div>
            </div>
            ${profile.contacts.linkedin ? `
            <div class="contact-item">
                <div class="contact-icon" style="display: flex; align-items: center; justify-content: center;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                </div>
                <div class="contact-text"><a href="${profile.contacts.linkedin}" onclick="openLinkedIn(event, '${profile.contacts.linkedin}')" style="color: var(--teal); text-decoration: none;">LinkedIn Profile</a></div>
            </div>
            ` : ''}
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

// --- FUNZIONALITA' DEEP LINKING PER LINKEDIN ---
window.openLinkedIn = function(e, url) {
    e.preventDefault();
    
    // Estrai lo username dall'URL di LinkedIn
    const match = url.match(/linkedin\.com\/in\/([^\/]+)/i);
    const username = match ? match[1] : null;
    
    if (!username) {
        window.open(url, '_blank');
        return;
    }

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isAndroid = /Android/.test(navigator.userAgent);

    if (isAndroid) {
        // Su Android, usiamo l'Intent Scheme nativo. Se l'app non è installata, il browser
        // lo gestisce automaticamente aprendo la versione web (o il Play Store a seconda del browser).
        window.location.href = `intent://in/${username}#Intent;package=com.linkedin.android;scheme=https;end`;
    } else if (isIOS) {
        // Su iOS proviamo ad aprire il protocollo personalizzato
        const appUrl = `linkedin://profile/${username}`;
        
        // Timeout di fallback: se l'app non si apre, la pagina web rimane attiva e scatta il fallback
        const now = Date.now();
        setTimeout(() => {
            if (Date.now() - now < 1000) {
                window.open(url, '_blank');
            }
        }, 500);
        
        window.location.href = appUrl;
    } else {
        // Desktop
        window.open(url, '_blank');
    }
};
