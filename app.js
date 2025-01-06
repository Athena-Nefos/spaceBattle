class WeaponPod {
    constructor(hull) {
        this.hull = hull;
        this.maxHull = hull;
        this.isDestroyed = false;
    }
    takeDamage(damage) {
        this.hull -= damage;
        this.isDestroyed = this.hull <= 0;
    }
}

class Ship {
    constructor(name, hull, firepower, accuracy, imageUrl) {
        this.name = name;
        this.hull = hull;
        this.firepower = firepower;
        this.accuracy = accuracy;
        this.imageUrl = imageUrl;
        this.hits = 0;
        this.misses = 0;
        this.damageDealt = 0;
        this.shields = 0;
    }

    activateShields() {
        const shieldBoost = Math.floor(Math.random() * 5) + 1;
        this.hull += shieldBoost;
        this.maxHull += shieldBoost;
        return shieldBoost;
    }

    attack(target) {
        const hit = Math.random() < this.accuracy;
        if (hit) {
            target.hull -= this.firepower;
            this.hits++;
            this.damageDealt += this.firepower;
        } else {
            this.misses++;
        }
        return hit;
    }

    isDestroyed() {
        return this.hull <= 0;
    }
}

class MegaShip extends Ship {
    constructor(name, hull, firepower, accuracy, imageUrl) {
        super(name, hull, firepower, accuracy, imageUrl);
        this.weaponPods = this.generateWeaponPods();
        this.allPodsDestroyed = false;
    }

    generateWeaponPods() {
        const podCount = Math.floor(Math.random() * 3) + 2; //2-4 pods
        return Array.from({ length: podCount }, () => new WeaponPod(Math.floor(Math.random() * 10) + 5));
    }

    takeDamage(damage) {
        if (!this.allPodsDestroyed) {
            const activePods = this.weaponPods.filter(pod => !pod.isDestroyed);
            if (activePods.length > 0) {
                const targetPod = activePods[Math.floor(Math.random() * activePods.length)];
                targetPod.takeDamage(damage);
                this.allPodsDestroyed = this.weaponPods.every(pod => pod.isDestroyed);
                return false;
            }
        }
        this.hull -= damage;
        return true;
    }
}

class Game {
    constructor() {
        this.alienImages = [
            'images/alien-ship-1.png',
            'images/alien-ship-2.png',
            'images/alien-ship-3.png',
            'images/alien-ship-4.png',
            'images/alien-ship-5.png',
            'images/alien-ship-6.png',
            'images/AlienMegaShip'
        ];

        this.playerShip = new Ship(
            'USS Assembly',
            20,
            5,
            0.7,
            'images/USSAssembly.png'
        );

        this.missiles = 3;
        this.roundNumber = 1;
        this.totalDamageDealt = 0;
        this.totalDamageReceived = 0;
        this.alienFleet = this.generateAliens();
        this.currentAlienIndex = 0;
        this.gameOver = false;
        this.activeAliens = [];

        // Bind methods to maintain correct 'this' context
        this.attack = this.attack.bind(this);
        this.retreat = this.retreat.bind(this);
        this.fireMissile = this.fireMissile.bind(this);
        this.selectTarget = this.selectTarget.bind(this);
    }

    generateAliens() {
        const fleetSize = Math.floor(Math.random() * 4) + 3; // random 3-6 ships
        const fleet = [];

        // Add regular ships
        for (let i = 0; i < fleetSize - 1; i++) {
            fleet.push(new Ship(
                `Alien Ship ${i + 1}`,
                Math.floor(Math.random() * 4) + 3, // hull 3-6
                Math.floor(Math.random() * 3) + 2, // firepower 2-4
                Math.random() * 0.2 + 0.6, // accuracy
                this.alienImages[i]
            ));
        }

        // Add a Mega ship as the final boss
        fleet.push(new MegaShip(
            'Mega Battleship',
            15,
            4,
            0.8,
            this.alienImages[fleetSize - 1]
        ));

        return fleet;
    }

    activateAliens() {
        const maxActive = Math.min(3, this.alienFleet.length - this.currentAlienIndex);
        const activeCount = Math.floor(Math.random() * maxActive) + 1;
        
        this.activeAliens = this.alienFleet
            .slice(this.currentAlienIndex, this.currentAlienIndex + activeCount)
            .filter(alien => !alien.isDestroyed());
    }

    selectTarget() {
        if (this.activeAliens.length === 0) return null;
        return this.activeAliens[0]; // For now, just select the first active alien
    }

