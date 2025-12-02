// Système de particules pour effets visuels
import { CONFIG } from './config.js';

export class ParticleSystem {
    constructor(container) {
        this.container = container;
        this.particles = [];
    }

    // Créer une explosion de particules
    createExplosion(x, y, config) {
        const { count, colors, lifetime } = config;

        for (let i = 0; i < count; i++) {
            const particle = {
                id: Date.now() + Math.random(),
                x,
                y,
                vx: (Math.random() - 0.5) * 200,
                vy: (Math.random() - 0.5) * 200 + 50,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: Math.random() * 6 + 2,
                lifetime,
                age: 0,
                element: null
            };

            const element = document.createElement('div');
            element.className = 'particle';
            element.style.position = 'absolute';
            element.style.left = `${x}px`;
            element.style.bottom = `${y}px`;
            element.style.width = `${particle.size}px`;
            element.style.height = `${particle.size}px`;
            element.style.backgroundColor = particle.color;
            element.style.borderRadius = '50%';
            element.style.pointerEvents = 'none';
            element.style.zIndex = '100';

            this.container.appendChild(element);
            particle.element = element;
            this.particles.push(particle);
        }
    }

    // Effet de hit
    createHitEffect(x, y) {
        this.createExplosion(x, y, CONFIG.PARTICLES.HIT);
    }

    // Effet de combo
    createComboEffect(x, y) {
        this.createExplosion(x, y, CONFIG.PARTICLES.COMBO);
    }

    // Effet de victoire
    createVictoryEffect(x, y) {
        this.createExplosion(x, y, CONFIG.PARTICLES.VICTORY);
    }

    // Créer un texte de dégâts flottant
    createDamageText(x, y, damage, isCritical = false, isCombo = false) {
        const element = document.createElement('div');
        element.className = 'damage-text';
        element.textContent = Math.floor(damage);
        element.style.position = 'absolute';
        element.style.left = `${x}px`;
        element.style.bottom = `${y + 30}px`;
        element.style.fontSize = isCritical ? '32px' : '24px';
        element.style.fontWeight = 'bold';
        element.style.color = isCritical ? '#ff0000' : (isCombo ? '#00d2d3' : '#ffffff');
        element.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';
        element.style.pointerEvents = 'none';
        element.style.zIndex = '101';
        element.style.animation = 'floatUp 1s ease-out forwards';

        this.container.appendChild(element);

        setTimeout(() => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        }, CONFIG.UI.DAMAGE_TEXT_DURATION);
    }

    // Créer un texte de combo
    createComboText(x, y, comboCount) {
        const element = document.createElement('div');
        element.className = 'combo-text';
        element.textContent = `${comboCount}x COMBO!`;
        element.style.position = 'absolute';
        element.style.left = `${x}px`;
        element.style.bottom = `${y + 50}px`;
        element.style.fontSize = '28px';
        element.style.fontWeight = 'bold';
        element.style.color = '#48dbfb';
        element.style.textShadow = '3px 3px 6px rgba(0,0,0,0.9)';
        element.style.pointerEvents = 'none';
        element.style.zIndex = '102';
        element.style.animation = 'pulse 0.5s ease-in-out';

        this.container.appendChild(element);

        setTimeout(() => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        }, 1000);
    }

    // Mettre à jour les particules
    update(deltaTime) {
        const deltaSeconds = deltaTime / 1000;

        this.particles = this.particles.filter(particle => {
            particle.age += deltaTime;

            if (particle.age >= particle.lifetime) {
                if (particle.element && particle.element.parentNode) {
                    particle.element.parentNode.removeChild(particle.element);
                }
                return false;
            }

            // Mettre à jour la position
            particle.x += particle.vx * deltaSeconds;
            particle.y += particle.vy * deltaSeconds;
            particle.vy -= 200 * deltaSeconds; // Gravité

            // Calculer l'opacité
            const lifeRatio = particle.age / particle.lifetime;
            const opacity = 1 - lifeRatio;

            // Mettre à jour l'élément
            if (particle.element) {
                particle.element.style.left = `${particle.x}px`;
                particle.element.style.bottom = `${particle.y}px`;
                particle.element.style.opacity = opacity;
            }

            return true;
        });
    }

    // Nettoyer toutes les particules
    clear() {
        this.particles.forEach(particle => {
            if (particle.element && particle.element.parentNode) {
                particle.element.parentNode.removeChild(particle.element);
            }
        });
        this.particles = [];
    }
}
