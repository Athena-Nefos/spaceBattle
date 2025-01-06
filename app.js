class WeaponPod {
    constructor(hull) {
        this.hull = hull;
        this.maxHUll = hull;
        this.isDestroyed = false;
    }
    takeDamage(damage) {
        this.hull -= damage;
        this.isDestroyed = this.hull <= 0;
    }
}

class MaagaShip extends Ship {
        constructor(name, hull, firepower, accuracy,imageUrl) {
            super(name, hull, firepower, accuracy, imageUrl);
            this.weaponPOds = this.generateWeaponPOds();
            this.allPodsDestroyed = false;
        }
generateWeaponPods() {
    const podCount = Math.floor(Math.random() * 3) +2; //2-4 pods
    return Array.from({ length: podCount}, () => new WeaponPod(Math.floor(Math.random() * 10) + 5));
}        

takeDamage(damage) {
    if (!this.allPodsDestroyed) {
        const activePods = this.weaponPOds.filter(pod => !pod.isDestroyed);
        if (activePods.length > 0) {
            const targetPod = activePods[Math.floor(Math.random() * activePods.length)];
            targetPod.takeDamage(damage);
            this.allPodsDestroyed = this.weaponPOds.every(pod => pod.isDestroyed);
            return false;
        }
    }
    this.hull -= damage;
    return true;
}

}

class Ship {
    constructor(name, hull, firepower, accuracy, imageUrl) {
        this.name = name;
        this.hull = hull;
        this.firepower = firepower;
        this.accuracy = accuracy;
        this.imageUrl = imageUrl;
        //Add new properties 
        this.hits = 0;
        this.misses = 0;
        this.damageDealt = 0;
        this.sheilds = 0;
    }

    activateSheilds() {
        const sheildBoost = Math.floor(Math.random() * 5) + 1;
        this.hull += sheildBoost;
        this.maxHull += sheildBoost;
        return sheildBoost;
    }
//Update Attack
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

        this.attack = this.attack.bind(this);
        this.retreat = this.retreat.bind(this);
        this.fireMissile = this.fireMissile.bind(this);
        this.selectTarget = this.selectTarget.bind(this);
    }

    generateAliens() {
        const fleetSize = Math.floor(Math.random() * 4) + 3; //random 3-6 ships
        const fleet = [];

        //generate regular ships
        for (let i = 0; i < fleetSize - 1; i++) {
            fleet.push(new Ship(
                `Alien Ship ${i + 1}`,
                Math.floor(Math.random() * 4) + 3, // hull 3-6
                Math.floor(Math.random() * 3) + 2, //firepower 2-4
                Math.random() * 0.2 + 0.6, //accuracy
                this.alienImages[i]
             ));
             return fleet;
        }
        //methods to handle multiple aliens
        activateAliens() {
            const maxActive = Math.min(3, this.alienFleet.length - this.currentAlienIndex);
            const activeCount = Math.floor(Math.random() * maxActive) + 1;
            
            this.activeAliens = this.alienFleet
                .slice(this.currentAlienIndex, this.currentAlienIndex + activeCount)
                .filter(alien => !alien.isDestroyed());
        }
        
        // Update attack() method to handle multiple aliens:
        attack() {
            if (this.gameOver) return;
        
            // Activate shields with 30% chance
            if (Math.random() < 0.3) {
                const shieldBoost = this.playerShip.activateShields();
                this.updateGameLog(`Shields activated! +${shieldBoost} hull points`);
            }
        
            // Generate active alien group
            this.activateAliens();
            
            // Player attacks one selected alien
            const target = this.activeAliens[0]; // Simplified - You can add target selection later
            const hitAlien = this.playerShip.attack(target);
            this.logBattleStats(this.playerShip, target, hitAlien, this.playerShip.firepower);
        
            // All active aliens counter-attack
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
        
            // Check for destroyed aliens and advance fleet
            this.activeAliens = this.activeAliens.filter(alien => !alien.isDestroyed());
            if (this.activeAliens.length === 0) {
                this.currentAlienIndex++;
                if (this.currentAlienIndex >= this.alienFleet.length) {
                    this.victory();
                }
            }
        
            this.updateUI();
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