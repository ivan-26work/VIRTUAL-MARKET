// index.js - Page d'accueil Virtual Market
// Utilise window.supabase (défini dans supabase.js)

// État de connexion
let estConnecte = false;
let userEmail = '';
let userData = {};

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Page d\'accueil chargée');
    verifierConnexion();
});

// Vérifier connexion avec Supabase
async function verifierConnexion() {
    try {
        const { data: { session } } = await window.supabase.auth.getSession();
        
        if (session) {
            console.log('👤 Utilisateur connecté:', session.user.email);
            estConnecte = true;
            userEmail = session.user.email;
            userData = session.user.user_metadata || {};
        } else {
            console.log('👤 Aucun utilisateur connecté');
            estConnecte = false;
        }
        
        afficherProfil();
        gererCartes();
        
    } catch (error) {
        console.error('Erreur vérification session:', error);
        estConnecte = false;
        afficherProfil();
    }
}

// Afficher le profil (avatar cliquable vers profil.html)
function afficherProfil() {
    const container = document.getElementById('user-profile');
    if (!container) return;
    
    if (estConnecte) {
        // Lettre de l'email ou du nom
        const lettre = userData.full_name ? 
            userData.full_name.charAt(0).toUpperCase() : 
            userEmail.charAt(0).toUpperCase();
        
        container.innerHTML = `
            <a href="profil.html" class="profile-button" id="profileBtn" title="Mon profil">
                ${lettre}
            </a>
        `;
        
        // Activer les cartes
        activerCartes(true);
        
    } else {
        // Bouton connexion
        container.innerHTML = `
            <a href="auth.html" class="profile-button guest" id="loginBtn">
                <i class="fas fa-user"></i> Se connecter
            </a>
        `;
        
        // Désactiver les cartes
        activerCartes(false);
    }
}

// Activer ou désactiver les cartes
function activerCartes(actif) {
    const cartes = document.querySelectorAll('.feature-card');
    cartes.forEach(carte => {
        if (actif) {
            carte.classList.remove('disabled');
        } else {
            carte.classList.add('disabled');
        }
    });
}

// Gérer les clics sur les cartes
function gererCartes() {
    const cardMarcher = document.getElementById('card-marcher');
    const cardPanier = document.getElementById('card-panier');
    const cardCommandes = document.getElementById('card-commandes');
    
    if (cardMarcher) {
        cardMarcher.addEventListener('click', () => {
            if (estConnecte) window.location.href = 'marcher.html';
        });
    }
    
    if (cardPanier) {
        cardPanier.addEventListener('click', () => {
            if (estConnecte) window.location.href = 'panier.html';
        });
    }
    
    if (cardCommandes) {
        cardCommandes.addEventListener('click', () => {
            if (estConnecte) window.location.href = 'mescommandes.html';
        });
    }
}