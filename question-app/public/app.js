// DOM elements
const categorySelect = document.getElementById('category-select');
const getQuestionButton = document.getElementById('get-question');
const questionContainer = document.getElementById('question-container');
const questionText = document.getElementById('question-text');
const answersList = document.getElementById('answers');
const submitAnswerButton = document.getElementById('submit-answer');
const nextQuestionButton = document.getElementById('next-question'); // Added next question button

let selectedAnswer = null;
let selectedQuestionId = null;
let correctAnswer = null;
let currentCategoryId = null; // Store the current category ID for "Next Question"

// Load categories from the server and populate the dropdown list
async function loadCategories() {
    try {
        const response = await fetch('/categories');
        const categories = await response.json();
        
        // Clear existing categories
        categorySelect.innerHTML = '';
        
        // Add a default placeholder option
        const placeholderOption = document.createElement('option');
        placeholderOption.textContent = 'Select a category';
        placeholderOption.disabled = true;
        placeholderOption.selected = true;
        categorySelect.appendChild(placeholderOption);
        
        // Populate the dropdown with categories
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Load a random question from the selected category
async function loadQuestion(categoryId) {
    try {
        const response = await fetch(`/question/${categoryId}?count=1`);
        const questionData = await response.json();

        // If no question is returned
        if (!questionData || questionData.length === 0) {
            alert('No questions available for the selected category.');
            return;
        }

        const question = questionData[0];
        selectedQuestionId = question.id;
        correctAnswer = question[`option_${question.correct_option}`]; // Get correct answer
        currentCategoryId = categoryId; // Store category for next question

        // Display the question text
        questionText.textContent = question.question_text;

        // Randomize the answers
        const answers = [question.option_1, question.option_2, question.option_3, question.option_4];
        shuffleArray(answers);

        // Display the answers
        answersList.innerHTML = '';
        answers.forEach(answer => {
            const answerButton = document.createElement('button');
            answerButton.textContent = answer;
            answerButton.onclick = () => handleAnswerSelection(answer);
            answersList.appendChild(answerButton);
        });

        // Show the question container & hide "Next Question" button until answer is selected
        questionContainer.style.display = 'block';
        nextQuestionButton.style.display = 'none';
    } catch (error) {
        console.error('Error loading question:', error);
    }
}

// Shuffle the answers array to randomize the order
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
}

// Handle answer selection
function handleAnswerSelection(answer) {
    selectedAnswer = answer;
    const answerButtons = answersList.querySelectorAll('button');
    answerButtons.forEach(button => {
        button.disabled = true; // Disable all answer buttons once selected
    });
}

// Submit the selected answer for evaluation
async function submitAnswer() {
    if (!selectedAnswer || !selectedQuestionId) {
        alert('Please select an answer.');
        return;
    }

    try {
        const response = await fetch('/submit-answer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                answer: selectedAnswer,
                questionId: selectedQuestionId
            })
        });

        const data = await response.json();
        if (data.correct) {
            alert('Correct Answer!');
            highlightAnswer(selectedAnswer, true);
        } else {
            alert('Wrong Answer!');
            highlightAnswer(selectedAnswer, false);
        }

        // Show "Next Question" button after answer is submitted
        nextQuestionButton.style.display = 'block';
    } catch (error) {
        console.error('Error submitting answer:', error);
    }
}

// Highlight the answer and indicate correct/wrong
function highlightAnswer(answer, isCorrect) {
    const answerButtons = answersList.querySelectorAll('button');
    answerButtons.forEach(button => {
        if (button.textContent === answer) {
            button.style.backgroundColor = isCorrect ? 'green' : 'red'; // Green for correct, red for wrong
        } else if (button.textContent === correctAnswer) {
            button.style.backgroundColor = 'green'; // Always highlight correct answer
        }
    });
}

// Load next question when "Next Question" button is clicked
function loadNextQuestion() {
    if (!currentCategoryId) {
        alert('Please select a category first.');
        return;
    }
    
    // Reset UI for new question
    selectedAnswer = null;
    selectedQuestionId = null;
    correctAnswer = null;
    answersList.innerHTML = '';
    questionText.textContent = '';

    // Load new question from the same category
    loadQuestion(currentCategoryId);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    loadCategories();

    getQuestionButton.addEventListener('click', () => {
        const selectedCategory = categorySelect.value;
        if (selectedCategory) {
            loadQuestion(selectedCategory);
        } else {
            alert('Please select a category');
        }
    });

    submitAnswerButton.addEventListener('click', submitAnswer);
    nextQuestionButton.addEventListener('click', loadNextQuestion);
});
