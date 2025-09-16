/**
 * Prize Generation and Management for Kuromi Claw Machine
 * Handles prize placement, physics, and interactions
 */

class PrizeGenerator {
    constructor(gameState) {
        this.gameState = gameState;
        this.prizeArea = document.getElementById('prizeArea');
        this.prizes = [];
        this.prizeIdCounter = 0;
        
        // Prize configuration
        this.prizeTypes = {
            kuromiPlush: {
                count: 8,
                size: { width: 45, height: 45 },
                rarity: 'rare',
                stackable: true
            },
            yellowCoin: {
                count: 6,
                size: { width: 35, height: 35 },
                rarity: 'common',
                stackable: false
            },
            pointToken: {
                count: 12,
                size: { width: 30, height: 30 },
                rarity: 'common',
                stackable: true
            },
            purpleBall: {
                count: 10,
                size: { width: 32, height: 32 },
                rarity: 'common',
                stackable: true
            }
        };
        
        // Machine boundaries
        this.boundaries = {
            left: 0,
            right: 100,
            top: 0,
            bottom: 85 // Leave space for drop zone
        };
        
        this.initialize();
    }
    
    initialize() {
        this.generatePrizes();
        this.renderPrizes();
        this.setupInteractions();
    }
    
    // Generate all prizes with random positions
    generatePrizes() {
        this.prizes = [];
        
        Object.entries(this.prizeTypes).forEach(([type, config]) => {
            for (let i = 0; i < config.count; i++) {
                const prize = this.createPrize(type, config);
                this.prizes.push(prize);
            }
        });
        
        // Ensure no overlaps
        this.resolveOverlaps();
    }
    
    // Create individual prize object
    createPrize(type, config) {
        const position = this.getRandomPosition(config.size);
        
        return {
            id: ++this.prizeIdCounter,
            type: type,
            position: position,
            size: config.size,
            rarity: config.rarity,
            stackable: config.stackable,
            grabbed: false,
            collected: false,
            element: null,
            wobble: Math.random() * 360, // For floating animation variation
            depth: Math.random() * 10 // For layering effect
        };
    }
    
    // Get random position within boundaries
    getRandomPosition(size) {
        const margin = 5; // Percentage margin from edges
        
        return {
            x: margin + Math.random() * (this.boundaries.right - this.boundaries.left - size.width/2 - margin*2),
            y: margin + Math.random() * (this.boundaries.bottom - this.boundaries.top - size.height/2 - margin*2)
        };
    }
    
    // Resolve overlapping prizes
    resolveOverlaps() {
        const maxAttempts = 50;
        let attempts = 0;
        
        while (attempts < maxAttempts) {
            let hasOverlap = false;
            
            for (let i = 0; i < this.prizes.length; i++) {
                for (let j = i + 1; j < this.prizes.length; j++) {
                    if (this.checkOverlap(this.prizes[i], this.prizes[j])) {
                        // Move the second prize
                        this.prizes[j].position = this.getRandomPosition(this.prizes[j].size);
                        hasOverlap = true;
                    }
                }
            }
            
            if (!hasOverlap) break;
            attempts++;
        }
    }
    
    // Check if two prizes overlap
    checkOverlap(prize1, prize2) {
        const buffer = 5; // Minimum distance between prizes
        
        const dx = Math.abs(prize1.position.x - prize2.position.x);
        const dy = Math.abs(prize1.position.y - prize2.position.y);
        const minDistance = (prize1.size.width + prize2.size.width) / 2 + buffer;
        
        return dx < minDistance && dy < minDistance;
    }
    
    // Render all prizes in the DOM
    renderPrizes() {
        if (!this.prizeArea) return;
        
        // Clear existing prizes
        this.prizeArea.innerHTML = '';
        
        this.prizes.forEach(prize => {
            if (!prize.collected) {
                prize.element = this.createPrizeElement(prize);
                this.prizeArea.appendChild(prize.element);
            }
        });
    }
    
    // Create DOM element for prize
    createPrizeElement(prize) {
        const element = document.createElement('div');
        element.className = `prize-item ${prize.type} ${prize.rarity === 'rare' ? 'rare' : ''}`;
        element.id = `prize-${prize.id}`;

        // Position the element
        element.style.left = prize.position.x + '%';
        element.style.top = prize.position.y + '%';
        element.style.width = prize.size.width + 'px';
        element.style.height = prize.size.height + 'px';
        element.style.zIndex = Math.floor(10 + prize.depth);

        // Add floating animation with unique timing
        element.style.animationDelay = (prize.wobble / 360 * 3) + 's';
        element.classList.add('animate-float');

        // Add Kuromi plushie SVG for kuromiPlush type
        if (prize.type === 'kuromiPlush') {
            element.innerHTML = `<svg viewBox="0 0 48 48" width="40" height="40" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="24" cy="32" rx="14" ry="12" fill="#E6D7FF" stroke="#2D1B3D" stroke-width="2"/>
                <ellipse cx="24" cy="22" rx="10" ry="8" fill="#2D1B3D" stroke="#2D1B3D" stroke-width="2"/>
                <ellipse cx="18" cy="20" rx="3" ry="4" fill="#2D1B3D"/>
                <ellipse cx="30" cy="20" rx="3" ry="4" fill="#2D1B3D"/>
                <ellipse cx="24" cy="28" rx="5" ry="3" fill="#FFB6C1"/>
                <circle cx="24" cy="22" r="2" fill="#FFF"/>
                <ellipse cx="12" cy="10" rx="6" ry="10" fill="#2D1B3D"/>
                <ellipse cx="36" cy="10" rx="6" ry="10" fill="#2D1B3D"/>
                <ellipse cx="24" cy="8" rx="4" ry="3" fill="#FFB6C1"/>
                <ellipse cx="24" cy="8" rx="2" ry="1.5" fill="#FFF"/>
            </svg>`;
        }
        // Add purple ball SVG for purpleBall type
        if (prize.type === 'purpleBall') {
            element.innerHTML = `<svg viewBox="0 0 32 32" width="32" height="32" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="14" fill="#9F85FF" stroke="#2D1B3D" stroke-width="2"/>
                <ellipse cx="16" cy="12" rx="7" ry="3" fill="#FFF" opacity="0.3"/>
            </svg>`;
        }

        // Add special effects for rare items
        if (prize.rarity === 'rare') {
            element.classList.add('animate-glow');
        }

        // Add magnetic effect for coins
        if (prize.type === 'yellowCoin' && Math.random() < 0.3) {
            element.classList.add('animate-magnetic');
        }

        // Store reference to prize data
        element.prizeData = prize;

        return element;
    }
    
    // Setup prize interactions
        setupInteractions() {
        if (!this.prizeArea) return;
        // Add hover effects for prizes
        this.prizeArea.addEventListener('mouseenter', (e) => {
            if (e.target.classList.contains('prize-item')) {
                e.target.style.transform = 'scale(1.1)';
                e.target.style.zIndex = '100';
            }
        }, true);
        this.prizeArea.addEventListener('mouseleave', (e) => {
            if (e.target.classList.contains('prize-item')) {
                e.target.style.transform = '';
                e.target.style.zIndex = Math.floor(10 + e.target.prizeData.depth);
            }
        }, true);
    }


    
    getPrizeAtPosition(x, y, tolerance = 15) {
        return this.prizes.find(prize => {
            if (prize.collected || prize.grabbed) return false;
            const distance = Math.sqrt(
                Math.pow(prize.position.x - x, 2) +
                Math.pow(prize.position.y - y, 2)
            );
            return distance <= tolerance;
        });
    }
}
    