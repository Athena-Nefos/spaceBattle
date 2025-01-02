const readline = require('readline');

// Step 1: Plan and Outline
/** 
 * The player's ship: USS Assembly 
 * Alien ships: six enemy spaceships 
 * 
 * Actions:
 * - Attack: Both ships attack each other until one is destroyed
 * - Retreat: The player can decide to retreat after destroying an alien ship 
 */

// Define a class named Ship to represent the spaceships
class Ship {
    constructor(name, hull, firepower, accuracy) {
        this.name = name; // Ship name
        this.hull = hull; // Health points
        this.firepower = firepower; // Attack power
        this.accuracy = accuracy; // Hit accuracy
    }

    attack(target) {
        if (Math.random() < this.accuracy) {
            target.hull -= this.firepower;
            console.log(`Successful hit! ${target.name}'s hull is now ${target.hull}.`);
        } else {
            console.log(`${this.name} missed the attack!`);
        }
    }
}

// Step 2: Create instances: Initialize the USS Assembly and the alien ships

// USS Assembly
const playerShip = new Ship('USS Assembly', 20, 5, 0.7);

// Alien Fleet
const generateAlienShip = (index) => {
    return new Ship(
        `Alien Ship ${index + 1}`,
        Math.floor(Math.random() * (6 - 3 + 1)) + 3, // Hull between 3-6
        Math.floor(Math.random() * (4 - 2 + 1)) + 2, // Firepower between 2-4
        (Math.random() * (0.8 - 0.6) + 0.6).toFixed(2) // Accuracy between 0.6-0.8
    );
};

const alienFleet = Array.from({ length: 6 }, (_, i) => generateAlienShip(i));

// Step 3: Implement the Game Loop: Function to handle battles and manage turns
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function askQuestion(query) {
    return new Promise((resolve) => rl.question(query, resolve));
}

async function battle() {
    let currentAlien = 0;

    while (currentAlien < alienFleet.length && playerShip.hull > 0) {
        const alienShip = alienFleet[currentAlien];
        console.log(`Battling ${alienShip.name}...`);

        // Player's turn
        playerShip.attack(alienShip);
        if (alienShip.hull <= 0) {
            console.log(`${alienShip.name} destroyed!`);
            currentAlien++;
            if (currentAlien < alienFleet.length) {
                const choice = await askQuestion("Do you want to attack the next ship or retreat? (attack/retreat): ");
                if (choice.toLowerCase() === 'retreat') {
                    console.log("You chose to retreat. GAME OVER.");
                    rl.close();
                    return;
                }
            }
        } else {
            // Alien's turn
            alienShip.attack(playerShip);
            if (playerShip.hull <= 0) {
                console.log("Your ship has been destroyed. GAME OVER.");
                rl.close();
                return;
            }
        }
    }

    if (currentAlien === alienFleet.length) {
        console.log("Congratulations! You destroyed all the alien ships and won the game!");
    }
    rl.close();
}

// Start Game: Initialize the game and call the battle function
console.log("Welcome to the Space Battle Game!");
battle();