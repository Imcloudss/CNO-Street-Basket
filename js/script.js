document.addEventListener('DOMContentLoaded', () => {
    
    // 1. GESTIONE MENU MOBILE
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.getElementById('navMenu');
    const body = document.body;

    if (menuBtn && navMenu) {
        menuBtn.addEventListener('click', () => {
            menuBtn.classList.toggle('active');
            navMenu.classList.toggle('active');

            // Blocca lo scroll quando il menu è aperto
            if (navMenu.classList.contains('active')) {
                body.style.overflow = 'hidden';
            } else {
                body.style.overflow = 'auto';
            }
        });
    }

    // 2. SMOOTH SCROLL E CORREZIONE POSIZIONE
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            
            // Gestione link vuoti o non validi
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                if (menuBtn) menuBtn.classList.remove('active');
                if (navMenu) navMenu.classList.remove('active');
                body.style.overflow = 'auto'; // Riattiva scroll
                
                // Calcolo preciso della posizione
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

    // 3. MENU ATTIVO DURANTE LO SCROLL
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
});

/* GESTIONE COOKIE BANNER */
document.addEventListener('DOMContentLoaded', () => {
    const cookieBanner = document.getElementById('cookieBanner');
    const acceptBtn = document.getElementById('acceptCookies');
    const declineBtn = document.getElementById('declineCookies');

    // 1. Controlla se l'utente ha già fatto una scelta
    if (!localStorage.getItem('cookieConsent')) {
        // Se NON ha scelto, mostra il banner dopo 1 secondo (effetto entrata)
        setTimeout(() => {
            cookieBanner.classList.add('show');
        }, 1000);
    }

    // 2. Click su Accetta
    if (acceptBtn) {
        acceptBtn.addEventListener('click', () => {
            localStorage.setItem('cookieConsent', 'accepted'); // Salva la scelta
            cookieBanner.classList.remove('show'); // Nascondi banner
        });
    }

    // 3. Click su Rifiuta
    if (declineBtn) {
        declineBtn.addEventListener('click', () => {
            localStorage.setItem('cookieConsent', 'declined'); // Salva la scelta
            cookieBanner.classList.remove('show'); // Nascondi banner
        });
    }
});