// admin.js - Version avec produits dynamiques

let produits = {};

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Admin chargé');
    
    chargerDonnees();
    afficherProduits();
    
    document.getElementById('ajouter-produit').addEventListener('click', ajouterProduit);
    document.getElementById('sauvegarder').addEventListener('click', sauvegarderDonnees);
});

// Charger les données
function chargerDonnees() {
    const saved = localStorage.getItem('marche_produits');
    
    if (saved) {
        produits = JSON.parse(saved);
    } else {
        // Produits par défaut
        produits = {
            banane: { nom: 'Banane', emoji: '🍌', prix: 2.00, stock: 10, bloque: false },
            tomate: { nom: 'Tomate', emoji: '🍅', prix: 3.00, stock: 5, bloque: false }
        };
    }
}

// Afficher tous les produits
function afficherProduits() {
    const container = document.getElementById('produits-container');
    container.innerHTML = '';
    
    Object.keys(produits).forEach(id => {
        const card = creerCarteProduit(id, produits[id]);
        container.appendChild(card);
    });
    
    afficherEtatStock();
}

// Créer une carte produit
function creerCarteProduit(id, produit) {
    const template = document.getElementById('template-produit');
    const clone = template.content.cloneNode(true);
    const card = clone.querySelector('.produit-card');
    
    card.dataset.produit = id;
    
    // Remplir les données
    card.querySelector('.produit-emoji').textContent = produit.emoji || '📦';
    card.querySelector('.produit-nom').textContent = produit.nom;
    card.querySelector('.produit-nom-input').value = produit.nom;
    card.querySelector('.produit-prix').value = produit.prix;
    card.querySelector('.produit-stock').value = produit.stock;
    card.querySelector('.produit-bloque').checked = produit.bloque;
    
    // Gestionnaire suppression
    card.querySelector('.btn-supprimer-produit').addEventListener('click', (e) => {
        e.stopPropagation();
        supprimerProduit(id);
    });
    
    return card;
}

// Ajouter un produit
function ajouterProduit() {
    const id = 'produit_' + Date.now();
    const nouveauNumero = Object.keys(produits).length + 1;
    
    produits[id] = {
        nom: `Produit ${nouveauNumero}`,
        emoji: '📦',
        prix: 2.00,
        stock: 10,
        bloque: false
    };
    
    afficherProduits();
    showToast('✅ Nouveau produit ajouté');
}

// Supprimer un produit
function supprimerProduit(id) {
    if (confirm(`Supprimer ${produits[id].nom} ?`)) {
        delete produits[id];
        afficherProduits();
        showToast('🗑️ Produit supprimé');
    }
}

// Sauvegarder les données
function sauvegarderDonnees() {
    // Parcourir toutes les cartes et mettre à jour les données
    document.querySelectorAll('.produit-card').forEach(card => {
        const id = card.dataset.produit;
        
        produits[id] = {
            nom: card.querySelector('.produit-nom-input').value,
            emoji: card.querySelector('.produit-emoji').textContent,
            prix: parseFloat(card.querySelector('.produit-prix').value) || 0,
            stock: parseFloat(card.querySelector('.produit-stock').value) || 0,
            bloque: card.querySelector('.produit-bloque').checked
        };
    });
    
    localStorage.setItem('marche_produits', JSON.stringify(produits));
    afficherProduits(); // Rafraîchir avec les nouveaux noms/emojis
    showToast('💾 Modifications sauvegardées');
}

// Afficher état des stocks
function afficherEtatStock() {
    const etats = Object.keys(produits).map(id => {
        const p = produits[id];
        let etat = `${p.emoji} ${p.nom}: ${p.stock} kg`;
        if (p.bloque) etat += ' (🔒)';
        return etat;
    }).join(' | ');
    
    document.getElementById('affichage-stock').textContent = etats || 'Aucun produit';
}

// Toast
function showToast(message) {
    let toast = document.getElementById('admin-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'admin-toast';
        toast.style.cssText = `
            position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
            background: #2c3e50; color: white; padding: 12px 24px;
            border-radius: 30px; z-index: 1000; transition: opacity 0.3s;
        `;
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.opacity = '1';
    setTimeout(() => toast.style.opacity = '0', 2000);
}