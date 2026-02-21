// panier.js - Gestion complète du panier avec livraison

// Structure des données
let panier = [];
let produits = {};

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Panier chargé');
    
    chargerDonnees();
    afficherPanier();
    
    // Écouter les changements (admin, marché)
    window.addEventListener('storage', function(e) {
        if (e.key === 'marche_produits' || e.key === 'marche_panier') {
            console.log('📢 Changement détecté');
            chargerDonnees();
            afficherPanier();
        }
    });
    
    // Boutons
    document.getElementById('btn-vider').addEventListener('click', viderPanier);
    document.getElementById('btn-payer').addEventListener('click', confirmerPaiement);
});

// Charger toutes les données
function chargerDonnees() {
    // Charger produits depuis admin
    const savedProduits = localStorage.getItem('marche_produits');
    if (savedProduits) {
        produits = JSON.parse(savedProduits);
    } else {
        produits = {
            banane: { nom: 'Banane', emoji: '🍌', prix: 2.00, stock: 10, bloque: false },
            tomate: { nom: 'Tomate', emoji: '🍅', prix: 3.00, stock: 5, bloque: false }
        };
    }
    
    // Charger panier depuis marché
    const savedPanier = localStorage.getItem('marche_panier');
    if (savedPanier) {
        panier = JSON.parse(savedPanier);
    } else {
        panier = [];
    }
    
    console.log('📥 Données chargées:', { produits, panier });
}

// Afficher le panier
function afficherPanier() {
    const panierVide = document.getElementById('panier-vide');
    const panierContenu = document.getElementById('panier-contenu');
    const panierListe = document.getElementById('panier-liste');
    
    // Vider la liste
    panierListe.innerHTML = '';
    
    if (panier.length === 0) {
        // Afficher panier vide
        panierVide.style.display = 'block';
        panierContenu.style.display = 'none';
        return;
    }
    
    // Afficher panier avec articles
    panierVide.style.display = 'none';
    panierContenu.style.display = 'block';
    
    // Ajouter chaque article
    panier.forEach((item, index) => {
        const article = creerArticleHTML(item, index);
        panierListe.appendChild(article);
    });
    
    // Ajouter les options de livraison si pas déjà présentes
    ajouterOptionsLivraison();
    
    // Restaurer le choix de livraison
    restaurerChoixLivraison();
    
    // Mettre à jour les totaux
    calculerTotaux();
    
    // Ajouter les écouteurs pour cet affichage
    ajouterEcouteursPanier();
}

// Créer le HTML d'un article
function creerArticleHTML(item, index) {
    const template = document.getElementById('template-article');
    const clone = template.content.cloneNode(true);
    const article = clone.querySelector('.panier-article');
    
    const produit = produits[item.id] || item; // Fallback si produit a été supprimé
    const prixUnitaire = produit.prix || 0;
    const totalArticle = (item.kg * prixUnitaire).toFixed(2);
    
    // Remplir les données
    article.dataset.produit = item.id;
    article.dataset.index = index;
    
    const nomElement = article.querySelector('.article-nom');
    nomElement.innerHTML = (produit.emoji || '📦') + ' ' + (produit.nom || 'Produit');
    
    const kgInput = article.querySelector('.kg-input');
    kgInput.value = item.kg;
    kgInput.dataset.produit = item.id;
    kgInput.dataset.index = index;
    
    const prixElement = article.querySelector('.article-prix-unitaire');
    prixElement.textContent = prixUnitaire.toFixed(2) + ' €';
    
    const totalElement = article.querySelector('.article-total');
    totalElement.textContent = totalArticle + ' €';
    
    return clone;
}

// Ajouter les options de livraison si elles n'existent pas
function ajouterOptionsLivraison() {
    const panierContenu = document.getElementById('panier-contenu');
    
    // Vérifier si les options existent déjà
    if (document.querySelector('.livraison-options')) {
        return;
    }
    
    // Créer la section livraison
    const livraisonDiv = document.createElement('div');
    livraisonDiv.className = 'livraison-options';
    livraisonDiv.innerHTML = `
        <h3>🚚 Mode de réception</h3>
        <div class="options-group">
            <label class="option-livraison">
                <input type="radio" name="livraison" value="domicile" checked>
                <span class="option-emoji">🚚</span>
                <div class="option-details">
                    <strong>Livraison à domicile</strong>
                    <small>Partagez votre position pour être livré</small>
                </div>
            </label>
            
            <label class="option-livraison">
                <input type="radio" name="livraison" value="local">
                <span class="option-emoji">🏪</span>
                <div class="option-details">
                    <strong>Retrait au local</strong>
                    <small>Venez chercher vos produits directement</small>
                </div>
            </label>
        </div>
        <p id="livraison-info" class="livraison-info"></p>
    `;
    
    // Insérer après la liste du panier
    const panierListe = document.getElementById('panier-liste');
    panierListe.insertAdjacentElement('afterend', livraisonDiv);
    
    // Ajouter les écouteurs pour les radios
    document.querySelectorAll('input[name="livraison"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            localStorage.setItem('marche_livraison', e.target.value);
            mettreAJourInfoLivraison(e.target.value);
        });
    });
}

