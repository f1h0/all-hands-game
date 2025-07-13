/**
 * Класс для создания и управления пузырями
 */
class Bubble {
    /**
     * Создает новый пузырь
     * @param {number} x - X координата пузыря
     * @param {number} y - Y координата пузыря
     * @param {number} radius - Радиус пузыря
     * @param {string} type - Тип пузыря (normal, rare, special, obstacle)
     * @param {object} game - Ссылка на объект игры
     */
    constructor(x, y, radius, type, game) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.type = type;
        this.game = game;
        this.popped = false;
        this.opacity = 1;
        this.velocityX = (Math.random() - 0.5) * 2;
        this.velocityY = -Math.random() * 2 - 1;
        this.gravity = 0.03;
        this.friction = 0.98;
        this.popAnimationProgress = 0;
        this.isAnimatingPop = false;
        this.isHovered = false; // Флаг для отслеживания наведения мыши
        this.hoverScale = 1; // Масштаб при наведении
        this.originalRadius = radius; // Сохраняем оригинальный радиус
        this.glowIntensity = 0; // Интенсивность свечения
        this.rotationAngle = 0; // Угол вращения для эффектов
        this.sparkles = []; // Массив для хранения искр вокруг пузыря
        this.isRainbow = false; // Флаг радужного режима
        this.rainbowHue = Math.random() * 360; // Начальный цвет для радужного режима
        this.setPropertiesByType();
        
