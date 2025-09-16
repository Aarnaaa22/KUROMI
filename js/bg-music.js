// bg-music.js
// Playful background music for Kuromi Claw Machine

class KuromiBackgroundMusic {
    constructor() {
        this.audio = new Audio('https://cdn.pixabay.com/audio/2022/10/16/audio_12b6b7b2b2.mp3'); // Royalty-free playful music
        this.audio.loop = true;
        this.audio.volume = 0.25;
        this.isPlaying = false;
        this.setupAutoPlay();
    }

    setupAutoPlay() {
        document.addEventListener('click', () => this.play(), { once: true });
    }

    play() {
        if (!this.isPlaying) {
            this.audio.play();
            this.isPlaying = true;
        }
    }

    pause() {
        if (this.isPlaying) {
            this.audio.pause();
            this.isPlaying = false;
        }
    }

    setVolume(vol) {
        this.audio.volume = Math.max(0, Math.min(1, vol));
    }
}

window.kuromiMusic = new KuromiBackgroundMusic();
