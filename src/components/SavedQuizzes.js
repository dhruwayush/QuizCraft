import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { theme } from '../theme';

const SavedQuizzesContainer = styled.div`
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  color: ${theme.colors.textPrimary};
  margin-bottom: 1.5rem;
`;

const QuizGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const QuizCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.md};
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.lg};
  }
`;

const QuizInfo = styled.div`
  margin-bottom: 1rem;
`;

const QuizTitle = styled.h3`
  margin: 0 0 0.5rem;
  color: ${theme.colors.textPrimary};
  font-size: 1.1rem;
`;

const QuizMeta = styled.div`
  color: ${theme.colors.textSecondary};
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
`;

const QuizProgress = styled.div`
  color: ${theme.colors.primary};
  font-weight: 500;
  margin-bottom: 1rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: ${theme.borderRadius.md};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;
  
  background: ${props => props.variant === 'primary' ? theme.colors.primary : 'transparent'};
  color: ${props => props.variant === 'primary' ? 'white' : theme.colors.textPrimary};
  border: 1px solid ${props => props.variant === 'primary' ? 'transparent' : theme.colors.border};

  &:hover {
    background: ${props => props.variant === 'primary' ? theme.colors.primaryDark : theme.colors.background};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: ${theme.colors.textSecondary};
`;

const SavedQuizzes = ({ onResumeQuiz }) => {
  const [savedQuizzes, setSavedQuizzes] = useState([]);

  useEffect(() => {
    loadSavedQuizzes();
  }, []);

  const loadSavedQuizzes = () => {
    const quizzes = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('savedQuiz_')) {
        try {
          const quiz = JSON.parse(localStorage.getItem(key));
          quizzes.push({
            id: key.replace('savedQuiz_', ''),
            ...quiz
          });
        } catch (e) {
          console.error('Error loading saved quiz:', e);
        }
      }
    }
    // Sort by timestamp, most recent first
    quizzes.sort((a, b) => b.timestamp - a.timestamp);
    setSavedQuizzes(quizzes);
  };

  const handleResumeQuiz = (quiz) => {
    onResumeQuiz(quiz.questions, quiz.id, quiz.folder);
  };

  const handleDeleteQuiz = (quizId) => {
    if (window.confirm('Are you sure you want to delete this saved quiz?')) {
      localStorage.removeItem(`savedQuiz_${quizId}`);
      loadSavedQuizzes();
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  if (savedQuizzes.length === 0) {
    return (
      <SavedQuizzesContainer>
        <Title>Saved Quizzes</Title>
        <EmptyState>
          <p>No saved quizzes found.</p>
          <p>When you pause a quiz, you can save it to continue later.</p>
        </EmptyState>
      </SavedQuizzesContainer>
    );
  }

  return (
    <SavedQuizzesContainer>
      <Title>Saved Quizzes</Title>
      <QuizGrid>
        {savedQuizzes.map(quiz => (
          <QuizCard key={quiz.id}>
            <QuizInfo>
              <QuizTitle>Saved Quiz</QuizTitle>
              <QuizMeta>Saved on {formatDate(quiz.timestamp)}</QuizMeta>
              <QuizProgress>
                Progress: {quiz.currentQuestion + 1} / {quiz.questions.length} questions
              </QuizProgress>
              <QuizMeta>
                Current Score: {quiz.score} / {quiz.currentQuestion}
              </QuizMeta>
            </QuizInfo>
            <ButtonGroup>
              <Button variant="primary" onClick={() => handleResumeQuiz(quiz)}>
                Resume Quiz
              </Button>
              <Button onClick={() => handleDeleteQuiz(quiz.id)}>
                Delete
              </Button>
            </ButtonGroup>
          </QuizCard>
        ))}
      </QuizGrid>
    </SavedQuizzesContainer>
  );
};

export default SavedQuizzes; 