import React, { useState, useEffect, useCallback } from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import Question from './Question';
import Result from './Result';
import QuestionUpload from './QuestionUpload';
import QuestionSetSelector from './QuestionSetSelector';
import Stats from './Stats';
import BookmarkedQuestions from './BookmarkedQuestions';
import { theme } from '../theme';
import ReviewQuestions from './ReviewQuestions';
import StarredQuestionsList from './StarredQuestionsList';

const slideIn = keyframes`
  from { transform: translateX(20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
`;

const QuizContainer = styled.div`
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
`;

const QuizHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 10;
  backdrop-filter: blur(8px);
`;

const QuizTitle = styled.h1`
  font-size: 2rem;
  color: ${theme.colors.textPrimary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  span {
    color: ${theme.colors.primary};
    font-weight: 600;
  }
`;

const QuizProgress = styled.div`
  text-align: center;
  color: ${theme.colors.textSecondary};
`;

const ProgressBar = styled.div`
  width: 200px;
  height: 8px;
  background: ${theme.colors.background};
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  width: ${props => (props.progress * 100)}%;
  height: 100%;
  background: ${theme.colors.primary};
  transition: width 0.3s ease;
`;

const QuizControls = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
`;

const QuizButton = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  background: ${props => {
    if (props.variant === 'primary') return theme.colors.primary;
    if (props.variant === 'danger') return theme.colors.danger;
    return theme.colors.background;
  }};
  
  color: ${props => props.variant ? 'white' : theme.colors.textPrimary};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
`;

const Timer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  color: ${theme.colors.textPrimary};
  padding: 0.5rem 1rem;
  background: ${theme.colors.background};
  border-radius: 8px;
  
  svg {
    width: 20px;
    height: 20px;
    color: ${theme.colors.primary};
  }
`;

const QuestionContainer = styled.div`
  margin-bottom: 2rem;
`;

const QuestionText = styled.h3`
  margin-bottom: 1.5rem;
  color: ${theme.colors.text};
`;

const ChoicesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ChoiceButton = styled.button`
  padding: 1rem;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  background: ${theme.colors.background};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${theme.colors.primary}10;
    border-color: ${theme.colors.primary};
  }
`;

const ResultsContainer = styled.div`
  text-align: center;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  background: ${theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.md};
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: ${theme.colors.primaryDark};
  }
`;

const SavedQuizTitle = styled.div`
  font-size: 1.1rem;
  color: ${theme.colors.textPrimary};
  margin-bottom: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  span {
    color: ${theme.colors.primary};
    font-weight: 500;
  }
`;

const SavedQuizList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const SavedQuizItem = styled.div`
  padding: 1.25rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const SavedQuizInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  
  h3 {
    margin: 0;
    color: ${theme.colors.textPrimary};
    font-size: 1.1rem;
  }
  
  p {
    margin: 0;
    color: ${theme.colors.textSecondary};
    font-size: 0.9rem;
  }
`;

const SavedQuizActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const QuizResult = styled.div`
  padding: 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  animation: ${fadeIn} 0.3s ease-out;
  
  h2 {
    margin: 0 0 1.5rem;
    color: ${theme.colors.textPrimary};
    text-align: center;
  }
`;

const ResultStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  padding: 1.25rem;
  background: ${theme.colors.background};
  border-radius: 12px;
  text-align: center;
  
  h3 {
    margin: 0 0 0.5rem;
    color: ${theme.colors.textSecondary};
    font-size: 0.9rem;
    font-weight: 500;
  }
  
  p {
    margin: 0;
    color: ${theme.colors.textPrimary};
    font-size: 1.5rem;
    font-weight: 600;
  }
`;

const Title = styled.h2`
  font-size: 1.5rem;
  color: ${theme.colors.textPrimary};
  margin-bottom: 1.5rem;
  font-weight: 600;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const QuizInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: white;
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.md};
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${theme.colors.textSecondary};
  font-size: 0.9rem;
  
  span:first-of-type {
    font-size: 1.2rem;
  }
`;

const StarButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: ${props => props.isStarred ? theme.colors.warning : theme.colors.border};
  transition: ${theme.transitions.default};
  
  &:hover {
    transform: scale(1.1);
  }
`;

const IconButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  transition: ${theme.transitions.default};
  
  &:hover {
    transform: scale(1.1);
  }
`;

const PauseOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${theme.colors.overlay};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: ${theme.zIndex.modal};
  backdrop-filter: blur(4px);
`;

