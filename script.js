const questionElement = document.getElementById("question");
const answerButtons = document.getElementById("answer-buttons");
const nextButton = document.getElementById("next-btn");
const progressBar = document.getElementById("progress-bar");

const setupContainer = document.getElementById("setup-container");
const quizSection = document.getElementById("quiz-section");
const categorySelect = document.getElementById("category-select");
const startButton = document.getElementById("start-btn");

const loadingElement = document.getElementById("loading");
const errorElement = document.getElementById("error");

let questions = [];
let currentQuestionIndex = 0;
let score = 0;

// ✅ Fetch questions from API
async function fetchQuestions(category) {
  showLoading(true);
  startButton.disabled = true; 
  questionElement.innerHTML = ""; // ✅ clear question text while loading
  try {
    errorElement.style.display = "none";
    const url = `https://opentdb.com/api.php?amount=10&category=${category}&type=multiple`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.response_code !== 0 || !data.results.length) {
      throw new Error("No questions found.");
    }
    questions = data.results.map(q => formatQuestion(q));
    startQuiz();
    showLoading(false); // ✅ hide only after first question is ready
  } catch (error) {
    console.error(error);
    showError("⚠️ Couldn’t load questions. Please try again.");
    showLoading(false); // ✅ also hide if error
  } finally {
    startButton.disabled = false;
  }
}

// ✅ Show or hide loading message
function showLoading(isLoading) {
  loadingElement.style.display = isLoading ? "block" : "none";
}

// ✅ Show error message
function showError(message) {
  errorElement.innerHTML = message;
  errorElement.style.display = "block";
  questionElement.innerHTML = "";
  answerButtons.innerHTML = "";
  nextButton.style.display = "none";
}

// ✅ Format question
function formatQuestion(q) {
  const answers = [...q.incorrect_answers.map(a => decodeHTML(a)), decodeHTML(q.correct_answer)];
  shuffleArray(answers);
  return {
    question: decodeHTML(q.question),
    answers: answers.map(ans => ({
      text: ans,
      correct: ans === decodeHTML(q.correct_answer)
    }))
  };
}

// ✅ Decode HTML entities
function decodeHTML(str) {
  const txt = document.createElement("textarea");
  txt.innerHTML = str;
  return txt.value;
}

// ✅ Shuffle answers
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function startQuiz() {
  setupContainer.style.display = "none";
  quizSection.style.display = "block";
  currentQuestionIndex = 0;
  score = 0;
  nextButton.innerHTML = "Next";
  updateProgressBar();
  showQuestion();
}

function showQuestion() {
  resetState();
  let currentQuestion = questions[currentQuestionIndex];
  questionElement.innerHTML = currentQuestion.question;

  currentQuestion.answers.forEach(answer => {
    const button = document.createElement("button");
    button.innerHTML = answer.text;
    button.classList.add("btn");
    answerButtons.appendChild(button);
    if (answer.correct) {
      button.dataset.correct = answer.correct;
    }
    button.addEventListener("click", selectAnswer);
  });

  updateProgressBar();
}

function resetState() {
  nextButton.style.display = "none";
  while (answerButtons.firstChild) {
    answerButtons.removeChild(answerButtons.firstChild);
  }
}

function selectAnswer(e) {
  const selectedBtn = e.target;
  const isCorrect = selectedBtn.dataset.correct === "true";
  if (isCorrect) {
    selectedBtn.style.background = "#2ecc71";
    score++;
  } else {
    selectedBtn.style.background = "#e74c3c";
  }
  Array.from(answerButtons.children).forEach(button => {
    if (button.dataset.correct === "true") {
      button.style.background = "#2ecc71";
    }
    button.disabled = true;
  });
  nextButton.style.display = "block";

  // ✅ update progress bar after answering
  progressBar.style.width = ((currentQuestionIndex + 1) / questions.length) * 100 + "%";
}

function showScore() {
  resetState();
  questionElement.innerHTML = `You scored ${score} out of ${questions.length}! 🎉`;
  progressBar.style.width = "100%";
  nextButton.innerHTML = "Play Again";
  nextButton.style.display = "block";
}

function handleNextButton() {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    showQuestion();
  } else {
    showScore();
  }
}

function updateProgressBar() {
  let progress = (currentQuestionIndex / questions.length) * 100;
  progressBar.style.width = progress + "%";
}

nextButton.addEventListener("click", () => {
  if (currentQuestionIndex < questions.length) {
    handleNextButton();
  } else {
    // Restart → back to setup screen
    quizSection.style.display = "none";
    setupContainer.style.display = "block";
  }
});

// ✅ Start Button
startButton.addEventListener("click", () => {
  const selectedCategory = categorySelect.value;
  fetchQuestions(selectedCategory);
});
