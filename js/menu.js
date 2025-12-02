// Système de menus
import { GAME_STATES } from './config.js';

export class MenuManager {
    constructor(onNewGame, onContinue, onRestart, onQuit) {
        this.onNewGame = onNewGame;
        this.onContinue = onContinue;
        this.onRestart = onRestart;
        this.onQuit = onQuit;
        this.currentMenu = null;
    }

    showMainMenu(hasSaveData = false) {
        this.hideAllMenus();

        const menu = document.createElement('div');
        menu.className = 'main-menu';
        menu.innerHTML = `
      <div class="menu-content">
        <h1 class="menu-title">COMBAT ARENA</h1>
        <div class="menu-subtitle">Préparez-vous au combat!</div>
        <div class="menu-buttons">
          <button class="menu-btn btn-new-game">Nouvelle Partie</button>
          ${hasSaveData ? '<button class="menu-btn btn-continue">Continuer</button>' : ''}
          <button class="menu-btn btn-credits">Crédits</button>
        </div>
      </div>
    `;

        document.querySelector('.jeu').appendChild(menu);
        this.currentMenu = menu;

        // Ajouter les event listeners
        menu.querySelector('.btn-new-game').addEventListener('click', () => {
            this.onNewGame();
            this.hideAllMenus();
        });

        if (hasSaveData) {
            menu.querySelector('.btn-continue').addEventListener('click', () => {
                this.onContinue();
                this.hideAllMenus();
            });
        }

        menu.querySelector('.btn-credits').addEventListener('click', () => {
            this.showCredits();
        });

        setTimeout(() => {
            menu.classList.add('show');
        }, 10);
    }

    showCredits() {
        const credits = document.createElement('div');
        credits.className = 'credits-screen';
        credits.innerHTML = `
      <div class="credits-content">
        <h2>Crédits</h2>
        <p>Jeu créé avec passion</p>
        <p>Modernisé avec JavaScript ES6</p>
        <p>Merci d'avoir joué!</p>
        <button class="menu-btn btn-back">Retour</button>
      </div>
    `;

        document.querySelector('.jeu').appendChild(credits);

        credits.querySelector('.btn-back').addEventListener('click', () => {
            credits.remove();
        });

        setTimeout(() => {
            credits.classList.add('show');
        }, 10);
    }

    hideAllMenus() {
        if (this.currentMenu) {
            this.currentMenu.classList.remove('show');
            setTimeout(() => {
                if (this.currentMenu && this.currentMenu.parentNode) {
                    this.currentMenu.parentNode.removeChild(this.currentMenu);
                }
                this.currentMenu = null;
            }, 300);
        }
    }

    showLevelStart(levelNumber, enemyName) {
        const levelStart = document.createElement('div');
        levelStart.className = 'level-start-screen';
        levelStart.innerHTML = `
      <div class="level-start-content">
        <h1 class="level-number">NIVEAU ${levelNumber}</h1>
        <div class="enemy-name">${enemyName}</div>
        <div class="level-instruction">Appuyez sur ENTRÉE pour commencer</div>
      </div>
    `;

        document.querySelector('.jeu').appendChild(levelStart);

        setTimeout(() => {
            levelStart.classList.add('show');
        }, 10);

        return new Promise((resolve) => {
            const handleKeyPress = (e) => {
                if (e.code === 'Enter') {
                    document.removeEventListener('keydown', handleKeyPress);
                    levelStart.classList.remove('show');
                    setTimeout(() => {
                        if (levelStart.parentNode) {
                            levelStart.parentNode.removeChild(levelStart);
                        }
                        resolve();
                    }, 300);
                }
            };

            document.addEventListener('keydown', handleKeyPress);
        });
    }

    showVictoryScreen(stats) {
        const victory = document.createElement('div');
        victory.className = 'victory-screen';
        victory.innerHTML = `
      <div class="victory-content">
        <h1 class="victory-title">VICTOIRE!</h1>
        <div class="victory-message">Vous avez vaincu tous les ennemis!</div>
        <div class="victory-stats">
          <div class="stat-item">
            <span class="stat-label">Score Final</span>
            <span class="stat-value">${stats.score.toLocaleString()}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Ennemis Vaincus</span>
            <span class="stat-value">${stats.enemiesDefeated}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Combo Maximum</span>
            <span class="stat-value">${stats.maxCombo}x</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Précision</span>
            <span class="stat-value">${stats.accuracy.toFixed(1)}%</span>
          </div>
        </div>
        ${stats.newAchievements.length > 0 ? `
          <div class="achievements-unlocked">
            <h3>Nouveaux Achievements!</h3>
            ${stats.newAchievements.map(ach => `
              <div class="achievement-item">
                <div class="achievement-name">${ach.name}</div>
                <div class="achievement-desc">${ach.description}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}
        <div class="victory-actions">
          <button class="menu-btn btn-restart">Rejouer</button>
          <button class="menu-btn btn-menu">Menu Principal</button>
        </div>
      </div>
    `;

        document.querySelector('.jeu').appendChild(victory);

        victory.querySelector('.btn-restart').addEventListener('click', () => {
            victory.remove();
            this.onRestart();
        });

        victory.querySelector('.btn-menu').addEventListener('click', () => {
            victory.remove();
            this.onQuit();
        });

        setTimeout(() => {
            victory.classList.add('show');
        }, 10);
    }

    showGameOverScreen(stats) {
        const gameOver = document.createElement('div');
        gameOver.className = 'game-over-screen';
        gameOver.innerHTML = `
      <div class="game-over-content">
        <h1 class="game-over-title">GAME OVER</h1>
        <div class="game-over-message">Vous avez été vaincu...</div>
        <div class="game-over-stats">
          <div class="stat-item">
            <span class="stat-label">Score</span>
            <span class="stat-value">${stats.score.toLocaleString()}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Niveau Atteint</span>
            <span class="stat-value">${stats.level}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Combo Max</span>
            <span class="stat-value">${stats.maxCombo}x</span>
          </div>
        </div>
        <div class="game-over-actions">
          <button class="menu-btn btn-restart">Réessayer</button>
          <button class="menu-btn btn-menu">Menu Principal</button>
        </div>
      </div>
    `;

        document.querySelector('.jeu').appendChild(gameOver);

        gameOver.querySelector('.btn-restart').addEventListener('click', () => {
            gameOver.remove();
            this.onRestart();
        });

        gameOver.querySelector('.btn-menu').addEventListener('click', () => {
            gameOver.remove();
            this.onQuit();
        });

        setTimeout(() => {
            gameOver.classList.add('show');
        }, 10);
    }
}
