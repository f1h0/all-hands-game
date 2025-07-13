/**
 * Класс для управления пользовательским интерфейсом
 */
class UI {
    /**
     * Создает новый UI менеджер
     * @param {Game} game - Ссылка на объект игры
     */
    constructor(game) {
        this.game = game;
        this.screens = {
            start: document.getElementById('start-screen'),
            game: document.getElementById('game-screen'),
            pause: document.getElementById('pause-screen'),
            gameOver: document.getElementById('game-over-screen'),
            settings: document.getElementById('settings-screen'),
            stats: document.getElementById('stats-screen')
        };
        
        this.buttons = {
            start: document.getElementById('start-button'),
            settings: document.getElementById('settings-button'),
            stats: document.getElementById('stats-button'),
            pause: document.getElementById('pause-button'),
            resume: document.getElementById('resume-button'),
            restart: document.getElementById('restart-button'),
            exit: document.getElementById('exit-button'),
            playAgain: document.getElementById('play-again-button'),
            mainMenu: document.getElementById('main-menu-button'),
            settingsBack: document.getElementById('settings-back-button'),
            statsBack: document.getElementById('stats-back-button')
        };
        
        this.settings = {
            sound: document.getElementById('sound-toggle'),
            music: document.getElementById('music-toggle'),
            difficulty: document.getElementById('difficulty')
        };
        
        this.stats = {
            totalGames: document.getElementById('total-games'),
            bestScore: document.getElementById('best-score'),
            totalBubbles: document.getElementById('total-bubbles'),
            maxLevel: document.getElementById('max-level')
        };
        
        this.setupEventListeners();
        this.loadSettings();
    }

    /**
     * Настраивает обработчики событий для UI элементов
     */
    setupEventListeners() {
        // Кнопки на стартовом экране
        this.buttons.start.addEventListener('click', () => this.startGame());
        this.buttons.settings.addEventListener('click', () => this.showScreen('settings'));
        this.buttons.stats.addEventListener('click', () => this.showStatsScreen());
        
        // Кнопки на игровом экране
        this.buttons.pause.addEventListener('click', () => this.pauseGame());
        
        // Кнопки на экране паузы
        this.buttons.resume.addEventListener('click', () => this.resumeGame());
        this.buttons.restart.addEventListener('click', () => this.restartGame());
        this.buttons.exit.addEventListener('click', () => this.exitToMainMenu());
        
        // Кнопки на экране окончания игры
        this.buttons.playAgain.addEventListener('click', () => this.restartGame());
        this.buttons.mainMenu.addEventListener('click', () => this.exitToMainMenu());
        
        // Кнопки на экране настроек
        this.buttons.settingsBack.addEventListener('click', () => this.saveSettingsAndBack());
        
        // Кнопки на экране статистики
        this.buttons.statsBack.addEventListener('click', () => this.showScreen('start'));
        
        // Обработчики изменения настроек
        this.settings.sound.addEventListener('change', () => this.updateSettings());
        this.settings.music.addEventListener('change', () => this.updateSettings());
        this.settings.difficulty.addEventListener('change', () => this.updateSettings());
    }

    /**
     * Загружает настройки из localStorage
     */
    loadSettings() {
        const savedSettings = localStorage.getItem('bubblePopSettings');
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            this.settings.sound.checked = settings.sound;
            this.settings.music.checked = settings.music;
            this.settings.difficulty.value = settings.difficulty;
        }
    }

    /**
     * Сохраняет настройки в localStorage
     */
    saveSettings() {
        const settings = {
            sound: this.settings.sound.checked,
            music: this.settings.music.checked,
            difficulty: this.settings.difficulty.value
        };
        localStorage.setItem('bubblePopSettings', JSON.stringify(settings));
    }

    /**
     * Обновляет настройки игры
     */
    updateSettings() {
        // Применяем настройки звука
        this.game.audio.setSoundEnabled(this.settings.sound.checked);
        this.game.audio.setMusicEnabled(this.settings.music.checked);
        
        // Применяем настройки сложности
        switch (this.settings.difficulty.value) {
            case 'easy':
                this.game.bubbleSpawnRate = 1500;
                break;
            case 'medium':
                this.game.bubbleSpawnRate = 1000;
                break;
            case 'hard':
                this.game.bubbleSpawnRate = 600;
                break;
        }
    }

    /**
     * Сохраняет настройки и возвращается на предыдущий экран
     */
    saveSettingsAndBack() {
        this.saveSettings();
        this.showScreen('start');
    }

    /**
     * Показывает указанный экран и скрывает остальные
     * @param {string} screenName - Имя экрана для отображения
     */
    showScreen(screenName) {
        console.log(`Showing screen: ${screenName}`);
        
        // Скрываем все экраны
        Object.values(this.screens).forEach(screen => {
            screen.classList.add('hidden');
            console.log(`Hidden screen: ${screen.id}`);
        });
        
        // Показываем нужный экран
        this.screens[screenName].classList.remove('hidden');
        console.log(`Shown screen: ${this.screens[screenName].id}`);
        
        // Если это игровой экран, убедимся, что канвас имеет правильные размеры
        if (screenName === 'game') {
            this.game.resizeCanvas();
            console.log(`Canvas resized: width=${this.game.canvas.width}, height=${this.game.canvas.height}`);
        }
    }

    /**
     * Показывает экран статистики и обновляет данные
     */
    showStatsScreen() {
        // Обновляем данные статистики
        this.stats.totalGames.textContent = this.game.stats.totalGames;
        this.stats.bestScore.textContent = this.game.stats.bestScore;
        this.stats.totalBubbles.textContent = this.game.stats.totalBubbles;
        this.stats.maxLevel.textContent = this.game.stats.maxLevel;
        
        // Показываем экран статистики
        this.showScreen('stats');
    }

    /**
     * Запускает игру
     */
    startGame() {
        console.log('UI.startGame() called');
        
        // Проверяем, что кнопка "Начать игру" существует и работает
        console.log('Start button:', this.buttons.start);
        
        // Проверяем, что экраны существуют
        console.log('Start screen:', this.screens.start);
        console.log('Game screen:', this.screens.game);
        
        // Показываем игровой экран
        this.showScreen('game');
        console.log('Game screen shown');
        
        // Запускаем игру
        this.game.start();
        console.log('Game started!');
        
        // Проверяем, что игра запущена
        console.log('Game state:', {
            isPaused: this.game.isPaused,
            isGameOver: this.game.isGameOver,
            bubbles: this.game.bubbles.length
        });
    }

    /**
     * Приостанавливает игру
     */
    pauseGame() {
        this.game.togglePause();
        this.showScreen('pause');
    }

    /**
     * Возобновляет игру
     */
    resumeGame() {
        this.showScreen('game');
        this.game.togglePause();
    }

    /**
     * Перезапускает игру
     */
    restartGame() {
        this.showScreen('game');
        this.game.start();
    }

    /**
     * Выходит в главное меню
     */
    exitToMainMenu() {
        this.game.isGameOver = true;
        this.showScreen('start');
    }
}