        // Создаем искры для специальных пузырей
        if (this.type === 'special' || this.type === 'rare') {
            this.createSparkles();
        }
    }

    /**
     * Устанавливает свойства пузыря в зависимости от его типа
     */
    setPropertiesByType() {
        switch (this.type) {
            case 'normal':
                this.color = 'rgba(0, 100, 255, 0.8)'; // Более яркий синий
                this.borderColor = 'rgba(0, 70, 225, 1.0)'; // Более темный синий
                this.points = 10;
                break;
            case 'rare':
                this.color = 'rgba(255, 215, 0, 0.8)'; // Более яркий золотой
                this.borderColor = 'rgba(225, 185, 0, 1.0)'; // Более темный золотой
                this.points = 30;
                break;
            case 'special':
                this.color = 'rgba(255, 0, 255, 0.8)'; // Более яркий розовый
                this.borderColor = 'rgba(225, 0, 225, 1.0)'; // Более темный розовый
                this.points = 50;
                this.specialEffect = this.getRandomSpecialEffect();
                break;
            case 'obstacle':
                this.color = 'rgba(255, 0, 0, 0.8)'; // Более яркий красный
                this.borderColor = 'rgba(225, 0, 0, 1.0)'; // Более темный красный
                this.points = -20;
                break;
            default:
                this.color = 'rgba(0, 100, 255, 0.8)'; // Более яркий синий
                this.borderColor = 'rgba(0, 70, 225, 1.0)'; // Более темный синий
                this.points = 10;
        }
    }

    /**
     * Возвращает случайный специальный эффект для пузыря
     * @returns {string} - Название специального эффекта
     */
    getRandomSpecialEffect() {
        const effects = ['slowTime', 'doublePoints', 'extraLife'];
        return effects[Math.floor(Math.random() * effects.length)];
    }

    /**
     * Создает искры вокруг пузыря
     */
    createSparkles() {
        const sparkleCount = this.type === 'special' ? 8 : 4;
        
        for (let i = 0; i < sparkleCount; i++) {
            this.sparkles.push({
                angle: Math.random() * Math.PI * 2,
                distance: this.radius * 1.2,
                size: Math.random() * 3 + 2,
                speed: Math.random() * 0.02 + 0.01,
                opacity: Math.random() * 0.5 + 0.5
            });
        }
    }
    
    /**
     * Обновляет состояние пузыря
     */
    update() {
        if (this.isAnimatingPop) {
            this.updatePopAnimation();
            return;
        }

        if (this.popped) return;

        // Обновляем эффект наведения
        if (this.isHovered) {
            // Плавно увеличиваем масштаб при наведении
            this.hoverScale += (1.15 - this.hoverScale) * 0.1;
            // Увеличиваем интенсивность свечения
            this.glowIntensity += (1 - this.glowIntensity) * 0.1;
        } else {
            // Плавно возвращаем масштаб к нормальному
            this.hoverScale += (1 - this.hoverScale) * 0.1;
            // Уменьшаем интенсивность свечения
            this.glowIntensity += (0 - this.glowIntensity) * 0.1;
        }
        
        // Обновляем угол вращения для эффектов
        this.rotationAngle += 0.02;
        
        // Обновляем искры
        for (let sparkle of this.sparkles) {
            sparkle.angle += sparkle.speed;
        }
        
        // Обновляем радужный цвет, если активирован радужный режим
        if (this.isRainbow) {
            this.rainbowHue = (this.rainbowHue + 1) % 360;
            this.color = `hsla(${this.rainbowHue}, 100%, 50%, 0.8)`;
            this.borderColor = `hsla(${this.rainbowHue}, 100%, 40%, 1.0)`;
        }

        // Применяем гравитацию и трение
        this.velocityY += this.gravity;
        this.velocityX *= this.friction;
        this.velocityY *= this.friction;

        // Обновляем позицию
        this.x += this.velocityX;
        this.y += this.velocityY;

        // Проверяем столкновение со стенами
        this.checkWallCollision();
    }

    /**
     * Проверяет столкновение пузыря со стенами
     */
    checkWallCollision() {
        const canvas = this.game.canvas;
        
        // Проверка столкновения с левой и правой стенами
        if (this.x - this.radius < 0) {
            this.x = this.radius;
            this.velocityX = -this.velocityX * 0.7;
        } else if (this.x + this.radius > canvas.width) {
            this.x = canvas.width - this.radius;
            this.velocityX = -this.velocityX * 0.7;
        }
        
        // Проверка столкновения с верхней и нижней стенами
        if (this.y - this.radius < 0) {
            this.y = this.radius;
            this.velocityY = -this.velocityY * 0.7;
        } else if (this.y + this.radius > canvas.height) {
            this.y = canvas.height - this.radius;
            this.velocityY = -this.velocityY * 0.7;
        }
    }

    /**
     * Обновляет анимацию лопания пузыря
     */
    updatePopAnimation() {
        this.popAnimationProgress += 0.1;
        if (this.popAnimationProgress >= 1) {
            this.popped = true;
            this.isAnimatingPop = false;
        }
    }

    /**
     * Проверяет, содержит ли пузырь указанную точку
     * @param {number} x - X координата точки
     * @param {number} y - Y координата точки
     * @param {number} extraRadius - Дополнительный радиус для увеличения области клика (по умолчанию 0)
     * @returns {boolean} - true, если точка внутри пузыря
     */
    containsPoint(x, y, extraRadius = 0) {
        const distance = Math.sqrt((this.x - x) ** 2 + (this.y - y) ** 2);
        // Учитываем эффект наведения при проверке попадания
        const effectiveRadius = this.radius * this.hoverScale + extraRadius;
        return distance <= effectiveRadius;
    }

    /**
     * Лопает пузырь
     */
    pop() {
        if (!this.popped && !this.isAnimatingPop) {
            this.isAnimatingPop = true;
            this.popAnimationProgress = 0;
            
            // Применяем специальный эффект, если это специальный пузырь
            if (this.type === 'special' && this.specialEffect) {
                this.applySpecialEffect();
            }
            
            return true;
        }
        return false;
    }

    /**
     * Применяет специальный эффект пузыря
     */
    applySpecialEffect() {
        switch (this.specialEffect) {
            case 'slowTime':
                this.game.slowTime(5000); // Замедление на 5 секунд
                break;
            case 'doublePoints':
                this.game.doublePoints(10000); // Удвоение очков на 10 секунд
                break;
            case 'extraLife':
                this.game.addLife();
                break;
        }
    }

    /**
     * Отрисовывает пузырь на канвасе
     * @param {CanvasRenderingContext2D} ctx - Контекст канваса
     */
    draw(ctx) {
        if (this.popped) return;

        ctx.save();
        
        if (this.isAnimatingPop) {
            // Анимация лопания
            const scale = 1 + this.popAnimationProgress * 0.5;
            const opacity = 1 - this.popAnimationProgress;
            
            ctx.globalAlpha = opacity;
            ctx.translate(this.x, this.y);
            ctx.scale(scale, scale);
            ctx.translate(-this.x, -this.y);
        } else {
            // Применяем эффект наведения
            ctx.translate(this.x, this.y);
            ctx.scale(this.hoverScale, this.hoverScale);
            ctx.translate(-this.x, -this.y);
        }

        // Рисуем свечение вокруг пузыря при наведении
        if (this.glowIntensity > 0.05) {
            const glowColor = this.type === 'special' ? 'rgba(255, 0, 255, ' : 
                             this.type === 'rare' ? 'rgba(255, 215, 0, ' :
                             this.type === 'obstacle' ? 'rgba(255, 0, 0, ' : 'rgba(0, 100, 255, ';
            
            ctx.shadowColor = glowColor + (this.glowIntensity * 0.7) + ')';
            ctx.shadowBlur = 15 + this.glowIntensity * 10;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
        } else {
            // Стандартная тень для лучшей видимости
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 10;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
        }

        // Рисуем основной пузырь
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        
        // Проверяем, активирован ли режим стеклянных пузырей
        if (this.game && this.game.easterEggs && this.game.easterEggs.glassMode) {
            // Создаем градиент для стеклянного эффекта
            const gradient = ctx.createRadialGradient(
                this.x - this.radius * 0.3, this.y - this.radius * 0.3, this.radius * 0.1,
                this.x, this.y, this.radius
            );
            
            // Определяем базовый цвет для стеклянного эффекта
            let baseColor;
            if (this.isRainbow || (this.game && this.game.easterEggs && this.game.easterEggs.rainbowMode)) {
                const hue = (Date.now() * 0.1 + this.x + this.y) % 360;
                baseColor = `hsl(${hue}, 100%, 70%)`;
            } else {
                // Извлекаем RGB компоненты из цвета пузыря
                const colorMatch = this.color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
                if (colorMatch) {
                    const r = parseInt(colorMatch[1]);
                    const g = parseInt(colorMatch[2]);
                    const b = parseInt(colorMatch[3]);
                    baseColor = `rgba(${r}, ${g}, ${b}, 0.7)`;
                } else {
                    baseColor = this.color;
                }
            }
            
            // Создаем стеклянный эффект с градиентом и прозрачностью
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)'); // Блик
            gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.5)');
            gradient.addColorStop(0.5, baseColor.replace(')', ', 0.6)').replace('rgb', 'rgba'));
            gradient.addColorStop(1, baseColor.replace(')', ', 0.4)').replace('rgb', 'rgba'));
            
            ctx.fillStyle = gradient;
            ctx.globalAlpha = 0.8; // Делаем пузырь полупрозрачным
        } 
        // Если активирован радужный режим, создаем радужный градиент
        else if (this.isRainbow || (this.game && this.game.easterEggs && this.game.easterEggs.rainbowMode)) {
            const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
            const hue = (Date.now() * 0.1 + this.x + this.y) % 360;
            gradient.addColorStop(0, `hsl(${hue}, 100%, 70%)`);
            gradient.addColorStop(0.5, `hsl(${(hue + 60) % 360}, 100%, 60%)`);
            gradient.addColorStop(1, `hsl(${(hue + 120) % 360}, 100%, 50%)`);
            ctx.fillStyle = gradient;
        } else {
            ctx.fillStyle = this.color;
        }
        
        ctx.fill();
        
        // Добавляем блик для стеклянного эффекта
        if (this.game && this.game.easterEggs && this.game.easterEggs.glassMode) {
            // Блик в верхней левой части
            ctx.beginPath();
            ctx.arc(this.x - this.radius * 0.3, this.y - this.radius * 0.3, this.radius * 0.2, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fill();
            
            // Маленький блик
            ctx.beginPath();
            ctx.arc(this.x + this.radius * 0.2, this.y - this.radius * 0.1, this.radius * 0.1, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.fill();
            
            // Восстанавливаем прозрачность
            ctx.globalAlpha = 1.0;
        }
        
        // Отключаем тень для границы
        ctx.shadowColor = 'transparent';
        
        // Рисуем границу пузыря
        ctx.strokeStyle = this.borderColor;
        ctx.lineWidth = 3; // Увеличиваем толщину границы
        ctx.stroke();
        
        // Рисуем блик на пузыре
        ctx.beginPath();
        ctx.arc(this.x - this.radius * 0.3, this.y - this.radius * 0.3, this.radius * 0.2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'; // Более яркий блик
        ctx.fill();
        
        // Рисуем искры вокруг специальных и редких пузырей
        if (this.type === 'special' || this.type === 'rare') {
            this.drawSparkles(ctx);
        }
        
        // Если это специальный пузырь, добавляем звездочку внутри
        if (this.type === 'special') {
            this.drawStar(ctx, this.x, this.y, 5, this.radius * 0.6, this.radius * 0.3); // Увеличиваем размер звезды
        }
        
        // Если это препятствие, добавляем крестик внутри
        if (this.type === 'obstacle') {
            this.drawCross(ctx, this.x, this.y, this.radius * 0.7); // Увеличиваем размер крестика
        }
        
        // Добавляем текст с очками внутри пузыря
        ctx.font = `bold ${Math.round(this.radius * 0.5)}px Arial`;
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.points.toString(), this.x, this.y);
        
        ctx.restore();
    }
    
    /**
     * Рисует искры вокруг пузыря
     * @param {CanvasRenderingContext2D} ctx - Контекст канваса
     */
    drawSparkles(ctx) {
        const sparkleColor = this.type === 'special' ? 'rgba(255, 0, 255, ' : 'rgba(255, 215, 0, ';
        
        for (let sparkle of this.sparkles) {
            const x = this.x + Math.cos(sparkle.angle + this.rotationAngle) * sparkle.distance;
            const y = this.y + Math.sin(sparkle.angle + this.rotationAngle) * sparkle.distance;
            
            ctx.beginPath();
            ctx.arc(x, y, sparkle.size, 0, Math.PI * 2);
            ctx.fillStyle = sparkleColor + sparkle.opacity + ')';
            ctx.fill();
        }
    }

    /**
     * Рисует звезду внутри пузыря
     * @param {CanvasRenderingContext2D} ctx - Контекст канваса
     * @param {number} cx - X координата центра звезды
     * @param {number} cy - Y координата центра звезды
     * @param {number} spikes - Количество лучей звезды
     * @param {number} outerRadius - Внешний радиус звезды
     * @param {number} innerRadius - Внутренний радиус звезды
     */
    drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
        let rot = Math.PI / 2 * 3;
        let x = cx;
        let y = cy;
        let step = Math.PI / spikes;

        ctx.beginPath();
        ctx.moveTo(cx, cy - outerRadius);
        
        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y);
            rot += step;

            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y);
            rot += step;
        }
        
        ctx.lineTo(cx, cy - outerRadius);
        ctx.closePath();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fill();
    }

    /**
     * Рисует крестик внутри пузыря
     * @param {CanvasRenderingContext2D} ctx - Контекст канваса
     * @param {number} cx - X координата центра крестика
     * @param {number} cy - Y координата центра крестика
     * @param {number} size - Размер крестика
     */
    drawCross(ctx, cx, cy, size) {
        ctx.beginPath();
        ctx.moveTo(cx - size / 2, cy - size / 2);
        ctx.lineTo(cx + size / 2, cy + size / 2);
        ctx.moveTo(cx + size / 2, cy - size / 2);
        ctx.lineTo(cx - size / 2, cy + size / 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 3;
        ctx.stroke();
    }
}