// Restaurer le choix de livraison
function restaurerChoixLivraison() {
    const choixPrecedent = localStorage.getItem('marche_livraison') || 'domicile';
    const radio = document.querySelector(`input[name="livraison"][value="${choixPrecedent}"]`);
    if (radio) {
        radio.checked = true;
        mettreAJourInfoLivraison(choixPrecedent);
    }
}

// Mettre à jour l'info livraison
function mettreAJourInfoLivraison(type) {
    const info = document.getElementById('livraison-info');
    if (!info) return;
    
    if (type === 'domicile') {
        info.innerHTML = '🚚 Vous serez invité à partager votre position après le paiement';
        info.style.background = '#e8f4f8';
        info.style.color = '#2c3e50';
    } else {
        info.innerHTML = '🏪 Vous pourrez venir chercher vos produits au local (Adresse: 123 Rue du Marché, 75001 Paris)';
        info.style.background = '#fff3cd';
        info.style.color = '#856404';
    }
}

// Ajouter les écouteurs du panier
function ajouterEcouteursPanier() {
    // Boutons supprimer
    document.querySelectorAll('.btn-supprimer').forEach(btn => {
        btn.addEventListener('click', function(e) {
            const article = this.closest('.panier-article');
            const produit = article.dataset.produit;
            supprimerArticle(produit);
        });
    });
    
    // Inputs quantité
    document.querySelectorAll('.kg-input').forEach(input => {
        input.addEventListener('change', function(e) {
            const produit = this.dataset.produit;
            const nouvelleKg = parseFloat(this.value) || 0;
            modifierQuantite(produit, nouvelleKg);
        });
        
        // Validation à la saisie
        input.addEventListener('input', function(e) {
            let valeur = parseFloat(this.value) || 0;
            if (valeur < 0.1) this.value = 0.1;
            if (valeur > 100) this.value = 100;
        });
    });
}

// Supprimer un article
function supprimerArticle(produitId) {
    panier = panier.filter(item => item.id !== produitId);
    localStorage.setItem('marche_panier', JSON.stringify(panier));
    
    showToast(`🗑️ Article retiré du panier`);
    afficherPanier();
    
    // Mettre à jour le compteur dans marcher.html
    localStorage.setItem('marche_panier_update', Date.now().toString());
}

// Modifier la quantité
function modifierQuantite(produitId, nouvelleKg) {
    const item = panier.find(i => i.id === produitId);
    const produit = produits[produitId];
    
    if (!item) return;
    
    // Vérifications
    if (nouvelleKg <= 0) {
        supprimerArticle(produitId);
        return;
    }
    
    if (produit && nouvelleKg > produit.stock) {
        showToast(`⚠️ Stock max: ${produit.stock}kg`, 'warning');
        item.kg = produit.stock;
    } else {
        item.kg = nouvelleKg;
    }
    
    // Sauvegarder
    localStorage.setItem('marche_panier', JSON.stringify(panier));
    
    // Recalculer
    calculerTotaux();
    
    // Mettre à jour l'affichage de cette ligne
    const total = (item.kg * (produit?.prix || 0)).toFixed(2);
    const article = document.querySelector(`.panier-article[data-produit="${produitId}"] .article-total`);
    if (article) article.textContent = total + ' €';
    
    // Mettre à jour l'input si besoin
    const input = document.querySelector(`.kg-input[data-produit="${produitId}"]`);
    if (input) input.value = item.kg;
}

// Calculer tous les totaux
function calculerTotaux() {
    let sousTotal = 0;
    
    panier.forEach(item => {
        const produit = produits[item.id];
        const prix = produit?.prix || 0;
        sousTotal += item.kg * prix;
    });
    
    const total = sousTotal;
    
    document.getElementById('sous-total').textContent = sousTotal.toFixed(2) + ' €';
    document.getElementById('total-general').textContent = total.toFixed(2) + ' €';
}

// Vider le panier
function viderPanier() {
    if (panier.length === 0) return;
    
    if (confirm('🗑️ Vider tout le panier ?')) {
        panier = [];
        localStorage.setItem('marche_panier', JSON.stringify(panier));
        localStorage.setItem('marche_panier_update', Date.now().toString());
        
        showToast('🗑️ Panier vidé');
        afficherPanier();
    }
}

