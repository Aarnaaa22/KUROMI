/**
 * Game State Management for Kuromi Claw Machine
 * Handles all game state, scoring, and progression
 */

class GameState {
    constructor() {
        this.coins = 5;
        this.points = 0;
        this.streak = 0;
        this.totalPlays = 0;
        this.prizes = [];
        this.isPlaying = false;
        this.clawPosition = { x: 50, y: 50 }; // Percentage-based positioning
        this.grabbedPrize = null;
        this.gameStarted = false;
        this.combo = 0;
        this.lastWinTime = 0;
        
        // Game settings
        this.settings = {
            startingCoins: 5,
            clawSpeed: 500, // ms for movement
            grabDuration: 2000, // ms for grab sequence
            successRates: {
                kuromiPlush: 0.65,
                yellowCoin: 0.80,
                pointToken: 0.75
            },
            pointValues: {
                kuromiPlush: { min: 50, max: 100 },
                yellowCoin: { coins: 1 },
                pointToken: { min: 10, max: 25 }
            },
            comboTimeout: 5000, // ms to maintain combo
            maxStreak: 10
        };
        
        // Initialize UI elements
        this.initializeUI();
        this.updateDisplay();
    }
    
    initializeUI() {
        this.coinsDisplay = document.getElementById('coinsCount');
        this.pointsDisplay = document.getElementById('pointsCount');
        this.streakDisplay = document.getElementById('streakCount');
        this.collectionDisplay = document.getElementById('collectionBox');
        this.collectionCount = document.getElementById('collectionCount');
        this.statusMessages = document.getElementById('statusMessages');
    }
    
    // Add coins to player's balance
    addCoins(amount) {
        this.coins += amount;
        this.updateDisplay();
        this.showStatusMessage(`+${amount} Coin${amount > 1 ? 's' : ''}!`, 'success');
        
        // Animate coin counter
        this.animateScoreChange(this.coinsDisplay);
    }
    
    // Deduct coins (for playing)
    spendCoin() {
        if (this.coins <= 0) {
            this.showStatusMessage('No coins remaining!', 'fail');
            return false;
        }
        
        this.coins--;
        this.totalPlays++;
        this.updateDisplay();
        this.animateScoreChange(this.coinsDisplay);
        return true;
    }
    
    // Add points to score
    addPoints(amount) {
        this.points += amount;
        this.updateDisplay();
        this.showStatusMessage(`+${amount} Points!`, 'success');
        
        // Animate points counter
        this.animateScoreChange(this.pointsDisplay);
    }
    
    // Handle successful prize collection
    collectPrize(prizeType, prizeData) {
        const now = Date.now();
        
        // Check for combo (consecutive wins within timeout)
        if (now - this.lastWinTime < this.settings.comboTimeout) {
            this.combo++;
        } else {
            this.combo = 1;
        }
        this.lastWinTime = now;
        
        // Increase streak
        this.streak++;
        if (this.streak > this.settings.maxStreak) {
            this.streak = this.settings.maxStreak;
        }
        
        // Add prize to collection
        this.prizes.push({
            type: prizeType,
            data: prizeData,
            timestamp: now,
            combo: this.combo
        });
        
        // Calculate and award points/coins based on prize type
        this.processPrizeReward(prizeType, prizeData);
        
        // Update displays
        this.updateDisplay();
        this.updatePrizeCollection();
        
        // Show combo effect if applicable
        if (this.combo > 1) {
            this.showComboEffect();
        }
        
        // Show streak effect for special milestones
        if (this.streak > 0 && this.streak % 3 === 0) {
            this.showStreakEffect();
        }
    }
    
    // Process prize rewards
    processPrizeReward(prizeType, prizeData) {
        const values = this.settings.pointValues[prizeType];
        let baseReward = 0;
        
        switch (prizeType) {
            case 'kuromiPlush':
                baseReward = Math.floor(Math.random() * (values.max - values.min + 1)) + values.min;
                this.addPoints(baseReward * (1 + (this.combo - 1) * 0.1)); // 10% bonus per combo
                break;
                
            case 'yellowCoin':
                this.addCoins(values.coins);
                baseReward = 20; // Base points for coins
                this.addPoints(baseReward);
                break;
                
            case 'pointToken':
                baseReward = Math.floor(Math.random() * (values.max - values.min + 1)) + values.min;
                this.addPoints(baseReward * (1 + (this.streak - 1) * 0.05)); // 5% bonus per streak
                break;
        }
    }
    
    // Handle failed attempts
    missedGrab() {
        this.streak = 0;
        this.combo = 0;
        this.updateDisplay();
        this.showStatusMessage('Better luck next time!', 'fail');
        
        // Small consolation points for trying
        if (Math.random() < 0.3) {
            this.addPoints(5);
        }
    }
    
    // Update claw position
    updateClawPosition(x, y) {
        // Clamp values to machine boundaries
        this.clawPosition.x = Math.max(10, Math.min(90, x));
        this.clawPosition.y = Math.max(10, Math.min(90, y));
    }
    
    // Set game playing state
    setPlaying(playing) {
        this.isPlaying = playing;
        if (playing && !this.gameStarted) {
            this.gameStarted = true;
        }
    }
    
    // Check if player can play (has coins and not currently playing)
    canPlay() {
        return this.coins > 0 && !this.isPlaying;
    }
    
