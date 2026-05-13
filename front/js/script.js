// Глобальная статистика
let stats = { correct: 0, wrong: 0, total: 0 };
let isAnswered = false;
let correctAnswerText = '';

/**
 * Перемешивание массива (алгоритм Фишера-Йейтса)
 */
function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

/**
 * Загрузка вопроса с API
 */
async function loadQuestion() {
    const btn = document.getElementById('loadBtn');
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const questionBox = document.getElementById('questionBox');

    btn.disabled = true;
    loading.classList.add('active');
    error.classList.remove('active');
    questionBox.classList.remove('active');
    isAnswered = false;

    try {
        const response = await fetch('http://127.0.0.1:8000/question', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            throw new Error(`HTTP ошибка: ${response.status}`);
        }

        const data = await response.json();
        renderQuestion(data);

    } catch (err) {
        console.error('Ошибка загрузки:', err);
        error.textContent = `⚠️ ${err.message}. Проверьте, что сервер запущен на :8000`;
        error.classList.add('active');
    } finally {
        btn.disabled = false;
        loading.classList.remove('active');
    }
}

/**
 * Отрисовка вопроса и кнопок ответов
 */
function renderQuestion(data) {
    const questionBox = document.getElementById('questionBox');
    const questionText = document.getElementById('questionText');
    const answersGrid = document.getElementById('answersGrid');
    const resultMessage = document.getElementById('resultMessage');
    const correctAnswerDiv = document.getElementById('correctAnswer');
    const retryBtn = document.getElementById('retryBtn');

    // Сброс интерфейса
    questionText.textContent = data.body || 'Вопрос не загружен';
    answersGrid.innerHTML = '';
    resultMessage.className = 'result-message';
    resultMessage.textContent = '';
    correctAnswerDiv.classList.remove('show');
    retryBtn.classList.remove('show');
    correctAnswerText = data.answer;

    // Формирование пула ответов: 1 правильный + 2 случайных неправильных
    let wrongAnswers = Array.isArray(data.other_answers) ? [...data.other_answers] : [];
    
    // Если мало неправильных ответов, добавляем заглушки
    while (wrongAnswers.length < 2) {
        wrongAnswers.push(`Вариант ${wrongAnswers.length + 1}`);
    }
    
    const selectedWrong = shuffle(wrongAnswers).slice(0, 2);
    
    const allAnswers = shuffle([
        { text: data.answer, isCorrect: true },
        { text: selectedWrong[0], isCorrect: false },
        { text: selectedWrong[1], isCorrect: false }
    ]);

    // Создание кнопок ответов
    allAnswers.forEach((ans) => {
        const btn = document.createElement('button');
        btn.className = 'answer-btn';
        btn.textContent = ans.text;
        btn.onclick = () => handleAnswer(btn, ans.isCorrect);
        answersGrid.appendChild(btn);
    });

    questionBox.classList.add('active');
}

/**
 * Обработка выбора ответа
 */
function handleAnswer(btn, isCorrect) {
    if (isAnswered) return;
    isAnswered = true;

    const buttons = document.querySelectorAll('.answer-btn');
    const resultMessage = document.getElementById('resultMessage');
    const correctAnswerDiv = document.getElementById('correctAnswer');
    const retryBtn = document.getElementById('retryBtn');

    // Блокируем все кнопки
    buttons.forEach(b => b.disabled = true);

    // Обновляем статистику
    stats.total++;
    
    if (isCorrect) {
        stats.correct++;
        btn.classList.add('correct');
        resultMessage.textContent = '🎉 Верно! Отличный ответ!';
        resultMessage.className = 'result-message success';
    } else {
        stats.wrong++;
        btn.classList.add('wrong');
        
        // Подсветить правильный ответ
        buttons.forEach(b => {
            if (b.textContent === correctAnswerText) {
                b.classList.add('correct');
            }
        });
        
        resultMessage.textContent = '😔 Неверно. Попробуйте следующий вопрос!';
        resultMessage.className = 'result-message error';
        correctAnswerDiv.textContent = `✅ Правильный ответ: ${correctAnswerText}`;
        correctAnswerDiv.classList.add('show');
    }

    // Обновляем статистику на странице
    document.getElementById('correctCount').textContent = stats.correct;
    document.getElementById('wrongCount').textContent = stats.wrong;
    document.getElementById('totalCount').textContent = stats.total;

    retryBtn.classList.add('show');
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    // Опционально: автозагрузка первого вопроса
    // loadQuestion();
});
