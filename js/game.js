/**
 * Основной класс игры
 */
class Game {
    /**
     * Создает новую игру
     * @param {HTMLCanvasElement} canvas - Элемент канваса для отрисовки игры
     */
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.bubbles = [];
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.isGameOver = false;
        this.isPaused = false;
        this.isSlowTime = false;
        this.isDoublePoints = false;
        this.isImmortal = false;
        this.bubbleSpawnRate = 1000; // Миллисекунды между появлением пузырей
        this.bubbleSpawnTimer = 0;
        this.comboCount = 0;
        this.comboTimer = 0;
        this.maxComboTime = 1000; // Время в миллисекундах для продолжения комбо
        this.levelProgress = 0;
        this.levelTarget = 500; // Очки, необходимые для перехода на следующий уровень
        this.lastFrameTime = 0;
        this.timeScale = 1; // Множитель скорости игры (для эффекта замедления)
        this.pointsMultiplier = 1; // Множитель очков
        this.effectTimers = {
            slowTime: null,
            doublePoints: null
        };
        
        // Пасхалки и секретные бонусы
        this.secretCodes = {
            'bubble': false,  // Разблокирует радужные пузыри
            'pop': false,     // Разблокирует взрывные эффекты
            'combo': false,   // Разблокирует супер-комбо
            'godmode': false, // Бессмертие + бесконечные очки
            'money': false,   // Увеличивает очки в 10 раз
            'speed': false,   // Замедляет время навсегда
            'life': false,    // Дает бесконечные жизни
            'master': false   // Разблокирует все коды сразу
        };
        this.easterEggs = {
            'rainbowMode': false,    // Радужный режим
            'giantBubbles': false,   // Гигантские пузыри
            'antiGravity': false,    // Антигравитация
            'superCombo': false,     // Супер-комбо
            'godMode': false,        // Режим бога
            'infiniteScore': false,  // Бесконечные очки
            'timeWarp': false,       // Замедление времени
            'immortal': false,       // Бессмертие
            'allCheats': false       // Все читы активированы
        };
        this.achievements = [];      // Достижения игрока
        this.secretCodeInput = '';   // Ввод секретного кода
        this.secretCodeTimer = 0;    // Таймер для сброса ввода кода
        
        // Аудио менеджер
        this.audio = new AudioManager();
        
        // Статистика
        this.stats = {
            totalGames: 0,
            bestScore: 0,
            totalBubbles: 0,
            maxLevel: 1,
            secretsFound: 0,         // Количество найденных секретов
            highestCombo: 0          // Наивысшее комбо
        };
        