    // Get success rate for prize type based on current stats
    getSuccessRate(prizeType) {
        let baseRate = this.settings.successRates[prizeType];
        
        // Slight bonus for consecutive plays (up to 10% increase)
        const streakBonus = Math.min(this.streak * 0.02, 0.1);
        
        // Slight penalty for very low coin count (encourage coin management)
        const lowCoinPenalty = this.coins < 2 ? 0.05 : 0;
        
        return Math.max(0.3, Math.min(0.9, baseRate + streakBonus - lowCoinPenalty));
    }
    
    // Update all UI displays
    updateDisplay() {
        if (this.coinsDisplay) this.coinsDisplay.textContent = this.coins;
        if (this.pointsDisplay) this.pointsDisplay.textContent = this.points;
        if (this.streakDisplay) this.streakDisplay.textContent = this.streak;
        if (this.collectionCount) this.collectionCount.textContent = this.prizes.length;
    }
    
    // Animate score changes
    animateScoreChange(element) {
        element.classList.remove('animate-score-up');
        setTimeout(() => element.classList.add('animate-score-up'), 10);
        setTimeout(() => element.classList.remove('animate-score-up'), 600);
    }
    
    // Update prize collection display
    updatePrizeCollection() {
        if (!this.collectionDisplay) return;
        
        // Clear existing display
        this.collectionDisplay.innerHTML = '';
        
        if (this.prizes.length === 0) {
            this.collectionDisplay.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-heart"></i>
                    <p>Win some adorable prizes!</p>
                </div>
            `;
            this.collectionDisplay.classList.remove('has-prizes');
            return;
        }
        
        this.collectionDisplay.classList.add('has-prizes');
        
        // Display recent prizes (limit to prevent overflow)
        const recentPrizes = this.prizes.slice(-20);
        
        recentPrizes.forEach((prize, index) => {
            const prizeElement = document.createElement('div');
            prizeElement.className = `collected-prize ${prize.type}`;
            
            // Add combo indicator for combo wins
            if (prize.combo > 1) {
                prizeElement.innerHTML = `
                    <div class="combo-indicator">×${prize.combo}</div>
                `;
            }
            
            // Animate new prizes
            if (index === recentPrizes.length - 1) {
                setTimeout(() => {
                    prizeElement.classList.add('animate-slide-in');
                }, 100);
            }
            
            this.collectionDisplay.appendChild(prizeElement);
        });
    }
    
    // Show status messages
    showStatusMessage(message, type = 'info') {
        if (!this.statusMessages) return;
        
        const messageElement = document.createElement('div');
        messageElement.className = `status-message ${type}`;
        messageElement.textContent = message;
        
        this.statusMessages.appendChild(messageElement);
        
        // Auto-remove after animation
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.parentNode.removeChild(messageElement);
            }
        }, 3000);
    }
    
    // Show combo effect
    showComboEffect() {
        const comboElement = document.createElement('div');
        comboElement.className = 'combo-effect';
        comboElement.textContent = `${this.combo}x COMBO!`;
        
        this.statusMessages.appendChild(comboElement);
        
        setTimeout(() => {
            if (comboElement.parentNode) {
                comboElement.parentNode.removeChild(comboElement);
            }
        }, 2000);
    }
    
    // Show streak effect
    showStreakEffect() {
        const streakElement = document.createElement('div');
        streakElement.className = 'streak-effect';
        streakElement.textContent = `🔥 ${this.streak} STREAK! 🔥`;
        
        this.statusMessages.appendChild(streakElement);
        
        setTimeout(() => {
            if (streakElement.parentNode) {
                streakElement.parentNode.removeChild(streakElement);
            }
        }, 1500);
    }
    
    // Get game statistics
    getStats() {
        const successRate = this.totalPlays > 0 ? (this.prizes.length / this.totalPlays * 100).toFixed(1) : 0;
        const averagePoints = this.totalPlays > 0 ? (this.points / this.totalPlays).toFixed(1) : 0;
        
        return {
            totalPlays: this.totalPlays,
            totalPrizes: this.prizes.length,
            successRate: successRate + '%',
            averagePoints,
            currentStreak: this.streak,
            highestCombo: Math.max(...this.prizes.map(p => p.combo || 1), 0),
            coinsRemaining: this.coins,
            totalPoints: this.points
        };
    }
    
    // Reset game (for new game functionality)
    reset() {
        this.coins = this.settings.startingCoins;
        this.points = 0;
        this.streak = 0;
        this.totalPlays = 0;
        this.prizes = [];
        this.isPlaying = false;
        this.clawPosition = { x: 50, y: 50 };
        this.grabbedPrize = null;
        this.gameStarted = false;
        this.combo = 0;
        this.lastWinTime = 0;
        
        this.updateDisplay();
        this.updatePrizeCollection();
        this.showStatusMessage('New game started!', 'success');
    }
    
    // Save game state to localStorage (if available)
    save() {
        try {
            const saveData = {
                coins: this.coins,
                points: this.points,
                streak: this.streak,
                totalPlays: this.totalPlays,
                prizes: this.prizes,
                gameStarted: this.gameStarted
            };
            
            // Note: In Claude artifacts, we can't use localStorage
            // This is a placeholder for the implementation
            console.log('Game state saved:', saveData);
        } catch (error) {
            console.log('Save not available in this environment');
        }
    }
    
    // Load game state from localStorage (if available)
    load() {
        try {
            // Note: In Claude artifacts, we can't use localStorage
            // This is a placeholder for the implementation
            console.log('Load not available in this environment');
        } catch (error) {
            console.log('Load not available in this environment');
        }
    }
}

// Export for use in other modules
window.GameState = GameState;