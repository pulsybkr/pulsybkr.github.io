// Gestionnaire d'interface utilisateur
import { CONFIG } from './config.js';

export class UIManager {
    constructor() {
        this.elements = {
            healthBarLeft: document.querySelector('.barreleft'),
            healthBarRight: document.querySelector('.barreright'),
            nameLeft: document.querySelector('.nameleft'),
            nameRight: document.querySelector('.nameright'),
            level: document.querySelector('.level'),
            score: null,
            combo: null,
            abilities: {},
            notifications: null
        };

        this.createUIElements();
    }

    createUIElements() {
        const jeu = document.querySelector('.jeu');

        // Créer l'affichage du score
        const scoreContainer = document.createElement('div');
        scoreContainer.className = 'score-container';
        scoreContainer.innerHTML = `
      <div class="score-label">SCORE</div>
      <div class="score-value">0</div>
    `;
        jeu.appendChild(scoreContainer);
        this.elements.score = scoreContainer.querySelector('.score-value');

        // Créer l'affichage du combo
        const comboContainer = document.createElement('div');
        comboContainer.className = 'combo-container';
        comboContainer.innerHTML = `
      <div class="combo-value">0x</div>
      <div class="combo-label">COMBO</div>
    `;
        jeu.appendChild(comboContainer);
        this.elements.combo = comboContainer.querySelector('.combo-value');

        // Créer l'affichage des capacités
        const abilitiesContainer = document.createElement('div');
        abilitiesContainer.className = 'abilities-container';
        abilitiesContainer.innerHTML = `
      <div class="ability" data-ability="fireball">
        <div class="ability-key">1</div>
        <div class="ability-name">Feu</div>
        <div class="ability-cooldown"></div>
      </div>
      <div class="ability" data-ability="lightning">
        <div class="ability-key">2</div>
        <div class="ability-name">Éclair</div>
        <div class="ability-cooldown"></div>
      </div>
      <div class="ability" data-ability="heal">
        <div class="ability-key">3</div>
        <div class="ability-name">Soin</div>
        <div class="ability-cooldown"></div>
      </div>
    `;
        jeu.appendChild(abilitiesContainer);

        this.elements.abilities = {
            fireball: abilitiesContainer.querySelector('[data-ability="fireball"]'),
            lightning: abilitiesContainer.querySelector('[data-ability="lightning"]'),
            heal: abilitiesContainer.querySelector('[data-ability="heal"]')
        };

        // Créer le conteneur de notifications
        const notificationsContainer = document.createElement('div');
        notificationsContainer.className = 'notifications-container';
        jeu.appendChild(notificationsContainer);
        this.elements.notifications = notificationsContainer;
    }

    updateHealthBar(character, side) {
        const percentage = character.getHealthPercentage();
        const barElement = side === 'left' ? this.elements.healthBarLeft : this.elements.healthBarRight;

        if (barElement) {
            document.documentElement.style.setProperty(
                side === 'left' ? '--vieHero' : '--vieEnemy',
                `${percentage}%`
            );
        }
    }

    updateNames(heroName, enemyName) {
        if (this.elements.nameLeft) {
            this.elements.nameLeft.textContent = heroName;
        }
        if (this.elements.nameRight) {
            this.elements.nameRight.textContent = enemyName;
        }
    }

    updateScore(score) {
        if (this.elements.score) {
            this.elements.score.textContent = score.toLocaleString();
        }
    }

    updateCombo(comboCount) {
        if (this.elements.combo) {
            this.elements.combo.textContent = `${comboCount}x`;

            const container = this.elements.combo.parentElement;
            if (comboCount >= CONFIG.PLAYER.COMBO_THRESHOLD) {
                container.classList.add('active');
            } else {
                container.classList.remove('active');
            }
        }
    }

    updateAbilityCooldown(abilityName, cooldown, maxCooldown) {
        const abilityElement = this.elements.abilities[abilityName];
        if (!abilityElement) return;

        const cooldownBar = abilityElement.querySelector('.ability-cooldown');

        if (cooldown > 0) {
            const percentage = (cooldown / maxCooldown) * 100;
            cooldownBar.style.height = `${percentage}%`;
            abilityElement.classList.add('on-cooldown');
        } else {
            cooldownBar.style.height = '0%';
            abilityElement.classList.remove('on-cooldown');
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;

        this.elements.notifications.appendChild(notification);

        // Animation d'entrée
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        // Retirer après un délai
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, CONFIG.UI.NOTIFICATION_DURATION);
    }

    showLevelTransition(levelNumber, enemyName) {
        const level = this.elements.level;
        if (!level) return;

        level.querySelector('.nextlevel').textContent = `NIVEAU ${levelNumber}`;
        level.querySelector('p').textContent = `Préparez-vous à affronter ${enemyName}!`;
        level.classList.add('leveln');
    }

    hideLevelTransition() {
        const level = this.elements.level;
        if (level) {
            level.classList.remove('leveln');
        }
    }

    showGameOver(won, stats) {
        const gameOverScreen = document.createElement('div');
        gameOverScreen.className = 'game-over-screen';
        gameOverScreen.innerHTML = `
      <div class="game-over-content">
        <h1 class="game-over-title">${won ? 'VICTOIRE!' : 'GAME OVER'}</h1>
        <div class="game-over-stats">
          <div class="stat-item">
            <span class="stat-label">Score Final</span>
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
          <button class="btn-restart">Recommencer</button>
          <button class="btn-menu">Menu Principal</button>
        </div>
      </div>
    `;

        document.querySelector('.jeu').appendChild(gameOverScreen);

        setTimeout(() => {
            gameOverScreen.classList.add('show');
        }, 10);

        return gameOverScreen;
    }

    showPauseMenu() {
        const pauseScreen = document.createElement('div');
        pauseScreen.className = 'pause-screen';
        pauseScreen.innerHTML = `
      <div class="pause-content">
        <h1 class="pause-title">PAUSE</h1>
        <div class="pause-actions">
          <button class="btn-resume">Reprendre</button>
          <button class="btn-restart">Recommencer</button>
          <button class="btn-menu">Menu Principal</button>
        </div>
      </div>
    `;

        document.querySelector('.jeu').appendChild(pauseScreen);

        setTimeout(() => {
            pauseScreen.classList.add('show');
        }, 10);

        return pauseScreen;
    }

    removePauseMenu() {
        const pauseScreen = document.querySelector('.pause-screen');
        if (pauseScreen) {
            pauseScreen.classList.remove('show');
            setTimeout(() => {
                if (pauseScreen.parentNode) {
                    pauseScreen.parentNode.removeChild(pauseScreen);
                }
            }, 300);
        }
    }
}