        this.loadStats();
        this.loadSecrets();
        this.setupEventListeners();
        this.resizeCanvas();
    }

    /**
     * Загружает статистику из localStorage
     */
    loadStats() {
        const savedStats = localStorage.getItem('bubblePopStats');
        if (savedStats) {
            this.stats = JSON.parse(savedStats);
        }
    }

    /**
     * Сохраняет статистику в localStorage
     */
    saveStats() {
        localStorage.setItem('bubblePopStats', JSON.stringify(this.stats));
    }
    
    /**
     * Загружает секретные коды и пасхалки из localStorage
     */
    loadSecrets() {
        const savedSecrets = localStorage.getItem('bubblePopSecrets');
        if (savedSecrets) {
            const secrets = JSON.parse(savedSecrets);
            this.secretCodes = secrets.codes || this.secretCodes;
            this.easterEggs = secrets.eggs || this.easterEggs;
            this.achievements = secrets.achievements || this.achievements;
        }
    }
    
    /**
     * Сохраняет секретные коды и пасхалки в localStorage
     */
    saveSecrets() {
        const secrets = {
            codes: this.secretCodes,
            eggs: this.easterEggs,
            achievements: this.achievements
        };
        localStorage.setItem('bubblePopSecrets', JSON.stringify(secrets));
    }
    
    /**
     * Проверяет и разблокирует достижения
     */
    checkAchievements() {
        // Проверяем достижения по очкам
        if (this.score >= 1000 && !this.hasAchievement('score1000')) {
            this.unlockAchievement('score1000', 'Набрать 1000 очков', 'Вы набрали 1000 очков!');
        }
        
        if (this.score >= 5000 && !this.hasAchievement('score5000')) {
            this.unlockAchievement('score5000', 'Набрать 5000 очков', 'Вы набрали 5000 очков!');
        }
        
        // Проверяем достижения по комбо
        if (this.comboCount >= 5 && !this.hasAchievement('combo5')) {
            this.unlockAchievement('combo5', 'Комбо x5', 'Вы сделали комбо из 5 пузырей!');
        }
        
        if (this.comboCount >= 10 && !this.hasAchievement('combo10')) {
            this.unlockAchievement('combo10', 'Комбо x10', 'Вы сделали комбо из 10 пузырей!');
            // Разблокируем секретный код combo
            this.secretCodes.combo = true;
        }
        
        // Проверяем достижения по уровню
        if (this.level >= 5 && !this.hasAchievement('level5')) {
            this.unlockAchievement('level5', 'Уровень 5', 'Вы достигли 5 уровня!');
        }
        
        if (this.level >= 10 && !this.hasAchievement('level10')) {
            this.unlockAchievement('level10', 'Уровень 10', 'Вы достигли 10 уровня!');
            // Разблокируем секретный код bubble
            this.secretCodes.bubble = true;
        }
        
        // Обновляем статистику
        if (this.comboCount > this.stats.highestCombo) {
            this.stats.highestCombo = this.comboCount;
        }
        
        // Сохраняем изменения
        this.saveSecrets();
        this.saveStats();
    }
    
    /**
     * Проверяет, есть ли у игрока указанное достижение
     * @param {string} id - Идентификатор достижения
     * @returns {boolean} - true, если достижение разблокировано
     */
    hasAchievement(id) {
        return this.achievements.some(a => a.id === id);
    }
    
    /**
     * Разблокирует новое достижение
     * @param {string} id - Идентификатор достижения
     * @param {string} title - Название достижения
     * @param {string} description - Описание достижения
     */
    unlockAchievement(id, title, description) {
        if (!this.hasAchievement(id)) {
            this.achievements.push({
                id,
                title,
                description,
                unlocked: Date.now()
            });
            
            // Показываем уведомление о достижении
            this.showAchievementNotification(title);
            
            // Обновляем статистику
            this.stats.secretsFound++;
            this.saveStats();
        }
    }
    
    /**
     * Показывает уведомление о разблокировке достижения
     * @param {string} title - Название достижения
     */
    showAchievementNotification(title) {
        // Создаем элемент уведомления
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-icon">🏆</div>
            <div class="achievement-text">
                <div class="achievement-title">Достижение разблокировано!</div>
                <div class="achievement-name">${title}</div>
            </div>
        `;
        
        // Добавляем стили для уведомления
        const style = document.createElement('style');
        style.textContent = `
            .achievement-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 15px;
                border-radius: 10px;
                display: flex;
                align-items: center;
                z-index: 1000;
                animation: achievement-slide-in 0.5s, achievement-fade-out 0.5s 4.5s;
                box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
                border: 2px solid gold;
            }
            .achievement-icon {
                font-size: 30px;
                margin-right: 15px;
            }
            .achievement-title {
                font-size: 14px;
                opacity: 0.8;
            }
            .achievement-name {
                font-size: 18px;
                font-weight: bold;
                color: gold;
            }
            @keyframes achievement-slide-in {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes achievement-fade-out {
                from { opacity: 1; }
                to { opacity: 0; }
            }
        `;
        
        // Добавляем элементы на страницу
        document.head.appendChild(style);
        document.body.appendChild(notification);
        
        // Удаляем уведомление через 5 секунд
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    /**
     * Настраивает обработчики событий
     */
    setupEventListeners() {
        // Обработчик изменения размера окна
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Обработчик нажатия на канвас
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        
        // Добавляем обработчик движения мыши для более отзывчивого интерфейса
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        
        // Обработчик касания для мобильных устройств
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const clickEvent = {
                clientX: touch.clientX,
                clientY: touch.clientY
            };
            this.handleClick(clickEvent);
        });
        
        // Добавляем обработчик движения пальца для мобильных устройств
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const moveEvent = {
                clientX: touch.clientX,
                clientY: touch.clientY
            };
            this.handleMouseMove(moveEvent);
        });
        
        // Обработчик нажатия клавиш для секретных кодов
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    }
    
    /**
     * Обрабатывает нажатие клавиш
     * @param {KeyboardEvent} e - Событие нажатия клавиши
     */
    handleKeyDown(e) {
        // Если игра на паузе или окончена, не обрабатываем ввод
        if (this.isPaused || this.isGameOver) return;
        
        // Сбрасываем таймер ввода кода
        clearTimeout(this.secretCodeTimer);
        
        // Добавляем символ к вводу кода
        if (e.key.length === 1) {
            this.secretCodeInput += e.key.toLowerCase();
            
            // Проверяем, введен ли один из секретных кодов
            this.checkSecretCode();
            
            // Устанавливаем таймер для сброса ввода через 2 секунды
            this.secretCodeTimer = setTimeout(() => {
                this.secretCodeInput = '';
            }, 2000);
        }
        
        // Обработка специальных клавиш
        switch (e.key) {
            case 'Escape':
                // Пауза по клавише Escape
                if (!this.isGameOver) {
                    this.togglePause();
                }
                break;
                
            case ' ':
                // Активация специального режима по пробелу, если разблокирован
                if (this.secretCodes.combo && !this.easterEggs.superCombo) {
                    this.activateEasterEgg('superCombo');
                }
                break;
                
            case 'r':
                // Активация радужного режима, если разблокирован
                if (this.secretCodes.bubble && !this.easterEggs.rainbowMode) {
                    this.activateEasterEgg('rainbowMode');
                }
                break;
                
            case 'g':
                // Активация гигантских пузырей, если разблокирован
                if (this.secretCodes.bubble && !this.easterEggs.giantBubbles) {
                    this.activateEasterEgg('giantBubbles');
                }
                break;
                
            case 'a':
                // Активация антигравитации, если разблокирован
                if (this.secretCodes.pop && !this.easterEggs.antiGravity) {
                    this.activateEasterEgg('antiGravity');
                }
                break;
        }
    }
    
    /**
     * Проверяет, введен ли секретный код
     */
    checkSecretCode() {
        // Проверяем код "bubble"
        if (this.secretCodeInput.endsWith('bubble')) {
            this.secretCodes.bubble = true;
            this.showSecretCodeNotification('Код "bubble" активирован!');
            this.secretCodeInput = '';
            this.saveSecrets();
        }
        
        // Проверяем код "pop"
        else if (this.secretCodeInput.endsWith('pop')) {
            this.secretCodes.pop = true;
            this.showSecretCodeNotification('Код "pop" активирован!');
            this.secretCodeInput = '';
            this.saveSecrets();
        }
        
        // Проверяем код "combo"
        else if (this.secretCodeInput.endsWith('combo')) {
            this.secretCodes.combo = true;
            this.showSecretCodeNotification('Код "combo" активирован!');
            this.secretCodeInput = '';
            this.saveSecrets();
        }
        
        // 🔥 СУПЕР ЧИТ-КОД "godmode" - активирует все возможные преимущества
        else if (this.secretCodeInput.endsWith('godmode')) {
            // Активируем все секретные коды
            this.secretCodes.bubble = true;
            this.secretCodes.pop = true;
            this.secretCodes.combo = true;
            this.secretCodes.godmode = true;
            this.secretCodes.money = true;
            this.secretCodes.speed = true;
            this.secretCodes.life = true;
            
            // Активируем все пасхалки
            this.easterEggs.rainbowMode = true;
            this.easterEggs.giantBubbles = true;
            this.easterEggs.antiGravity = false; // Оставляем выключенным, чтобы не мешало играть
            this.easterEggs.superCombo = true;
            this.easterEggs.godMode = true;
            this.easterEggs.infiniteScore = true;
            this.easterEggs.timeWarp = true;
            this.easterEggs.immortal = true;
            
            // Даем игроку МЕГА преимущества
            this.lives = 999;
            this.pointsMultiplier = 10;
            this.comboCount = 20;
            this.comboTimer = this.maxComboTime * 10;
            this.score += 50000; // Бонус очков
            this.timeScale = 0.3; // Замедляем время
            
            // Показываем уведомление
            this.showSecretCodeNotification('🔥 ЧИТ-КОД "GODMODE" АКТИВИРОВАН! 🔥\n👑 ВЫ СТАЛИ БОГОМ ИГРЫ! 👑');
            this.secretCodeInput = '';
            this.saveSecrets();
        }
        
        // 💰 ЧИТ-КОД "money" - увеличивает очки в 10 раз
        else if (this.secretCodeInput.endsWith('money')) {
            this.secretCodes.money = true;
            this.easterEggs.infiniteScore = true;
            
            // Увеличиваем очки и множитель
            this.score += 10000;
            this.pointsMultiplier = Math.max(this.pointsMultiplier, 5);
            
            this.showSecretCodeNotification('💰 ЧИТ-КОД "MONEY" АКТИВИРОВАН! 💰\nОчки увеличены в 5 раз!');
            this.secretCodeInput = '';
            this.saveSecrets();
        }
        
        // ⚡ ЧИТ-КОД "speed" - замедляет время навсегда
        else if (this.secretCodeInput.endsWith('speed')) {
            this.secretCodes.speed = true;
            this.easterEggs.timeWarp = true;
            
            // Замедляем время навсегда
            this.timeScale = 0.5;
            this.isSlowTime = true;
            
            this.showSecretCodeNotification('⚡ ЧИТ-КОД "SPEED" АКТИВИРОВАН! ⚡\nВремя замедлено навсегда!');
            this.secretCodeInput = '';
            this.saveSecrets();
        }
        
        // ❤️ ЧИТ-КОД "life" - дает бесконечные жизни
        else if (this.secretCodeInput.endsWith('life')) {
            this.secretCodes.life = true;
            this.easterEggs.immortal = true;
            
            // Даем много жизней
            this.lives = 99;
            
            this.showSecretCodeNotification('❤️ ЧИТ-КОД "LIFE" АКТИВИРОВАН! ❤️\nТеперь у вас 99 жизней!');
            this.secretCodeInput = '';
            this.saveSecrets();
        }
        
        // 👑 МАСТЕР ЧИТ-КОД "master" - разблокирует ВСЕ коды сразу
        else if (this.secretCodeInput.endsWith('master')) {
            // Активируем ВСЕ секретные коды
            Object.keys(this.secretCodes).forEach(code => {
                this.secretCodes[code] = true;
            });
            
            // Активируем ВСЕ пасхалки
            Object.keys(this.easterEggs).forEach(egg => {
                if (egg !== 'antiGravity') { // Кроме антигравитации
                    this.easterEggs[egg] = true;
                }
            });
            
            // МАКСИМАЛЬНЫЕ преимущества
            this.lives = 999;
            this.pointsMultiplier = 20;
            this.comboCount = 50;
            this.comboTimer = this.maxComboTime * 20;
            this.score += 100000; // Огромный бонус очков
            this.timeScale = 0.2; // Очень медленное время
            this.level += 5; // Бонус уровней
            
            this.showSecretCodeNotification('👑 МАСТЕР ЧИТ-КОД "MASTER" АКТИВИРОВАН! 👑\n🎮 ВЫ ПОЛУЧИЛИ ВСЕ ЧИТЫ! 🎮\n🏆 ВЫ - АБСОЛЮТНЫЙ МАСТЕР! 🏆');
            this.secretCodeInput = '';
            this.saveSecrets();
            
            // Разблокируем все достижения
            this.unlockAllAchievements();
        }
    }
    
    /**
     * Разблокирует все достижения сразу
     */
    unlockAllAchievements() {
        const allAchievements = [
            { id: 'score1000', title: 'Первая тысяча', description: 'Набрать 1000 очков' },
            { id: 'score5000', title: 'Пять тысяч!', description: 'Набрать 5000 очков' },
            { id: 'score10000', title: 'Десять тысяч!', description: 'Набрать 10000 очков' },
            { id: 'combo5', title: 'Комбо мастер', description: 'Сделать комбо из 5 пузырей' },
            { id: 'combo10', title: 'Комбо легенда', description: 'Сделать комбо из 10 пузырей' },
            { id: 'combo20', title: 'Комбо бог', description: 'Сделать комбо из 20 пузырей' },
            { id: 'level5', title: 'Пятый уровень', description: 'Достичь 5 уровня' },
            { id: 'level10', title: 'Десятый уровень', description: 'Достичь 10 уровня' },
            { id: 'level20', title: 'Двадцатый уровень', description: 'Достичь 20 уровня' },
            { id: 'cheat_master', title: 'Мастер читов', description: 'Активировать все чит-коды' },
            { id: 'secret_finder', title: 'Искатель секретов', description: 'Найти все секретные коды' }
        ];
        
        allAchievements.forEach(achievement => {
            if (!this.hasAchievement(achievement.id)) {
                this.achievements.push({
                    ...achievement,
                    unlocked: Date.now()
                });
            }
        });
        
        this.stats.secretsFound = this.achievements.length;
        this.saveStats();
        this.saveSecrets();
    }
        
        // Чит-код "immortal" - бесконечные жизни
        else if (this.secretCodeInput.endsWith('immortal')) {
            // Устанавливаем флаг бессмертия
            this.isImmortal = true;
            this.lives = 999;
            
            // Показываем уведомление
            this.showSecretCodeNotification('ЧИТ-КОД "IMMORTAL" АКТИВИРОВАН!');
            this.secretCodeInput = '';
            this.saveSecrets();
            
            // Разблокируем достижение
            this.unlockAchievement('immortal', 'Бессмертие', 'Вы активировали режим бессмертия!');
        }
        
        // Чит-код "points" - мгновенно добавляет 1000 очков
        else if (this.secretCodeInput.endsWith('points')) {
            // Добавляем очки
            this.score += 1000;
            this.levelProgress += 1000;
            
            // Обновляем UI
            document.getElementById('score').textContent = this.score;
            
            // Проверяем переход на следующий уровень
            this.checkLevelUp();
            
            // Показываем уведомление
            this.showSecretCodeNotification('ЧИТ-КОД "POINTS" АКТИВИРОВАН! +1000 ОЧКОВ');
            this.secretCodeInput = '';
        }
    }
    
    /**
     * Разблокирует все достижения
     */
    unlockAllAchievements() {
        // Список всех достижений
        const allAchievements = [
            {id: 'score1000', title: 'Набрать 1000 очков', description: 'Вы набрали 1000 очков!'},
            {id: 'score5000', title: 'Набрать 5000 очков', description: 'Вы набрали 5000 очков!'},
            {id: 'combo5', title: 'Комбо x5', description: 'Вы сделали комбо из 5 пузырей!'},
            {id: 'combo10', title: 'Комбо x10', description: 'Вы сделали комбо из 10 пузырей!'},
            {id: 'level5', title: 'Уровень 5', description: 'Вы достигли 5 уровня!'},
            {id: 'level10', title: 'Уровень 10', description: 'Вы достигли 10 уровня!'},
            {id: 'godmode', title: 'Режим Бога', description: 'Вы активировали режим Бога!'}
        ];
        
        // Разблокируем каждое достижение
        for (const achievement of allAchievements) {
            if (!this.hasAchievement(achievement.id)) {
                this.achievements.push({
                    id: achievement.id,
                    title: achievement.title,
                    description: achievement.description,
                    unlocked: Date.now()
                });
                
                // Обновляем статистику
                this.stats.secretsFound++;
            }
        }
        
        // Сохраняем изменения
        this.saveStats();
        this.saveSecrets();
        
        // Показываем уведомление о последнем достижении
        this.showAchievementNotification('Режим Бога');
    }
    
    /**
     * Активирует пасхалку
     * @param {string} eggName - Название пасхалки
     */
    activateEasterEgg(eggName) {
        if (this.easterEggs[eggName]) return; // Уже активирована
        
        this.easterEggs[eggName] = true;
        this.saveSecrets();
        
        // Показываем уведомление
        let title = '';
        
        switch (eggName) {
            case 'rainbowMode':
                title = 'Радужный режим активирован!';
                break;
            case 'giantBubbles':
                title = 'Режим гигантских пузырей активирован!';
                break;
            case 'antiGravity':
                title = 'Антигравитация активирована!';
                break;
            case 'superCombo':
                title = 'Супер-комбо активировано!';
                break;
        }
        
        this.showSecretCodeNotification(title);
        
        // Применяем эффект пасхалки
        this.applyEasterEggEffect(eggName);
    }
    
    /**
     * Применяет эффект пасхалки
     * @param {string} eggName - Название пасхалки
     */
    applyEasterEggEffect(eggName) {
        switch (eggName) {
            case 'rainbowMode':
                // Делаем все пузыри радужными
                for (const bubble of this.bubbles) {
                    bubble.isRainbow = true;
                }
                break;
                
            case 'giantBubbles':
                // Увеличиваем размер всех пузырей
                for (const bubble of this.bubbles) {
                    bubble.radius *= 1.5;
                }
                break;
                
            case 'antiGravity':
                // Меняем гравитацию на противоположную
                for (const bubble of this.bubbles) {
                    bubble.gravity = -bubble.gravity;
                }
                break;
                
            case 'superCombo':
                // Увеличиваем множитель комбо
                this.comboCount = Math.max(this.comboCount, 5);
                this.comboTimer = this.maxComboTime * 3;
                break;
        }
    }
    
    /**
     * Показывает уведомление о вводе секретного кода
     * @param {string} message - Сообщение для отображения
     */
    showSecretCodeNotification(message) {
        // Создаем элемент уведомления
        const notification = document.createElement('div');
        notification.className = 'secret-code-notification';
        notification.innerHTML = `
            <div class="secret-code-icon">🔮</div>
            <div class="secret-code-text">${message}</div>
        `;
        
        // Добавляем стили для уведомления
        const style = document.createElement('style');
        style.textContent = `
            .secret-code-notification {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0, 0, 0, 0.9);
                color: white;
                padding: 20px;
                border-radius: 15px;
                display: flex;
                flex-direction: column;
                align-items: center;
                z-index: 1000;
                animation: secret-code-appear 0.5s, secret-code-disappear 0.5s 2.5s;
                box-shadow: 0 0 30px rgba(128, 0, 255, 0.7);
                border: 3px solid #8a2be2;
                text-align: center;
            }
            .secret-code-icon {
                font-size: 40px;
                margin-bottom: 15px;
            }
            .secret-code-text {
                font-size: 22px;
                font-weight: bold;
                color: #ff00ff;
            }
            @keyframes secret-code-appear {
                from { transform: translate(-50%, -50%) scale(0); opacity: 0; }
                to { transform: translate(-50%, -50%) scale(1); opacity: 1; }
            }
            @keyframes secret-code-disappear {
                from { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                to { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
            }
        `;
        
        // Добавляем элементы на страницу
        document.head.appendChild(style);
        document.body.appendChild(notification);
        
        // Удаляем уведомление через 3 секунды
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    /**
     * Изменяет размер канваса в соответствии с размером окна
     */
    resizeCanvas() {
        const container = this.canvas.parentElement;
        console.log('Resizing canvas...');
        console.log(`Container dimensions: width=${container.clientWidth}, height=${container.clientHeight}`);
        
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight - 60; // Вычитаем высоту заголовка
        
        console.log(`New canvas dimensions: width=${this.canvas.width}, height=${this.canvas.height}`);
        
        // Проверяем, что канвас имеет ненулевые размеры
        if (this.canvas.width <= 0 || this.canvas.height <= 0) {
            console.error('Canvas has invalid dimensions!');
            // Устанавливаем минимальные размеры
            this.canvas.width = Math.max(300, this.canvas.width);
            this.canvas.height = Math.max(400, this.canvas.height);
            console.log(`Corrected canvas dimensions: width=${this.canvas.width}, height=${this.canvas.height}`);
        }
    }

    /**
     * Обрабатывает движение мыши над канвасом
     * @param {MouseEvent|TouchEvent} e - Событие движения мыши
     */
    handleMouseMove(e) {
        if (this.isPaused || this.isGameOver) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Проверяем, находится ли курсор над каким-либо пузырем
        let hoveredBubble = false;
        
        for (let i = 0; i < this.bubbles.length; i++) {
            const bubble = this.bubbles[i];
            
            // Если курсор над пузырем, увеличиваем его немного для визуального эффекта
            if (bubble.containsPoint(x, y)) {
                bubble.isHovered = true;
                hoveredBubble = true;
                this.canvas.style.cursor = 'pointer'; // Меняем курсор на указатель
            } else {
                bubble.isHovered = false;
            }
        }
        
        // Если курсор не над пузырем, возвращаем стандартный курсор
        if (!hoveredBubble) {
            this.canvas.style.cursor = 'default';
        }
    }
    
    /**
     * Обрабатывает нажатие на канвас
     * @param {MouseEvent|TouchEvent} e - Событие нажатия
     */
    handleClick(e) {
        if (this.isPaused || this.isGameOver) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        let bubblePopped = false;
        
        // Проверяем каждый пузырь на попадание с увеличенной областью клика для лучшей отзывчивости
        for (let i = this.bubbles.length - 1; i >= 0; i--) {
            const bubble = this.bubbles[i];
            // Увеличиваем область клика на 10 пикселей для лучшей отзывчивости
            if (bubble.containsPoint(x, y, 10) && bubble.pop()) {
                bubblePopped = true;
                this.stats.totalBubbles++;
                
                // Воспроизводим звук в зависимости от типа пузыря
                if (bubble.type === 'special') {
                    this.audio.playSound('special');
                } else {
                    this.audio.playSound('pop');
                }
                
                // Обновляем комбо
                this.comboCount++;
                this.comboTimer = this.maxComboTime;
                
                // Воспроизводим звук комбо, если комбо больше 3
                if (this.comboCount >= 3) {
                    this.audio.playSound('combo');
                }
                
                // Рассчитываем очки с учетом комбо и множителя
                let pointsToAdd = bubble.points * (1 + (this.comboCount - 1) * 0.1) * this.pointsMultiplier;
                this.score += Math.round(pointsToAdd);
                
                // Обновляем прогресс уровня
                this.levelProgress += Math.round(pointsToAdd);
                
                // Проверяем переход на следующий уровень
                this.checkLevelUp();
                
                // Проверяем достижения
                this.checkAchievements();
                
                // Обновляем UI
                document.getElementById('score').textContent = this.score;
                document.getElementById('progress-bar').style.width = `${(this.levelProgress / this.levelTarget) * 100}%`;
                
                break; // Лопаем только один пузырь за клик
            }
        }
        
        // Если не попали по пузырю, сбрасываем комбо
        if (!bubblePopped) {
            this.comboCount = 0;
        }
    }

    /**
     * Проверяет переход на следующий уровень
     */
    checkLevelUp() {
        if (this.levelProgress >= this.levelTarget) {
            this.levelUp();
        }
    }
    
    /**
     * Переход на следующий уровень
     */
    levelUp() {
        this.level++;
        this.levelProgress = 0;
        this.levelTarget = Math.round(this.levelTarget * 1.5); // Увеличиваем цель для следующего уровня
        this.bubbleSpawnRate = Math.max(200, this.bubbleSpawnRate * 0.9); // Увеличиваем скорость появления пузырей
        
        // Воспроизводим звук перехода на новый уровень
        this.audio.playSound('levelUp');
        
        // Обновляем UI
        document.getElementById('level').textContent = this.level;
        document.getElementById('progress-bar').style.width = '0%';
        
        // Обновляем статистику
        if (this.level > this.stats.maxLevel) {
            this.stats.maxLevel = this.level;
            this.saveStats();
        }
        
        // Создаем эффект перехода на новый уровень
        this.createLevelUpEffect();
    }

    /**
     * Создает визуальный эффект перехода на новый уровень
     */
    createLevelUpEffect() {
        // Здесь можно добавить визуальные эффекты для перехода на новый уровень
        // Например, вспышку экрана или появление текста "Level Up!"
    }

    /**
     * Запускает игру
     */
    start() {
        console.log('Game.start() called');
        this.isGameOver = false;
        this.isPaused = false;
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.bubbles = [];
        this.comboCount = 0;
        this.comboTimer = 0;
        this.levelProgress = 0;
        this.levelTarget = 500;
        this.bubbleSpawnRate = 1000;
        this.timeScale = 1;
        this.pointsMultiplier = 1;
        
        // Сбрасываем все эффекты
        clearTimeout(this.effectTimers.slowTime);
        clearTimeout(this.effectTimers.doublePoints);
        this.isSlowTime = false;
        this.isDoublePoints = false;
        
        // Создаем несколько пузырей сразу при старте игры
        console.log('Creating initial bubbles...');
        for (let i = 0; i < 10; i++) {
            this.spawnBubble();
        }
        
        // Запускаем фоновую музыку
        this.audio.playMusic();
        
        // Обновляем UI
        document.getElementById('score').textContent = '0';
        document.getElementById('level').textContent = '1';
        document.getElementById('progress-bar').style.width = '0%';
        
        // Обновляем статистику
        this.stats.totalGames++;
        this.saveStats();
        
        // Запускаем игровой цикл
        console.log('Starting game loop...');
        this.lastFrameTime = performance.now();
        requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
    }

    /**
     * Приостанавливает или возобновляет игру
     */
    togglePause() {
        this.isPaused = !this.isPaused;
        if (!this.isPaused) {
            this.lastFrameTime = performance.now();
            requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
        }
    }

    /**
     * Завершает игру
     */
    gameOver() {
        // Если активирован режим бессмертия, не завершаем игру
        if (this.isImmortal) {
            // Восстанавливаем жизни
            this.lives = 999;
            // Показываем уведомление
            this.showSecretCodeNotification('БЕССМЕРТИЕ АКТИВИРОВАНО!');
            return;
        }
        
        this.isGameOver = true;
        
        // Воспроизводим звук окончания игры
        this.audio.playSound('gameOver');
        
        // Останавливаем фоновую музыку
        this.audio.stopMusic();
        
        // Обновляем статистику
        if (this.score > this.stats.bestScore) {
            this.stats.bestScore = this.score;
            this.saveStats();
        }
        
        // Показываем экран окончания игры
        document.getElementById('game-screen').classList.add('hidden');
        document.getElementById('game-over-screen').classList.remove('hidden');
        document.getElementById('final-score').textContent = this.score;
    }

    /**
     * Замедляет время в игре
     * @param {number} duration - Продолжительность эффекта в миллисекундах
     */
    slowTime(duration) {
        this.isSlowTime = true;
        this.timeScale = 0.5;
        
        // Сбрасываем предыдущий таймер, если он был
        clearTimeout(this.effectTimers.slowTime);
        
        // Устанавливаем новый таймер
        this.effectTimers.slowTime = setTimeout(() => {
            this.isSlowTime = false;
            this.timeScale = 1;
        }, duration);
    }

    /**
     * Удваивает получаемые очки
     * @param {number} duration - Продолжительность эффекта в миллисекундах
     */
    doublePoints(duration) {
        this.isDoublePoints = true;
        this.pointsMultiplier = 2;
        
        // Сбрасываем предыдущий таймер, если он был
        clearTimeout(this.effectTimers.doublePoints);
        
        // Устанавливаем новый таймер
        this.effectTimers.doublePoints = setTimeout(() => {
            this.isDoublePoints = false;
            this.pointsMultiplier = 1;
        }, duration);
    }

    /**
     * Добавляет дополнительную жизнь
     */
    addLife() {
        this.lives++;
    }

    /**
     * Создает новый пузырь
     */
    spawnBubble() {
        console.log('Spawning bubble...');
        
        // Определяем радиус пузыря с учетом режима гигантских пузырей
        let radius = Math.random() * 20 + 20; // Радиус от 20 до 40
        if (this.easterEggs.giantBubbles) {
            radius *= 1.5; // Увеличиваем размер для режима гигантских пузырей
        }
        
        // Создаем пузырь в нижней части экрана, но в видимой области
        const x = Math.random() * (this.canvas.width - radius * 2) + radius;
        const y = this.canvas.height - radius; // Пузырь появляется внизу экрана, но виден
        
        console.log(`Bubble position: x=${x}, y=${y}, radius=${radius}`);
        console.log(`Canvas dimensions: width=${this.canvas.width}, height=${this.canvas.height}`);
        
        // Определяем тип пузыря на основе вероятностей
        let type = 'normal';
        const rand = Math.random();
        
        // Увеличиваем шанс появления специальных пузырей, если игрок нашел секреты
        const specialBonus = this.stats.secretsFound * 0.01; // +1% за каждый найденный секрет
        
        if (rand < (0.05 + specialBonus)) {
            type = 'special';
        } else if (rand < (0.15 + specialBonus)) {
            type = 'rare';
        } else if (rand < 0.25) {
            type = 'obstacle';
        }
        
        console.log(`Bubble type: ${type}`);
        
        const bubble = new Bubble(x, y, radius, type, this);
        
        // Устанавливаем начальную скорость пузыря с учетом режима антигравитации
        const baseSpeed = Math.random() * 2 + 1;
        bubble.velocityY = this.easterEggs.antiGravity ? baseSpeed : -baseSpeed;
        
        // Если активирован радужный режим, делаем пузырь радужным
        if (this.easterEggs.rainbowMode) {
            bubble.isRainbow = true;
        }
        
        // Если у игрока высокий уровень, добавляем дополнительные эффекты
        if (this.level >= 5) {
            // Увеличиваем скорость пузырей с каждым уровнем
            bubble.velocityY *= (1 + (this.level - 5) * 0.05);
            
            // Добавляем случайное вращение для пузырей
            bubble.rotationSpeed = (Math.random() - 0.5) * 0.1;
        }
        
        this.bubbles.push(bubble);
        console.log(`Total bubbles: ${this.bubbles.length}`);
    }

    /**
     * Основной игровой цикл
     * @param {number} timestamp - Временная метка текущего кадра
     */
    gameLoop(timestamp) {
        if (this.isGameOver || this.isPaused) {
            console.log('Game is over or paused, not running game loop');
            return;
        }
        
        // Рассчитываем дельту времени между кадрами
        const deltaTime = (timestamp - this.lastFrameTime) * this.timeScale;
        this.lastFrameTime = timestamp;
        
        console.log(`Game loop running, deltaTime: ${deltaTime}ms`);
        
        // Очищаем канвас
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Обновляем таймер появления пузырей
        this.bubbleSpawnTimer += deltaTime;
        console.log(`Bubble spawn timer: ${this.bubbleSpawnTimer}ms, spawn rate: ${this.bubbleSpawnRate}ms`);
        
        if (this.bubbleSpawnTimer >= this.bubbleSpawnRate) {
            this.spawnBubble();
            this.bubbleSpawnTimer = 0;
        }
        
        // Обновляем таймер комбо
        if (this.comboTimer > 0) {
            this.comboTimer -= deltaTime;
            if (this.comboTimer <= 0) {
                this.comboCount = 0;
            }
        }
        
        // Обновляем и отрисовываем пузыри
        console.log(`Updating and drawing ${this.bubbles.length} bubbles`);
        
        for (let i = this.bubbles.length - 1; i >= 0; i--) {
            const bubble = this.bubbles[i];
            bubble.update();
            bubble.draw(this.ctx);
            
            // Удаляем лопнувшие пузыри
            if (bubble.popped) {
                this.bubbles.splice(i, 1);
                console.log('Removed popped bubble');
            }
            // Удаляем пузыри, которые вышли за пределы экрана сверху
            else if (bubble.y + bubble.radius < -100) {
                this.bubbles.splice(i, 1);
                console.log('Removed bubble that went off screen at top');
                
                // Если это не был пузырь-препятствие, теряем жизнь (если не активирован чит бессмертия)
                if (bubble.type !== 'obstacle') {
                    // Проверяем, активирован ли чит бессмертия
                    if (!this.easterEggs.immortal && !this.easterEggs.godMode && !this.secretCodes.life) {
                        this.lives--;
                        console.log(`Lost a life, lives remaining: ${this.lives}`);
                    } else {
                        console.log('Immortality cheat active - no life lost!');
                    }
                    
                    if (this.lives <= 0) {
                        this.gameOver();
                        return;
                    }
                }
            }
        }
        
        // Отрисовываем эффекты
        this.drawEffects();
        
        // Продолжаем игровой цикл
        requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
    }

    /**
     * Отрисовывает активные эффекты
     */
    drawEffects() {
        // Отрисовываем индикатор замедления времени
        if (this.isSlowTime) {
            this.ctx.fillStyle = 'rgba(0, 100, 255, 0.2)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
        // Отрисовываем индикатор удвоения очков
        if (this.isDoublePoints) {
            this.ctx.fillStyle = 'rgba(255, 215, 0, 0.2)';
            this.ctx.fillRect(0, 0, this.canvas.width, 5);
        }
        
        // Отрисовываем текущее комбо
        if (this.comboCount > 1) {
            this.ctx.font = '24px Arial';
            this.ctx.fillStyle = 'rgba(255, 100, 100, 0.8)';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(`Комбо x${this.comboCount}`, this.canvas.width / 2, 30);
        }
        
        // Отрисовываем количество жизней
        this.ctx.font = '20px Arial';
        this.ctx.fillStyle = 'rgba(255, 50, 50, 0.8)';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`❤️ ${this.lives}`, 10, 30);
    }
}