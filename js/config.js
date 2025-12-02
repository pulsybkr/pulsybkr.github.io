// Configuration centralisée du jeu
export const CONFIG = {
    // Dimensions du jeu
    GAME: {
        WIDTH: 800,
        HEIGHT: 400,
        FPS: 60
    },

    // Configuration du joueur
    PLAYER: {
        WIDTH: 55,
        HEIGHT: 57,
        MOVE_SPEED: 5,
        COMBO_WINDOW: 800, // ms pour enchaîner un combo
        COMBO_THRESHOLD: 3, // nombre d'attaques pour activer le combo
        COMBO_DAMAGE_MULTIPLIER: 1.5,
        SPECIAL_COOLDOWN: 5000, // ms
        DODGE_COOLDOWN: 2000 // ms
    },

    // Configuration des ennemis
    ENEMY: {
        WIDTH: 55,
        HEIGHT: 57,
        MOVE_SPEED: 3,
        ATTACK_INTERVAL: 3000 // ms entre les attaques
    },

    // Système de progression
    PROGRESSION: {
        BASE_XP: 100,
        XP_MULTIPLIER: 1.5,
        SCORE_PER_HIT: 10,
        SCORE_COMBO_MULTIPLIER: 2,
        SCORE_PERFECT_BONUS: 500
    },

    // Capacités spéciales
    ABILITIES: {
        FIREBALL: {
            name: 'Boule de Feu',
            damage: 30,
            cooldown: 5000,
            key: '1'
        },
        LIGHTNING: {
            name: 'Éclair',
            damage: 25,
            cooldown: 4000,
            key: '2'
        },
        HEAL: {
            name: 'Soin',
            amount: 30,
            cooldown: 8000,
            key: '3'
        }
    },

    // Configuration des particules
    PARTICLES: {
        HIT: {
            count: 15,
            colors: ['#ff6b6b', '#feca57', '#ff9ff3'],
            lifetime: 600
        },
        COMBO: {
            count: 25,
            colors: ['#48dbfb', '#0abde3', '#00d2d3'],
            lifetime: 800
        },
        VICTORY: {
            count: 50,
            colors: ['#ffd700', '#ffed4e', '#fff200'],
            lifetime: 1200
        }
    },

    // Animations
    ANIMATIONS: {
        ATTACK_DURATION: 500,
        HIT_DURATION: 750,
        DEATH_DURATION: 2000,
        PROJECTILE_SPEED: 800, // pixels par seconde
        SHAKE_INTENSITY: 10
    },

    // UI
    UI: {
        HEALTH_BAR_TRANSITION: 500,
        NOTIFICATION_DURATION: 2000,
        DAMAGE_TEXT_DURATION: 1000
    },

    // Touches
    KEYS: {
        MOVE_LEFT: 'ArrowLeft',
        MOVE_RIGHT: 'ArrowRight',
        JUMP: 'ArrowUp',
        ATTACK: 'Space',
        ABILITY_1: 'Digit1',
        ABILITY_2: 'Digit2',
        ABILITY_3: 'Digit3',
        PAUSE: 'Escape',
        CONFIRM: 'Enter'
    }
};

// États du jeu
export const GAME_STATES = {
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    LEVEL_TRANSITION: 'level_transition',
    GAME_OVER: 'game_over',
    VICTORY: 'victory'
};

// Types d'animations
export const ANIMATION_TYPES = {
    IDLE: 'idle',
    WALK: 'walk',
    ATTACK: 'attack',
    HIT: 'hit',
    DEATH: 'death',
    SPECIAL: 'special'
};
