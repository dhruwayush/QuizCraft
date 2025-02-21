import React from 'react';
import styled from '@emotion/styled';
import { theme } from '../theme';

const HistoryContainer = styled.div`
  padding: 2rem;
  background: white;
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.md};
`;

const HistoryTitle = styled.h2`
  font-size: 1.5rem;
  color: ${theme.colors.textPrimary};
`;

const HistoryList = styled.ul`
  list-style-type: none;
  padding: 0;
`;

const HistoryItem = styled.li`
  padding: 1rem;
  border-bottom: 1px solid ${theme.colors.border};
  color: ${theme.colors.textSecondary};

  &:last-child {
    border-bottom: none;
  }
`;

const QuizHistory = () => {
  const quizzes = JSON.parse(localStorage.getItem('completedScheduledQuizzes') || '[]');

  return (
    <HistoryContainer>
      <HistoryTitle>Quiz History</HistoryTitle>
      <HistoryList>
        {quizzes.length === 0 ? (
          <HistoryItem>No quizzes taken yet.</HistoryItem>
        ) : (
          quizzes.map((quizId) => (
            <HistoryItem key={quizId}>
              Quiz ID: {quizId} - Completed on: {new Date().toLocaleString()}
            </HistoryItem>
          ))
        )}
      </HistoryList>
    </HistoryContainer>
  );
};

export default QuizHistory; 