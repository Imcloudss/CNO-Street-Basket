/* --- 1. GESTIONE MENU MOBILE --- */
// Funzione chiamata direttamente dall'HTML (onclick="toggleMenu()")
window.toggleMenu = function() {
    const navMenu = document.getElementById('navMenu');
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const body = document.body;

    if (navMenu && menuBtn) {
        navMenu.classList.toggle('active');
        menuBtn.classList.toggle('active');

        // Blocca lo scroll se il menu è aperto
        if (navMenu.classList.contains('active')) {
            body.style.overflow = 'hidden';
        } else {
            body.style.overflow = 'auto';
        }
    }
};

window.closeMenu = function() {
    const navMenu = document.getElementById('navMenu');
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const body = document.body;

    if (navMenu && menuBtn) {
        navMenu.classList.remove('active');
        menuBtn.classList.remove('active');
        body.style.overflow = 'auto';
    }
};

/* --- 2. GESTIONE EVENTI AL CARICAMENTO PAGINA --- */
document.addEventListener('DOMContentLoaded', () => {

    // A. CHIUSURA MENU AL CLICK ESTERNO
    document.addEventListener('click', (e) => {
        // Se il menu è aperto E non clicco sul menu E non clicco sul bottone
        if (navMenu && navMenu.classList.contains('active') && 
            !navMenu.contains(e.target) && 
            !menuBtn.contains(e.target)) {
            closeMenu();
        }
    });

    // B. SMOOTH SCROLL (Scorrimento fluido)
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            // Ignora link vuoti
            if (this.getAttribute('href') === '#') return;

            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                // Chiudi menu prima di scorrere
                closeMenu();

                // Calcolo posizione (considerando navbar fissa 85px)
                const headerOffset = 85;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // C. EVIDENZIA MENU DURANTE SCROLL
    window.addEventListener('scroll', () => {
        const sections = document.querySelectorAll('section[id]');
        const scrollY = window.pageYOffset;

        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 100;
            const sectionId = section.getAttribute('id');
            
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                document.querySelectorAll('nav ul li a').forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    });

    // D. GESTIONE COOKIE BANNER
    const cookieBanner = document.getElementById('cookieBanner');
    const acceptBtn = document.getElementById('acceptCookies');
    const declineBtn = document.getElementById('declineCookies');

    // Mostra banner se non c'è scelta salvata
    if (cookieBanner && !localStorage.getItem('cookieConsent')) {
        setTimeout(() => {
            cookieBanner.classList.add('show');
        }, 1000);
    }

    // Click su Accetta
    if (acceptBtn) {
        acceptBtn.addEventListener('click', () => {
            localStorage.setItem('cookieConsent', 'accepted');
            cookieBanner.classList.remove('show');
        });
    }

    // Click su Rifiuta
    if (declineBtn) {
        declineBtn.addEventListener('click', () => {
            localStorage.setItem('cookieConsent', 'declined');
            cookieBanner.classList.remove('show');
        });
    }
});