// Confirmer le paiement
function confirmerPaiement() {
    if (panier.length === 0) {
        showToast('🛒 Panier vide', 'warning');
        return;
    }
    
    // Créer modal de confirmation
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-confirmation">
            <h3>💰 Confirmation d'achat</h3>
            <p>Total à payer: <strong>${document.getElementById('total-general').textContent}</strong></p>
            <p>Mode: <strong>${document.querySelector('input[name="livraison"]:checked').value === 'domicile' ? '🚚 Livraison' : '🏪 Retrait'}</strong></p>
            <p>Confirmez-vous l'achat ?</p>
            <div class="modal-actions">
                <button class="modal-btn cancel">Annuler</button>
                <button class="modal-btn confirm">✅ Confirmer</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Afficher modal
    setTimeout(() => modal.classList.add('show'), 10);
    
    // Gestion boutons
    modal.querySelector('.cancel').addEventListener('click', () => {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    });
    
    modal.querySelector('.confirm').addEventListener('click', () => {
        effectuerPaiement();
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    });
}

// Effectuer le paiement
function effectuerPaiement() {
    // Vérifier les stocks une dernière fois
    let stockOK = true;
    
    panier.forEach(item => {
        const produit = produits[item.id];
        if (!produit || produit.bloque || produit.stock < item.kg) {
            stockOK = false;
            showToast(`❌ Problème avec ${produit?.nom || 'un produit'}`, 'error');
        }
    });
    
    if (!stockOK) {
        showToast('❌ Vérifiez votre panier', 'error');
        return;
    }
    
    // Récupérer le type de livraison
    const typeLivraison = document.querySelector('input[name="livraison"]:checked')?.value || 'local';
    
    // Créer la commande
    const commande = {
        id: 'CMD_' + Date.now(),
        utilisateur: 'Megane',
        date: new Date().toISOString(),
        typeLivraison: typeLivraison,
        produits: panier.map(item => {
            const produit = produits[item.id] || item;
            return {
                id: item.id,
                nom: produit.nom || 'Produit',
                emoji: produit.emoji || '📦',
                kg: item.kg,
                prix: produit.prix || 0,
                total: item.kg * (produit.prix || 0)
            };
        }),
        total: parseFloat(document.getElementById('total-general').textContent)
    };
    
    // Si livraison à domicile, demander la position
    if (typeLivraison === 'domicile') {
        demanderPosition(commande);
    } else {
        commande.localisation = null;
        finaliserCommande(commande);
    }
}

// Demander la géolocalisation
function demanderPosition(commande) {
    showToast('📍 Demande de position...', 'info');
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                commande.localisation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                showToast('📍 Position obtenue', 'success');
                finaliserCommande(commande);
            },
            (error) => {
                console.warn('Géolocalisation refusée:', error);
                commande.localisation = null;
                
                if (confirm('📍 Partager votre position pour être livré ? (Sinon, retrait au local)')) {
                    demanderPosition(commande); // Réessayer
                } else {
                    commande.typeLivraison = 'local';
                    finaliserCommande(commande);
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    } else {
        alert('📱 Géolocalisation non supportée par votre navigateur');
        commande.localisation = null;
        commande.typeLivraison = 'local';
        finaliserCommande(commande);
    }
}

// Finaliser la commande
function finaliserCommande(commande) {
    // Récupérer les commandes existantes
    let commandes = JSON.parse(localStorage.getItem('marche_commandes')) || [];
    commandes.unshift(commande); // Ajouter au début
    localStorage.setItem('marche_commandes', JSON.stringify(commandes));
    
    // Déduire les stocks
    let produits = JSON.parse(localStorage.getItem('marche_produits'));
    panier.forEach(item => {
        if (produits[item.id]) {
            produits[item.id].stock -= item.kg;
        }
    });
    localStorage.setItem('marche_produits', JSON.stringify(produits));
    
    // Déclencher l'alerte sonore pour commande.html
    localStorage.setItem('marche_nouvelle_commande', Date.now().toString());
    
    // Sauvegarder le choix de livraison pour la prochaine fois
    if (commande.typeLivraison) {
        localStorage.setItem('marche_livraison', commande.typeLivraison);
    }
    
    // Vider le panier
    panier = [];
    localStorage.setItem('marche_panier', JSON.stringify(panier));
    
    // Message de confirmation
    showToast('✅ Commande enregistrée ! Merci Megane', 'success');
    
    // Rediriger vers le marché après 2 secondes
    setTimeout(() => {
        window.location.href = 'marcher.html';
    }, 2000);
}

// Système de toast
function showToast(message, type = 'success') {
    let toast = document.getElementById('panier-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'panier-toast';
        toast.style.cssText = `
            position: fixed;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            padding: 14px 28px;
            border-radius: 50px;
            font-size: 1rem;
            font-weight: bold;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 1001;
            transition: opacity 0.3s;
            opacity: 0;
            background-color: #27ae60;
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
    }, 2000);
}

// Export pour débogage
window.getPanier = () => panier;
window.getProduits = () => produits;