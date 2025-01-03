/* Space Battle the Game Implementation */

class Ship {
    constructor(hull, firepower, accuracy, imgageURLS) {
      this.hull = hull;
      this.firepower = firepower;
      this.accuracy = accuracy;
      this.imageUrls = imageUrls || [];
      this.currentImageIndex = 0;
    }

    //Get the next Image for the ship (used for changing the images during battle)
    getNextImage() {
        if (this.imageUrls.length === 0) return '';
        this.currentImageIndex = (this.currentImageIndex + 1) % this.imageUrls.length;
        return this.imageUrls[this.currentImageIndex];
    }
  
    //Attack the target ship
    attack(target) {
      if (Math.random() < this.accuracy) {
        target.hull -= this.firepower;
        return true;
      }
      return false;
    }
  
    //Check if the ship is destroyed
    isDestroyed() {
      return this.hull <= 0;
    }

  }
  // Class to represent the game
  class Game {
    constructor() {
        //Initialize player ship and alien fleet
      this.playerShip = new Ship('USS Assembly', 20, 5, 0.7, ['images/USSAssembly.png']);
      this.alienFleet = this.generateAliens();
      this.currentAlienIndex = 0;
      this.gameOver = false;
      
      // Bind methods for event listeners
      this.attack = this.attack.bind(this);
      this.retreat = this.retreat.bind(this);
    }
  
    //generate a fleet of alien ships
    generateAliens() {
      const alienFLeet = [];
      const alienImages = [
        'images/alien-ship-1.png',
        'images/alien-ship-2.png',
        'images/alien-ship-3.png',
        'images/alien-ship-4.png',
        'images/alien-ship-5.png',
        'images/alien-ship-6.png',
      ]
      for (let i = 0; i < alienImages.length; i++) {
        const hull = Math.floor(Math.random() * 4) + 3; // hull 3-6
        const firepower = Math.floor(Math.random() * 3) + 2; //FirePower 2-4
        const accuracy = (Math.random() * 0.3) + 0.6 // accuracy 0.6-0.8
        alienFleet.push(new Ship(`Alien Ship ${i + 1}`, hull, firepower, accuracy, [alienImages[i]]));
      }
      return alienFleet;
    }
  
    //Get current alien ship
    getCurrentAlien() {
      return this.alienFleet[this.currentAlienIndex];
    }
  
    //Player attacks the alien Ship
    attack() {
      if (this.gameOver) return;
  
      const currentAlien = this.getCurrentAlien();
      const hitAlien = this.playerShip.attack(currentAlien);
      
      this.updateGameLog(`You ${hitAlien ? 'hit' : 'missed'} the alien ship!`);
      
      if (currentAlien.isDestroyed()) {
        this.updateGameLog('Alien ship destroyed!');
        this.currentAlienIndex++;
        
        if (this.currentAlienIndex >= this.alienFleet.length) {
          this.victory();
          return;
        }
        
        this.updateGameLog('New alien ship approaching!');
      } else {
  
      const hitPlayer = currentAlien.attack(this.playerShip);
      this.updateGameLog(`${currentAlien.name} ${hitPlayer ? 'hit' : 'missed'} your ship!`);
      
      if (this.playerShip.isDestroyed()) {
        this.defeat();
      }
    }
    this.updateUI();
}

//Player retreats from battle

    retreat() {
      if (!this.gameOver) {
        this.gameOver = true;
        this.updateGameLog('You retreated. Game Over!');
        this.updateUI();
      }
    }
  

    //victory logic
    victory() {
      this.gameOver = true;
      this.updateGameLog('Congratulations! You destroyed all alien ships!');
      this.updateUI();
    }
  
    //defeat logic
    defeat() {
      this.gameOver = true;
      this.updateGameLog('Your ship was destroyed. Game Over!');
      this.updateUI();
    }
  
    //update the game log with a new message
    updateGameLog(message) {
      const gameLog = document.getElementById('gameLog');
      gameLog.innerHTML += `<div>${message}</div>`;
      gameLog.scrollTop = gameLog.scrollHeight;
    }
  
    //Update the UI for ship stats and images
    updateUI() {
      const playerStats = document.getElementById('shipStats');
      const alienStats = document.getElementById('alienStats');
      const buttons = document.querySelectorAll('button');
      
      playerStats.textContent = `USS Assembly - Hull: ${Math.max(0, this.playerShip.hull)}`;
      
      const currentAlien = this.getCurrentAlien();
      if (!this.gameOver && currentAlien) {
        alienStats.textContent = `${currentAlien.name} - Hull: ${Math.max(0, currentAlien.hull)}`;

        const alienImage = document.querySelector('#alien-ship img') || document.createElement('img');
        alienImage.src = currentAlien.getNextImage();
        alienImage.alt = currentAlien.name;
            document.getElementById('alien-ship').appendChild(alienImage);
      } else {
        alienStats.textContent = '';
      }
      
      buttons.forEach(button => {
        button.disabled = this.gameOver;
      });
    }
  

    //Initialize the game UI and event listeners
    init() {
        document.getElementById('attackBtn').addEventListener('click', this.attack);
        document.getElementById('retreatBtn').addEventListener('click', this.retreat);
        this.updateGameLog('Game initialized. Press Attack or Retreat to begin.');
        this.updateUI();
    }
}

// Start the game
const game = new Game();
game.init();