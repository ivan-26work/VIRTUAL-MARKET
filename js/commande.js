// commande.js - Interface admin des commandes avec notifications sonores

let commandes = [];
let nouvelleCommandeId = null;

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Commandes chargé');
    
    chargerCommandes();
    afficherCommandes();
    
    // Surveiller les nouvelles commandes
    surveillerNouvellesCommandes();
    
    // Bouton rafraîchir
    document.getElementById('rafraichir').addEventListener('click', function() {
        chargerCommandes();
        afficherCommandes();
        showToast('🔄 Commandes rafraîchies');
    });
    
    // Demander permission audio au chargement
    preparerAudio();
});

// Préparer l'audio (nécessaire pour certains navigateurs)
function preparerAudio() {
    const audio = document.getElementById('notification-son');
    if (audio) {
        // Charger le son sans le jouer
        audio.load();
        console.log('🔊 Son chargé');
    }
}

// Charger les commandes depuis localStorage
function chargerCommandes() {
    const saved = localStorage.getItem('marche_commandes');
    if (saved) {
        commandes = JSON.parse(saved);
    } else {
        commandes = [];
    }
    
    // Trier par date (plus récente en premier)
    commandes.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    console.log(`📦 ${commandes.length} commandes chargées`);
}

// Surveiller les nouvelles commandes
function surveillerNouvellesCommandes() {
    let derniereMAJ = localStorage.getItem('marche_nouvelle_commande') || 0;
    
    setInterval(() => {
        const currentMAJ = localStorage.getItem('marche_nouvelle_commande');
        
        if (currentMAJ && currentMAJ !== derniereMAJ) {
            console.log('🔔 Nouvelle commande détectée!');
            derniereMAJ = currentMAJ;
            
            // Recharger les commandes
            chargerCommandes();
            
            // Jouer le son
            jouerNotification();
            
            // Afficher les commandes avec mise en évidence
            afficherCommandes(true);
            
            // Notification visuelle
            showToast('🔔 Nouvelle commande reçue!', 'success');
        }
    }, 1000); // Vérifier chaque seconde
}

// Jouer la notification sonore
function jouerNotification() {
    const audio = document.getElementById('notification-son');
    
    if (audio) {
        // Réinitialiser le son si déjà joué
        audio.pause();
        audio.currentTime = 0;
        
        // Jouer le son
        audio.play().catch(e => {
            console.log('⚠️ Impossible de jouer le son:', e);
            // Fallback: notification visuelle seulement
            showToast('🔔 Nouvelle commande! (son bloqué)', 'warning');
        });
    } else {
        console.warn('Élément audio non trouvé');
    }
}

// Afficher toutes les commandes
function afficherCommandes(nouvelleRecue = false) {
    const container = document.getElementById('commandes-liste');
    container.innerHTML = '';
    
    if (commandes.length === 0) {
        container.innerHTML = `
            <div class="aucune-commande">
                <div class="empty-icon">📭</div>
                <h3>Aucune commande pour le moment</h3>
                <p>Les commandes des clients apparaîtront ici</p>
            </div>
        `;
        return;
    }
    
    // Afficher chaque commande
    commandes.forEach((commande, index) => {
        const card = creerCarteCommande(commande, index);
        container.appendChild(card);
    });
    
    // Si nouvelle commande, scroller en haut
    if (nouvelleRecue && commandes.length > 0) {
        setTimeout(() => {
            const premiereCarte = document.querySelector('.commande-card');
            if (premiereCarte) {
                premiereCarte.scrollIntoView({ behavior: 'smooth', block: 'start' });
                
                // Mettre en évidence
                premiereCarte.classList.add('nouvelle');
                setTimeout(() => {
                    premiereCarte.classList.remove('nouvelle');
                }, 3000);
            }
        }, 100);
    }
}

