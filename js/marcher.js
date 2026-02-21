// marcher.js - Version dynamique qui s'adapte à admin

let produits = {};
let panier = [];

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Marché chargé');
    
    chargerDonnees();
    genererProduits();
    chargerPanier();
    mettreAJourCompteurPanier();
    
    // Surveiller les changements admin
    window.addEventListener('storage', function(e) {
        if (e.key === 'marche_produits') {
            console.log('📢 Mise à jour depuis admin');
            chargerDonnees();
            genererProduits();
        }
    });
});

// Charger les produits
function chargerDonnees() {
    const saved = localStorage.getItem('marche_produits');
    if (saved) {
        produits = JSON.parse(saved);
    } else {
        produits = {
            banane: { nom: 'Banane', emoji: '🍌', prix: 2.00, stock: 10, bloque: false },
            tomate: { nom: 'Tomate', emoji: '🍅', prix: 3.00, stock: 5, bloque: false }
        };
    }
}

// Générer dynamiquement les produits sur la page
function genererProduits() {
    const main = document.querySelector('.marcher-main');
    main.innerHTML = ''; // Vider
    
    Object.keys(produits).forEach(id => {
        const produit = produits[id];
        const card = creerCarteProduit(id, produit);
        main.appendChild(card);
    });
}

// Créer une carte produit
function creerCarteProduit(id, produit) {
    const div = document.createElement('div');
    div.className = 'produit-card';
    div.id = `prod-${id}`;
    div.dataset.produit = id;
    
    // Appliquer les classes d'état
    if (produit.bloque) div.classList.add('produit-indisponible');
    else if (produit.stock <= 0) div.classList.add('rupture-stock');
    else if (produit.stock < 2) div.classList.add('stock-faible');
    
    // Construction HTML
    div.innerHTML = `
        <div class="produit-header">
            <h2>${produit.emoji || '📦'} ${produit.nom}</h2>
            <span class="prix" id="prix-${id}">${produit.prix.toFixed(2)}€</span>
        </div>
        
        <div class="produit-stock">
            <span class="stock-label">Dispo:</span>
            <span class="stock-valeur" id="stock-${id}">${produit.stock} kg</span>
        </div>

        <div class="produit-actions">
            <div class="action-group">
                <button class="btn-add" id="add-${id}-1kg" ${produit.bloque || produit.stock <= 0 ? 'disabled' : ''}>
                    +1kg
                </button>
                
                <div class="kilo-selector">
                    <input type="number" id="kg-${id}" min="1" value="1" step="0.5" 
                           ${produit.bloque || produit.stock <= 0 ? 'disabled' : ''}>
                    <button class="btn-kilo" id="add-${id}-kg" 
                            ${produit.bloque || produit.stock <= 0 ? 'disabled' : ''}>
                        Ajouter kg
                    </button>
                </div>
            </div>
            <p class="error-message" id="error-${id}"></p>
        </div>
    `;
    
    // Ajouter les événements
    setTimeout(() => {
        document.getElementById(`add-${id}-1kg`).addEventListener('click', () => ajouterAuPanier(id, 1));
        document.getElementById(`add-${id}-kg`).addEventListener('click', () => {
            const kg = parseFloat(document.getElementById(`kg-${id}`).value) || 1;
            ajouterAuPanier(id, kg);
        });
        document.getElementById(`kg-${id}`).addEventListener('input', validerKilo);
    }, 0);
    
    return div;
}

// Valider kilo
function validerKilo(e) {
    let valeur = parseFloat(e.target.value) || 1;
    if (valeur < 0.1) e.target.value = 0.1;
    if (valeur > 100) e.target.value = 100;
}

// Ajouter au panier
function ajouterAuPanier(id, kgDemande) {
    const produit = produits[id];
    
    if (produit.bloque) {
        showToast(`❌ ${produit.nom} est bloqué`, 'error');
        return;
    }
    
    if (produit.stock <= 0) {
        showToast(`❌ Plus de ${produit.nom} disponible`, 'error');
        return;
    }
    
    if (kgDemande > produit.stock) {
        showToast(`❌ Seulement ${produit.stock} kg disponible`, 'error');
        return;
    }
    
    // Panier avec structure enrichie
    const existant = panier.find(item => item.id === id);
    
    if (existant) {
        if (existant.kg + kgDemande > produit.stock) {
            showToast(`❌ Stock insuffisant`, 'error');
            return;
        }
        existant.kg += kgDemande;
    } else {
        panier.push({
            id: id,
            nom: produit.nom,
            emoji: produit.emoji,
            kg: kgDemande,
            prix: produit.prix
        });
    }
    
    localStorage.setItem('marche_panier', JSON.stringify(panier));
    
    // Animation
    const btn = document.getElementById(`add-${id}-1kg`);
    btn.classList.add('add-animation');
    setTimeout(() => btn.classList.remove('add-animation'), 300);
    
    showToast(`✅ ${kgDemande}kg de ${produit.nom} ajouté`, 'success');
    mettreAJourCompteurPanier();
    
    // Reset input
    document.getElementById(`kg-${id}`).value = 1;
}

// Charger panier
function chargerPanier() {
    const saved = localStorage.getItem('marche_panier');
    if (saved) {
        panier = JSON.parse(saved);
        // Filtrer les produits qui n'existent plus
        panier = panier.filter(item => produits[item.id]);
        localStorage.setItem('marche_panier', JSON.stringify(panier));
    }
}

// Compteur panier
function mettreAJourCompteurPanier() {
    const total = panier.reduce((acc, item) => acc + item.kg, 0);
    const compteur = document.getElementById('panier-count');
    if (compteur) {
        compteur.textContent = total;
        compteur.style.display = total > 0 ? 'block' : 'none';
    }
}

// Toast
function showToast(message, type = 'info') {
    let toast = document.getElementById('marcher-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'marcher-toast';
        toast.style.cssText = `
            position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);
            padding: 14px 28px; border-radius: 50px; font-size: 1rem;
            font-weight: bold; box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 1000; transition: opacity 0.3s; opacity: 0;
        `;
        document.body.appendChild(toast);
    }
    
    const colors = { success: '#27ae60', error: '#e74c3c', info: '#3498db' };
    toast.style.backgroundColor = colors[type] || colors.info;
    toast.style.color = 'white';
    toast.textContent = message;
    toast.style.opacity = '1';
    
    setTimeout(() => toast.style.opacity = '0', 2000);
}

// Mise à jour du HTML pour supporter les IDs dynamiques
// Note: Il faut aussi mettre à jour marcher.html pour enlever les IDs fixes