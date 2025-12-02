// Point d'entrée principal du jeu modernisé
import { Game } from './js/game.js';

// Initialiser le jeu quand le DOM est prêt
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🎮 Initialisation du jeu...');

  try {
    const game = new Game();
    await game.init();
    console.log('✅ Jeu initialisé avec succès!');

    // Exposer le jeu globalement pour le débogage
    window.game = game;
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation du jeu:', error);
    alert('Une erreur est survenue lors du chargement du jeu. Veuillez rafraîchir la page.');
  }
});
