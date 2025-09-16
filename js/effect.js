/**
 * Kuromi-specific Effects for Claw Machine
 * Handles themed animations and special Kuromi visual effects
 */

class KuromiEffects {
    constructor() {
        this.isInitialized = false;
        this.kuromiEars = null;
        this.devilMode = false;
        this.magicalEffects = [];
        
        this.initialize();
    }
    
    initialize() {
        this.createKuromiEars();
        this.setupMagicalBackground();
        this.startKuromiAnimations();
        this.isInitialized = true;
    }
    
    // Create animated Kuromi ears on the machine
    createKuromiEars() {
        const machineBody = document.querySelector('.machine-body');
        if (!machineBody) return;
        
        this.kuromiEars = document.createElement('div');
        this.kuromiEars.className = 'kuromi-ears';
        
        const leftEar = document.createElement('div');
        leftEar.className = 'kuromi-ear left-ear';
        
        const rightEar = document.createElement('div');
        rightEar.className = 'kuromi-ear right-ear';
        
        this.kuromiEars.appendChild(leftEar);
        this.kuromiEars.appendChild(rightEar);
        
        machineBody.appendChild(this.kuromiEars);
        
        // Make ears reactive to game events
        this.setupEarAnimations();
    }
    
    setupEarAnimations() {
        if (!this.kuromiEars) return;
        
        // Ears wiggle when machine is active
        document.addEventListener('clawMove', () => {
            this.wiggleEars();
        });
        
        // Ears perk up on prize collection
        document.addEventListener('prizeCollected', (e) => {
            this.celebrateEars(e.detail.prizeType);
        });
        
        // Ears droop on miss
        document.addEventListener('prizeMissed', () => {
            this.sadEars();
        });
    }
    
    wiggleEars() {
        if (!this.kuromiEars) return;
        
        const ears = this.kuromiEars.querySelectorAll('.kuromi-ear');
        ears.forEach((ear, index) => {
            ear.style.animation = 'none';
            ear.offsetHeight; // Force reflow
            ear.style.animation = `earWiggle 0.8s ease-in-out ${index * 0.1}s`;
        });
    }
    
    celebrateEars(prizeType) {
        if (!this.kuromiEars) return;
        
        const celebrationIntensity = prizeType === 'kuromiPlush' ? 'intense' : 'normal';
        const ears = this.kuromiEars.querySelectorAll('.kuromi-ear');
        
        ears.forEach((ear, index) => {
            ear.classList.add(`celebrate-${celebrationIntensity}`);
            setTimeout(() => {
                ear.classList.remove(`celebrate-${celebrationIntensity}`);
            }, 2000);
        });
        
        // Add sparkles around ears for rare prizes
        if (prizeType === 'kuromiPlush') {
            this.addEarSparkles();
        }
    }
    
    sadEars() {
        if (!this.kuromiEars) return;
        
        const ears = this.kuromiEars.querySelectorAll('.kuromi-ear');
        ears.forEach(ear => {
            ear.classList.add('sad-droop');
            setTimeout(() => {
                ear.classList.remove('sad-droop');
            }, 1500);
        });
    }
    
    addEarSparkles() {
        if (!this.kuromiEars) return;
        
        for (let i = 0; i < 6; i++) {
            setTimeout(() => {
                const sparkle = document.createElement('div');
                sparkle.className = 'ear-sparkle';
                sparkle.style.cssText = `
                    position: absolute;
                    width: 8px;
                    height: 8px;
                    background: radial-gradient(circle, #FFD700, #FF69B4);
                    border-radius: 50%;
                    left: ${20 + Math.random() * 60}%;
                    top: ${-20 + Math.random() * 40}%;
                    pointer-events: none;
                    z-index: 15;
                `;
                
                this.kuromiEars.appendChild(sparkle);
                
                sparkle.animate([
                    { opacity: 0, transform: 'scale(0) rotate(0deg)' },
                    { opacity: 1, transform: 'scale(1.5) rotate(180deg)' },
                    { opacity: 0, transform: 'scale(0) rotate(360deg)' }
                ], {
                    duration: 1500,
                    easing: 'ease-out'
                });
                
                setTimeout(() => {
                    if (sparkle.parentNode) {
                        sparkle.parentNode.removeChild(sparkle);
                    }
                }, 1500);
            }, i * 200);
        }
    }
    
