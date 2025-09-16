/**
 * Effects Manager for Kuromi Claw Machine
 * Handles visual effects, particles, and special animations
 */

class EffectsManager {
    constructor() {
        this.effectsContainer = document.querySelector('.kuromi-special-effects');
        this.bgEffectsContainer = document.querySelector('.kuromi-bg-effects');
        this.activeEffects = new Set();
        this.particlePool = [];
        this.maxParticles = 100;
        
        this.initialize();
    }
    
    initialize() {
        this.createParticlePool();
        this.startBackgroundEffects();
        this.setupPerformanceMonitoring();
    }
    
    // Create reusable particle pool for performance
    createParticlePool() {
        for (let i = 0; i < this.maxParticles; i++) {
            const particle = document.createElement('div');
            particle.className = 'pooled-particle';
            particle.style.position = 'absolute';
            particle.style.pointerEvents = 'none';
            particle.style.opacity = '0';
            particle.style.zIndex = '100';
            this.particlePool.push(particle);
        }
    }
    
    // Get particle from pool
    getParticle() {
        return this.particlePool.find(p => p.style.opacity === '0') || this.createNewParticle();
    }
    
    // Return particle to pool
    returnParticle(particle) {
        particle.style.opacity = '0';
        particle.className = 'pooled-particle';
        particle.style.transform = '';
        particle.style.background = '';
        particle.style.width = '';
        particle.style.height = '';
        if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
        }
    }
    
    createNewParticle() {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '100';
        this.particlePool.push(particle);
        return particle;
    }
    
    // Start continuous background effects
    startBackgroundEffects() {
        this.createFloatingHearts();
        this.createSparkleField();
        this.createDevilParticles();
        
        // Periodic effect refresh
        setInterval(() => {
            this.refreshBackgroundEffects();
        }, 15000);
    }
    
    createFloatingHearts() {
        if (!this.bgEffectsContainer) return;
        
        setInterval(() => {
            if (Math.random() < 0.3) { // 30% chance every interval
                this.createFloatingHeart();
            }
        }, 3000);
    }
    
    createFloatingHeart() {
        const heart = this.getParticle();
        if (!heart || !this.bgEffectsContainer) return;
        
        const hearts = ['💜', '🖤', '💗', '🤍'];
        const randomHeart = hearts[Math.floor(Math.random() * hearts.length)];
        
        heart.innerHTML = randomHeart;
        heart.style.fontSize = (15 + Math.random() * 10) + 'px';
        heart.style.left = Math.random() * 100 + '%';
        heart.style.top = '100vh';
        heart.style.opacity = '0.7';
        heart.className = 'floating-heart-particle';
        
        this.bgEffectsContainer.appendChild(heart);
        
        // Animate upward
        const duration = 12000 + Math.random() * 8000;
        const sway = 50 + Math.random() * 100;
        
        heart.animate([
            { 
                transform: 'translateY(0) translateX(0) rotate(0deg)', 
                opacity: 0 
            },
            { 
                transform: `translateY(-20vh) translateX(${sway/4}px) rotate(90deg)`, 
                opacity: 0.7,
                offset: 0.1
            },
            { 
                transform: `translateY(-80vh) translateX(${sway}px) rotate(270deg)`, 
                opacity: 0.7,
                offset: 0.9
            },
            { 
                transform: `translateY(-100vh) translateX(${sway*1.2}px) rotate(360deg)`, 
                opacity: 0 
            }
        ], {
            duration: duration,
            easing: 'linear'
        });
        
        setTimeout(() => {
            this.returnParticle(heart);
        }, duration);
    }
    
    createSparkleField() {
        setInterval(() => {
            if (Math.random() < 0.6) { // 60% chance
                this.createSparkle();
            }
        }, 1000);
    }
    
    createSparkle() {
        const sparkle = this.getParticle();
        if (!sparkle || !this.bgEffectsContainer) return;
        
        sparkle.style.width = '4px';
        sparkle.style.height = '4px';
        sparkle.style.background = '#FFD700';
        sparkle.style.borderRadius = '50%';
        sparkle.style.boxShadow = '0 0 6px #FFD700';
        sparkle.style.left = Math.random() * 100 + '%';
        sparkle.style.top = Math.random() * 100 + '%';
        sparkle.style.opacity = '1';
        sparkle.className = 'sparkle-particle';
        
        this.bgEffectsContainer.appendChild(sparkle);
        
        // Twinkle animation
        sparkle.animate([
            { opacity: 0, transform: 'scale(0)' },
            { opacity: 1, transform: 'scale(1.5)' },
            { opacity: 0, transform: 'scale(0)' }
        ], {
            duration: 2000,
            easing: 'ease-in-out'
        });
        
        setTimeout(() => {
            this.returnParticle(sparkle);
        }, 2000);
    }
    
    createDevilParticles() {
        setInterval(() => {
            if (Math.random() < 0.2) { // 20% chance
                this.createDevilParticle();
            }
        }, 5000);
    }
    
    createDevilParticle() {
        const particle = this.getParticle();
        if (!particle || !this.bgEffectsContainer) return;
        
        // Create devil horn shape
        particle.style.width = '0';
        particle.style.height = '0';
        particle.style.borderLeft = '6px solid transparent';
        particle.style.borderRight = '6px solid transparent';
        particle.style.borderBottom = '12px solid #2D1B3D';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = '100vh';
        particle.style.opacity = '0.6';
        particle.className = 'devil-particle';
        
        this.bgEffectsContainer.appendChild(particle);
        
        // Float upward with rotation
        const duration = 8000 + Math.random() * 4000;
        const rotation = 360 + Math.random() * 720;
        const drift = (Math.random() - 0.5) * 200;
        
        particle.animate([
            { 
                transform: 'translateY(0) translateX(0) rotate(0deg)', 
                opacity: 0 
            },
            { 
                transform: `translateY(-30vh) translateX(${drift/3}px) rotate(${rotation/3}deg)`, 
                opacity: 0.6,
                offset: 0.2
            },
            { 
                transform: `translateY(-90vh) translateX(${drift}px) rotate(${rotation}deg)`, 
                opacity: 0.6,
                offset: 0.8
            },
            { 
                transform: `translateY(-110vh) translateX(${drift*1.2}px) rotate(${rotation*1.1}deg)`, 
                opacity: 0 
            }
        ], {
            duration: duration,
            easing: 'ease-out'
        });
        
        setTimeout(() => {
            this.returnParticle(particle);
        }, duration);
    }
    
    // Prize collection celebration
    createPrizeCelebration(prizeType, x = 50, y = 50) {
        const celebrationTypes = {
            kuromiPlush: () => this.createKuromiCelebration(x, y),
            yellowCoin: () => this.createCoinCelebration(x, y),
            pointToken: () => this.createTokenCelebration(x, y)
        };
        
        const celebration = celebrationTypes[prizeType];
        if (celebration) {
            celebration();
        }
        
        // Always add general celebration particles
        this.createCelebrationBurst(x, y, prizeType);
    }
    
    createKuromiCelebration(x, y) {
        // Special Kuromi-themed particles
        const particles = ['💜', '🖤', '👑', '🦇'];
        
        particles.forEach((emoji, index) => {
            setTimeout(() => {
                this.createEmojiParticle(emoji, x, y, {
                    size: 20 + Math.random() * 10,
                    duration: 2000,
                    spread: 150
                });
            }, index * 100);
        });
        
        // Create skull trail
        this.createSkullTrail(x, y);
    }
    
    createCoinCelebration(x, y) {
        // Golden coin effects
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                this.createGoldenParticle(x, y);
            }, i * 50);
        }
        
        // Coin spin effect
        this.createCoinSpinEffect(x, y);
    }
    
    createTokenCelebration(x, y) {
        // Star burst effect
        this.createStarBurst(x, y);
        
        // Purple energy waves
        this.createEnergyWaves(x, y);
    }
    
    createCelebrationBurst(x, y, prizeType) {
        const particleCount = prizeType === 'kuromiPlush' ? 15 : 10;
        const colors = {
            kuromiPlush: ['#E6D7FF', '#D4C2FF', '#FFB6C1', '#FFFFFF'],
            yellowCoin: ['#FFD700', '#FFA500', '#FFFF00', '#FFE55C'],
            pointToken: ['#9F85FF', '#B199FF', '#C2ADFF', '#D4C2FF']
        };
        
        const colorPalette = colors[prizeType] || colors.pointToken;
        
        for (let i = 0; i < particleCount; i++) {
            setTimeout(() => {
                this.createBurstParticle(x, y, colorPalette);
            }, i * 30);
        }
    }
    
    createBurstParticle(x, y, colors) {
        const particle = this.getParticle();
        if (!particle || !this.effectsContainer) return;
        
        const color = colors[Math.floor(Math.random() * colors.length)];
        const size = 4 + Math.random() * 8;
        
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.background = color;
        particle.style.borderRadius = '50%';
        particle.style.boxShadow = `0 0 10px ${color}`;
        particle.style.left = x + '%';
        particle.style.top = y + '%';
        particle.style.opacity = '1';
        particle.className = 'burst-particle';
        
        this.effectsContainer.appendChild(particle);
        
        // Random direction and distance
        const angle = Math.random() * Math.PI * 2;
        const distance = 50 + Math.random() * 100;
        const deltaX = Math.cos(angle) * distance;
        const deltaY = Math.sin(angle) * distance;
        
        particle.animate([
            { 
                transform: 'translate(-50%, -50%) scale(1)', 
                opacity: 1 
            },
            { 
                transform: `translate(${deltaX}px, ${deltaY}px) scale(0.5)`, 
                opacity: 1,
                offset: 0.7
            },
            { 
                transform: `translate(${deltaX*1.2}px, ${deltaY*1.2}px) scale(0)`, 
                opacity: 0 
            }
        ], {
            duration: 1500,
            easing: 'ease-out'
        });
        
        setTimeout(() => {
            this.returnParticle(particle);
        }, 1500);
    }
    
    createEmojiParticle(emoji, x, y, options = {}) {
        const particle = this.getParticle();
        if (!particle || !this.effectsContainer) return;
        
        particle.innerHTML = emoji;
        particle.style.fontSize = (options.size || 16) + 'px';
        particle.style.left = x + '%';
        particle.style.top = y + '%';
        particle.style.opacity = '1';
        particle.className = 'emoji-particle';
        
        this.effectsContainer.appendChild(particle);
        
        const spread = options.spread || 100;
        const duration = options.duration || 1500;
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * spread;
        const deltaX = Math.cos(angle) * distance;
        const deltaY = Math.sin(angle) * distance - 30; // Slight upward bias
        
        particle.animate([
            { 
                transform: 'translate(-50%, -50%) rotate(0deg)', 
                opacity: 1 
            },
            { 
                transform: `translate(${deltaX}px, ${deltaY}px) rotate(360deg)`, 
                opacity: 0 
            }
        ], {
            duration: duration,
            easing: 'ease-out'
        });
        
        setTimeout(() => {
            this.returnParticle(particle);
        }, duration);
    }
    
    createSkullTrail(x, y) {
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const particle = this.getParticle();
                if (!particle || !this.effectsContainer) return;
                
                particle.innerHTML = '💀';
                particle.style.fontSize = '12px';
                particle.style.left = (x + (Math.random() - 0.5) * 10) + '%';
                particle.style.top = (y + (Math.random() - 0.5) * 10) + '%';
                particle.style.opacity = '0.8';
                particle.className = 'skull-trail-particle';
                
                this.effectsContainer.appendChild(particle);
                
                particle.animate([
                    { 
                        transform: 'translate(-50%, -50%) scale(0.5)', 
                        opacity: 0 
                    },
                    { 
                        transform: 'translate(-50%, -50%) scale(1)', 
                        opacity: 0.8,
                        offset: 0.3
                    },
                    { 
                        transform: 'translate(-50%, -50%) scale(0.3)', 
                        opacity: 0 
                    }
                ], {
                    duration: 1000,
                    easing: 'ease-out'
                });
                
                setTimeout(() => {
                    this.returnParticle(particle);
                }, 1000);
            }, i * 150);
        }
    }
    
    createStarBurst(x, y) {
        for (let i = 0; i < 8; i++) {
            const particle = this.getParticle();
            if (!particle || !this.effectsContainer) return;
            
            particle.innerHTML = '★';
            particle.style.fontSize = '16px';
            particle.style.color = '#FFD700';
            particle.style.left = x + '%';
            particle.style.top = y + '%';
            particle.style.opacity = '1';
            particle.className = 'star-burst-particle';
            
            this.effectsContainer.appendChild(particle);
            
            const angle = (i / 8) * Math.PI * 2;
            const distance = 80;
            const deltaX = Math.cos(angle) * distance;
            const deltaY = Math.sin(angle) * distance;
            
            particle.animate([
                { 
                    transform: 'translate(-50%, -50%) scale(0) rotate(0deg)', 
                    opacity: 0 
                },
                { 
                    transform: 'translate(-50%, -50%) scale(1.5) rotate(180deg)', 
                    opacity: 1,
                    offset: 0.3
                },
                { 
                    transform: `translate(${deltaX}px, ${deltaY}px) scale(0.5) rotate(360deg)`, 
                    opacity: 0 
                }
            ], {
                duration: 1200,
                easing: 'ease-out'
            });
            
            setTimeout(() => {
                this.returnParticle(particle);
            }, 1200);
        }
    }
    
    // Combo effect display
    createComboEffect(comboLevel, x = 50, y = 40) {
        // Create main combo text
        const comboElement = document.createElement('div');
        comboElement.className = 'combo-effect';
        comboElement.innerHTML = `
            <div class="combo-number">${comboLevel}x</div>
            <div class="combo-text">COMBO!</div>
        `;
        
        comboElement.style.cssText = `
            position: absolute;
            left: ${x}%;
            top: ${y}%;
            transform: translate(-50%, -50%);
            font-family: 'Fredoka', cursive;
            font-weight: 700;
            text-align: center;
            z-index: 200;
            pointer-events: none;
        `;
        
        comboElement.querySelector('.combo-number').style.cssText = `
            font-size: ${Math.min(4, 2 + comboLevel * 0.3)}rem;
            color: #FFD700;
            text-shadow: 3px 3px 0 #2D1B3D;
            margin-bottom: -10px;
        `;
        
        comboElement.querySelector('.combo-text').style.cssText = `
            font-size: 1.5rem;
            color: #FF69B4;
            text-shadow: 2px 2px 0 #FFFFFF;
        `;
        
        if (this.effectsContainer) {
            this.effectsContainer.appendChild(comboElement);
        }
        
        // Animate combo display
        comboElement.animate([
            { 
                transform: 'translate(-50%, -50%) scale(0) rotate(-180deg)', 
                opacity: 0 
            },
            { 
                transform: 'translate(-50%, -50%) scale(1.3) rotate(0deg)', 
                opacity: 1,
                offset: 0.3
            },
            { 
                transform: 'translate(-50%, -50%) scale(1) rotate(0deg)', 
                opacity: 1,
                offset: 0.8
            },
            { 
                transform: 'translate(-50%, -50%) scale(0.5) rotate(180deg)', 
                opacity: 0 
            }
        ], {
            duration: 2500,
            easing: 'ease-out'
        });
        
        // Create supporting particle effects
        this.createComboParticles(comboLevel, x, y);
        
        setTimeout(() => {
            if (comboElement.parentNode) {
                comboElement.parentNode.removeChild(comboElement);
            }
        }, 2500);
    }
    
    createComboParticles(comboLevel, x, y) {
        const particleCount = Math.min(20, 5 + comboLevel * 2);
        
        for (let i = 0; i < particleCount; i++) {
            setTimeout(() => {
                const particle = this.getParticle();
                if (!particle || !this.effectsContainer) return;
                
                const size = 6 + Math.random() * 8;
                particle.style.width = size + 'px';
                particle.style.height = size + 'px';
                particle.style.background = `hsl(${Math.random() * 60 + 280}, 70%, 60%)`;
                particle.style.borderRadius = '50%';
                particle.style.left = x + '%';
                particle.style.top = y + '%';
                particle.style.opacity = '1';
                particle.className = 'combo-particle';
                
                this.effectsContainer.appendChild(particle);
                
                const angle = (i / particleCount) * Math.PI * 2;
                const distance = 50 + Math.random() * 80;
                const deltaX = Math.cos(angle) * distance;
                const deltaY = Math.sin(angle) * distance;
                
                particle.animate([
                    { 
                        transform: 'translate(-50%, -50%) scale(0)', 
                        opacity: 0 
                    },
                    { 
                        transform: 'translate(-50%, -50%) scale(1)', 
                        opacity: 1,
                        offset: 0.2
                    },
                    { 
                        transform: `translate(${deltaX}px, ${deltaY}px) scale(0)`, 
                        opacity: 0 
                    }
                ], {
                    duration: 1500,
                    easing: 'ease-out'
                });
                
                setTimeout(() => {
                    this.returnParticle(particle);
                }, 1500);
            }, i * 20);
        }
    }
    
    // Screen shake effect
    createScreenShake(intensity = 1, duration = 500) {
        const gameContainer = document.querySelector('.game-container');
        if (!gameContainer) return;
        
        const shakeAmount = Math.min(10, intensity * 3);
        
        gameContainer.animate([
            { transform: 'translate(0)' },
            { transform: `translate(${shakeAmount}px, ${shakeAmount}px)` },
            { transform: `translate(-${shakeAmount}px, -${shakeAmount}px)` },
            { transform: `translate(${shakeAmount}px, -${shakeAmount}px)` },
            { transform: `translate(-${shakeAmount}px, ${shakeAmount}px)` },
            { transform: 'translate(0)' }
        ], {
            duration: duration,
            easing: 'ease-in-out'
        });
    }
    
    // Refresh background effects periodically
    refreshBackgroundEffects() {
        // Clean up any orphaned particles
        const orphanedParticles = document.querySelectorAll('.floating-heart-particle, .sparkle-particle, .devil-particle');
        orphanedParticles.forEach(particle => {
            if (parseFloat(particle.style.opacity) === 0) {
                this.returnParticle(particle);
            }
        });
    }
    
    // Performance monitoring
    setupPerformanceMonitoring() {
        setInterval(() => {
            const activeParticles = document.querySelectorAll('[class*="particle"]').length;
            const poolAvailable = this.particlePool.filter(p => p.style.opacity === '0').length;
            
            // If too many active particles, clean some up
            if (activeParticles > this.maxParticles * 0.8) {
                this.emergencyCleanup();
            }
            
            console.debug(`Particles: ${activeParticles} active, ${poolAvailable} available`);
        }, 5000);
    }
    
    emergencyCleanup() {
        const allParticles = document.querySelectorAll('[class*="particle"]');
        let cleaned = 0;
        
        allParticles.forEach(particle => {
            if (cleaned < 20 && Math.random() < 0.5) { // Clean up 50% chance, max 20
                this.returnParticle(particle);
                cleaned++;
            }
        });
        
        console.log(`Emergency cleanup: removed ${cleaned} particles`);
    }
    
    // Destroy effects manager
    destroy() {
        // Clean up all particles
        this.particlePool.forEach(particle => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        });
        
        this.particlePool = [];
        this.activeEffects.clear();
    }
}

// Initialize effects manager globally
window.effectsManager = new EffectsManager();

// Export for use in other modules  
window.EffectsManager = EffectsManager;