// Créer une carte commande
function creerCarteCommande(commande, index) {
    const template = document.getElementById('template-commande');
    const clone = template.content.cloneNode(true);
    const card = clone.querySelector('.commande-card');
    
    card.dataset.commandeId = commande.id;
    
    // Si c'est la première commande et récente, ajouter badge
    if (index === 0 && estRecente(commande.date)) {
        card.classList.add('nouvelle-commande');
    }
    
    // ID et date
    card.querySelector('.commande-id').textContent = commande.id;
    card.querySelector('.commande-date').textContent = formaterDate(commande.date);
    
    // Statut (à développer plus tard)
    const statut = card.querySelector('.commande-statut');
    statut.textContent = 'En attente';
    statut.classList.add('en-attente');
    
    // Client
    card.querySelector('.client-nom').textContent = '👤 ' + (commande.utilisateur || 'Megane');
    
    const livraisonSpan = card.querySelector('.client-livraison');
    if (commande.typeLivraison === 'domicile') {
        livraisonSpan.textContent = '🚚 Livraison à domicile';
        livraisonSpan.classList.add('domicile');
    } else {
        livraisonSpan.textContent = '🏪 Retrait au local';
        livraisonSpan.classList.add('local');
    }
    
    // Produits
    const tbody = card.querySelector('.produits-body');
    commande.produits.forEach(produit => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${produit.emoji || '📦'} ${produit.nom}</td>
            <td>${produit.kg} kg</td>
            <td>${produit.prix.toFixed(2)} €</td>
            <td><strong>${produit.total.toFixed(2)} €</strong></td>
        `;
        tbody.appendChild(row);
    });
    
    // Total
    card.querySelector('.total-montant').textContent = commande.total;
    
    // Localisation / bouton Maps
    const localisationDiv = card.querySelector('.commande-localisation');
    
    if (commande.typeLivraison === 'domicile' && commande.localisation) {
        // Créer lien Google Maps
        const lat = commande.localisation.lat;
        const lng = commande.localisation.lng;
        const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
        
        localisationDiv.innerHTML = `
            <a href="${mapsUrl}" target="_blank" class="btn-maps">
                🗺️ Voir sur Google Maps
            </a>
        `;
    } else if (commande.typeLivraison === 'domicile' && !commande.localisation) {
        localisationDiv.innerHTML = `
            <span class="pas-livraison">📍 Position non partagée</span>
        `;
    } else {
        localisationDiv.innerHTML = `
            <span class="pas-livraison">🏪 Retrait au local (123 Rue du Marché)</span>
        `;
    }
    
    return clone;
}

// Vérifier si une commande est récente (< 5 minutes)
function estRecente(dateString) {
    const dateCommande = new Date(dateString);
    const maintenant = new Date();
    const diffMinutes = (maintenant - dateCommande) / (1000 * 60);
    return diffMinutes < 5;
}

// Formater la date
function formaterDate(dateString) {
    const date = new Date(dateString);
    const aujourd = new Date();
    const hier = new Date(aujourd);
    hier.setDate(hier.getDate() - 1);
    
    // Format heure
    const heures = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const timeStr = `${heures}:${minutes}`;
    
    // Vérifier si aujourd'hui
    if (date.toDateString() === aujourd.toDateString()) {
        return `Aujourd'hui à ${timeStr}`;
    }
    // Vérifier si hier
    else if (date.toDateString() === hier.toDateString()) {
        return `Hier à ${timeStr}`;
    }
    // Sinon date complète
    else {
        const jour = date.getDate().toString().padStart(2, '0');
        const mois = (date.getMonth() + 1).toString().padStart(2, '0');
        const annee = date.getFullYear();
        return `${jour}/${mois}/${annee} à ${timeStr}`;
    }
}

// Système de toast
function showToast(message, type = 'info') {
    let toast = document.getElementById('commande-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'commande-toast';
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: bold;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 1000;
            transition: opacity 0.3s;
            opacity: 0;
            background-color: #3498db;
            color: white;
        `;
        document.body.appendChild(toast);
    }
    
    const colors = {
        success: '#27ae60',
        error: '#e74c3c',
        warning: '#f39c12',
        info: '#3498db'
    };
    
    toast.style.backgroundColor = colors[type] || colors.info;
    toast.style.color = 'white';
    toast.textContent = message;
    toast.style.opacity = '1';
    
    setTimeout(() => {
        toast.style.opacity = '0';
    }, 3000);
}

// Ajouter du CSS pour l'état vide
const style = document.createElement('style');
style.textContent = `
    .aucune-commande {
        text-align: center;
        padding: 60px 20px;
        background: white;
        border-radius: 15px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    
    .empty-icon {
        font-size: 5rem;
        margin-bottom: 20px;
        opacity: 0.5;
    }
    
    .aucune-commande h3 {
        color: #7f8c8d;
        margin-bottom: 10px;
    }
    
    .aucune-commande p {
        color: #95a5a6;
    }
    
    .nouvelle-commande {
        animation: highlightNew 2s ease;
    }
    
    @keyframes highlightNew {
        0% { background: #fff3cd; }
        100% { background: white; }
    }
`;
document.head.appendChild(style);