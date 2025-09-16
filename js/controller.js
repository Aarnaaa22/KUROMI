/**
 * Claw Controller for Kuromi Claw Machine
 * Handles claw movement, grabbing mechanics, and animations
 */

class ClawController {
    constructor(gameState, prizeGenerator) {
        this.gameState = gameState;
        this.prizeGenerator = prizeGenerator;
        
        // DOM elements
        this.claw = document.getElementById('claw');
        this.railHorizontal = document.getElementById('railHorizontal');
        this.railVertical = document.getElementById('railVertical');
        this.machineBody = document.querySelector('.machine-body');
        
        // Claw state
        this.position = { x: 50, y: 50 }; // Percentage-based
        this.isMoving = false;
        this.isGrabbing = false;
        this.grabbedPrize = null;
        this.homePosition = { x: 50, y: 50 };
        
        // Movement settings
        this.moveStep = 8; // Percentage per move
        this.moveSpeed = 500; // ms
        this.grabSequenceTime = 2500; // ms
        this.returnSpeed = 800; // ms
        
        // Boundaries (percentage)
        this.boundaries = {
            minX: 15,
            maxX: 85,
            minY: 15,
            maxY: 75
        };
        
        this.initialize();
    }
    
    initialize() {
        this.setupEventListeners();
        this.updateClawDisplay();
        this.resetToHome();
    }
    
    setupEventListeners() {
        // Movement controls
        document.getElementById('moveLeft')?.addEventListener('click', () => this.move('left'));
        document.getElementById('moveRight')?.addEventListener('click', () => this.move('right'));
        document.getElementById('moveForward')?.addEventListener('click', () => this.move('forward'));
        document.getElementById('moveBack')?.addEventListener('click', () => this.move('back'));
        
        // Action controls
        document.getElementById('pickBtn')?.addEventListener('click', () => this.grab());
        document.getElementById('dropBtn')?.addEventListener('click', () => this.drop());
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Touch controls for mobile
        this.setupTouchControls();
    }
    