    fireMissile() {
        if (this.gameOver || this.missiles <= 0) return;

        const target = this.selectTarget();
        if (!target) return;

        this.missiles--;
        const missileDamage = 10; // Missiles do more damage than regular attacks
        const accuracyBoost = 0.2; // Missiles are more accurate
        const hit = Math.random() < (this.playerShip.accuracy + accuracyBoost);

        if (hit) {
            if (target instanceof MegaShip) {
                target.takeDamage(missileDamage);
            } else {
                target.hull -= missileDamage;
            }
            this.updateGameLog(`Missile hit ${target.name} for ${missileDamage} damage! Missiles remaining: ${this.missiles}`);
            this.playerShip.damageDealt += missileDamage;
            this.playerShip.hits++;
        } else {
            this.updateGameLog(`Missile missed ${target.name}! Missiles remaining: ${this.missiles}`);
            this.playerShip.misses++;
        }

        // Check if target is destroyed
        if (target.isDestroyed()) {
            this.updateGameLog(`${target.name} was destroyed!`);
            this.activeAliens = this.activeAliens.filter(alien => !alien.isDestroyed());
            if (this.activeAliens.length === 0) {
                this.currentAlienIndex++;
                if (this.currentAlienIndex >= this.alienFleet.length) {
                    this.victory();
                    return;
                }
            }
        }

        // Aliens still get to counter-attack after a missile
        this.alienCounterAttack();
        this.updateUI();
    }

    alienCounterAttack() {
        for (const alien of this.activeAliens) {
            if (!alien.isDestroyed()) {
                const hitPlayer = alien.attack(this.playerShip);
                this.logBattleStats(alien, this.playerShip, hitPlayer, alien.firepower);
                
                if (this.playerShip.isDestroyed()) {
                    this.defeat();
                    return;
                }
            }
        }
    }

    attack() {
        if (this.gameOver) return;

        // Activate shields with 30% chance
        if (Math.random() < 0.3) {
            const shieldBoost = this.playerShip.activateShields();
            this.updateGameLog(`Shields activated! +${shieldBoost} hull points`);
        }

        // Generate active alien group if none are active
        if (this.activeAliens.length === 0) {
            this.activateAliens();
        }
        
        const target = this.selectTarget();
        if (!target) return;

        // Player attack
        const hitAlien = this.playerShip.attack(target);
        this.logBattleStats(this.playerShip, target, hitAlien, this.playerShip.firepower);

        // Handle alien counter-attack
        this.alienCounterAttack();

        // Clean up destroyed aliens and check victory
        this.activeAliens = this.activeAliens.filter(alien => !alien.isDestroyed());
        if (this.activeAliens.length === 0) {
            this.currentAlienIndex++;
            if (this.currentAlienIndex >= this.alienFleet.length) {
                this.victory();
                return;
            }
        }

        this.updateUI();
    }

    retreat() {
        if (!this.gameOver) {
            this.gameOver = true;
            this.updateGameLog('You retreated. Game Over!');
            this.updateUI();
        }
    }

    victory() {
        this.gameOver = true;
        this.updateGameLog('Victory! All alien ships destroyed!');
        this.updateUI();
    }

    defeat() {
        this.gameOver = true;
        this.updateGameLog('Defeat! USS Assembly destroyed!');
        this.updateUI();
    }

    updateGameLog(message) {
        const gameLog = document.getElementById('gameLog');
        if (gameLog) {
            const messageDiv = document.createElement('div');
            messageDiv.textContent = message;
            gameLog.appendChild(messageDiv);
            gameLog.scrollTop = gameLog.scrollHeight;
        }
    }

    logBattleStats(attacker, defender, hit, damage) {
        const stats = `${attacker.name} ${hit ? 'hit' : 'missed'} ${defender.name}` +
            (hit ? ` for ${damage} damage! ${defender.name} hull: ${Math.max(0, defender.hull)}` : '!');
        this.updateGameLog(stats);
    }

    updateUI() {
        const shipStats = document.getElementById('shipStats');
        const alienStats = document.getElementById('alienStats');
        const missileCount = document.getElementById('missileCount');
        const missileBtn = document.getElementById('missileBtn');
        
        if (shipStats) {
            shipStats.textContent = `${this.playerShip.name} - Hull: ${Math.max(0, this.playerShip.hull)}`;
        }
        
        if (alienStats && this.activeAliens.length > 0) {
            alienStats.textContent = this.activeAliens
                .map(alien => `${alien.name} - Hull: ${Math.max(0, alien.hull)}`)
                .join(' | ');
        } else if (alienStats) {
            alienStats.textContent = 'No alien ships present';
        }
    
        if (missileCount) {
            missileCount.textContent = `Missiles: ${this.missiles}`;
        }
    
        if (missileBtn) {
            missileBtn.disabled = this.missiles <= 0 || this.gameOver;
        }
    }

