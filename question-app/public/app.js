// DOM elements
const categorySelect = document.getElementById('category-select'); // Select dropdown for categories
const getQuestionButton = document.getElementById('get-question'); // Button to fetch a question
const questionContainer = document.getElementById('question-container'); // Container to display the question
const questionText = document.getElementById('question-text'); // Text element to display the question
const answersList = document.getElementById('answers'); // List of answer buttons
const submitAnswerButton = document.getElementById('submit-answer'); // Button to submit the selected answer
const nextQuestionButton = document.getElementById('next-question'); // Button to load the next question (added functionality)

let selectedAnswer = null;  // Store the user's selected answer
let selectedQuestionId = null;  // Store the ID of the currently displayed question
let correctAnswer = null;  // Store the correct answer to the current question
let currentCategoryId = null;  // Store the current category ID for the "Next Question" functionality

// Load categories from the server and populate the dropdown list
async function loadCategories() {
    try {
        const response = await fetch('/categories');  // Fetch the categories from the server
        const categories = await response.json();  // Parse the response to JSON
        
        // Clear existing categories in case the list is being updated
        categorySelect.innerHTML = '';
        
        // Add a default placeholder option to the dropdown
        const placeholderOption = document.createElement('option');
        placeholderOption.textContent = 'Select a category';
        placeholderOption.disabled = true;
        placeholderOption.selected = true;
        categorySelect.appendChild(placeholderOption);
        
        // Populate the dropdown with categories fetched from the server
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;  // Set the value to the category's ID
            option.textContent = category.name;  // Display the category's name
            categorySelect.appendChild(option);  // Add each option to the dropdown
        });
    } catch (error) {
        console.error('Error loading categories:', error);  // Log any errors that occur while fetching categories
    }
}

// Load a random question from the selected category
async function loadQuestion(categoryId) {
    try {
        const response = await fetch(`/question/${categoryId}?count=1`);  // Fetch a random question from the selected category
        const questionData = await response.json();  // Parse the response to JSON

        // If no question is returned, alert the user
        if (!questionData || questionData.length === 0) {
            alert('No questions available for the selected category.');
            return;
        }

        const question = questionData[0];  // Get the first question from the response
        selectedQuestionId = question.id;  // Store the question ID for later use
        correctAnswer = question[`option_${question.correct_option}`];  // Get the correct answer for this question
        currentCategoryId = categoryId;  // Store the category ID for the "Next Question" button functionality

        // Display the question text on the page
        questionText.textContent = question.question_text;

        // Randomize the order of the answers so they appear in a different order each time
        const answers = [question.option_1, question.option_2, question.option_3, question.option_4];
        shuffleArray(answers);  // Shuffle the answers

        // Display the shuffled answers as clickable buttons
        answersList.innerHTML = '';  // Clear any previous answers
        answers.forEach(answer => {
            const answerButton = document.createElement('button');  // Create a button for each answer
            answerButton.textContent = answer;  // Set the button text to the answer
            answerButton.onclick = () => handleAnswerSelection(answer);  // Set the click handler for answer selection
            answersList.appendChild(answerButton);  // Append the button to the answers list
        });

        // Show the question container and hide the "Next Question" button until the answer is submitted
        questionContainer.style.display = 'block';
        nextQuestionButton.style.display = 'none';
    } catch (error) {
        console.error('Error loading question:', error);  // Log any errors that occur while fetching the question
    }
}

// Shuffle the answers array to randomize the order
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));  // Random index for swapping
        [array[i], array[j]] = [array[j], array[i]];  // Swap elements in the array
    }
}

// Handle answer selection (when the user clicks on an answer button)
function handleAnswerSelection(answer) {
    selectedAnswer = answer;  // Store the selected answer
    const answerButtons = answersList.querySelectorAll('button');  // Get all answer buttons
    answerButtons.forEach(button => {
        button.disabled = true;  // Disable all answer buttons once the user has selected an answer
    });
}

// Submit the selected answer for evaluation
async function submitAnswer() {
    if (!selectedAnswer || !selectedQuestionId) {
        alert('Please select an answer.');  // If no answer is selected, alert the user
        return;
    }

    try {
        const response = await fetch('/submit-answer', {
            method: 'POST',  // Send a POST request to submit the answer
            headers: {
                'Content-Type': 'application/json'  // Specify the content type as JSON
            },
            body: JSON.stringify({
                answer: selectedAnswer,  // Send the selected answer
                questionId: selectedQuestionId  // Send the question ID
            })
        });

        const data = await response.json();  // Parse the response to JSON
        if (data.correct) {
            alert('Correct Answer!');  // Notify the user if the answer was correct
            highlightAnswer(selectedAnswer, true);  // Highlight the answer in green (correct)
        } else {
            alert('Wrong Answer!');  // Notify the user if the answer was incorrect
            highlightAnswer(selectedAnswer, false);  // Highlight the answer in red (incorrect)
        }

        // Show the "Next Question" button after submitting the answer
        nextQuestionButton.style.display = 'block';
    } catch (error) {
        console.error('Error submitting answer:', error);  // Log any errors that occur while submitting the answer
    }
}

// Highlight the selected answer and indicate whether it's correct or incorrect
function highlightAnswer(answer, isCorrect) {
    const answerButtons = answersList.querySelectorAll('button');  // Get all answer buttons
    answerButtons.forEach(button => {
        if (button.textContent === answer) {
            button.style.backgroundColor = isCorrect ? 'green' : 'red';  // Green for correct, red for wrong
        } else if (button.textContent === correctAnswer) {
            button.style.backgroundColor = 'green';  // Always highlight the correct answer in green
        }
    });
}

// Load next question when "Next Question" button is clicked
function loadNextQuestion() {
    if (!currentCategoryId) {
        alert('Please select a category first.');  // If no category is selected, alert the user
        return;
    }

    // Reset the UI for the next question
    selectedAnswer = null;  // Reset the selected answer
    selectedQuestionId = null;  // Reset the selected question ID
    correctAnswer = null;  // Reset the correct answer
    answersList.innerHTML = '';  // Clear any previous answers
    questionText.textContent = '';  // Clear the previous question text

    // Load a new question from the same category
    loadQuestion(currentCategoryId);  // Fetch a new question from the current category
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    loadCategories();  // Load categories when the page is loaded

    // Handle the "Get Question" button click
    getQuestionButton.addEventListener('click', () => {
        const selectedCategory = categorySelect.value;  // Get the selected category
        if (selectedCategory) {
            loadQuestion(selectedCategory);  // Load a question for the selected category
        } else {
            alert('Please select a category');  // Alert the user if no category is selected
        }
    });

    // Handle the "Submit Answer" button click
    submitAnswerButton.addEventListener('click', submitAnswer);

    // Handle the "Next Question" button click
    nextQuestionButton.addEventListener('click', loadNextQuestion);
});