    setupTouchControls() {
        const controls = document.querySelectorAll('.control-btn');
        controls.forEach(btn => {
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                btn.classList.add('animate-button-press');
                btn.click();
            });
            
            btn.addEventListener('touchend', (e) => {
                e.preventDefault();
                setTimeout(() => btn.classList.remove('animate-button-press'), 200);
            });
        });
    }
    
    handleKeyboard(event) {
        if (this.isMoving || this.isGrabbing) return;
        
        switch(event.key.toLowerCase()) {
            case 'a':
            case 'arrowleft':
                this.move('left');
                break;
            case 'd':
            case 'arrowright':
                this.move('right');
                break;
            case 'w':
            case 'arrowup':
                this.move('back');
                break;
            case 's':
            case 'arrowdown':
                this.move('forward');
                break;
            case ' ':
            case 'enter':
                event.preventDefault();
                this.grab();
                break;
            case 'x':
                this.drop();
                break;
        }
    }
    
    // Move claw in specified direction
    move(direction) {
        if (this.isMoving || this.isGrabbing || !this.gameState.canPlay()) {
            return false;
        }
        
        const newPosition = { ...this.position };
        
        switch(direction) {
            case 'left':
                newPosition.x = Math.max(this.boundaries.minX, this.position.x - this.moveStep);
                break;
            case 'right':
                newPosition.x = Math.min(this.boundaries.maxX, this.position.x + this.moveStep);
                break;
            case 'forward':
                newPosition.y = Math.min(this.boundaries.maxY, this.position.y + this.moveStep);
                break;
            case 'back':
                newPosition.y = Math.max(this.boundaries.minY, this.position.y - this.moveStep);
                break;
        }
        
        // Check if position actually changed
        if (newPosition.x === this.position.x && newPosition.y === this.position.y) {
            this.showBoundaryWarning(direction);
            return false;
        }
        
        this.animateMovement(newPosition);
        return true;
    }
    
    // Animate claw movement
    animateMovement(newPosition) {
        this.isMoving = true;
        this.updateControlsState();
        
        // Play movement sound
        if (window.soundManager) {
            window.soundManager.playSound('clawMove');
        }
        
        // Update position
        this.position = newPosition;
        this.gameState.updateClawPosition(this.position.x, this.position.y);
        
        // Animate claw
        this.animateClawMovement();
        
        // Update displays
        this.updateClawDisplay();
        this.updateRailPosition();
        
        // Add machine vibration
        this.machineBody?.classList.add('animate-vibrate');
        
        setTimeout(() => {
            this.isMoving = false;
            this.updateControlsState();
            this.machineBody?.classList.remove('animate-vibrate');
        }, this.moveSpeed);
    }
    
    // Animate the claw element during movement
    animateClawMovement() {
        if (!this.claw) return;
        
        this.claw.style.transition = `all ${this.moveSpeed}ms ease-out`;
        
        // Add slight bounce effect
        this.claw.classList.add('animate-bounce');
        setTimeout(() => {
            this.claw.classList.remove('animate-bounce');
        }, this.moveSpeed);
    }
    
    // Grab sequence
    grab() {
        if (this.isMoving || this.isGrabbing || !this.gameState.canPlay()) {
            return false;
        }
        
        // Spend a coin to play
        if (!this.gameState.spendCoin()) {
            return false;
        }
        
        this.isGrabbing = true;
        this.gameState.setPlaying(true);
        this.updateControlsState();
        
        // Play grab sequence
        this.executeGrabSequence();
        
        return true;
    }
    
    // Execute the complete grab sequence
    executeGrabSequence() {
        // Phase 1: Lower claw
        this.animateClawDown();
        
        setTimeout(() => {
            // Phase 2: Attempt grab
            this.attemptGrab();
        }, this.grabSequenceTime * 0.4);
        
        setTimeout(() => {
            // Phase 3: Raise claw
            this.animateClawUp();
        }, this.grabSequenceTime * 0.6);
        
        setTimeout(() => {
            // Phase 4: Return to drop zone or home
            this.returnClaw();
        }, this.grabSequenceTime * 0.8);
        
        setTimeout(() => {
            // Phase 5: Complete sequence
            this.completeGrabSequence();
        }, this.grabSequenceTime);
    }
    
    // Animate claw lowering
    animateClawDown() {
        if (!this.claw) return;
        
        this.claw.classList.add('animate-claw-grab');
        this.claw.classList.add('claw-active');
        
        // Visual feedback
        this.addGrabEffects();
        
        // Play sound
        if (window.soundManager) {
            window.soundManager.playSound('clawMove');
        }
    }
    
    // Attempt to grab prize at current position
    attemptGrab() {
        const grabResult = this.prizeGenerator.attemptGrab(this.position.x, this.position.y);
        
        if (grabResult.success) {
            this.grabbedPrize = grabResult.prize;
            this.animateSuccessfulGrab();
            this.gameState.showStatusMessage(grabResult.reason, 'success');
        } else {
            this.animateMissedGrab();
            this.gameState.showStatusMessage(grabResult.reason, 'fail');
        }
        
        return grabResult.success;
    }
    
    // Animate successful grab
    animateSuccessfulGrab() {
        if (!this.claw) return;
        
        this.claw.classList.add('grabbing');
        
        // Create success particles
        this.createGrabParticles('success');
        
        // Machine excitement
        this.machineBody?.classList.add('machine-excited');
        
        // Play success sound
        if (window.soundManager) {
            window.soundManager.playSound('success');
        }
    }
    
    // Animate missed grab
    animateMissedGrab() {
        if (!this.claw) return;
        
        this.claw.classList.add('animate-shake');
        
        // Create failure particles
        this.createGrabParticles('fail');
        
        // Play failure sound
        if (window.soundManager) {
            window.soundManager.playSound('fail');
        }
        
        setTimeout(() => {
            this.claw.classList.remove('animate-shake');
        }, 500);
    }
    
    // Animate claw raising
    animateClawUp() {
        if (!this.claw) return;
        
        this.claw.classList.remove('animate-claw-grab');
        
        // If holding prize, animate it
        if (this.grabbedPrize) {
            this.prizeGenerator.transportPrize(this.grabbedPrize);
        }
    }
    
    // Return claw to appropriate position
    returnClaw() {
        let returnPosition;
        
        if (this.grabbedPrize) {
            // Go to drop zone
            returnPosition = { x: 50, y: 70 };
        } else {
            // Return to home position
            returnPosition = this.homePosition;
        }
        
        this.animateReturn(returnPosition);
    }
    
    // Animate claw return
    animateReturn(targetPosition) {
        this.position = targetPosition;
        this.updateClawDisplay();
        this.updateRailPosition();
        
        if (this.claw) {
            this.claw.style.transition = `all ${this.returnSpeed}ms ease-in-out`;
        }
    }
    
    // Complete the grab sequence
    completeGrabSequence() {
        // Clean up states
        this.isGrabbing = false;
        this.gameState.setPlaying(false);
        
        if (this.claw) {
            this.claw.classList.remove('claw-active', 'grabbing');
        }
        
        this.machineBody?.classList.remove('machine-excited');
        
        // Handle grabbed prize
        if (this.grabbedPrize) {
            // Prize will be automatically collected by PrizeGenerator
            this.grabbedPrize = null;
        } else {
            // No prize grabbed, record miss
            this.gameState.missedGrab();
        }
        
        // Reset to home position
        setTimeout(() => {
            this.resetToHome();
        }, 1000);
        
        this.updateControlsState();
    }
    
    // Manual drop function
    drop() {
        if (!this.isGrabbing && !this.grabbedPrize) {
            return false;
        }
        
        if (this.grabbedPrize) {
            this.prizeGenerator.dropPrize(this.grabbedPrize);
            this.grabbedPrize = null;
            
            this.gameState.showStatusMessage('Prize dropped!', 'info');
            
            if (this.claw) {
                this.claw.classList.remove('grabbing');
            }
        }
        
        return true;
    }
    
    // Reset claw to home position
    resetToHome() {
        this.position = { ...this.homePosition };
        this.gameState.updateClawPosition(this.position.x, this.position.y);
        this.updateClawDisplay();
        this.updateRailPosition();
        
        if (this.claw) {
            this.claw.style.transition = 'all 1s ease-out';
        }
    }
    
    // Update claw visual position
    updateClawDisplay() {
        if (!this.claw) return;
        
        const clawContainer = this.claw.parentElement;
        if (!clawContainer) return;
        
        const containerRect = clawContainer.getBoundingClientRect();
        const clawRect = this.claw.getBoundingClientRect();
        
        // Convert percentage to pixels
        const leftPos = (this.position.x / 100) * (containerRect.width - clawRect.width);
        const topPos = (this.position.y / 100) * (containerRect.height - clawRect.height);
        
        this.claw.style.left = this.position.x + '%';
        this.claw.style.top = this.position.y + '%';
        this.claw.style.transform = 'translateX(-50%)';
    }
    
    // Update rail position to follow claw
    updateRailPosition() {
        if (this.railVertical) {
            this.railVertical.style.left = this.position.x + '%';
            this.railVertical.style.transition = `left ${this.moveSpeed}ms ease-out`;
        }
    }
    
    // Update control button states
    updateControlsState() {
        const canMove = !this.isMoving && !this.isGrabbing && this.gameState.canPlay();
        const canGrab = !this.isMoving && !this.isGrabbing && this.gameState.canPlay();
        const canDrop = this.isGrabbing || this.grabbedPrize;
        
        // Movement buttons
        document.getElementById('moveLeft').disabled = !canMove;
        document.getElementById('moveRight').disabled = !canMove;
        document.getElementById('moveForward').disabled = !canMove;
        document.getElementById('moveBack').disabled = !canMove;
        
        // Action buttons
        document.getElementById('pickBtn').disabled = !canGrab;
        document.getElementById('dropBtn').disabled = !canDrop;
        
        // Visual feedback for disabled state
        const buttons = document.querySelectorAll('.control-btn');
        buttons.forEach(btn => {
            if (btn.disabled) {
                btn.classList.add('disabled');
            } else {
                btn.classList.remove('disabled');
            }
        });
    }
    
    // Show boundary warning
    showBoundaryWarning(direction) {
        const messages = {
            left: "Can't move further left!",
            right: "Can't move further right!",
            forward: "Can't move further forward!",
            back: "Can't move further back!"
        };
        
        this.gameState.showStatusMessage(messages[direction] || "Can't move there!", 'info');
        
        // Add visual feedback
        if (this.claw) {
            this.claw.classList.add('animate-shake');
            setTimeout(() => {
                this.claw.classList.remove('animate-shake');
            }, 300);
        }
    }
    
    // Add visual effects during grabbing
    addGrabEffects() {
        // Add spotlight effect
        const spotlight = document.createElement('div');
        spotlight.className = 'grab-spotlight';
        spotlight.style.position = 'absolute';
        spotlight.style.left = this.position.x + '%';
        spotlight.style.top = this.position.y + '%';
        spotlight.style.width = '80px';
        spotlight.style.height = '80px';
        spotlight.style.background = 'radial-gradient(circle, rgba(255,255,0,0.3), transparent)';
        spotlight.style.borderRadius = '50%';
        spotlight.style.transform = 'translate(-50%, -50%)';
        spotlight.style.pointerEvents = 'none';
        spotlight.style.zIndex = '50';
        spotlight.style.animation = 'pulse 0.5s ease-in-out 3';
        
        const clawContainer = this.claw?.parentElement;
        if (clawContainer) {
            clawContainer.appendChild(spotlight);
            
            setTimeout(() => {
                if (spotlight.parentNode) {
                    spotlight.parentNode.removeChild(spotlight);
                }
            }, 1500);
        }
    }
    
    // Create particles during grab attempts
    createGrabParticles(type) {
        const effectsContainer = document.querySelector('.kuromi-special-effects');
        if (!effectsContainer) return;
        
        const particleCount = type === 'success' ? 12 : 6;
        const colors = type === 'success' ? 
            ['#FFD700', '#FF69B4', '#9F85FF'] : 
            ['#666', '#999', '#333'];
        
        for (let i = 0; i < particleCount; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.style.position = 'absolute';
                particle.style.width = '6px';
                particle.style.height = '6px';
                particle.style.background = colors[Math.floor(Math.random() * colors.length)];
                particle.style.borderRadius = '50%';
                particle.style.left = (45 + Math.random() * 10) + '%';
                particle.style.top = (this.position.y + Math.random() * 10) + '%';
                particle.style.pointerEvents = 'none';
                particle.style.zIndex = '100';
                
                // Animate particle
                const moveX = (Math.random() - 0.5) * 100;
                const moveY = (Math.random() - 0.5) * 100;
                const rotation = Math.random() * 360;
                
                particle.animate([
                    { 
                        transform: 'translate(0, 0) rotate(0deg) scale(1)', 
                        opacity: 1 
                    },
                    { 
                        transform: `translate(${moveX}px, ${moveY}px) rotate(${rotation}deg) scale(0)`, 
                        opacity: 0 
                    }
                ], {
                    duration: 1000,
                    easing: 'ease-out'
                });
                
                effectsContainer.appendChild(particle);
                
                setTimeout(() => {
                    if (particle.parentNode) {
                        particle.parentNode.removeChild(particle);
                    }
                }, 1000);
            }, i * 50);
        }
    }
    
    // Get current claw statistics
    getStats() {
        return {
            position: { ...this.position },
            isMoving: this.isMoving,
            isGrabbing: this.isGrabbing,
            hasGrabbedPrize: !!this.grabbedPrize,
            grabbedPrizeType: this.grabbedPrize?.type || null,
            boundaries: { ...this.boundaries }
        };
    }
    
    // Emergency stop (for debugging or special situations)
    emergencyStop() {
        this.isMoving = false;
        this.isGrabbing = false;
        this.gameState.setPlaying(false);
        
        if (this.grabbedPrize) {
            this.prizeGenerator.dropPrize(this.grabbedPrize);
            this.grabbedPrize = null;
        }
        
        if (this.claw) {
            this.claw.classList.remove('animate-claw-grab', 'claw-active', 'grabbing', 'animate-shake');
        }
        
        this.machineBody?.classList.remove('machine-excited', 'animate-vibrate');
        
        this.resetToHome();
        this.updateControlsState();
        
        this.gameState.showStatusMessage('System reset!', 'info');
    }
    
    // Auto-play mode (for demonstration)
    autoPlay(duration = 30000) {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
        }
        
        const startTime = Date.now();
        this.autoPlayInterval = setInterval(() => {
            if (Date.now() - startTime > duration) {
                clearInterval(this.autoPlayInterval);
                this.autoPlayInterval = null;
                this.gameState.showStatusMessage('Auto-play ended', 'info');
                return;
            }
            
            if (!this.gameState.canPlay() || this.isMoving || this.isGrabbing) {
                return;
            }
            
            // Random strategy
            const action = Math.random();
            
            if (action < 0.6) {
                // 60% chance to move randomly
                const directions = ['left', 'right', 'forward', 'back'];
                const randomDir = directions[Math.floor(Math.random() * directions.length)];
                this.move(randomDir);
            } else if (action < 0.9) {
                // 30% chance to grab
                this.grab();
            } else {
                // 10% chance to reset position
                this.resetToHome();
            }
        }, 1500);
        
        this.gameState.showStatusMessage('Auto-play started!', 'success');
    }
    
    // Setup visual indicators for claw position
    setupPositionIndicators() {
        // Add position display (optional feature)
        const positionDisplay = document.createElement('div');
        positionDisplay.className = 'claw-position-display';
        positionDisplay.style.position = 'absolute';
        positionDisplay.style.top = '5px';
        positionDisplay.style.right = '5px';
        positionDisplay.style.background = 'rgba(0,0,0,0.7)';
        positionDisplay.style.color = 'white';
        positionDisplay.style.padding = '5px 10px';
        positionDisplay.style.borderRadius = '10px';
        positionDisplay.style.fontSize = '12px';
        positionDisplay.style.fontFamily = 'monospace';
        positionDisplay.style.zIndex = '20';
        
        const machineBody = document.querySelector('.machine-body');
        if (machineBody) {
            machineBody.appendChild(positionDisplay);
            
            // Update position display
            this.positionUpdateInterval = setInterval(() => {
                positionDisplay.textContent = `X:${Math.round(this.position.x)} Y:${Math.round(this.position.y)}`;
            }, 100);
        }
    }
    
    // Cleanup when destroying controller
    destroy() {
        // Clear intervals
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
        }
        
        if (this.positionUpdateInterval) {
            clearInterval(this.positionUpdateInterval);
        }
        
        // Remove event listeners
        document.removeEventListener('keydown', this.handleKeyboard);
        
        // Reset states
        this.emergencyStop();
    }
    
    // Calibrate claw (ensure proper positioning)
    calibrate() {
        this.gameState.showStatusMessage('Calibrating claw...', 'info');
        
        // Move to each corner to test boundaries
        const calibrationSequence = [
            { x: this.boundaries.minX, y: this.boundaries.minY },
            { x: this.boundaries.maxX, y: this.boundaries.minY },
            { x: this.boundaries.maxX, y: this.boundaries.maxY },
            { x: this.boundaries.minX, y: this.boundaries.maxY },
            { x: 50, y: 50 } // Return to center
        ];
        
        let step = 0;
        const calibrateStep = () => {
            if (step >= calibrationSequence.length) {
                this.gameState.showStatusMessage('Calibration complete!', 'success');
                return;
            }
            
            this.position = calibrationSequence[step];
            this.updateClawDisplay();
            this.updateRailPosition();
            
            step++;
            setTimeout(calibrateStep, 500);
        };
        
        calibrateStep();
    }
    
    // Get recommended next move (AI assistance)
    getRecommendedMove() {
        const prizes = this.prizeGenerator.getPrizesInReach(this.position.x, this.position.y, 25);
        
        if (prizes.length === 0) {
            // No prizes nearby, suggest movement toward center of prize cluster
            const allPrizes = this.prizeGenerator.prizes.filter(p => !p.collected);
            if (allPrizes.length > 0) {
                const avgX = allPrizes.reduce((sum, p) => sum + p.position.x, 0) / allPrizes.length;
                const avgY = allPrizes.reduce((sum, p) => sum + p.position.y, 0) / allPrizes.length;
                
                const deltaX = avgX - this.position.x;
                const deltaY = avgY - this.position.y;
                
                if (Math.abs(deltaX) > Math.abs(deltaY)) {
                    return deltaX > 0 ? 'right' : 'left';
                } else {
                    return deltaY > 0 ? 'forward' : 'back';
                }
            }
        } else {
            // Prizes nearby, suggest grab
            return 'grab';
        }
        
        return null;
    }
    
    // Show hint for next move
    showHint() {
        const recommendation = this.getRecommendedMove();
        
        if (recommendation) {
            const hintMessages = {
                'left': '← Try moving left',
                'right': '→ Try moving right', 
                'forward': '↓ Try moving forward',
                'back': '↑ Try moving back',
                'grab': '🎯 Try grabbing here!'
            };
            
            this.gameState.showStatusMessage(
                hintMessages[recommendation] || 'Keep trying!', 
                'info'
            );
            
            // Highlight recommended button
            const buttonMap = {
                'left': 'moveLeft',
                'right': 'moveRight',
                'forward': 'moveForward',
                'back': 'moveBack',
                'grab': 'pickBtn'
            };
            
            const button = document.getElementById(buttonMap[recommendation]);
            if (button) {
                button.classList.add('animate-glow');
                setTimeout(() => {
                    button.classList.remove('animate-glow');
                }, 2000);
            }
        } else {
            this.gameState.showStatusMessage('Explore the machine!', 'info');
        }
    }
}

// Export for use in other modules
window.ClawController = ClawController;