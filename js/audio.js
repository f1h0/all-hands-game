/**
 * Класс для управления звуками в игре
 */
class AudioManager {
    /**
     * Создает новый аудио менеджер
     */
    constructor() {
        this.sounds = {
            pop: new Audio('assets/sounds/pop.mp3'),
            levelUp: new Audio('assets/sounds/level_up.mp3'),
            gameOver: new Audio('assets/sounds/game_over.mp3'),
            special: new Audio('assets/sounds/special.mp3'),
            combo: new Audio('assets/sounds/combo.mp3')
        };
        
        this.music = new Audio('assets/sounds/background_music.mp3');
        this.music.loop = true;
        
        this.isSoundEnabled = true;
        this.isMusicEnabled = true;
        
        // Предзагрузка звуков
        this.preloadSounds();
    }

    /**
     * Предзагружает звуковые файлы
     */
    preloadSounds() {
        // Для каждого звука устанавливаем обработчик ошибки загрузки
        for (const sound in this.sounds) {
            this.sounds[sound].addEventListener('error', () => {
                console.warn(`Failed to load sound: ${sound}`);
                // Создаем пустой звук для предотвращения ошибок
                this.sounds[sound] = {
                    play: () => {},
                    pause: () => {},
                    currentTime: 0
                };
            });
        }
        
        // Обработчик ошибки загрузки для фоновой музыки
        this.music.addEventListener('error', () => {
            console.warn('Failed to load background music');
            // Создаем пустой звук для предотвращения ошибок
            this.music = {
                play: () => {},
                pause: () => {},
                currentTime: 0,
                loop: true
            };
        });
    }

    /**
     * Включает или выключает звуки
     * @param {boolean} enabled - Включены ли звуки
     */
    setSoundEnabled(enabled) {
        this.isSoundEnabled = enabled;
    }

    /**
     * Включает или выключает музыку
     * @param {boolean} enabled - Включена ли музыка
     */
    setMusicEnabled(enabled) {
        this.isMusicEnabled = enabled;
        if (enabled) {
            this.playMusic();
        } else {
            this.stopMusic();
        }
    }

    /**
     * Воспроизводит звук
     * @param {string} soundName - Название звука
     */
    playSound(soundName) {
        if (!this.isSoundEnabled || !this.sounds[soundName]) return;
        
        // Сбрасываем звук на начало и воспроизводим
        const sound = this.sounds[soundName];
        sound.currentTime = 0;
        sound.play().catch(error => {
            console.warn(`Error playing sound ${soundName}:`, error);
        });
    }

    /**
     * Воспроизводит фоновую музыку
     */
    playMusic() {
        if (!this.isMusicEnabled) return;
        
        try {
            // Проверяем, что музыка существует и имеет метод play
            if (this.music && typeof this.music.play === 'function') {
                console.log('Attempting to play background music...');
                this.music.play().catch(error => {
                    console.warn('Error playing background music:', error);
                });
            } else {
                console.warn('Background music not available');
            }
        } catch (error) {
            console.error('Exception when playing music:', error);
        }
    }

    /**
     * Останавливает фоновую музыку
     */
    stopMusic() {
        this.music.pause();
        this.music.currentTime = 0;
    }
}