// index.js - Page d'accueil Virtual Market

document.addEventListener('DOMContentLoaded', function() {
    console.log('🏠 Virtual Market - Accueil');
    
    // Animation simple au scroll
    window.addEventListener('scroll', function() {
        const cards = document.querySelectorAll('.nav-card, .about-card');
        cards.forEach(card => {
            const rect = card.getBoundingClientRect();
            if (rect.top < window.innerHeight - 100) {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }
        });
    });
});
