/**
 * Main Game Controller for Kuromi Claw Machine
 * Coordinates all game systems and handles the main game loop
 */

class KuromiClawMachine {
    constructor() {
        this.isInitialized = false;
        this.gameState = null;
        this.prizeGenerator = null;
        this.clawController = null;
        this.isPlaying = false;
        this.debugMode = false;
        
        this.initialize();
    }
    
    initialize() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }
    
    setup() {
        console.log('🎮 Initializing Aarna\'s Kuromi Claw Machine...');
        
        try {
            // Initialize core systems
            this.gameState = new GameState();
            this.prizeGenerator = new PrizeGenerator(this.gameState);
            this.clawController = new ClawController(this.gameState, this.prizeGenerator);

            // Setup game events
            this.setupEventListeners();
            this.setupCoinSlot();
            this.setupGameLoop();

            // Add dynamic CSS animations
            this.addDynamicStyles();

            // Start the game
            this.startGame();

            this.isInitialized = true;
            console.log('✨ Kuromi Claw Machine ready to play!');

            // Show welcome message
            this.showWelcomeMessage();

            // Hide error message if shown
            const errorDiv = document.getElementById('gameErrorMessage');
            if (errorDiv) errorDiv.style.display = 'none';
        } catch (error) {
            console.error('❌ Failed to initialize game:', error);
            this.showErrorMessage('Failed to load game. Please refresh the page.');
            const errorDiv = document.getElementById('gameErrorMessage');
            if (errorDiv) {
                errorDiv.textContent = 'Game failed to load: ' + (error?.message || error);
                errorDiv.style.display = 'block';
            }
        }
    }
    
    setupEventListeners() {
        // Prize collection events
        document.addEventListener('prizeCollected', (e) => {
            this.handlePrizeCollected(e.detail);
        });
        
        // Combo events
        document.addEventListener('comboAchieved', (e) => {
            this.handleCombo(e.detail);
        });
        
        // Special events
        document.addEventListener('rarePrizeWon', (e) => {
            this.handleRarePrize(e.detail);
        });
        
        // Debug controls
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
                this.toggleDebugMode();
            }
        });
        
        // Window events
        window.addEventListener('beforeunload', () => {
            this.saveGame();
        });
        
        window.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseGame();
            } else {
                this.resumeGame();
            }
        });
    }
    
    setupCoinSlot() {
        const coinSlot = document.getElementById('coinSlot');
        if (!coinSlot) return;
        
        coinSlot.addEventListener('click', () => {
            this.insertCoin();
        });
        
        // Add hover effects
        coinSlot.addEventListener('mouseenter', () => {
            if (this.gameState.canPlay()) {
                coinSlot.style.transform = 'scale(1.1)';
                coinSlot.style.boxShadow = '0 0 25px var(--kuromi-yellow)';
            }
        });
        
        coinSlot.addEventListener('mouseleave', () => {
            coinSlot.style.transform = '';
            coinSlot.style.boxShadow = '';
        });
    }
    
    insertCoin() {
        if (!this.gameState.canPlay()) {
            this.gameState.showStatusMessage('Cannot play right now!', 'fail');
            return;
        }
        
        // Animate coin insertion
        this.animateCoinInsertion();
        
        // Play coin sound
        if (window.soundManager) {
            window.soundManager.playSound('coinInsert');
        }
        
        // Enable controls briefly to show they're available
        this.highlightControls();
        
        this.gameState.showStatusMessage('Coin inserted! Use controls to play!', 'success');
    }
    
    animateCoinInsertion() {
        const coinSlot = document.getElementById('coinSlot');
        const coinAnimation = document.getElementById('coinAnimation');
        
        if (!coinAnimation) return;
        
        // Reset and start animation
        coinAnimation.classList.remove('animate-coin-drop');
        coinAnimation.style.opacity = '1';
        
        setTimeout(() => {
            coinAnimation.classList.add('animate-coin-drop');
        }, 50);
        
        // Add slot feedback
        if (coinSlot) {
            coinSlot.style.animation = 'none';
            coinSlot.offsetHeight; // Force reflow
            coinSlot.style.animation = 'buttonPress 0.3s ease-out';
        }
    }
    
    highlightControls() {
        const controlButtons = document.querySelectorAll('.control-btn:not(:disabled)');
        
        controlButtons.forEach((btn, index) => {
            setTimeout(() => {
                btn.classList.add('animate-glow');
                setTimeout(() => {
                    btn.classList.remove('animate-glow');
                }, 2000);
            }, index * 100);
        });
    }
    
    setupGameLoop() {
        // Main game update loop
        this.gameLoopInterval = setInterval(() => {
            this.updateGame();
        }, 100); // 10 FPS for game logic
        
        // Visual effects update loop
        this.effectsLoopInterval = setInterval(() => {
            this.updateEffects();
        }, 50); // 20 FPS for visual effects
        
        // Prize physics update loop (less frequent)
        this.physicsLoopInterval = setInterval(() => {
            if (this.prizeGenerator) {
                this.prizeGenerator.updatePositions();
            }
        }, 1000); // 1 FPS for subtle physics
    }
    
    updateGame() {
        if (!this.isInitialized || !this.isPlaying) return;
        
        // Update game state
        if (this.gameState) {
            // Check for special conditions
            this.checkSpecialConditions();
            
            // Update UI if needed
            this.updateUI();
        }
    }
    
    updateEffects() {
        // Update any continuous visual effects
        if (window.effectsManager) {
            // This could include particle system updates, etc.
        }
    }
    
    checkSpecialConditions() {
        // Check for devil mode activation
        if (this.gameState.streak >= 5 && Math.random() < 0.05) { // 5% chance at 5+ streak
            if (window.kuromiEffects && !window.kuromiEffects.devilMode) {
                window.kuromiEffects.activateDevilMode();
                this.gameState.showStatusMessage('😈 DEVIL MODE! 😈', 'success');
            }
        }
        
        // Check for rare prize special effects
        if (this.gameState.combo >= 3) {
            if (Math.random() < 0.1) { // 10% chance for special effect
                this.triggerComboSpecialEffect();
            }
        }
        
        // Auto-replenish coins if player is doing well
        if (this.gameState.coins === 0 && this.gameState.streak >= 3) {
            this.gameState.addCoins(2);
            this.gameState.showStatusMessage('🎁 Streak bonus: +2 coins!', 'success');
        }
    }
    
    updateUI() {
        // Update any dynamic UI elements
        this.updateMachineState();
        this.updateControlStates();
    }
    
    updateMachineState() {
        const machineBody = document.querySelector('.machine-body');
        if (!machineBody) return;
        
        // Add visual feedback based on game state
        if (this.gameState.streak > 0) {
            machineBody.classList.add('streak-active');
        } else {
            machineBody.classList.remove('streak-active');
        }
        
        if (this.gameState.isPlaying) {
            machineBody.classList.add('machine-active');
        } else {
            machineBody.classList.remove('machine-active');
        }
    }
    
    updateControlStates() {
        if (this.clawController) {
            this.clawController.updateControlsState();
        }
    }
    
    handlePrizeCollected(prizeData) {
        console.log('🎉 Prize collected:', prizeData);
        
        // Create celebration effects
        if (window.effectsManager) {
            window.effectsManager.createPrizeCelebration(prizeData.type);
        }
        
        // Special Kuromi effects for Kuromi prizes
        if (prizeData.type === 'kuromiPlush') {
            if (window.kuromiEffects) {
                window.kuromiEffects.celebrateEars('kuromiPlush');
            }
        }
        
        // Play success sound
        if (window.soundManager) {
            window.soundManager.playSound('success');
        }
        
        // Check for achievements
        this.checkAchievements(prizeData);
        
        // Dispatch custom event
        const event = new CustomEvent('prizeCollected', { 
            detail: prizeData 
        });
        document.dispatchEvent(event);
    }
    
    handleCombo(comboData) {
        console.log('🔥 Combo achieved:', comboData);
        
        // Create combo effects
        if (window.effectsManager) {
            window.effectsManager.createComboEffect(comboData.level);
        }
        
        // Play combo sound
        if (window.soundManager) {
            window.soundManager.playComboSound(comboData.level);
        }
        
        // Screen shake for high combos
        if (comboData.level >= 5 && window.effectsManager) {
            window.effectsManager.createScreenShake(comboData.level / 5);
        }
        
        // Dispatch custom event
        const event = new CustomEvent('comboAchieved', { 
            detail: comboData 
        });
        document.dispatchEvent(event);
    }
    
    handleRarePrize(prizeData) {
        console.log('💎 Rare prize won:', prizeData);
        
        // Create rare prize effects
        if (window.kuromiEffects) {
            window.kuromiEffects.createRarePrizeAnimation();
        }
        
        // Play rare prize sound
        if (window.soundManager) {
            window.soundManager.playRarePrizeSound();
        }
        
        // Show special message
        this.gameState.showStatusMessage('💎 RARE KUROMI PRIZE! 💎', 'success');
        
        // Dispatch custom event
        const event = new CustomEvent('rarePrizeWon', { 
            detail: prizeData 
        });
        document.dispatchEvent(event);
    }
    
    checkAchievements(prizeData) {
        // Check for various achievements
        const stats = this.gameState.getStats();
        
        // First prize achievement
        if (stats.totalPrizes === 1) {
            this.unlockAchievement('First Win', '🎯 You won your first prize!');
        }
        
        // Combo achievements
        if (this.gameState.combo === 3) {
            this.unlockAchievement('Triple Combo', '🔥 Three wins in a row!');
        }
        
        if (this.gameState.combo === 5) {
            this.unlockAchievement('Combo Master', '🔥 Five wins in a row! Amazing!');
        }
        
        // Collection achievements
        if (stats.totalPrizes === 10) {
            this.unlockAchievement('Collector', '📦 You collected 10 prizes!');
        }
        
        if (stats.totalPrizes === 25) {
            this.unlockAchievement('Hoarder', '🏆 25 prizes collected!');
        }
        
        // Kuromi-specific achievements
        const kuromiPrizes = this.gameState.prizes.filter(p => p.type === 'kuromiPlush').length;
        if (kuromiPrizes === 5) {
            this.unlockAchievement('Kuromi Fan', '💜 Collected 5 Kuromi plushies!');
        }
        
        // Perfect game achievement (high success rate)
        const successRate = parseFloat(stats.successRate);
        if (stats.totalPlays >= 10 && successRate >= 80) {
            this.unlockAchievement('Perfect Player', '⭐ 80%+ success rate!');
        }
    }
    
    unlockAchievement(title, description) {
        console.log('🏆 Achievement unlocked:', title);
        
        // Create achievement popup
        const achievement = document.createElement('div');
        achievement.className = 'achievement-popup';
        achievement.innerHTML = `
            <div class="achievement-icon">🏆</div>
            <div class="achievement-content">
                <div class="achievement-title">${title}</div>
                <div class="achievement-description">${description}</div>
            </div>
        `;
        
        achievement.style.cssText = `
            position: fixed;
            top: 20px;
            right: -400px;
            width: 350px;
            background: linear-gradient(135deg, #FFD700, #FFA500);
            color: #2D1B3D;
            padding: 20px;
            border-radius: 15px;
            border: 3px solid #FF69B4;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            z-index: 2000;
            display: flex;
            align-items: center;
            gap: 15px;
            font-family: 'Fredoka', cursive;
            transition: right 0.5s ease-out;
        `;
        
        achievement.querySelector('.achievement-icon').style.cssText = `
            font-size: 2rem;
            flex-shrink: 0;
        `;
        
        achievement.querySelector('.achievement-title').style.cssText = `
            font-size: 1.2rem;
            font-weight: 700;
            margin-bottom: 5px;
        `;
        
        achievement.querySelector('.achievement-description').style.cssText = `
            font-size: 0.9rem;
            opacity: 0.9;
        `;
        
        document.body.appendChild(achievement);
        
        // Animate in
        setTimeout(() => {
            achievement.style.right = '20px';
        }, 100);
        
        // Animate out
        setTimeout(() => {
            achievement.style.right = '-400px';
            setTimeout(() => {
                if (achievement.parentNode) {
                    achievement.parentNode.removeChild(achievement);
                }
            }, 500);
        }, 4000);
        
        // Play achievement sound
        if (window.soundManager) {
            window.soundManager.playSound('success', { volume: 0.8 });
        }
    }
    
    triggerComboSpecialEffect() {
        // Create special combo visual effect
        if (window.effectsManager) {
            // Create rainbow particles
            for (let i = 0; i < 15; i++) {
                setTimeout(() => {
                    const colors = ['#FF69B4', '#FFD700', '#9F85FF', '#00FF00', '#00BFFF'];
                    window.effectsManager.createBurstParticle(50, 50, colors);
                }, i * 50);
            }
        }
        
        // Create temporary speed boost
        if (this.clawController) {
            const originalSpeed = this.clawController.moveSpeed;
            this.clawController.moveSpeed = originalSpeed * 0.7; // 30% faster
            
            setTimeout(() => {
                this.clawController.moveSpeed = originalSpeed;
            }, 10000); // 10 seconds
            
            this.gameState.showStatusMessage('⚡ Speed Boost Active! ⚡', 'success');
        }
    }
    
    startGame() {
        this.isPlaying = true;
        console.log('🎮 Game started!');
        
        // Start ambient sounds
        if (window.soundManager) {
            setTimeout(() => {
                window.soundManager.playAmbientSound();
            }, 1000);
        }
        
        // Initialize Kuromi effects
        if (window.kuromiEffects) {
            window.kuromiEffects.addKuromiAnimations();
        }
    }
    
    pauseGame() {
        if (!this.isPlaying) return;
        
        console.log('⏸️ Game paused');
        // Pause can be implemented for future features
        
        // Stop ambient sounds
        if (window.soundManager) {
            window.soundManager.stopAmbientSound();
        }
    }
    
    resumeGame() {
        if (this.isPlaying) return;
        
        console.log('▶️ Game resumed');
        this.isPlaying = true;
        
        // Resume ambient sounds
        if (window.soundManager) {
            window.soundManager.playAmbientSound();
        }
    }
    
    saveGame() {
        if (this.gameState) {
            this.gameState.save();
        }
        console.log('💾 Game saved');
    }
    
    loadGame() {
        if (this.gameState) {
            this.gameState.load();
        }
        console.log('📁 Game loaded');
    }
    
    resetGame() {
        if (this.gameState) {
            this.gameState.reset();
        }
        
        if (this.prizeGenerator) {
            this.prizeGenerator.reset();
        }
        
        if (this.clawController) {
            this.clawController.resetToHome();
        }
        
        console.log('🔄 Game reset');
        this.showWelcomeMessage();
    }
    
    toggleDebugMode() {
        this.debugMode = !this.debugMode;
        
        if (this.debugMode) {
            this.enableDebugMode();
        } else {
            this.disableDebugMode();
        }
    }
    
    enableDebugMode() {
        console.log('🔧 Debug mode enabled');
        
        // Add debug UI
        const debugPanel = document.createElement('div');
        debugPanel.id = 'debugPanel';
        debugPanel.innerHTML = `
            <div class="debug-header">🔧 DEBUG MODE</div>
            <button onclick="game.gameState.addCoins(10)">+10 Coins</button>
            <button onclick="game.gameState.addPoints(100)">+100 Points</button>
            <button onclick="game.prizeGenerator.replenishPrizes()">Replenish Prizes</button>
            <button onclick="game.clawController.autoPlay(15000)">Auto Play 15s</button>
            <button onclick="window.kuromiEffects.activateDevilMode()">Devil Mode</button>
            <button onclick="game.resetGame()">Reset Game</button>
            <div class="debug-stats">
                <div>Claw Position: <span id="debugClawPos">--</span></div>
                <div>Active Particles: <span id="debugParticles">--</span></div>
                <div>Game State: <span id="debugGameState">--</span></div>
            </div>
        `;
        
        debugPanel.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: rgba(0,0,0,0.9);
            color: white;
            padding: 20px;
            border-radius: 10px;
            font-family: monospace;
            font-size: 12px;
            z-index: 3000;
            max-width: 300px;
        `;
        
        document.body.appendChild(debugPanel);
        
        // Update debug info
        this.debugUpdateInterval = setInterval(() => {
            this.updateDebugInfo();
        }, 500);
        
        // Enable position indicators
        if (this.clawController) {
            this.clawController.setupPositionIndicators();
        }
    }
    
    disableDebugMode() {
        console.log('🔧 Debug mode disabled');
        
        // Remove debug UI
        const debugPanel = document.getElementById('debugPanel');
        if (debugPanel) {
            debugPanel.remove();
        }
        
        // Clear debug update interval
        if (this.debugUpdateInterval) {
            clearInterval(this.debugUpdateInterval);
        }
    }
    
    updateDebugInfo() {
        if (!this.debugMode) return;
        
        const clawPosElement = document.getElementById('debugClawPos');
        const particlesElement = document.getElementById('debugParticles');
        const gameStateElement = document.getElementById('debugGameState');
        
        if (clawPosElement && this.clawController) {
            const pos = this.clawController.position;
            clawPosElement.textContent = `${Math.round(pos.x)}, ${Math.round(pos.y)}`;
        }
        
        if (particlesElement) {
            const particleCount = document.querySelectorAll('[class*="particle"]').length;
            particlesElement.textContent = particleCount;
        }
        
        if (gameStateElement && this.gameState) {
            const state = this.gameState.isPlaying ? 'Playing' : 'Idle';
            gameStateElement.textContent = `${state} | C:${this.gameState.coins} P:${this.gameState.points}`;
        }
    }
    
    showWelcomeMessage() {
        const welcomeMessage = `
            <div class="welcome-title">🎮 Welcome to Aarna's Kuromi Claw Machine! 🎮</div>
            <div class="welcome-content">
                <p>🎯 Use the controls to move the claw and grab adorable prizes!</p>
                <p>💜 Collect Kuromi plushies for big points</p>
                <p>🪙 Yellow coins give you extra plays</p>
                <p>⭐ Point tokens boost your score</p>
                <p>🔥 Build combos and streaks for bonuses!</p>
                <div class="welcome-controls">
                    <p><strong>Controls:</strong></p>
                    <p>🎮 Use buttons or WASD/Arrow keys to move</p>
                    <p>🎯 SPACE/Enter to grab, X to drop</p>
                    <p>🪙 Click coin slot to insert coin</p>
                </div>
            </div>
        `;
        
        this.showCustomMessage(welcomeMessage, 8000);
    }
    
    showCustomMessage(content, duration = 5000) {
        const messageElement = document.createElement('div');
        messageElement.className = 'custom-message';
        messageElement.innerHTML = content;
        
        messageElement.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, var(--kuromi-primary), var(--kuromi-white));
            color: var(--kuromi-black);
            padding: 30px;
            border-radius: 20px;
            border: 4px solid var(--kuromi-pink);
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            z-index: 2500;
            max-width: 500px;
            text-align: center;
            font-family: 'Fredoka', cursive;
        `;
        
        messageElement.querySelector('.welcome-title').style.cssText = `
            font-size: 1.8rem;
            font-weight: 700;
            color: var(--kuromi-deep);
            margin-bottom: 20px;
        `;
        
        messageElement.querySelector('.welcome-content').style.cssText = `
            text-align: left;
            line-height: 1.6;
        `;
        
        messageElement.querySelector('.welcome-controls').style.cssText = `
            background: var(--kuromi-accent);
            padding: 15px;
            border-radius: 10px;
            margin-top: 15px;
        `;
        
        document.body.appendChild(messageElement);
        
        // Animate in
        messageElement.animate([
            { opacity: 0, transform: 'translate(-50%, -50%) scale(0.8)' },
            { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' }
        ], {
            duration: 500,
            easing: 'ease-out'
        });
        
        // Auto-close or click to close
        const closeMessage = () => {
            messageElement.animate([
                { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
                { opacity: 0, transform: 'translate(-50%, -50%) scale(0.8)' }
            ], {
                duration: 300,
                easing: 'ease-in'
            });
            
            setTimeout(() => {
                if (messageElement.parentNode) {
                    messageElement.parentNode.removeChild(messageElement);
                }
            }, 300);
        };
        
        messageElement.addEventListener('click', closeMessage);
        setTimeout(closeMessage, duration);
    }
    
    showErrorMessage(message) {
        console.error('❌ Error:', message);
        
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        
        errorElement.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #FF4444;
            color: white;
            padding: 20px;
            border-radius: 10px;
            font-family: 'Fredoka', cursive;
            font-weight: 600;
            z-index: 3000;
            text-align: center;
        `;
        
        document.body.appendChild(errorElement);
        
        setTimeout(() => {
            if (errorElement.parentNode) {
                errorElement.parentNode.removeChild(errorElement);
            }
        }, 5000);
    }
    
    addDynamicStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .streak-active {
                box-shadow: 0 0 30px rgba(255, 105, 180, 0.5) !important;
            }
            
            .machine-active .claw-light {
                animation: pulse 0.5s ease-in-out infinite !important;
            }
            
            .disabled {
                opacity: 0.5;
                cursor: not-allowed;
                transform: none !important;
            }
            
            .debug-header {
                font-weight: bold;
                margin-bottom: 10px;
                color: #FFD700;
            }
            
            .debug-stats {
                margin-top: 15px;
                padding-top: 10px;
                border-top: 1px solid #666;
            }
            
            #debugPanel button {
                display: block;
                width: 100%;
                margin: 5px 0;
                padding: 5px;
                background: #333;
                color: white;
                border: 1px solid #666;
                border-radius: 5px;
                cursor: pointer;
                font-size: 11px;
            }
            
            #debugPanel button:hover {
                background: #555;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Public API methods
    getGameStats() {
        return {
            gameState: this.gameState?.getStats(),
            prizeGenerator: this.prizeGenerator?.getStats(),
            clawController: this.clawController?.getStats(),
            soundManager: window.soundManager?.getStats(),
            isPlaying: this.isPlaying,
            debugMode: this.debugMode
        };
    }
    
    // Cleanup when page unloads
    destroy() {
        if (this.gameLoopInterval) clearInterval(this.gameLoopInterval);
        if (this.effectsLoopInterval) clearInterval(this.effectsLoopInterval);
        if (this.physicsLoopInterval) clearInterval(this.physicsLoopInterval);
        if (this.debugUpdateInterval) clearInterval(this.debugUpdateInterval);
        
        if (this.clawController) this.clawController.destroy();
        if (window.soundManager) window.soundManager.destroy();
        if (window.effectsManager) window.effectsManager.destroy();
        if (window.kuromiEffects) window.kuromiEffects.destroy();
        
        console.log('🧹 Game destroyed');
    }
}

// Initialize the game
const game = new KuromiClawMachine();

// Make game globally accessible for debugging
window.game = game;

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    game.destroy();
});

console.log('🎮 Kuromi Claw Machine initialized!');
console.log('💡 Tip: Press F12 or Ctrl+Shift+I to enable debug mode!');