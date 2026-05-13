const API_BASE = 'http://127.0.0.1:8000';

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

let currentCorrectAnswer = null;

startBtn.addEventListener('click', startQuiz);
addBtn.addEventListener('click', openModal);
cancelBtn.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
});
nextBtn.addEventListener('click', loadNextQuestion);
addQuestionForm.addEventListener('submit', handleAddQuestion);

function startQuiz() {
    startScreen.style.display = 'none';
    quizScreen.style.display = 'block';
    loadNextQuestion();
}

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

function displayQuestion(data) {
    questionText.textContent = data.body;
    currentCorrectAnswer = data.answer;
    
    // Берём не более 3 неправильных ответов + 1 правильный = всего 4
    const incorrectAnswers = data.other_answers.slice(0, 3);
    const allAnswers = [...incorrectAnswers, data.answer];
    
    // Перемешиваем и берём ровно 4 ответа (на случай, если неправильных < 3)
    const shuffled = shuffleArray(allAnswers).slice(0, 4);
    
    shuffled.forEach(answer => {
        const btn = document.createElement('button');
        btn.className = 'answer-btn';
        btn.textContent = answer;
        btn.addEventListener('click', () => handleAnswerSelect(btn, answer));
        answersContainer.appendChild(btn);
    });
}

function handleAnswerSelect(selectedBtn, selectedAnswer) {
    const buttons = answersContainer.querySelectorAll('.answer-btn');
    buttons.forEach(btn => btn.disabled = true);
    
    if (selectedAnswer === currentCorrectAnswer) {
        selectedBtn.classList.add('correct');
        showFeedback('Правильно! 🎉', 'success');
    } else {
        selectedBtn.classList.add('incorrect');
        buttons.forEach(btn => {
            if (btn.textContent === currentCorrectAnswer) {
                btn.classList.add('correct');
            }
        });
        showFeedback('Неправильно. Попробуйте следующий вопрос!', 'error');
    }
    
    nextBtn.classList.add('visible');
}

function resetQuizState() {
    questionText.textContent = '';
    answersContainer.innerHTML = '';
    feedback.className = 'feedback';
    feedback.style.display = 'none';
    nextBtn.classList.remove('visible');
    currentCorrectAnswer = null;
}

function showFeedback(message, type) {
    feedback.textContent = message;
    feedback.className = `feedback ${type}`;
    feedback.style.display = 'block';
}

function showError(message) {
    feedback.textContent = message;
    feedback.className = 'feedback error';
    feedback.style.display = 'block';
}

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function openModal() {
    modalOverlay.classList.add('active');
    addQuestionForm.reset();
    formError.classList.remove('visible');
}

function closeModal() {
    modalOverlay.classList.remove('active');
}

async function handleAddQuestion(e) {
    e.preventDefault();
    formError.classList.remove('visible');
    
    const topic = document.getElementById('topic').value.trim();
    const body = document.getElementById('body').value.trim();
    const answer = document.getElementById('answer').value.trim();
    
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
            body: JSON.stringify({ topic, body, answer })
        });
        
        if (!response.ok) throw new Error('Ошибка при создании вопроса');
        
        closeModal();
        alert('Вопрос успешно добавлен!');
    } catch (error) {
        formError.textContent = 'Не удалось добавить вопрос. Проверьте соединение с сервером.';
        formError.classList.add('visible');
        console.error('Error:', error);
    }
}
