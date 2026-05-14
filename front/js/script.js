const API_BASE = 'http://127.0.0.1:8000';

// DOM элементы
const startScreen = document.getElementById('startScreen');
const quizScreen = document.getElementById('quizScreen');
const startBtn = document.getElementById('startBtn');
const addBtn = document.getElementById('addBtn');
const modalOverlay = document.getElementById('modalOverlay');
const cancelBtn = document.getElementById('cancelBtn');
const addQuestionForm = document.getElementById('addQuestionForm');
const questionText = document.getElementById('questionText');
const answersContainer = document.getElementById('answersContainer');
const feedback = document.getElementById('feedback');
const nextBtn = document.getElementById('nextBtn');
const formError = document.getElementById('formError');
const categorySelect = document.getElementById('category');

let currentCorrectAnswer = null;

// Обработчики событий
startBtn.addEventListener('click', startQuiz);
addBtn.addEventListener('click', openModal);
cancelBtn.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
});
nextBtn.addEventListener('click', loadNextQuestion);
addQuestionForm.addEventListener('submit', handleAddQuestion);

/**
 * Запуск викторины
 */
function startQuiz() {
    startScreen.style.display = 'none';
    quizScreen.style.display = 'block';
    loadNextQuestion();
}

/**
 * Загрузка следующего вопроса с сервера
 */
async function loadNextQuestion() {
    resetQuizState();
    
    try {
        const response = await fetch(`${API_BASE}/question`);
        if (!response.ok) throw new Error('Ошибка загрузки вопроса');
        
        const data = await response.json();
        displayQuestion(data);
    } catch (error) {
        showError('Не удалось загрузить вопрос. Проверьте соединение с сервером.');
        console.error('Error:', error);
    }
}

/**
 * Отображение вопроса и вариантов ответов
 * @param {Object} data - данные вопроса от API
 */
function displayQuestion(data) {
    questionText.textContent = data.body;
    currentCorrectAnswer = data.answer;
    
    // Берём не более 3 неправильных ответов + 1 правильный = 4 всего
    const incorrectAnswers = data.other_answers ? data.other_answers.slice(0, 3) : [];
    const allAnswers = [...incorrectAnswers, data.answer];
    const shuffled = shuffleArray(allAnswers).slice(0, 4);
    
    shuffled.forEach(answer => {
        const btn = document.createElement('button');
        btn.className = 'answer-btn';
        btn.textContent = answer;
        btn.addEventListener('click', () => handleAnswerSelect(btn, answer));
        answersContainer.appendChild(btn);
    });
}

/**
 * Обработка выбора ответа пользователем
 * @param {HTMLElement} selectedBtn - нажатая кнопка
 * @param {string} selectedAnswer - текст выбранного ответа
 */
function handleAnswerSelect(selectedBtn, selectedAnswer) {
    const buttons = answersContainer.querySelectorAll('.answer-btn');
    buttons.forEach(btn => btn.disabled = true);
    
    if (selectedAnswer === currentCorrectAnswer) {
        selectedBtn.classList.add('correct');
        showFeedback('Правильно! 🎉', 'success');
    } else {
        selectedBtn.classList.add('incorrect');
        // Подсвечиваем правильный ответ
        buttons.forEach(btn => {
            if (btn.textContent === currentCorrectAnswer) {
                btn.classList.add('correct');
            }
        });
        showFeedback('Неправильно. Попробуйте следующий вопрос!', 'error');
    }
    
    nextBtn.classList.add('visible');
}

/**
 * Сброс состояния викторины перед новым вопросом
 */
function resetQuizState() {
    questionText.textContent = '';
    answersContainer.innerHTML = '';
    feedback.className = 'feedback';
    feedback.style.display = 'none';
    nextBtn.classList.remove('visible');
    currentCorrectAnswer = null;
}

/**
 * Показать сообщение с обратной связью
 * @param {string} message - текст сообщения
 * @param {string} type - 'success' или 'error'
 */
function showFeedback(message, type) {
    feedback.textContent = message;
    feedback.className = `feedback ${type}`;
    feedback.style.display = 'block';
}

/**
 * Показать ошибку
 * @param {string} message - текст ошибки
 */
function showError(message) {
    feedback.textContent = message;
    feedback.className = 'feedback error';
    feedback.style.display = 'block';
}

/**
 * Перемешивание массива (алгоритм Фишера-Йетса)
 * @param {Array} array - массив для перемешивания
 * @returns {Array} перемешанный массив
 */
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Открытие модального окна
 */
function openModal() {
    modalOverlay.classList.add('active');
    addQuestionForm.reset();
    formError.classList.remove('visible');
    categorySelect.value = '';
}

/**
 * Закрытие модального окна
 */
function closeModal() {
    modalOverlay.classList.remove('active');
}

/**
 * Обработка отправки формы добавления вопроса
 * @param {Event} e - событие submit
 */
async function handleAddQuestion(e) {
    e.preventDefault();
    formError.classList.remove('visible');
    
    const category = categorySelect.value;
    const topic = document.getElementById('topic').value.trim();
    const body = document.getElementById('body').value.trim();
    const answer = document.getElementById('answer').value.trim();
    
    // Валидация
    if (!category) {
        formError.textContent = 'Выберите категорию';
        formError.classList.add('visible');
        return;
    }
    if (!topic || !body || !answer) {
        formError.textContent = 'Заполните все поля';
        formError.classList.add('visible');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/add_question`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                topic,
                body,
                answer,
                category  // "char" или "events"
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || 'Ошибка при создании вопроса');
        }
        
        closeModal();
        alert('Вопрос успешно добавлен!');
        addQuestionForm.reset();
    } catch (error) {
        formError.textContent = error.message || 'Не удалось добавить вопрос. Проверьте соединение с сервером.';
        formError.classList.add('visible');
        console.error('Error:', error);
    }
}
