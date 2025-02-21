import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { theme } from '../theme';

const Container = styled.div`
  padding: 2rem;
  background: white;
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.md};
`;

const QuizList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
`;

const QuizCard = styled.div`
  padding: 1.5rem;
  background: ${theme.colors.background};
  border-radius: ${theme.borderRadius.md};
  border: 1px solid ${theme.colors.border};
  transition: ${theme.transitions.default};

  &:hover {
    box-shadow: ${theme.shadows.md};
    transform: translateY(-2px);
  }
`;

const QuizHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const QuizTitle = styled.h3`
  margin: 0;
  color: ${theme.colors.textPrimary};
  font-size: ${theme.typography.fontSize.lg};
`;

const QuizTimestamp = styled.span`
  color: ${theme.colors.textSecondary};
  font-size: ${theme.typography.fontSize.sm};
`;

const QuizStats = styled.div`
  display: flex;
  gap: 2rem;
  margin-bottom: 1rem;
  color: ${theme.colors.textSecondary};
  font-size: ${theme.typography.fontSize.sm};
`;

const QuizActions = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: ${theme.borderRadius.md};
  cursor: pointer;
  font-size: ${theme.typography.fontSize.sm};
  transition: ${theme.transitions.default};
  
  background: ${props => props.variant === 'primary' ? theme.colors.primary : theme.colors.background};
  color: ${props => props.variant === 'primary' ? 'white' : theme.colors.textPrimary};
  border: 1px solid ${props => props.variant === 'primary' ? 'transparent' : theme.colors.border};

  &:hover {
    transform: translateY(-1px);
    box-shadow: ${theme.shadows.sm};
    background: ${props => props.variant === 'primary' ? theme.colors.primary + 'dd' : theme.colors.background + 'dd'};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: ${theme.colors.textSecondary};
`;

const TabContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid ${theme.colors.border};
  padding-bottom: 1rem;
`;

const TabButton = styled.button`
  padding: 0.5rem 1rem;
  background: none;
  border: none;
  border-bottom: 2px solid ${props => props.active ? theme.colors.primary : 'transparent'};
  color: ${props => props.active ? theme.colors.primary : theme.colors.textSecondary};
  cursor: pointer;
  transition: ${theme.transitions.default};
  font-weight: ${props => props.active ? 500 : 400};

  &:hover {
    color: ${theme.colors.primary};
  }
`;

const CreateQuizButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: ${theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.md};
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  transition: ${theme.transitions.default};

  &:hover {
    background: ${theme.colors.primaryHover};
    transform: translateY(-1px);
  }
`;

const ScheduledQuizzesHeader = styled.h2`
  font-size: 1.5rem;
  color: ${theme.colors.textPrimary};
`;