const PauseMenu = styled.div`
  background: white;
  padding: 2rem;
  border-radius: ${theme.borderRadius.xl};
  box-shadow: ${theme.shadows.xl};
  text-align: center;
  max-width: 400px;
  width: 90%;
`;

const PauseTitle = styled.h3`
  font-size: 1.5rem;
  color: ${theme.colors.textPrimary};
  margin-bottom: 1.5rem;
`;

const PauseButton = styled(Button)`
  width: 100%;
  margin-bottom: 1rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SavedQuizCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.md};
  margin-bottom: 1rem;
`;

const SavedQuizMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const QuizHistoryCard = styled(SavedQuizCard)``;

const QuizHistoryInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const QuizHistoryScore = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${theme.colors.primary};
`;

const QuizHistoryMeta = styled.div`
  color: ${theme.colors.textSecondary};
  font-size: 0.9rem;
`;

const formatTime = (seconds) => {
  if (!seconds) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const ReportedQuestionsSection = styled.div`
  margin-top: 2rem;
  padding: 1.5rem;
  background: white;
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.md};
`;

const ReportedQuestionCard = styled.div`
  padding: 1rem;
  margin: 1rem 0;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  background: ${theme.colors.background};

  &:first-of-type {
    margin-top: 0;
  }
`;

const ReportedQuestionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const ReportedQuestionStatus = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: ${theme.borderRadius.sm};
  font-size: 0.875rem;
  font-weight: 500;
  
  ${props => {
    switch (props.status) {
      case 'pending':
        return `
          background: ${theme.colors.warning}20;
          color: ${theme.colors.warning};
        `;
      case 'reviewed':
        return `
          background: ${theme.colors.info}20;
          color: ${theme.colors.info};
        `;
      case 'fixed':
        return `
          background: ${theme.colors.success}20;
          color: ${theme.colors.success};
        `;
      case 'invalid':
        return `
          background: ${theme.colors.danger}20;
          color: ${theme.colors.danger};
        `;
      default:
        return '';
    }
  }}
`;

const NextButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: ${theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.md};
  font-weight: 500;
  cursor: pointer;
  transition: ${theme.transitions.default};
  margin-top: 1rem;

  &:hover {
    background: ${theme.colors.primary}dd;
    transform: translateY(-2px);
  }

  &:disabled {
    background: ${theme.colors.border};
    cursor: not-allowed;
    transform: none;
  }
