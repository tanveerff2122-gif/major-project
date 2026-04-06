import { useState } from 'react';

const CS_QUESTIONS = [
  { question: "What does HTML stand for?", options: ["Hyper Text Markup Language", "High Text Machine Language", "Hyperlink and Text Markup Language", "Home Tool Markup Language"], answer: 0 },
  { question: "Which of the following is a JavaScript framework?", options: ["Django", "React", "Laravel", "Flask"], answer: 1 },
  { question: "What does CSS stand for?", options: ["Computer Style Sheets", "Creative Style Sheets", "Cascading Style Sheets", "Colorful Style Sheets"], answer: 2 },
  { question: "Which language is primarily used for Android app development?", options: ["Swift", "Kotlin", "Objective-C", "Ruby"], answer: 1 },
  { question: "What is the time complexity of binary search?", options: ["O(n)", "O(n log n)", "O(log n)", "O(1)"], answer: 2 },
  { question: "What does SQL stand for?", options: ["Structured Query Language", "Strong Question Language", "Structured Question Language", "Simple Query Language"], answer: 0 },
  { question: "Which data structure uses LIFO (Last In First Out)?", options: ["Queue", "Tree", "Stack", "Graph"], answer: 2 },
  { question: "What is the main function of a compiler?", options: ["Execute code", "Translate high-level code to machine code", "Debug code", "Store data"], answer: 1 },
  { question: "In Git, what command is used to save changes to the local repository?", options: ["git push", "git save", "git commit", "git add"], answer: 2 },
  { question: "What does API stand for?", options: ["Application Programming Interface", "Advanced Programming Interface", "Application Process Integration", "Automated Program Interface"], answer: 0 },
  { question: "Which of the following is NOT an operating system?", options: ["Linux", "Windows", "Oracle", "macOS"], answer: 2 },
  { question: "What is the primary purpose of Docker?", options: ["Database management", "Containerization", "UI Design", "Version Control"], answer: 1 },
  { question: "Which sorting algorithm is generally considered the fastest for large datasets?", options: ["Bubble Sort", "Insertion Sort", "Selection Sort", "Quick Sort"], answer: 3 },
  { question: "What does JSON stand for?", options: ["JavaScript Object Notation", "Java Standard Output Network", "JavaScript Output Name", "Java Source Open Network"], answer: 0 },
  { question: "Which HTTP method is typically used to update existing data?", options: ["GET", "POST", "PUT", "DELETE"], answer: 2 },
];

const TOTAL_QUESTIONS_PER_ROUND = 5;

const pickRandomQuestion = (exclude: number[]) => {
  const available = CS_QUESTIONS.map((_, i) => i).filter(i => !exclude.includes(i));
  if (available.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * available.length);
  return available[randomIndex];
};

export default function Quiz() {
  const [isActive, setIsActive] = useState(false);
  const [usedIndices, setUsedIndices] = useState<number[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);

  const startQuiz = () => {
    let currentUsed = usedIndices;
    // Reset if we don't have enough questions left for a round
    if (CS_QUESTIONS.length - currentUsed.length < TOTAL_QUESTIONS_PER_ROUND) {
      currentUsed = [];
      setUsedIndices([]);
    }
    
    const firstQ = pickRandomQuestion(currentUsed);
    if (firstQ !== null) {
      setCurrentQuestionIndex(firstQ);
      setUsedIndices([...currentUsed, firstQ]);
    }
    
    setIsActive(true);
    setScore(0);
    setQuestionsAnswered(0);
    setShowResult(false);
  };

  const handleAnswer = (selectedIndex: number) => {
    if (currentQuestionIndex === null) return;

    if (selectedIndex === CS_QUESTIONS[currentQuestionIndex].answer) {
      setScore(score + 1);
    }

    const nextAnsweredCount = questionsAnswered + 1;
    setQuestionsAnswered(nextAnsweredCount);

    if (nextAnsweredCount < TOTAL_QUESTIONS_PER_ROUND) {
      const nextQ = pickRandomQuestion(usedIndices);
      if (nextQ !== null) {
        setCurrentQuestionIndex(nextQ);
        setUsedIndices([...usedIndices, nextQ]);
      } else {
        setShowResult(true);
      }
    } else {
      setShowResult(true);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">CS & Coding Quiz</h1>
        <p className="text-gray-500 dark:text-gray-400">Test your computer science and programming knowledge.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 min-h-[400px] flex flex-col items-center justify-center">
        {!isActive && !showResult ? (
          <div className="text-center">
            <div className="text-6xl mb-6">💻</div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Ready for a quick coding challenge?</h2>
            <button
              onClick={startQuiz}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors text-lg"
            >
              Start Quiz
            </button>
          </div>
        ) : showResult ? (
          <div className="text-center">
            <div className="text-6xl mb-6">{score >= 3 ? '🎉' : '📚'}</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Quiz Completed!</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              You scored <span className="font-bold text-blue-600 dark:text-blue-400">{score}</span> out of {TOTAL_QUESTIONS_PER_ROUND}
            </p>
            <button
              onClick={startQuiz}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors"
            >
              Play Again
            </button>
          </div>
        ) : currentQuestionIndex !== null ? (
          <div className="w-full">
            <div className="flex justify-between items-center mb-6 text-sm font-medium text-gray-500 dark:text-gray-400">
              <span>Question {questionsAnswered + 1} of {TOTAL_QUESTIONS_PER_ROUND}</span>
              <span>Score: {score}</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-8">
              {CS_QUESTIONS[currentQuestionIndex].question}
            </h2>
            <div className="space-y-3">
              {CS_QUESTIONS[currentQuestionIndex].options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  className="w-full text-left p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-gray-700 dark:hover:border-gray-600 transition-colors text-gray-700 dark:text-gray-200"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