const ScheduledQuizzes = ({ onStartQuiz }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = () => {
    // Get all quizzes from localStorage
    const allQuizzes = [];
    console.log('Starting to load quizzes...');
    console.log('All localStorage keys:', Object.keys(localStorage));
    
    // First, get all saved quiz states
    const savedStates = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('savedQuiz_')) {
        try {
          const quizId = key.replace('savedQuiz_', '');
          const savedState = localStorage.getItem(key);
          const parsedState = JSON.parse(savedState);
          if (parsedState && parsedState.questions) {
            savedStates[quizId] = parsedState;
            console.log('Found valid saved state for quiz:', quizId);
          }
        } catch (e) {
          console.error('Invalid saved state:', e);
        }
      }
    }
    console.log('All saved states:', savedStates);

    // Then load the quizzes and match with saved states
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('generatedQuiz_')) {
        try {
          console.log('Found quiz with key:', key);
          const quizId = key.replace('generatedQuiz_', '');
          const quiz = JSON.parse(localStorage.getItem(key));
          
          // Check if there's a saved state for this quiz
          const savedState = savedStates[quizId];
          console.log('Checking saved state for quiz:', quizId);
          console.log('Saved state exists:', !!savedState);
          
          // Check if there's a saved state directly
          const hasSavedState = localStorage.getItem(`savedQuiz_${quizId}`) !== null;
          console.log('Direct check for saved state:', hasSavedState);
          
          const quizData = {
            id: quizId,
            ...quiz,
            completed: false,
            hasSavedState: hasSavedState,
            currentQuestion: savedState ? savedState.currentQuestion : 0,
            score: savedState ? savedState.score : 0
          };
          console.log('Quiz data:', quizData);
          allQuizzes.push(quizData);
        } catch (e) {
          console.error('Error loading quiz:', key, e);
        }
      }
    }

    // Get completed quizzes
    const completedQuizzes = JSON.parse(localStorage.getItem('completedScheduledQuizzes') || '[]');
    console.log('Completed quizzes:', completedQuizzes);
    
    // Mark completed quizzes
    allQuizzes.forEach(quiz => {
      quiz.completed = completedQuizzes.includes(quiz.id);
      // Double check saved state
      quiz.hasSavedState = localStorage.getItem(`savedQuiz_${quiz.id}`) !== null;
      console.log(`Quiz ${quiz.id} completed status:`, quiz.completed);
      console.log(`Quiz ${quiz.id} has saved state:`, quiz.hasSavedState);
    });

    // Sort by timestamp
    allQuizzes.sort((a, b) => b.timestamp - a.timestamp);
    console.log('Final quizzes state:', allQuizzes);
    setQuizzes(allQuizzes);
  };

  const handleStartQuiz = (quiz) => {
    console.log('Starting/Resuming quiz:', quiz);
    
    if (!quiz || !quiz.questions || quiz.questions.length === 0) {
      console.error('Invalid quiz data:', quiz);
      alert('No questions available in this quiz');
      return;
    }

    // Check if there's a saved state for this quiz
    console.log('Checking for saved state of quiz:', quiz.id);
    const savedStateKey = `savedQuiz_${quiz.id}`;
    const savedState = localStorage.getItem(savedStateKey);
    console.log('Saved state key:', savedStateKey);
    console.log('Found saved state:', !!savedState);
    
    if (savedState) {
      try {
        console.log('Parsing saved state...');
        const savedQuiz = JSON.parse(savedState);
        console.log('Saved quiz data:', savedQuiz);
        onStartQuiz(savedQuiz.questions, savedQuiz.folder, quiz.id);
        return;
      } catch (error) {
        console.error('Error parsing saved quiz state:', error);
        // If there's an error with the saved state, fall back to original quiz
        console.log('Falling back to original quiz state');
      }
    }

    // If no saved state or error occurred, process questions as normal
    console.log('Processing original quiz questions...');
    const processedQuestions = quiz.questions.map(q => {
      // Ensure choices are properly formatted
      const choices = q.choices.map((choice, index) => {
        if (typeof choice === 'string') {
          // If choice is a string, convert it to object format
          return {
            text: choice,
            isCorrect: index === parseInt(q.correctAnswer) - 1 || 
                      String.fromCharCode(65 + index) === q.correctAnswer
          };
        }
        return choice;
      });

      return {
        ...q,
        quizId: quiz.id,
        question: q.question,
        choices: choices,
        // Ensure other necessary properties are present
        explanation: q.explanation || '',
        category: q.category || '',
        difficulty: q.difficulty || 'medium',
        folder: q.folder
      };
    });

    console.log('Processed questions:', processedQuestions);
    // Start the quiz with the processed questions, folder, and quiz ID
    onStartQuiz(processedQuestions, processedQuestions[0]?.folder || 'Default', quiz.id);
  };

  const deleteQuiz = (quizId) => {
    console.log('Deleting quiz:', quizId);
    // Remove both the quiz and its saved state
    localStorage.removeItem(`generatedQuiz_${quizId}`);
    localStorage.removeItem(`savedQuiz_${quizId}`);
    loadQuizzes();
  };

  const createScheduledQuiz = () => {
    // Get all starred questions from all folders
    const folders = JSON.parse(localStorage.getItem('questionFolders') || '[]');
    let allStarredQuestions = [];

    folders.forEach(folder => {
      const starredIds = JSON.parse(localStorage.getItem(`starredQuestions_${folder}`) || '[]');
      const files = JSON.parse(localStorage.getItem(`questionFiles_${folder}`) || '{}');

      Object.entries(files).forEach(([fileName, fileData]) => {
        const starredFromFile = fileData.questions.filter((_, index) => 
          starredIds.includes(`${folder}-${index}`)
        ).map(q => ({
          ...q,
          folder,
          fileName
        }));

        allStarredQuestions = [...allStarredQuestions, ...starredFromFile];
      });
    });

    if (allStarredQuestions.length === 0) {
      alert('Please star some questions first to create a scheduled quiz.');
      return;
    }

    // Shuffle questions and take 30 (or less if not enough starred questions)
    const shuffled = allStarredQuestions.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(30, shuffled.length));

    // Generate a unique ID for this quiz
    const quizId = Date.now().toString(36);
    
    // Create the quiz
    const newQuiz = {
      questions: selected,
      timestamp: Date.now(),
      type: 'scheduled',
      folder: selected[0]?.folder || 'Default'
    };

    // Save to localStorage
    localStorage.setItem(`generatedQuiz_${quizId}`, JSON.stringify(newQuiz));
    
    // Reload quizzes
    loadQuizzes();
  };

  const filteredQuizzes = quizzes.filter(quiz => {
    if (activeTab === 'upcoming') {
      return !quiz.completed;
    } else {
      return quiz.completed;
    }
  });

  return (
    <Container>
      <ScheduledQuizzesHeader>Scheduled Quizzes in QuizCraft</ScheduledQuizzesHeader>
      <CreateQuizButton onClick={createScheduledQuiz}>
        <span>+</span> Create New Quiz
      </CreateQuizButton>

      <TabContainer>
        <TabButton 
          active={activeTab === 'upcoming'} 
          onClick={() => setActiveTab('upcoming')}
        >
          Upcoming Quizzes
        </TabButton>
        <TabButton 
          active={activeTab === 'completed'} 
          onClick={() => setActiveTab('completed')}
        >
          Completed Quizzes
        </TabButton>
      </TabContainer>

      <QuizList>
        {filteredQuizzes.length === 0 ? (
          <EmptyState>
            {activeTab === 'upcoming' 
              ? 'No upcoming scheduled quizzes' 
              : 'No completed quizzes yet'}
          </EmptyState>
        ) : (
          filteredQuizzes.map(quiz => (
            <QuizCard key={quiz.id}>
              <QuizHeader>
                <QuizTitle>Scheduled Quiz</QuizTitle>
                <QuizTimestamp>
                  {new Date(quiz.timestamp).toLocaleString()}
                </QuizTimestamp>
              </QuizHeader>
              <QuizStats>
                <span>📝 {quiz.questions.length} Questions</span>
                <span>🌟 From Starred Questions</span>
                {quiz.completed && <span>✅ Completed</span>}
              </QuizStats>
              <QuizActions>
                {!quiz.completed ? (
                  <Button 
                    variant="primary"
                    onClick={() => handleStartQuiz(quiz)}
                  >
                    {quiz.hasSavedState ? 'Resume Quiz' : 'Start Quiz'}
                  </Button>
                ) : (
                  <Button 
                    variant="primary"
                    onClick={() => handleStartQuiz(quiz)}
                  >
                    Review Quiz
                  </Button>
                )}
                <Button onClick={() => {
                  const url = `${window.location.origin}/quiz/${quiz.id}`;
                  navigator.clipboard.writeText(url);
                  alert('Quiz link copied to clipboard!');
                }}>
                  Copy Link
                </Button>
                <Button onClick={() => deleteQuiz(quiz.id)}>
                  Delete
                </Button>
              </QuizActions>
            </QuizCard>
          ))
        )}
      </QuizList>
    </Container>
  );
};

export default ScheduledQuizzes; 