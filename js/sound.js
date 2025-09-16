/**
 * Sound Manager for Kuromi Claw Machine
 * Handles all audio effects and background music
 */

class SoundManager {
    constructor() {
        this.sounds = {};
        this.masterVolume = 0.7;
        this.sfxVolume = 0.8;
        this.musicVolume = 0.3;
        this.isMuted = false;
        this.isInitialized = false;
        
        // Sound configuration
        this.soundConfig = {
            coinInsert: { 
                volume: 0.9, 
                loop: false,
                preload: true
            },
            clawMove: { 
                volume: 0.6, 
                loop: false,
                preload: true 
            },
            success: { 
                volume: 1.0, 
                loop: false,
                preload: false 
            },
            fail: { 
                volume: 0.7, 
                loop: false,
                preload: false 
            },
            ambient: { 
                volume: 0.3, 
                loop: true,
                preload: false 
            },
            combo: { 
                volume: 0.9, 
                loop: false,
                preload: false 
            },
            rare: { 
                volume: 1.0, 
                loop: false,
                preload: false 
            }
        };
        
        this.initialize();
    }
    
    initialize() {
        this.createAudioContext();
        this.setupSounds();
        this.createVolumeControls();
        this.isInitialized = true;
    }
    
    createAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGainNode = this.audioContext.createGain();
            this.masterGainNode.connect(this.audioContext.destination);
            this.masterGainNode.gain.value = this.masterVolume;
        } catch (error) {
            console.log('Web Audio API not supported, using HTML5 audio');
            this.useHTML5Audio = true;
        }
    }
    
    setupSounds() {
        // Generate sound effects using Web Audio API
        this.generateSounds();
        
        // Setup HTML5 audio elements as fallback
        this.setupHTML5Audio();
    }
    
    generateSounds() {
        if (!this.audioContext) return;
        
        // Generate coin insert sound
        this.sounds.coinInsert = this.generateCoinSound();
        
        // Generate claw movement sound
        this.sounds.clawMove = this.generateClawMoveSound();
        
        // Generate success sound
        this.sounds.success = this.generateSuccessSound();
        
        // Generate failure sound
        this.sounds.fail = this.generateFailSound();
        
        // Generate combo sound
        this.sounds.combo = this.generateComboSound();
        
        // Generate rare prize sound
        this.sounds.rare = this.generateRareSound();
    }
    
    generateCoinSound() {
        if (!this.audioContext) return null;
        
        const duration = 0.3;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < buffer.length; i++) {
            const time = i / sampleRate;
            const frequency = 800 * Math.exp(-time * 3);
            const amplitude = Math.exp(-time * 4);
            data[i] = Math.sin(2 * Math.PI * frequency * time) * amplitude * 0.3;
            
            // Add metallic ping
            const ping = Math.sin(2 * Math.PI * 1200 * time) * Math.exp(-time * 8) * 0.2;
            data[i] += ping;
        }
        
        return buffer;
    }
    
    generateClawMoveSound() {
        if (!this.audioContext) return null;
        
        const duration = 0.4;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < buffer.length; i++) {
            const time = i / sampleRate;
            // Mechanical whirr sound
            const frequency = 200 + Math.sin(time * 20) * 50;
            const amplitude = 0.2 * (1 - time / duration);
            data[i] = (Math.random() - 0.5) * amplitude * 0.5;
            data[i] += Math.sin(2 * Math.PI * frequency * time) * amplitude * 0.3;
        }
        
        return buffer;
    }
    
    generateSuccessSound() {
        if (!this.audioContext) return null;
        
        const duration = 1.0;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
        const data = buffer.getChannelData(0);
        
        // Ascending melody
        const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
        
        for (let i = 0; i < buffer.length; i++) {
            const time = i / sampleRate;
            const noteIndex = Math.floor(time * 8) % notes.length;
            const frequency = notes[noteIndex];
            const amplitude = Math.exp(-time * 2) * 0.4;
            
            data[i] = Math.sin(2 * Math.PI * frequency * time) * amplitude;
            
            // Add sparkle effect
            if (Math.random() < 0.001) {
                data[i] += Math.sin(2 * Math.PI * 2000 * time) * 0.1;
            }
        }
        
        return buffer;
    }
    
    generateFailSound() {
        if (!this.audioContext) return null;
        
        const duration = 0.5;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < buffer.length; i++) {
            const time = i / sampleRate;
            // Descending tone
            const frequency = 400 * Math.exp(-time * 2);
            const amplitude = Math.exp(-time * 3) * 0.3;
            
            data[i] = Math.sin(2 * Math.PI * frequency * time) * amplitude;
            
            // Add disappointment effect
            data[i] += (Math.random() - 0.5) * amplitude * 0.3;
        }
        
        return buffer;
    }
    
    generateComboSound() {
        if (!this.audioContext) return null;
        
        const duration = 0.8;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
        const data = buffer.getChannelData(0);
        
        // Rapid ascending notes
        for (let i = 0; i < buffer.length; i++) {
            const time = i / sampleRate;
            const frequency = 440 * Math.pow(2, time * 2); // Exponential rise
            const amplitude = Math.sin(Math.PI * time / duration) * 0.5;
            
            data[i] = Math.sin(2 * Math.PI * frequency * time) * amplitude;
            
            // Add harmonics
            data[i] += Math.sin(2 * Math.PI * frequency * 2 * time) * amplitude * 0.3;
        }
        
        return buffer;
    }
    
    generateRareSound() {
        if (!this.audioContext) return null;
        
        const duration = 1.5;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
        const data = buffer.getChannelData(0);
        
        // Magical sound with multiple frequencies
        const frequencies = [523.25, 659.25, 783.99, 987.77]; // C major chord
        
        for (let i = 0; i < buffer.length; i++) {
            const time = i / sampleRate;
            const amplitude = Math.sin(Math.PI * time / duration) * 0.4;
            
            data[i] = 0;
            frequencies.forEach((freq, index) => {
                const phase = index * Math.PI / 4;
                data[i] += Math.sin(2 * Math.PI * freq * time + phase) * amplitude / frequencies.length;
            });
            
            // Add shimmer effect
            const shimmer = Math.sin(2 * Math.PI * 2000 * time) * Math.sin(time * 20) * 0.1;
            data[i] += shimmer;
        }
        
        return buffer;
    }
    
    setupHTML5Audio() {
        // Fallback to HTML5 audio for browsers that don't support Web Audio API
        const audioElements = document.querySelectorAll('audio');
        audioElements.forEach(audio => {
            const soundName = audio.id;
            if (this.soundConfig[soundName]) {
                audio.volume = this.soundConfig[soundName].volume * this.sfxVolume;
                audio.loop = this.soundConfig[soundName].loop;
            }
        });
    }
    
    playSound(soundName, options = {}) {
        if (this.isMuted || !this.isInitialized) return;
        
        if (this.useHTML5Audio) {
            this.playHTML5Sound(soundName, options);
        } else {
            this.playGeneratedSound(soundName, options);
        }
    }
    
    playHTML5Sound(soundName, options) {
        const audio = document.getElementById(soundName);
        if (!audio) return;
        
        try {
            audio.currentTime = 0;
            audio.volume = (options.volume || this.soundConfig[soundName]?.volume || 1) * this.sfxVolume;
            audio.play().catch(e => console.log('Audio play failed:', e));
        } catch (error) {
            console.log('HTML5 audio error:', error);
        }
    }
    
    playGeneratedSound(soundName, options) {
        if (!this.audioContext || !this.sounds[soundName]) return;
        
        try {
            // Resume audio context if suspended
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            
            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();
            
            source.buffer = this.sounds[soundName];
            
            const volume = (options.volume || this.soundConfig[soundName]?.volume || 1) * this.sfxVolume;
            gainNode.gain.value = volume;
            
            source.connect(gainNode);
            gainNode.connect(this.masterGainNode);
            
            source.start(0);
            
            // Add pitch variation for repeated sounds
            if (options.pitchVariation) {
                source.playbackRate.value = 0.8 + Math.random() * 0.4;
            }
            
        } catch (error) {
            console.log('Generated sound error:', error);
        }
    }
    
    // Play special sound combinations
    playComboSound(comboLevel) {
        this.playSound('combo', { volume: Math.min(1.0, 0.5 + comboLevel * 0.1) });
        
        // Add extra sparkles for high combos
        if (comboLevel > 5) {
            setTimeout(() => this.playSound('rare', { volume: 0.6 }), 200);
        }
    }
    
    playRarePrizeSound() {
        this.playSound('rare');
        
        // Add celebration sequence
        setTimeout(() => this.playSound('success', { volume: 0.5 }), 500);
        setTimeout(() => this.playSound('combo', { volume: 0.4 }), 800);
    }
    
    // Play streamed background ambience
    playAmbientSound() {
        if (this.ambientSource) return; // Already playing
        
        this.generateAmbientLoop();
    }
    
    generateAmbientLoop() {
        if (!this.audioContext) return;
        
        const duration = 10; // 10 second loop
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
        const data = buffer.getChannelData(0);
        
        // Generate subtle machine humming
        for (let i = 0; i < buffer.length; i++) {
            const time = i / sampleRate;
            
            // Base hum
            data[i] = Math.sin(2 * Math.PI * 60 * time) * 0.05;
            
            // Electrical buzz
            data[i] += Math.sin(2 * Math.PI * 120 * time) * 0.02;
            
            // Random electrical pops
            if (Math.random() < 0.0001) {
                data[i] += (Math.random() - 0.5) * 0.1;
            }
            
            // Subtle melody occasionally
            if (Math.sin(time * 0.1) > 0.9) {
                const melody = Math.sin(2 * Math.PI * 440 * time) * 0.01;
                data[i] += melody;
            }
        }
        
        // Play the ambient loop
        try {
            this.ambientSource = this.audioContext.createBufferSource();
            const ambientGain = this.audioContext.createGain();
            
            this.ambientSource.buffer = buffer;
            this.ambientSource.loop = true;
            
            ambientGain.gain.value = this.musicVolume;
            
            this.ambientSource.connect(ambientGain);
            ambientGain.connect(this.masterGainNode);
            
            this.ambientSource.start(0);
        } catch (error) {
            console.log('Ambient sound error:', error);
        }
    }
    
    stopAmbientSound() {
        if (this.ambientSource) {
            try {
                this.ambientSource.stop();
                this.ambientSource = null;
            } catch (error) {
                console.log('Stop ambient error:', error);
            }
        }
    }
    
    // Volume controls
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        if (this.masterGainNode) {
            this.masterGainNode.gain.value = this.masterVolume;
        }
    }
    
    setSFXVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
    }
    
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        if (this.ambientSource && this.ambientSource.gainNode) {
            this.ambientSource.gainNode.gain.value = this.musicVolume;
        }
    }
    
    toggleMute() {
        this.isMuted = !this.isMuted;
        
        if (this.isMuted) {
            this.stopAmbientSound();
            if (this.masterGainNode) {
                this.masterGainNode.gain.value = 0;
            }
        } else {
            if (this.masterGainNode) {
                this.masterGainNode.gain.value = this.masterVolume;
            }
        }
        
        return this.isMuted;
    }
    
    createVolumeControls() {
        // Create floating volume control panel
        const volumePanel = document.createElement('div');
        volumePanel.className = 'volume-controls';
        volumePanel.innerHTML = `
            <div class="volume-toggle" id="volumeToggle">
                <i class="fas fa-volume-up" id="volumeIcon"></i>
            </div>
            <div class="volume-sliders" id="volumeSliders" style="display: none;">
                <div class="volume-slider-group">
                    <label>Master</label>
                    <input type="range" id="masterVolumeSlider" min="0" max="100" value="${this.masterVolume * 100}">
                </div>
                <div class="volume-slider-group">
                    <label>SFX</label>
                    <input type="range" id="sfxVolumeSlider" min="0" max="100" value="${this.sfxVolume * 100}">
                </div>
                <div class="volume-slider-group">
                    <label>Music</label>
                    <input type="range" id="musicVolumeSlider" min="0" max="100" value="${this.musicVolume * 100}">
                </div>
            </div>
        `;
        
        // Style the volume controls
        volumePanel.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
            background: rgba(0,0,0,0.8);
            border-radius: 10px;
            padding: 10px;
            color: white;
            font-size: 14px;
        `;
        
        document.body.appendChild(volumePanel);
        
        // Setup event listeners
        this.setupVolumeControls();
    }
    
    setupVolumeControls() {
        const volumeToggle = document.getElementById('volumeToggle');
        const volumeSliders = document.getElementById('volumeSliders');
        const volumeIcon = document.getElementById('volumeIcon');
        
        // Toggle volume panel
        volumeToggle?.addEventListener('click', () => {
            const isVisible = volumeSliders.style.display !== 'none';
            volumeSliders.style.display = isVisible ? 'none' : 'block';
        });
        
        // Mute toggle
        volumeIcon?.addEventListener('click', (e) => {
            e.stopPropagation();
            const muted = this.toggleMute();
            volumeIcon.className = muted ? 'fas fa-volume-mute' : 'fas fa-volume-up';
        });
        
        // Volume sliders
        document.getElementById('masterVolumeSlider')?.addEventListener('input', (e) => {
            this.setMasterVolume(e.target.value / 100);
        });
        
        document.getElementById('sfxVolumeSlider')?.addEventListener('input', (e) => {
            this.setSFXVolume(e.target.value / 100);
        });
        
        document.getElementById('musicVolumeSlider')?.addEventListener('input', (e) => {
            this.setMusicVolume(e.target.value / 100);
        });
    }
    
    // Initialize audio context on first user interaction
    initializeOnUserGesture() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        // Start ambient sound
        this.playAmbientSound();
    }
    
    // Cleanup when destroying sound manager
    destroy() {
        this.stopAmbientSound();
        
        if (this.audioContext) {
            this.audioContext.close();
        }
        
        // Remove volume controls
        const volumeControls = document.querySelector('.volume-controls');
        if (volumeControls) {
            volumeControls.remove();
        }
    }
    
    // Get current audio stats
    getStats() {
        return {
            masterVolume: this.masterVolume,
            sfxVolume: this.sfxVolume,
            musicVolume: this.musicVolume,
            isMuted: this.isMuted,
            isInitialized: this.isInitialized,
            audioContextState: this.audioContext?.state || 'not available',
            ambientPlaying: !!this.ambientSource
        };
    }
}

// Initialize sound manager globally
window.soundManager = new SoundManager();

// Setup first interaction listener
document.addEventListener('click', () => {
    if (window.soundManager) {
        window.soundManager.initializeOnUserGesture();
    }
}, { once: true });

// Export for use in other modules
window.SoundManager = SoundManager;