    init() {
        // Get all control buttons
        const attackBtn = document.getElementById('attackBtn');
        const retreatBtn = document.getElementById('retreatBtn');
        const missileBtn = document.getElementById('missileBtn');
    
        // Add event listeners
        if (attackBtn) attackBtn.addEventListener('click', this.attack);
        if (retreatBtn) retreatBtn.addEventListener('click', this.retreat);
        if (missileBtn) {
            missileBtn.addEventListener('click', this.fireMissile);
            missileBtn.disabled = this.missiles <= 0;
        }
    
        this.updateGameLog('Game initialized. Attack to begin!');
        this.updateUI();
    }
}
        
    /* generateAliens() {
        return this.alienImages.map((imageUrl, index) => {
            const hull = Math.floor(Math.random() * 4) + 3;
            const firepower = Math.floor(Math.random() * 3) + 2;
            const accuracy = Math.random() * 0.2 + 0.6;
            return new Ship(`Alien Ship ${index + 1}`, hull, firepower, accuracy, imageUrl);
        });
    }

    getCurrentAlien() {
        return this.alienFleet[this.currentAlienIndex];
    }

    updateAlienImage() {
        const alienImage = document.querySelector('#alien-ship img');
        const currentAlien = this.getCurrentAlien();
        if (alienImage && currentAlien) {
            alienImage.src = currentAlien.imageUrl;
            alienImage.alt = currentAlien.name;
        }
    }

    logBattleStats(attacker, defender, hit, damage) {
        const stats = `${attacker.name} ${hit ? 'hit' : 'missed'} ${defender.name}` +
            (hit ? ` for ${damage} damage! ${defender.name} hull: ${Math.max(0, defender.hull)}` : '!');
        this.updateGameLog(stats);
    }

    attack() {
        if (this.gameOver) return;

        const currentAlien = this.getCurrentAlien();
        
        // Player attack
        const hitAlien = this.playerShip.attack(currentAlien);
        this.logBattleStats(this.playerShip, currentAlien, hitAlien, this.playerShip.firepower);

        if (currentAlien.isDestroyed()) {
            this.updateGameLog(`${currentAlien.name} destroyed!`);
            this.currentAlienIndex++;

            if (this.currentAlienIndex >= this.alienFleet.length) {
                this.victory();
                return;
            }

            this.updateGameLog(`${this.getCurrentAlien().name} approaching!`);
            this.updateAlienImage();
        } else {
            // Alien counterattack
            const hitPlayer = currentAlien.attack(this.playerShip);
            this.logBattleStats(currentAlien, this.playerShip, hitPlayer, currentAlien.firepower);

            if (this.playerShip.isDestroyed()) {
                this.defeat();
            }
        }

        this.updateUI();
    }

    retreat() {
        if (!this.gameOver) {
            this.gameOver = true;
            this.updateGameLog('You retreated. Game Over!');
            this.updateUI();
        }
    }

    victory() {
        this.gameOver = true;
        this.updateGameLog('Victory! All alien ships destroyed!');
        this.updateUI();
    }

    defeat() {
        this.gameOver = true;
        this.updateGameLog('Defeat! USS Assembly destroyed!');
        this.updateUI();
    }

    updateGameLog(message) {
        const gameLog = document.getElementById('gameLog');
        if (gameLog) {
            const messageDiv = document.createElement('div');
            messageDiv.textContent = message;
            gameLog.appendChild(messageDiv);
            gameLog.scrollTop = gameLog.scrollHeight;
        }
    }

    updateUI() {
        const shipStats = document.getElementById('shipStats');
        const alienStats = document.getElementById('alienStats');
        const attackBtn = document.getElementById('attackBtn');
        const retreatBtn = document.getElementById('retreatBtn');
        
        if (shipStats) {
            shipStats.textContent = `${this.playerShip.name} - Hull: ${Math.max(0, this.playerShip.hull)}`;
        }
        
        const currentAlien = this.getCurrentAlien();
        if (alienStats) {
            alienStats.textContent = currentAlien ? 
                `${currentAlien.name} - Hull: ${Math.max(0, currentAlien.hull)}` : 
                'No alien ship present';
        }

        if (attackBtn) attackBtn.disabled = this.gameOver;
        if (retreatBtn) retreatBtn.disabled = this.gameOver;
    }

    init() {
        const attackBtn = document.getElementById('attackBtn');
        const retreatBtn = document.getElementById('retreatBtn');

        if (attackBtn) attackBtn.addEventListener('click', this.attack);
        if (retreatBtn) retreatBtn.addEventListener('click', this.retreat);

        this.updateGameLog('Game initialized. Attack to begin!');
        this.updateUI();
        this.updateAlienImage();
    }
} */

// Start the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    game.init();
});