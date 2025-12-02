// Système de combat
import { CONFIG } from './config.js';

export class CombatSystem {
    constructor() {
        this.projectiles = [];
        this.hitEffects = [];
    }

    // Créer un projectile
    createProjectile(from, to, damage, type = 'fire') {
        const projectile = {
            id: Date.now() + Math.random(),
            from: { ...from },
            to: { ...to },
            current: { ...from },
            damage,
            type,
            speed: CONFIG.ANIMATIONS.PROJECTILE_SPEED,
            active: true,
            element: null
        };

        // Créer l'élément visuel
        const element = document.createElement('img');
        element.src = `perso/${type === 'fire' ? 'hero' : 'enemy'}/feu.png`;
        element.className = type === 'fire' ? 'projectile-hero' : 'projectile-enemy';
        element.style.position = 'absolute';
        element.style.left = `${from.x}px`;
        element.style.bottom = `${from.y}px`;
        element.style.zIndex = '5';

        const gameElement = document.querySelector('.jeu');
        gameElement.appendChild(element);

        projectile.element = element;
        this.projectiles.push(projectile);

        return projectile;
    }

    // Mettre à jour les projectiles
    updateProjectiles(deltaTime, onHit) {
        const deltaSeconds = deltaTime / 1000;

        this.projectiles = this.projectiles.filter(projectile => {
            if (!projectile.active) {
                if (projectile.element && projectile.element.parentNode) {
                    projectile.element.parentNode.removeChild(projectile.element);
                }
                return false;
            }

            // Calculer la direction
            const dx = projectile.to.x - projectile.from.x;
            const dy = projectile.to.y - projectile.from.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance === 0) {
                projectile.active = false;
                return true;
            }

            // Normaliser et déplacer
            const moveDistance = projectile.speed * deltaSeconds;
            const ratio = Math.min(moveDistance / distance, 1);

            projectile.current.x += dx * ratio;
            projectile.current.y += dy * ratio;

            // Mettre à jour la position visuelle
            if (projectile.element) {
                projectile.element.style.left = `${projectile.current.x}px`;
                projectile.element.style.bottom = `${projectile.current.y}px`;
            }

            // Vérifier si le projectile a atteint sa cible
            const remainingDistance = Math.sqrt(
                Math.pow(projectile.to.x - projectile.current.x, 2) +
                Math.pow(projectile.to.y - projectile.current.y, 2)
            );

            if (remainingDistance < 10) {
                projectile.active = false;
                if (onHit) {
                    onHit(projectile);
                }
            }

            return true;
        });
    }

    // Calculer si une attaque touche (avec possibilité d'esquive)
    calculateHit(attacker, defender, canDodge = true) {
        if (!defender.isAlive) return { hit: false, dodged: false };

        // Calculer la probabilité d'esquive basée sur la vitesse
        let dodgeChance = 0;
        if (canDodge) {
            dodgeChance = (defender.spd / (attacker.spd + defender.spd)) * 0.3; // Max 30%
        }

        const dodged = Math.random() < dodgeChance;

        return {
            hit: !dodged,
            dodged,
            critical: !dodged && Math.random() < 0.15 // 15% de chance de critique
        };
    }

    // Appliquer les dégâts avec effets
    applyDamage(attacker, defender, baseDamage, isCritical = false, isCombo = false) {
        let finalDamage = baseDamage;

        // Appliquer le multiplicateur de critique
        if (isCritical) {
            finalDamage *= 2;
        }

        // Appliquer les dégâts
        const actualDamage = defender.takeDamage(finalDamage);

        return {
            damage: actualDamage,
            isCritical,
            isCombo,
            killed: !defender.isAlive
        };
    }

    // Nettoyer tous les projectiles
    clearProjectiles() {
        this.projectiles.forEach(projectile => {
            if (projectile.element && projectile.element.parentNode) {
                projectile.element.parentNode.removeChild(projectile.element);
            }
        });
        this.projectiles = [];
    }

    // Effet de secousse d'écran
    screenShake(intensity = CONFIG.ANIMATIONS.SHAKE_INTENSITY, duration = 300) {
        const gameElement = document.querySelector('.jeu');
        const originalTransform = gameElement.style.transform;

        let startTime = null;

        const shake = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;

            if (elapsed < duration) {
                const x = (Math.random() - 0.5) * intensity;
                const y = (Math.random() - 0.5) * intensity;
                gameElement.style.transform = `translate(${x}px, ${y}px)`;
                requestAnimationFrame(shake);
            } else {
                gameElement.style.transform = originalTransform;
            }
        };

        requestAnimationFrame(shake);
    }
}

// Gestionnaire de combos
export class ComboManager {
    constructor() {
        this.currentCombo = 0;
        this.maxCombo = 0;
        this.lastHitTime = 0;
        this.comboTimeout = null;
    }

    addHit() {
        this.currentCombo++;
        this.maxCombo = Math.max(this.maxCombo, this.currentCombo);
        this.lastHitTime = Date.now();

        // Réinitialiser le timeout
        if (this.comboTimeout) {
            clearTimeout(this.comboTimeout);
        }

        this.comboTimeout = setTimeout(() => {
            this.reset();
        }, CONFIG.PLAYER.COMBO_WINDOW);

        return this.currentCombo;
    }

    reset() {
        this.currentCombo = 0;
        if (this.comboTimeout) {
            clearTimeout(this.comboTimeout);
            this.comboTimeout = null;
        }
    }

    getMultiplier() {
        if (this.currentCombo >= CONFIG.PLAYER.COMBO_THRESHOLD) {
            return CONFIG.PLAYER.COMBO_DAMAGE_MULTIPLIER;
        }
        return 1;
    }

    getCurrentCombo() {
        return this.currentCombo;
    }

    getMaxCombo() {
        return this.maxCombo;
    }
}
