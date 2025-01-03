class Ship {
    constructor(name, hull, firepower, accuracy, imageUrl) {
        this.name = name;
        this.hull = hull;
        this.firepower = firepower;
        this.accuracy = accuracy;
        this.imageUrl = imageUrl;
    }

    attack(target) {
        const hit = Math.random() < this.accuracy;
        if (hit) {
            target.hull -= this.firepower;
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
            'images/alien-ship-6.png'
        ];

        this.playerShip = new Ship(
            'USS Assembly',
            20,
            5,
            0.7,
            'images/USSAssembly.png'
        );

        this.alienFleet = this.generateAliens();
        this.currentAlienIndex = 0;
        this.gameOver = false;

        this.attack = this.attack.bind(this);
        this.retreat = this.retreat.bind(this);
    }

    generateAliens() {
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
}

// Start the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    game.init();
});