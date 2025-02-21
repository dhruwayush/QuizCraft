import React from 'react';
import styled from '@emotion/styled';

const BookmarkContainer = styled.div`
  margin-top: 2rem;
  padding: 1rem;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const BookmarkList = styled.div`
  margin-top: 1rem;
`;

const BookmarkItem = styled.div`
  padding: 1rem;
  margin-bottom: 1rem;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  background-color: ${props => props.isCorrect ? '#e8f5e9' : '#fff'};

  &:hover {
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
`;

const QuestionText = styled.div`
  font-weight: bold;
  margin-bottom: 0.5rem;
`;

const ChoiceList = styled.div`
  margin-left: 1rem;
`;

const Choice = styled.div`
  margin: 0.25rem 0;
  color: ${props => props.isCorrect ? '#28a745' : 'inherit'};
`;

const BookmarkedQuestions = ({ bookmarkedQuestions, questions, selectedFolder }) => {
  const getQuestionFromId = (id) => {
    const [folder, index] = id.split('-');
    return questions[parseInt(index)];
  };

  return (
    <BookmarkContainer>
      <h3>Bookmarked Questions</h3>
      <BookmarkList>
        {bookmarkedQuestions.map((id) => {
          const question = getQuestionFromId(id);
          if (!question) return null;

          return (
            <BookmarkItem key={id}>
              <QuestionText>{question.question}</QuestionText>
              <ChoiceList>
                {question.choices.map((choice, index) => (
                  <Choice
                    key={index}
                    isCorrect={choice === question.correctAnswer}
                  >
                    {choice === question.correctAnswer ? '✓ ' : '○ '}
                    {choice}
                  </Choice>
                ))}
              </ChoiceList>
            </BookmarkItem>
          );
        })}
        {bookmarkedQuestions.length === 0 && (
          <p>No bookmarked questions yet. Star questions while taking the quiz to bookmark them!</p>
        )}
      </BookmarkList>
    </BookmarkContainer>
  );
};

export default BookmarkedQuestions; 