    // Setup magical background elements
    setupMagicalBackground() {
        this.createMagicalCircles();
        this.createDevilTail();
        this.startMagicalPulse();
    }
    
    createMagicalCircles() {
        const body = document.body;
        const circleContainer = document.createElement('div');
        circleContainer.className = 'magical-circles';
        circleContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            pointer-events: none;
            z-index: 1;
            overflow: hidden;
        `;
        
        // Create multiple magical circles
        for (let i = 0; i < 3; i++) {
            const circle = document.createElement('div');
            circle.className = 'magical-circle';
            circle.style.cssText = `
                position: absolute;
                width: ${200 + i * 100}px;
                height: ${200 + i * 100}px;
                border: 2px solid rgba(159, 133, 255, 0.3);
                border-radius: 50%;
                left: ${20 + i * 30}%;
                top: ${20 + i * 20}%;
                animation: magicalRotate ${30 + i * 10}s linear infinite;
            `;
            
            circleContainer.appendChild(circle);
        }
        
        body.appendChild(circleContainer);
    }
    
    createDevilTail() {
        const gameContainer = document.querySelector('.game-container');
        if (!gameContainer) return;
        
        const tail = document.createElement('div');
        tail.className = 'kuromi-devil-tail';
        tail.style.cssText = `
            position: absolute;
            bottom: -50px;
            right: 20px;
            width: 60px;
            height: 80px;
            background: linear-gradient(45deg, #2D1B3D, #9F85FF);
            border-radius: 30px 30px 50% 50%;
            transform-origin: top center;
            animation: tailSway 3s ease-in-out infinite;
            z-index: 10;
            opacity: 0.8;
        `;
        
        // Add tail tip
        const tailTip = document.createElement('div');
        tailTip.style.cssText = `
            position: absolute;
            bottom: -10px;
            left: 50%;
            width: 20px;
            height: 20px;
            background: #FF69B4;
            border-radius: 0 50% 50% 50%;
            transform: translateX(-50%) rotate(45deg);
        `;
        
        tail.appendChild(tailTip);
        gameContainer.appendChild(tail);
    }
    
    startMagicalPulse() {
        setInterval(() => {
            this.createMagicalPulse();
        }, 8000);
    }
    
    createMagicalPulse() {
        const machineBody = document.querySelector('.machine-body');
        if (!machineBody) return;
        
        const pulse = document.createElement('div');
        pulse.className = 'magical-pulse';
        pulse.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            width: 20px;
            height: 20px;
            background: radial-gradient(circle, rgba(255, 105, 180, 0.8), transparent);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            pointer-events: none;
            z-index: 20;
        `;
        
        machineBody.appendChild(pulse);
        
        pulse.animate([
            { 
                opacity: 0,
                transform: 'translate(-50%, -50%) scale(0)',
                filter: 'hue-rotate(0deg)'
            },
            { 
                opacity: 1,
                transform: 'translate(-50%, -50%) scale(10)',
                filter: 'hue-rotate(180deg)',
                offset: 0.7
            },
            { 
                opacity: 0,
                transform: 'translate(-50%, -50%) scale(20)',
                filter: 'hue-rotate(360deg)'
            }
        ], {
            duration: 4000,
            easing: 'ease-out'
        });
        
        setTimeout(() => {
            if (pulse.parentNode) {
                pulse.parentNode.removeChild(pulse);
            }
        }, 4000);
    }
    
    // Activate devil mode (special state)
    activateDevilMode(duration = 10000) {
        if (this.devilMode) return;
        
        this.devilMode = true;
        
        // Change color scheme temporarily
        document.documentElement.style.setProperty('--kuromi-primary', '#2D1B3D');
        document.documentElement.style.setProperty('--kuromi-accent', '#9F85FF');
        
        // Add devil effects
        this.addDevilEffects();
        
        // Play devil sound
        if (window.soundManager) {
            window.soundManager.playSound('rare');
        }
        
        // Show devil mode message
        this.showDevilModeMessage();
        
        setTimeout(() => {
            this.deactivateDevilMode();
        }, duration);
    }
    
    deactivateDevilMode() {
        this.devilMode = false;
        
        // Restore original colors
        document.documentElement.style.removeProperty('--kuromi-primary');
        document.documentElement.style.removeProperty('--kuromi-accent');
        
        // Remove devil effects
        this.removeDevilEffects();
    }
    
    addDevilEffects() {
        // Create devil aura around machine
        const machineBody = document.querySelector('.machine-body');
        if (!machineBody) return;
        
        const aura = document.createElement('div');
        aura.className = 'devil-aura';
        aura.style.cssText = `
            position: absolute;
            top: -20px;
            left: -20px;
            right: -20px;
            bottom: -20px;
            background: radial-gradient(ellipse, transparent 40%, rgba(255, 0, 0, 0.1) 70%, transparent);
            border-radius: 25px;
            animation: devilPulse 2s ease-in-out infinite;
            pointer-events: none;
            z-index: 1;
        `;
        
        machineBody.appendChild(aura);
        
        // Create floating devil symbols
        this.createDevilSymbols();
    }
    
    createDevilSymbols() {
        const symbols = ['👹', '🔥', '⚡', '💀'];
        
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                const symbol = document.createElement('div');
                symbol.className = 'devil-symbol';
                symbol.innerHTML = symbols[Math.floor(Math.random() * symbols.length)];
                symbol.style.cssText = `
                    position: fixed;
                    font-size: 24px;
                    left: ${Math.random() * 100}%;
                    top: ${Math.random() * 100}%;
                    pointer-events: none;
                    z-index: 200;
                    opacity: 0.8;
                `;
                
                document.body.appendChild(symbol);
                
                symbol.animate([
                    { 
                        opacity: 0,
                        transform: 'scale(0) rotate(0deg)',
                        filter: 'hue-rotate(0deg)'
                    },
                    { 
                        opacity: 0.8,
                        transform: 'scale(1.2) rotate(180deg)',
                        filter: 'hue-rotate(180deg)',
                        offset: 0.5
                    },
                    { 
                        opacity: 0,
                        transform: 'scale(0) rotate(360deg)',
                        filter: 'hue-rotate(360deg)'
                    }
                ], {
                    duration: 3000,
                    easing: 'ease-in-out'
                });
                
                setTimeout(() => {
                    if (symbol.parentNode) {
                        symbol.parentNode.removeChild(symbol);
                    }
                }, 3000);
            }, i * 200);
        }
    }
    
    removeDevilEffects() {
        // Remove devil aura
        const aura = document.querySelector('.devil-aura');
        if (aura) {
            aura.remove();
        }
        
        // Remove devil symbols
        const symbols = document.querySelectorAll('.devil-symbol');
        symbols.forEach(symbol => symbol.remove());
    }
    
    showDevilModeMessage() {
        const message = document.createElement('div');
        message.className = 'devil-mode-message';
        message.innerHTML = `
            <div class="devil-title">👹 DEVIL MODE ACTIVATED! 👹</div>
            <div class="devil-subtitle">Increased rare prize chances!</div>
        `;
        
        message.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #2D1B3D, #FF0000);
            color: #FFD700;
            padding: 30px;
            border-radius: 20px;
            border: 3px solid #FFD700;
            text-align: center;
            font-family: 'Fredoka', cursive;
            font-weight: 700;
            z-index: 1000;
            box-shadow: 0 0 30px rgba(255, 0, 0, 0.5);
        `;
        
        message.querySelector('.devil-title').style.cssText = `
            font-size: 2rem;
            margin-bottom: 10px;
            text-shadow: 2px 2px 0 #000;
        `;
        
        message.querySelector('.devil-subtitle').style.cssText = `
            font-size: 1.2rem;
            color: #FF69B4;
        `;
        
        document.body.appendChild(message);
        
        message.animate([
            { 
                opacity: 0,
                transform: 'translate(-50%, -50%) scale(0) rotate(-180deg)'
            },
            { 
                opacity: 1,
                transform: 'translate(-50%, -50%) scale(1.1) rotate(0deg)',
                offset: 0.7
            },
            { 
                opacity: 1,
                transform: 'translate(-50%, -50%) scale(1) rotate(0deg)',
                offset: 0.9
            },
            { 
                opacity: 0,
                transform: 'translate(-50%, -50%) scale(0) rotate(180deg)'
            }
        ], {
            duration: 4000,
            easing: 'ease-out'
        });
        
        setTimeout(() => {
            if (message.parentNode) {
                message.parentNode.removeChild(message);
            }
        }, 4000);
    }
    
    // Create Kuromi bow effect
    createKuromiBowEffect(x = 50, y = 30) {
        const bow = document.createElement('div');
        bow.className = 'kuromi-bow-effect';
        bow.style.cssText = `
            position: absolute;
            left: ${x}%;
            top: ${y}%;
            width: 40px;
            height: 25px;
            background: #FF69B4;
            border-radius: 50%;
            transform: translate(-50%, -50%);
            z-index: 100;
            pointer-events: none;
        `;
        
        // Add bow sides
        const leftSide = document.createElement('div');
        leftSide.style.cssText = `
            position: absolute;
            left: -15px;
            top: 50%;
            width: 18px;
            height: 25px;
            background: #FF69B4;
            border-radius: 50% 20% 20% 50%;
            transform: translateY(-50%);
        `;
        
        const rightSide = document.createElement('div');
        rightSide.style.cssText = `
            position: absolute;
            right: -15px;
            top: 50%;
            width: 18px;
            height: 25px;
            background: #FF69B4;
            border-radius: 20% 50% 50% 20%;
            transform: translateY(-50%);
        `;
        
        bow.appendChild(leftSide);
        bow.appendChild(rightSide);
        
        const effectsContainer = document.querySelector('.kuromi-special-effects');
        if (effectsContainer) {
            effectsContainer.appendChild(bow);
        }
        
        // Animate bow
        bow.animate([
            { 
                opacity: 0,
                transform: 'translate(-50%, -50%) scale(0) rotate(0deg)'
            },
            { 
                opacity: 1,
                transform: 'translate(-50%, -50%) scale(1.3) rotate(360deg)',
                offset: 0.5
            },
            { 
                opacity: 1,
                transform: 'translate(-50%, -50%) scale(1) rotate(360deg)',
                offset: 0.8
            },
            { 
                opacity: 0,
                transform: 'translate(-50%, -50%) scale(0.3) rotate(720deg)'
            }
        ], {
            duration: 2000,
            easing: 'ease-out'
        });
        
        setTimeout(() => {
            if (bow.parentNode) {
                bow.parentNode.removeChild(bow);
            }
        }, 2000);
    }
    
    // Special rare prize animation
    createRarePrizeAnimation() {
        // Screen flash
        this.createScreenFlash();
        
        // Devil mode activation chance
        if (Math.random() < 0.3) { // 30% chance
            setTimeout(() => {
                this.activateDevilMode(8000);
            }, 1000);
        }
        
        // Kuromi bow shower
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                this.createKuromiBowEffect(
                    30 + Math.random() * 40,
                    20 + Math.random() * 40
                );
            }, i * 300);
        }
        
        // Create magical seal
        this.createMagicalSeal();
    }
    
    createScreenFlash() {
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: radial-gradient(circle, rgba(255, 105, 180, 0.3), transparent);
            pointer-events: none;
            z-index: 9999;
        `;
        
        document.body.appendChild(flash);
        
        flash.animate([
            { opacity: 0 },
            { opacity: 1 },
            { opacity: 0 }
        ], {
            duration: 500,
            easing: 'ease-in-out'
        });
        
        setTimeout(() => {
            if (flash.parentNode) {
                flash.parentNode.removeChild(flash);
            }
        }, 500);
    }
    
    createMagicalSeal() {
        const seal = document.createElement('div');
        seal.className = 'magical-seal';
        seal.innerHTML = '🌟';
        seal.style.cssText = `
            position: absolute;
            top: 30%;
            left: 50%;
            font-size: 60px;
            transform: translate(-50%, -50%);
            z-index: 150;
            pointer-events: none;
        `;
        
        const machineBody = document.querySelector('.machine-body');
        if (machineBody) {
            machineBody.appendChild(seal);
        }
        
        seal.animate([
            { 
                opacity: 0,
                transform: 'translate(-50%, -50%) scale(0) rotate(0deg)',
                filter: 'brightness(1) hue-rotate(0deg)'
            },
            { 
                opacity: 1,
                transform: 'translate(-50%, -50%) scale(1) rotate(360deg)',
                filter: 'brightness(2) hue-rotate(180deg)',
                offset: 0.7
            },
            { 
                opacity: 0,
                transform: 'translate(-50%, -50%) scale(2) rotate(720deg)',
                filter: 'brightness(3) hue-rotate(360deg)'
            }
        ], {
            duration: 3000,
            easing: 'ease-out'
        });
        
        setTimeout(() => {
            if (seal.parentNode) {
                seal.parentNode.removeChild(seal);
            }
        }, 3000);
    }
    
    // Start continuous Kuromi-themed animations
    startKuromiAnimations() {
        // Random Kuromi bow appearances
        setInterval(() => {
            if (Math.random() < 0.1 && !this.devilMode) { // 10% chance
                this.createKuromiBowEffect(
                    20 + Math.random() * 60,
                    20 + Math.random() * 60
                );
            }
        }, 5000);
        
        // Periodic magical effects
        setInterval(() => {
            if (Math.random() < 0.3) { // 30% chance
                this.createMagicalPulse();
            }
        }, 12000);
    }
    
    // Add CSS animations dynamically
    addKuromiAnimations() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes magicalRotate {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            
            @keyframes tailSway {
                0%, 100% { transform: rotate(0deg); }
                50% { transform: rotate(15deg); }
            }
            
            @keyframes devilPulse {
                0%, 100% { opacity: 0.1; transform: scale(1); }
                50% { opacity: 0.3; transform: scale(1.05); }
            }
            
            @keyframes celebrate-intense {
                0%, 100% { transform: rotate(0deg) scale(1); }
                25% { transform: rotate(-15deg) scale(1.1); }
                75% { transform: rotate(15deg) scale(1.1); }
            }
            
            @keyframes celebrate-normal {
                0%, 100% { transform: rotate(0deg); }
                50% { transform: rotate(8deg); }
            }
            
            @keyframes sad-droop {
                0% { transform: rotate(0deg); }
                50% { transform: rotate(25deg) translateY(5px); }
                100% { transform: rotate(0deg); }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Cleanup
    destroy() {
        if (this.kuromiEars && this.kuromiEars.parentNode) {
            this.kuromiEars.parentNode.removeChild(this.kuromiEars);
        }
        
        // Remove magical elements
        const magicalElements = document.querySelectorAll('.magical-circles, .kuromi-devil-tail, .devil-aura');
        magicalElements.forEach(el => el.remove());
        
        this.deactivateDevilMode();
    }
}

// Initialize Kuromi effects
document.addEventListener('DOMContentLoaded', () => {
    window.kuromiEffects = new KuromiEffects();
});

// Export for use in other modules
window.KuromiEffects = KuromiEffects;