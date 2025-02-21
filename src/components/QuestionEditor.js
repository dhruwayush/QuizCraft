import React, { useState } from 'react';
import styled from '@emotion/styled';

const EditorContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const QuestionCard = styled.div`
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1.5rem;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  position: relative;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.5rem;
  margin: 0.5rem 0;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 1rem;
`;

const ChoiceContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 0.5rem 0;
`;

const RadioInput = styled.input`
  margin-right: 0.5rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s;

  background-color: ${props => {
    if (props.variant === 'delete') return '#dc3545';
    if (props.variant === 'save') return '#28a745';
    return '#6c757d';
  }};
  color: white;

  &:hover {
    opacity: 0.9;
  }
`;

const SearchInput = styled(Input)`
  max-width: 300px;
  margin-bottom: 2rem;
`;

const CorrectAnswerIndicator = styled.span`
  color: #28a745;
  font-weight: bold;
  margin-left: 0.5rem;
`;

const QuestionNumber = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background-color: #007bff;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
`;

const QuestionEditor = ({ questions, onQuestionsChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingStates, setEditingStates] = useState({});

  const toggleEdit = (index) => {
    setEditingStates(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    if (field === 'choices') {
      const choiceIndex = parseInt(value.target.dataset.index);
      newQuestions[index].choices[choiceIndex] = {
        text: value.target.value,
        isCorrect: String.fromCharCode(65 + choiceIndex) === newQuestions[index].correctAnswer
      };
    } else if (field === 'correctAnswer') {
      newQuestions[index].correctAnswer = value;
      // Update isCorrect flags for all choices
      newQuestions[index].choices = newQuestions[index].choices.map((choice, choiceIndex) => ({
        text: choice.text,
        isCorrect: String.fromCharCode(65 + choiceIndex) === value
      }));
    } else {
      newQuestions[index][field] = value;
    }
    onQuestionsChange(newQuestions);
  };

  const handleDelete = (index) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    onQuestionsChange(newQuestions);
  };

  const filteredQuestions = questions.filter(q => 
    q.question.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <EditorContainer>
      <SearchInput
        type="text"
        placeholder="Search questions..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {filteredQuestions.map((question, index) => (
        <QuestionCard key={index}>
          <QuestionNumber>Question {index + 1}</QuestionNumber>
          {editingStates[index] ? (
            <>
              <Input
                value={question.question}
                onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
                placeholder="Question"
              />
              {question.choices.map((choice, choiceIndex) => (
                <ChoiceContainer key={choiceIndex}>
                  <RadioInput
                    type="radio"
                    checked={String.fromCharCode(65 + choiceIndex) === question.correctAnswer}
                    onChange={() => handleQuestionChange(index, 'correctAnswer', String.fromCharCode(65 + choiceIndex))}
                  />
                  <Input
                    value={choice.text}
                    onChange={(e) => handleQuestionChange(index, 'choices', {
                      target: {
                        value: e.target.value,
                        dataset: { index: choiceIndex }
                      }
                    })}
                    placeholder={`Choice ${choiceIndex + 1}`}
                  />
                  {String.fromCharCode(65 + choiceIndex) === question.correctAnswer && (
                    <CorrectAnswerIndicator>(Correct)</CorrectAnswerIndicator>
                  )}
                </ChoiceContainer>
              ))}
            </>
          ) : (
            <>
              <h3>{question.question}</h3>
              {question.choices.map((choice, choiceIndex) => (
                <div key={choiceIndex}>
                  <input
                    type="radio"
                    checked={String.fromCharCode(65 + choiceIndex) === question.correctAnswer}
                    readOnly
                  />
                  {choice.text}
                  {String.fromCharCode(65 + choiceIndex) === question.correctAnswer && (
                    <CorrectAnswerIndicator>(Correct)</CorrectAnswerIndicator>
                  )}
                </div>
              ))}
            </>
          )}
          <ButtonGroup>
            <Button onClick={() => toggleEdit(index)}>
              {editingStates[index] ? 'Done' : 'Edit'}
            </Button>
            <Button variant="delete" onClick={() => handleDelete(index)}>
              Delete
            </Button>
          </ButtonGroup>
        </QuestionCard>
      ))}
    </EditorContainer>
  );
};

export default QuestionEditor; 