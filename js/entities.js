// Classes pour les entités du jeu
import { CONFIG, ANIMATION_TYPES } from './config.js';

// Classe de base pour tous les personnages
export class Character {
    constructor(data, element) {
        this.id = data.id;
        this.name = data.name;
        this.maxHp = data.hp;
        this.hp = data.hp;
        this.str = data.str;
        this.spd = data.spd;
        this.element = element;
        this.position = { x: 0, y: 0 };
        this.currentAnimation = ANIMATION_TYPES.IDLE;
        this.isAlive = true;
        this.isAttacking = false;
    }

    takeDamage(damage) {
        if (!this.isAlive) return 0;

        const actualDamage = Math.max(0, damage);
        this.hp = Math.max(0, this.hp - actualDamage);

        if (this.hp <= 0) {
            this.isAlive = false;
            this.playAnimation(ANIMATION_TYPES.DEATH);
        } else {
            this.playAnimation(ANIMATION_TYPES.HIT);
        }

        return actualDamage;
    }

    heal(amount) {
        if (!this.isAlive) return 0;

        const oldHp = this.hp;
        this.hp = Math.min(this.maxHp, this.hp + amount);
        return this.hp - oldHp;
    }

    getHealthPercentage() {
        return (this.hp / this.maxHp) * 100;
    }

    playAnimation(type) {
        this.currentAnimation = type;
        // L'animation sera gérée par le CSS
    }

    updatePosition(x, y) {
        this.position.x = x;
        this.position.y = y;
        this.element.style.left = `${x}px`;
        this.element.style.bottom = `${y}px`;
    }
}

// Classe pour le héros
export class Hero extends Character {
    constructor(data, element) {
        super(data, element);
        this.comboCount = 0;
        this.lastAttackTime = 0;
        this.abilities = {
            fireball: { cooldown: 0, ready: true },
            lightning: { cooldown: 0, ready: true },
            heal: { cooldown: 0, ready: true }
        };
        this.canDodge = true;
        this.dodgeCooldown = 0;
        this.facingRight = true;
    }

    attack() {
        if (this.isAttacking || !this.isAlive) return null;

        const now = Date.now();
        const timeSinceLastAttack = now - this.lastAttackTime;

        // Vérifier si on est dans la fenêtre de combo
        if (timeSinceLastAttack < CONFIG.PLAYER.COMBO_WINDOW) {
            this.comboCount++;
        } else {
            this.comboCount = 1;
        }

        this.lastAttackTime = now;
        this.isAttacking = true;
        this.playAnimation(ANIMATION_TYPES.ATTACK);

        // Calculer les dégâts avec bonus de combo
        let damage = this.str;
        let isCombo = false;

        if (this.comboCount >= CONFIG.PLAYER.COMBO_THRESHOLD) {
            damage *= CONFIG.PLAYER.COMBO_DAMAGE_MULTIPLIER;
            isCombo = true;
        }

        // Réinitialiser l'état d'attaque après l'animation
        setTimeout(() => {
            this.isAttacking = false;
        }, CONFIG.ANIMATIONS.ATTACK_DURATION);

        return {
            damage,
            isCombo,
            comboCount: this.comboCount
        };
    }

    useAbility(abilityName) {
        if (!this.isAlive) return null;

        const ability = this.abilities[abilityName];
        if (!ability || !ability.ready) return null;

        const config = CONFIG.ABILITIES[abilityName.toUpperCase()];
        if (!config) return null;

        // Mettre l'abilité en cooldown
        ability.ready = false;
        ability.cooldown = config.cooldown;

        this.playAnimation(ANIMATION_TYPES.SPECIAL);

        return {
            name: config.name,
            damage: config.damage || 0,
            heal: config.amount || 0
        };
    }

    updateCooldowns(deltaTime) {
        for (const [name, ability] of Object.entries(this.abilities)) {
            if (!ability.ready) {
                ability.cooldown = Math.max(0, ability.cooldown - deltaTime);
                if (ability.cooldown === 0) {
                    ability.ready = true;
                }
            }
        }

        if (!this.canDodge) {
            this.dodgeCooldown = Math.max(0, this.dodgeCooldown - deltaTime);
            if (this.dodgeCooldown === 0) {
                this.canDodge = true;
            }
        }
    }

    dodge() {
        if (!this.canDodge || !this.isAlive) return false;

        this.canDodge = false;
        this.dodgeCooldown = CONFIG.PLAYER.DODGE_COOLDOWN;

        // Animation d'esquive (saut)
        this.element.classList.add('dodge-animation');
        setTimeout(() => {
            this.element.classList.remove('dodge-animation');
        }, 500);

        return true;
    }

    move(direction) {
        if (!this.isAlive) return;

        const speed = CONFIG.PLAYER.MOVE_SPEED;
        let newX = this.position.x;

        if (direction === 'left') {
            newX -= speed;
            this.facingRight = false;
            this.element.classList.add('leftdirection');
        } else if (direction === 'right') {
            newX += speed;
            this.facingRight = true;
            this.element.classList.remove('leftdirection');
        }

        // Limiter le mouvement dans les bornes du jeu
        newX = Math.max(0, Math.min(CONFIG.GAME.WIDTH - CONFIG.PLAYER.WIDTH, newX));

        if (newX !== this.position.x) {
            this.updatePosition(newX, this.position.y);
            if (!this.isAttacking) {
                this.playAnimation(ANIMATION_TYPES.WALK);
            }
        }
    }

    resetCombo() {
        this.comboCount = 0;
    }
}

// Classe pour les ennemis
export class Enemy extends Character {
    constructor(data, element) {
        super(data, element);
        this.attackPattern = data.attackPattern || 'basic';
        this.lastAttackTime = 0;
        this.moveDirection = -1; // -1 pour gauche, 1 pour droite
        this.moveTimer = 0;
    }

    shouldAttack(currentTime) {
        if (!this.isAlive || this.isAttacking) return false;

        const timeSinceLastAttack = currentTime - this.lastAttackTime;
        return timeSinceLastAttack >= CONFIG.ENEMY.ATTACK_INTERVAL;
    }

    attack() {
        if (this.isAttacking || !this.isAlive) return null;

        this.lastAttackTime = Date.now();
        this.isAttacking = true;
        this.playAnimation(ANIMATION_TYPES.ATTACK);

        setTimeout(() => {
            this.isAttacking = false;
        }, CONFIG.ANIMATIONS.ATTACK_DURATION);

        return {
            damage: this.str,
            canDodge: true
        };
    }

    updateAI(deltaTime, heroPosition) {
        if (!this.isAlive || this.isAttacking) return;

        // Simple AI: se déplacer vers le héros
        this.moveTimer += deltaTime;

        if (this.moveTimer >= 100) { // Mise à jour tous les 100ms
            this.moveTimer = 0;

            const distanceToHero = heroPosition.x - this.position.x;
            const minDistance = 100; // Distance minimale à maintenir

            if (Math.abs(distanceToHero) > minDistance) {
                const direction = distanceToHero > 0 ? 1 : -1;
                const newX = this.position.x + (direction * CONFIG.ENEMY.MOVE_SPEED);

                // Limiter le mouvement
                const clampedX = Math.max(0, Math.min(CONFIG.GAME.WIDTH - CONFIG.ENEMY.WIDTH, newX));
                this.updatePosition(clampedX, this.position.y);
            }
        }
    }
}
