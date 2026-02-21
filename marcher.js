// marcher.js - Affichage public des produits

const SUPABASE_URL = 'https://tohvsjklhtecljlftagq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvaHZzamtsaHRlY2xqbGZ0YWdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0NjUxMzksImV4cCI6MjA4NjA0MTEzOX0.zMvaO-FYI2UvDUeHiKZZgb1WUzo-ir4Ud6EtQIJIirc';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', () => {
    chargerProduits();
    
    // Écouter les changements en temps réel
    supabase
        .channel('produits')
        .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'produits' },
            () => {
                console.log('🔄 Changement détecté, mise à jour...');
                chargerProduits();
            }
        )
        .subscribe();
});

async function chargerProduits() {
    const { data: produits, error } = await supabase
        .from('produits')
        .select('*')
        .order('created_at', { ascending: false });
    
    if (error) {
        console.error('Erreur chargement:', error);
        afficherErreur();
        return;
    }
    
    afficherProduits(produits);
}

function afficherProduits(produits) {
    const container = document.getElementById('produits-container');
    
    if (!produits || produits.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 50px;">
                <i class="fas fa-store-alt" style="font-size: 4rem; color: #bdc3c7;"></i>
                <p style="color: #7f8c8d; margin-top: 20px;">Aucun produit disponible pour le moment</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    produits.forEach(produit => {
        const card = document.createElement('div');
        card.className = 'produit-card';
        
        if (produit.bloque) {
            card.classList.add('produit-bloque');
        }
        
        // Déterminer la classe du stock
        let stockClass = 'stock-dispo';
        let stockTexte = `${produit.stock} kg disponibles`;
        
        if (produit.stock <= 0) {
            stockClass = 'stock-rupture';
            stockTexte = 'Rupture de stock';
        } else if (produit.stock < 5) {
            stockClass = 'stock-faible';
            stockTexte = `Plus que ${produit.stock} kg`;
        }
        
        card.innerHTML = `
            <div class="produit-nom">
                <i class="fas fa-apple-alt" style="color: #27ae60;"></i>
                ${produit.nom}
            </div>
            <div class="produit-details">
                <span class="produit-prix">${produit.prix} F/kg</span>
                <span class="produit-stock ${stockClass}">${stockTexte}</span>
            </div>
            ${produit.bloque ? '<div class="badge-bloque"><i class="fas fa-ban"></i> Indisponible</div>' : ''}
        `;
        
        container.appendChild(card);
    });
}

function afficherErreur() {
    const container = document.getElementById('produits-container');
    container.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 50px;">
            <i class="fas fa-exclamation-triangle" style="font-size: 4rem; color: #e74c3c;"></i>
            <p style="color: #7f8c8d; margin-top: 20px;">Erreur de chargement des produits</p>
        </div>
    `;
}
