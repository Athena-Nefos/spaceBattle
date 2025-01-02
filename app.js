class Ship {
    constructor(hull, firepower, accuracy, imgageURLS) {
      this.hull = hull;
      this.firepower = firepower;
      this.accuracy = accuracy;
      this.imageUrls = this.imageUrls;
      this.currentImageIndex = 0;
    }

    getNextImage() {
        if (this.imageUrls.length === 0) return '';
        this.currentImageIndex = (this.currentImageIndex + 1) % this.imageUrls.length;
        return this.imageUrls[this.currentImageIndex];
    }
  
    attack(target) {
      if (Math.random() < this.accuracy) {
        target.hull -= this.firepower;
        return true;
      }
      return false;
    }
  
    isDestroyed() {
      return this.hull <= 0;
    }

  }
  // game class
  class Game {
    constructor() {
      this.ship = new Ship('USS Assembly', 20, 5, 0.7);
      this.alienImages = [
        'alien-ship-1.png',
        'alien-ship-2.png',
        'alien-ship-3.png',
        'alien-ship-4.png',
        'alien-ship-5.png',
        'alien-ship-6.png'
      ];
      this.aliens = this.generateAliens();
      this.currentAlienIndex = 0;
      this.gameOver = false;
      
      // Bind methods
      this.attack = this.attack.bind(this);
      this.retreat = this.retreat.bind(this);
    }
  
    generateAliens() {
      const aliens = [];
      for (let i = 0; i < 6; i++) {
        const hull = Math.floor(Math.random() * 4) + 3; // 3-6
        const firepower = Math.floor(Math.random() * 3) + 2; // 2-4
        const accuracy = (Math.floor(Math.random() * 3) + 6) / 10; // 0.6-0.8
        aliens.push(new Ship(hull, firepower, accuracy));
      }
      return aliens;
    }
  
    getCurrentAlien() {
      return this.aliens[this.currentAlienIndex];
    }
  
    attack() {
      if (this.gameOver) return;
  
      const currentAlien = this.getCurrentAlien();
      const hitAlien = this.ship.attack(currentAlien);
      
      this.updateGameLog(`You ${hitAlien ? 'hit' : 'missed'} the alien ship!`);
      
      if (currentAlien.isDestroyed()) {
        this.updateGameLog('Alien ship destroyed!');
        this.currentAlienIndex++;
        
        if (this.currentAlienIndex >= this.aliens.length) {
          this.victory();
          return;
        }
        
        this.updateGameLog('New alien ship approaching!');
        return;
      }
  
      const hitPlayer = currentAlien.attack(this.ship);
      this.updateGameLog(`Alien ${hitPlayer ? 'hit' : 'missed'} your ship!`);
      
      if (this.ship.isDestroyed()) {
        this.defeat();
      }
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
      this.updateGameLog('Congratulations! You destroyed all alien ships!');
      this.updateUI();
    }
  
    defeat() {
      this.gameOver = true;
      this.updateGameLog('Your ship was destroyed. Game Over!');
      this.updateUI();
    }
  
    updateGameLog(message) {
      const gameLog = document.getElementById('gameLog');
      gameLog.innerHTML += `<div>${message}</div>`;
      gameLog.scrollTop = gameLog.scrollHeight;
    }
  
    updateUI() {
      const shipStats = document.getElementById('shipStats');
      const alienStats = document.getElementById('alienStats');
      const buttons = document.querySelectorAll('button');
      
      shipStats.textContent = `USS Assembly - Hull: ${Math.max(0, this.ship.hull)}`;
      
      if (!this.gameOver && this.getCurrentAlien()) {
        alienStats.textContent = `Alien Ship - Hull: ${Math.max(0, this.getCurrentAlien().hull)}`;
      }
      
      buttons.forEach(button => {
        button.disabled = this.gameOver;
      });
    }
  
    init() {
      const container = document.createElement('div');
      container.innerHTML = `
        <div id="gameStats" class="text-lg font-bold mb-4">
          <div id="shipStats"></div>
          <div id="alienStats"></div>
        </div>
        <div id="gameLog" class="h-48 overflow-y-auto mb-4 p-2 border border-gray-300"></div>
        <div class="space-x-4">
          <button id="attackBtn" class="bg-red-500 text-white px-4 py-2 rounded">Attack</button>
          <button id="retreatBtn" class="bg-gray-500 text-white px-4 py-2 rounded">Retreat</button>
        </div>
      `;
      
      document.body.appendChild(container);
      
      document.getElementById('attackBtn').addEventListener('click', this.attack);
      document.getElementById('retreatBtn').addEventListener('click', this.retreat);
      
      this.updateUI();
      this.updateGameLog('Game started! Attack the alien ships!');
    }
  }


  
  // Initialize game
  const game = new Game();
  game.init();