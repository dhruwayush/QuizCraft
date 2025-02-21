import React, { useState } from 'react';
import styled from '@emotion/styled';
import { theme } from '../theme';

const ReviewContainer = styled.div`
  margin-top: 2rem;
  padding: 1rem;
  background-color: ${theme.colors.white};
  border-radius: ${theme.borderRadius.medium};
  box-shadow: ${theme.shadows.medium};
`;

const ReviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const FilterButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const FilterButton = styled.button`
  padding: 0.5rem 1rem;
  background: ${props => props.active ? theme.colors.primary : theme.colors.light};
  color: ${props => props.active ? theme.colors.white : theme.colors.dark};
  border: none;
  border-radius: ${theme.borderRadius.small};
  cursor: pointer;
  transition: ${theme.transitions.fast};

  &:hover {
    background: ${props => props.active ? theme.colors.primary : theme.colors.info};
    color: ${theme.colors.white};
  }
`;

const QuestionCard = styled.div`
  padding: 1rem;
  margin-bottom: 1rem;
  border: 1px solid ${theme.colors.light};
  border-radius: ${theme.borderRadius.medium};
  background-color: ${props => props.isCorrect ? '#e8f5e9' : props.isIncorrect ? '#ffebee' : theme.colors.white};
  transition: ${theme.transitions.default};

  &:hover {
    box-shadow: ${theme.shadows.small};
  }
`;

const QuestionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  background-color: ${theme.colors.light};
  border-radius: ${theme.borderRadius.small};
`;

const QuestionText = styled.div`
  font-weight: 500;
  margin: 1rem 0;
  font-size: 1.1rem;
  color: ${theme.colors.dark};
`;

const ChoiceList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-left: 1rem;
`;

const Choice = styled.div`
  padding: 0.75rem;
  border-radius: ${theme.borderRadius.small};
  background-color: ${props => {
    if (props.isCorrect) return '#e8f5e9';
    if (props.isSelected && !props.isCorrect) return '#ffebee';
    return 'transparent';
  }};
  color: ${props => {
    if (props.isCorrect) return '#2e7d32';
    if (props.isSelected && !props.isCorrect) return '#c62828';
    return 'inherit';
  }};
  border: 1px solid ${props => {
    if (props.isCorrect) return '#4caf50';
    if (props.isSelected && !props.isCorrect) return '#ef5350';
    return theme.colors.light;
  }};
`;

const StarButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: ${props => props.isStarred ? '#ffc107' : '#e0e0e0'};
  transition: all 0.2s ease;
  padding: 0.5rem;
  border-radius: 50%;

  &:hover {
    transform: scale(1.1);
    color: ${props => props.isStarred ? '#ffc107' : '#ffd700'};
    background-color: ${props => props.isStarred ? 'rgba(255, 193, 7, 0.1)' : 'rgba(255, 215, 0, 0.1)'};
  }

  &:active {
    transform: scale(0.95);
  }
`;

const QuestionNumber = styled.div`
  font-weight: 500;
  color: ${theme.colors.primary};
`;

const ReviewQuestions = ({ questions, userAnswers, starredQuestions, onToggleStar, selectedFolder }) => {
  const [filter, setFilter] = useState('all');

  const isQuestionStarred = (questionIndex) => {
    const questionId = `${selectedFolder}-${questionIndex}`;
    return starredQuestions.includes(questionId);
  };

  const filteredQuestions = questions.filter((question, index) => {
    const userAnswer = userAnswers[index];
    const correctAnswer = question.choices.find(c => c.isCorrect)?.text;
    const isCorrect = userAnswer === correctAnswer;
    const isStarred = isQuestionStarred(index);

    switch (filter) {
      case 'correct':
        return isCorrect;
      case 'incorrect':
        return !isCorrect;
      case 'starred':
        return isStarred;
      default:
        return true;
    }
  });

  return (
    <ReviewContainer>
      <ReviewHeader>
        <h3>Review Questions</h3>
        <FilterButtons>
          <FilterButton 
            active={filter === 'all'} 
            onClick={() => setFilter('all')}
          >
            All ({questions.length})
          </FilterButton>
          <FilterButton 
            active={filter === 'correct'} 
            onClick={() => setFilter('correct')}
          >
            Correct ({questions.filter((q, i) => userAnswers[i] === q.choices.find(c => c.isCorrect)?.text).length})
          </FilterButton>
          <FilterButton 
            active={filter === 'incorrect'} 
            onClick={() => setFilter('incorrect')}
          >
            Incorrect ({questions.filter((q, i) => userAnswers[i] !== q.choices.find(c => c.isCorrect)?.text).length})
          </FilterButton>
          <FilterButton 
            active={filter === 'starred'} 
            onClick={() => setFilter('starred')}
          >
            Starred ({questions.filter((_, i) => isQuestionStarred(i)).length})
          </FilterButton>
        </FilterButtons>
      </ReviewHeader>

      {filteredQuestions.map((question, index) => {
        const userAnswer = userAnswers[index];
        const correctAnswer = question.choices.find(c => c.isCorrect)?.text;
        const isCorrect = userAnswer === correctAnswer;
        const isStarred = isQuestionStarred(index);

        return (
          <QuestionCard 
            key={index}
            isCorrect={isCorrect}
            isIncorrect={!isCorrect}
          >
            <QuestionHeader>
              <QuestionNumber>Question {index + 1}</QuestionNumber>
              <StarButton
                isStarred={isStarred}
                onClick={() => onToggleStar(index)}
                title={isStarred ? "Remove Star" : "Star Question"}
              >
                {isStarred ? '⭐' : '☆'}
              </StarButton>
            </QuestionHeader>
            <QuestionText>{question.question}</QuestionText>
            <ChoiceList>
              {question.choices.map((choice, choiceIndex) => (
                <Choice
                  key={choiceIndex}
                  isCorrect={choice.isCorrect}
                  isSelected={choice.text === userAnswer}
                >
                  {choice.isCorrect && '✓ '}
                  {choice.text === userAnswer && !choice.isCorrect && '✗ '}
                  {choice.text}
                </Choice>
              ))}
            </ChoiceList>
          </QuestionCard>
        );
      })}
    </ReviewContainer>
  );
};

export default ReviewQuestions; 