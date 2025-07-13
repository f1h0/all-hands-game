/**
 * Инициализация игры при загрузке страницы
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded');
    
    // Получаем элемент канваса
    const canvas = document.getElementById('game-canvas');
    console.log('Canvas element:', canvas);
    
    // Создаем экземпляр игры
    const game = new Game(canvas);
    console.log('Game instance created');
    
    // Создаем экземпляр UI
    const ui = new UI(game);
    console.log('UI instance created');
    
    // Обработчик клавиш для управления игрой с клавиатуры
    document.addEventListener('keydown', (e) => {
        console.log('Key pressed:', e.key);
        // Пауза по клавише Escape
        if (e.key === 'Escape') {
            if (game.isPaused) {
                ui.resumeGame();
            } else if (!game.isGameOver) {
                ui.pauseGame();
            }
        }
    });
    
    // Проверяем, что стартовый экран отображается
    console.log('Start screen visible:', !document.getElementById('start-screen').classList.contains('hidden'));
    
    console.log('Bubble Pop Game initialized!');
});