`;

const ExplanationBox = styled.div`
  margin-top: 2rem;
  padding: 1.5rem;
  background: ${theme.colors.background};
  border-radius: 12px;
  border-left: 4px solid ${theme.colors.primary};

  h4 {
    margin: 0 0 1rem;
    color: ${theme.colors.textPrimary};
    font-size: 1.1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  p {
    margin: 0;
    color: ${theme.colors.textSecondary};
    line-height: 1.6;
  }
`;

const Quiz = ({ questions: initialQuestions, onClose, selectedFolder, setSelectedFolder, savedQuizId: initialSavedQuizId }) => {
  const [questions, setQuestions] = useState(initialQuestions);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [userAnswers, setUserAnswers] = useState([]);
  const [questionTimes, setQuestionTimes] = useState([]);
  const [timer, setTimer] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [quizStats, setQuizStats] = useState(null);
  const [isStarred, setIsStarred] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [savedQuizId, setSavedQuizId] = useState(initialSavedQuizId);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showNextButton, setShowNextButton] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(null);

  useEffect(() => {
    // Initialize quiz state from initialQuestions
    setQuestions(initialQuestions);
    setSavedQuizId(initialSavedQuizId);
    
    // Check if this is a saved quiz being resumed
    if (initialSavedQuizId) {
      const savedQuiz = localStorage.getItem(`savedQuiz_${initialSavedQuizId}`);
      if (savedQuiz) {
        const quizState = JSON.parse(savedQuiz);
        setCurrentQuestion(quizState.currentQuestion || 0);
        setScore(quizState.score || 0);
        setUserAnswers(quizState.userAnswers || []);
        setQuestionTimes(quizState.questionTimes || []);
        setTimer(quizState.timer || 0);
        setStartTime(quizState.startTime || Date.now());
        setIsPaused(false);
        setSelectedOption(quizState.selectedOption || null);
        setShowAnswer(quizState.showAnswer || false);
        setQuestionStartTime(quizState.startTime || Date.now());
        
        // Set the folder from the saved quiz state
        if (quizState.folder) {
          setSelectedFolder(quizState.folder);
        }
        
        // Update questions with folder information
        if (quizState.questions) {
          setQuestions(quizState.questions.map(q => ({
            ...q,
            folder: quizState.folder || selectedFolder
          })));
        }
      }
    } else {
      // If not a saved quiz, initialize with new state
      setCurrentQuestion(0);
      setScore(0);
      setUserAnswers([]);
      setQuestionTimes([]);
      setTimer(0);
      setStartTime(Date.now());
      setShowResults(false);
      setSelectedOption(null);
      setShowAnswer(false);
      setQuestionStartTime(Date.now());
    }
  }, [initialSavedQuizId, initialQuestions, setSelectedFolder, selectedFolder]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!showResults && !isPaused) {
        setTimer(prev => prev + 1);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [showResults, isPaused]);

  useEffect(() => {
    // Check if current question is starred
    if (selectedFolder && questions[currentQuestion]) {
      const starredQuestions = JSON.parse(localStorage.getItem(`starredQuestions_${selectedFolder}`) || '[]');
      const questionId = `${selectedFolder}-${currentQuestion}`;
      setIsStarred(starredQuestions.includes(questionId));
    }
  }, [currentQuestion, selectedFolder, questions]);

  const handleAnswerSelect = (answer) => {
    if (isPaused) return;

    const endTime = Date.now();
    const timeSpent = (endTime - questionStartTime) / 1000;
    
    setSelectedOption(answer);
    setShowAnswer(true);
    setShowNextButton(true);

    // Update the answers and times
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestion] = answer;
    setUserAnswers(newAnswers);

    const newTimes = [...questionTimes];
    newTimes[currentQuestion] = timeSpent;
    setQuestionTimes(newTimes);

    // Update score if answer is correct
    const correctAnswer = questions[currentQuestion].choices.find(c => c.isCorrect)?.text;
    if (answer === correctAnswer) {
      setScore(score + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
      setShowAnswer(false);
      setShowNextButton(false);
      setQuestionStartTime(Date.now());
    } else {
      handleQuizComplete();
    }
  };

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
  };

  const handleSkipQuestion = () => {
    setUserAnswers([...userAnswers, null]);
    setQuestionTimes([...questionTimes, timer]);
    setSelectedOption(null);
    setShowAnswer(false);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setTimer(0);
    } else {
      handleQuizComplete();
    }
  };

  const saveQuizForLater = () => {
    const quizState = {
      questions: questions.map(q => ({
        ...q,
        folder: selectedFolder
      })),
      currentQuestion,
      score,
      userAnswers,
      questionTimes,
      timer,
      startTime,
      timestamp: Date.now(),
      folder: selectedFolder,
      isScheduledQuiz: questions[0]?.quizId ? true : false,
      quizId: questions[0]?.quizId,
      selectedOption,
      showAnswer,
      isPaused: true
    };

    // Use the existing quiz ID if available, otherwise generate a new one
    const quizId = savedQuizId || Date.now().toString(36);
    localStorage.setItem(`savedQuiz_${quizId}`, JSON.stringify(quizState));
    setSavedQuizId(quizId);
    onClose();
  };

  const resumeQuiz = (quizId) => {
    const savedQuiz = localStorage.getItem(`savedQuiz_${quizId}`);
    if (savedQuiz) {
      const quizState = JSON.parse(savedQuiz);
      setCurrentQuestion(quizState.currentQuestion);
      setScore(quizState.score);
      setUserAnswers(quizState.userAnswers);
      setQuestionTimes(quizState.questionTimes);
      setTimer(quizState.timer);
      setStartTime(quizState.startTime);
      setSavedQuizId(quizId);
      setIsPaused(false);
      setSelectedOption(quizState.selectedOption || null);
      setShowAnswer(quizState.showAnswer || false);
      setQuestionStartTime(quizState.startTime || Date.now());
      
      // Set the folder from the saved quiz state
      if (quizState.folder) {
        setSelectedFolder(quizState.folder);
      }
      
      // Update questions with folder information
      if (quizState.questions) {
        setQuestions(quizState.questions.map(q => ({
          ...q,
          folder: quizState.folder
        })));
      }
    }
  };

  const calculateAverageTime = (times) => {
    return Math.round(times.reduce((a, b) => a + b, 0) / times.length);
  };

  const handleQuizComplete = () => {
    const endTime = Date.now();
    const totalTime = Math.floor((endTime - startTime) / 1000);
    const correctAnswers = userAnswers.filter((answer, index) => {
      const question = questions[index];
      if (!question || !question.choices) return false;
      const correctChoice = question.choices.find(c => c.isCorrect);
      return answer === correctChoice?.text;
    }).length;
    
    // Calculate quiz stats
    const stats = {
      totalQuestions: questions.length,
      correctAnswers,
      incorrectAnswers: questions.length - correctAnswers,
      accuracy: (correctAnswers / questions.length) * 100,
      totalTime,
      averageTimePerQuestion: Math.round(totalTime / questions.length),
      userAnswers,
      questionTimes,
      folder: selectedFolder,
      timestamp: Date.now()
    };

    // Save folder stats
    const folderStatsKey = `quizStats_${selectedFolder}`;
    const existingFolderStats = JSON.parse(localStorage.getItem(folderStatsKey) || '{}');
    const updatedFolderStats = {
      totalQuestions: (existingFolderStats.totalQuestions || 0) + questions.length,
      correctAnswers: (existingFolderStats.correctAnswers || 0) + correctAnswers,
      averageTime: Math.round(((existingFolderStats.averageTime || 0) * (existingFolderStats.quizzesCompleted || 0) + totalTime) / ((existingFolderStats.quizzesCompleted || 0) + 1)),
      bestTime: Math.min(existingFolderStats.bestTime || Infinity, totalTime),
      quizzesCompleted: (existingFolderStats.quizzesCompleted || 0) + 1,
      totalTime: (existingFolderStats.totalTime || 0) + totalTime,
      lastQuizDate: Date.now()
    };
    localStorage.setItem(folderStatsKey, JSON.stringify(updatedFolderStats));

    // Save file stats if questions are from a file
    const fileName = questions[0]?.fileName;
    if (fileName) {
      const fileStatsKey = `fileStats_${selectedFolder}_${fileName}`;
      const existingFileStats = JSON.parse(localStorage.getItem(fileStatsKey) || '{}');
      const currentAccuracy = (correctAnswers / questions.length) * 100;
      const updatedFileStats = {
        totalQuestions: (existingFileStats.totalQuestions || 0) + questions.length,
        correctAnswers: (existingFileStats.correctAnswers || 0) + correctAnswers,
        averageTime: Math.round(((existingFileStats.averageTime || 0) * (existingFileStats.attempts || 0) + totalTime) / ((existingFileStats.attempts || 0) + 1)),
        bestTime: Math.min(existingFileStats.bestTime || Infinity, totalTime),
        bestScore: Math.max(existingFileStats.bestScore || 0, currentAccuracy),
        attempts: (existingFileStats.attempts || 0) + 1,
        lastAttemptDate: Date.now()
      };
      localStorage.setItem(fileStatsKey, JSON.stringify(updatedFileStats));
    }

    // Mark scheduled quiz as completed if applicable
    if (questions[0]?.quizId) {
      const completedQuizzes = JSON.parse(localStorage.getItem('completedScheduledQuizzes') || '[]');
      if (!completedQuizzes.includes(questions[0].quizId)) {
        completedQuizzes.push(questions[0].quizId);
        localStorage.setItem('completedScheduledQuizzes', JSON.stringify(completedQuizzes));
      }
    }

    setQuizStats(stats);
    setShowResults(true);
  };

  const handleToggleStar = useCallback((questionIndex = currentQuestion) => {
    if (!selectedFolder || !questions[questionIndex]) return;

    const questionId = `${selectedFolder}-${questionIndex}`;
    const starredQuestions = JSON.parse(localStorage.getItem(`starredQuestions_${selectedFolder}`) || '[]');
    
    const newStarred = starredQuestions.includes(questionId)
      ? starredQuestions.filter(id => id !== questionId)
      : [...starredQuestions, questionId];
    
    localStorage.setItem(`starredQuestions_${selectedFolder}`, JSON.stringify(newStarred));
    
    if (questionIndex === currentQuestion) {
      setIsStarred(!starredQuestions.includes(questionId));
    }
  }, [selectedFolder, currentQuestion, questions]);

  const currentQuestionObj = questions[currentQuestion];

  return (
    <QuizContainer>
      {!showResults ? (
        <div>
          <QuizHeader>
            <QuizTitle>Welcome to QuizCraft!</QuizTitle>
            <QuizControls>
              <QuizInfo>
                <InfoItem>
                  <span>⏱️</span>
                  {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                </InfoItem>
                <InfoItem>
                  <span>🎯</span>
                  Score: {score} / {currentQuestion + (selectedOption ? 1 : 0)}
                </InfoItem>
                <InfoItem>
                  <span>📊</span>
                  {Math.round((score / (currentQuestion + (selectedOption ? 1 : 0))) * 100) || 0}%
                </InfoItem>
              </QuizInfo>
              <QuizButton onClick={handlePauseResume}>
                {isPaused ? '▶️ Resume' : '⏸️ Pause'}
              </QuizButton>
              <QuizButton onClick={handleSkipQuestion}>
                ⏭️ Skip
              </QuizButton>
              <QuizButton onClick={saveQuizForLater}>
                💾 Save
              </QuizButton>
            </QuizControls>
          </QuizHeader>

          {isPaused ? (
            <PauseOverlay>
              <PauseMenu>
                <PauseTitle>Quiz Paused</PauseTitle>
                <PauseButton onClick={handlePauseResume}>Resume Quiz</PauseButton>
                <PauseButton onClick={saveQuizForLater}>Save for Later</PauseButton>
                <PauseButton onClick={onClose}>Exit Quiz</PauseButton>
              </PauseMenu>
            </PauseOverlay>
          ) : (
            <>
              <Question
                question={currentQuestionObj.question}
                options={currentQuestionObj.choices}
                selectedOption={selectedOption}
                showAnswer={showAnswer}
                correctOption={currentQuestionObj.choices.find(c => c.isCorrect)?.text}
                onSelectOption={handleAnswerSelect}
                questionNumber={currentQuestion + 1}
                isStarred={isStarred}
                onToggleStar={handleToggleStar}
                folder={selectedFolder}
                fileName={currentQuestionObj.fileName}
                onReportQuestion={(reason) => {
                  const report = {
                    question: currentQuestionObj,
                    reason,
                    timestamp: new Date().toISOString(),
                    status: 'pending'
                  };
                  const reports = JSON.parse(localStorage.getItem('questionReports') || '[]');
                  reports.push(report);
                  localStorage.setItem('questionReports', JSON.stringify(reports));
                }}
              />

              <QuizProgress>
                <ProgressBar>
                  <ProgressFill progress={(currentQuestion + 1) / questions.length} />
                </ProgressBar>
                <div>
                  Progress: {currentQuestion + 1} / {questions.length}
                  {selectedOption && (
                    <span style={{ marginLeft: '1rem', color: showAnswer && selectedOption === currentQuestionObj.choices.find(c => c.isCorrect)?.text ? theme.colors.success : theme.colors.danger }}>
                      {showAnswer && selectedOption === currentQuestionObj.choices.find(c => c.isCorrect)?.text ? '✓ Correct' : '✗ Incorrect'}
                    </span>
                  )}
                </div>
              </QuizProgress>
            </>
          )}
        </div>
      ) : (
        <QuizResult>
          <h2>Quiz Complete!</h2>
          <ResultStats>
            <StatCard>
              <h3>Final Score</h3>
              <p>{quizStats.correctAnswers} / {quizStats.totalQuestions}</p>
              <span style={{ color: theme.colors.textSecondary, fontSize: '0.9rem' }}>
                ({Math.round(quizStats.accuracy)}% Accuracy)
              </span>
            </StatCard>
            <StatCard>
              <h3>Average Time</h3>
              <p>{quizStats.averageTimePerQuestion}s</p>
              <span style={{ color: theme.colors.textSecondary, fontSize: '0.9rem' }}>
                per question
              </span>
            </StatCard>
            <StatCard>
              <h3>Total Time</h3>
              <p>{Math.floor(quizStats.totalTime / 60)}:{(quizStats.totalTime % 60).toString().padStart(2, '0')}</p>
              <span style={{ color: theme.colors.textSecondary, fontSize: '0.9rem' }}>
                minutes
              </span>
            </StatCard>
          </ResultStats>
          <ReviewQuestions
            questions={questions}
            userAnswers={userAnswers}
            starredQuestions={JSON.parse(localStorage.getItem(`starredQuestions_${selectedFolder}`) || '[]')}
            onToggleStar={handleToggleStar}
            selectedFolder={selectedFolder}
          />
          <ActionButtons>
            <Button onClick={onClose}>Close</Button>
          </ActionButtons>
        </QuizResult>
      )}
      
      {showAnswer && (
        <>
          {currentQuestionObj.explanation && (
            <ExplanationBox>
              <h4>Explanation</h4>
              <p>{currentQuestionObj.explanation}</p>
            </ExplanationBox>
          )}
          <NextButton 
            onClick={handleNextQuestion}
            disabled={!showNextButton}
          >
            {currentQuestion < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
          </NextButton>
        </>
      )}
    </QuizContainer>
  );
};

export default Quiz;
