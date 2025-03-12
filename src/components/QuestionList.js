import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { theme } from '../theme';
import { useSupabase } from '../contexts/SupabaseContext';
import { getQuestions } from '../utils/supabaseUtils';
import LoadingSpinner from './LoadingSpinner';

const QuestionListContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: ${theme.shadows.sm};
  padding: 1.5rem;
  height: 100%;
`;

const QuestionListHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const QuestionListTitle = styled.h2`
  font-size: 1.2rem;
  color: ${theme.colors.textPrimary};
  margin: 0;
`;

const QuestionItem = styled.div`
  padding: 1rem;
  border: 1px solid ${theme.colors.border};
  border-radius: 8px;
  margin-bottom: 1rem;
  cursor: pointer;
  transition: ${theme.transitions.default};

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-color: ${theme.colors.primary};
  }
`;

const QuestionText = styled.div`
  font-weight: 500;
  margin-bottom: 0.75rem;
  color: ${theme.colors.textPrimary};
`;

const OptionsList = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  margin-bottom: 0.5rem;

  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`;

const Option = styled.div`
  padding: 0.5rem 0.75rem;
  border: 1px solid ${theme.colors.border};
  border-radius: 4px;
  font-size: 0.9rem;
  background: ${props => props.isCorrect ? theme.colors.successLight : 'transparent'};
  color: ${props => props.isCorrect ? theme.colors.success : theme.colors.textSecondary};
`;

const QuestionMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: ${theme.colors.textSecondary};
  margin-top: 0.5rem;
`;

const QuestionCategory = styled.span`
  padding: 0.25rem 0.5rem;
  background: ${theme.colors.backgroundLight};
  border-radius: 4px;
`;

const StartQuizButton = styled.button`
  background: ${theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-weight: 500;
  cursor: pointer;
  margin-top: 1rem;
  width: 100%;
  transition: ${theme.transitions.default};

  &:hover {
    background: ${theme.colors.primaryDark};
  }

  &:disabled {
    background: ${theme.colors.disabled};
    cursor: not-allowed;
  }
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const Select = styled.select`
  padding: 0.5rem;
  border: 1px solid ${theme.colors.border};
  border-radius: 4px;
  background: white;
  font-size: 0.9rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: ${theme.colors.textSecondary};
`;

const ErrorMessage = styled.div`
  color: ${theme.colors.error};
  padding: 0.75rem;
  background: ${theme.colors.errorLight};
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
`;

const QuestionList = ({ selectedFolder, onSelectQuestions }) => {
  const { user } = useSupabase();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!selectedFolder || !user) {
        setQuestions([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const questionData = await getQuestions(selectedFolder, user.id);
        setQuestions(questionData || []);
        setError(null);
      } catch (error) {
        console.error('Error fetching questions:', error);
        setError('Failed to load questions. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [selectedFolder, user]);

  const handleStartQuiz = () => {
    // Filter questions based on selected category and difficulty
    let filteredQuestions = [...questions];
    
    if (selectedCategory) {
      filteredQuestions = filteredQuestions.filter(q => q.category === selectedCategory);
    }
    
    if (selectedDifficulty) {
      filteredQuestions = filteredQuestions.filter(q => q.difficulty === selectedDifficulty);
    }
    
    // Pass the filtered questions to the parent component
    onSelectQuestions(filteredQuestions, selectedFolder);
  };

  // Get unique categories and difficulties for filters
  const categories = [...new Set(questions.map(q => q.category).filter(Boolean))];
  const difficulties = [...new Set(questions.map(q => q.difficulty).filter(Boolean))];

  if (loading) {
    return (
      <QuestionListContainer>
        <QuestionListHeader>
          <QuestionListTitle>Questions</QuestionListTitle>
        </QuestionListHeader>
        <LoadingSpinner />
      </QuestionListContainer>
    );
  }

  return (
    <QuestionListContainer>
      <QuestionListHeader>
        <QuestionListTitle>Questions</QuestionListTitle>
      </QuestionListHeader>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {questions.length > 0 && (
        <>
          <FilterContainer>
            <Select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Select>

            <Select 
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
            >
              <option value="">All Difficulties</option>
              {difficulties.map(difficulty => (
                <option key={difficulty} value={difficulty}>
                  {difficulty}
                </option>
              ))}
            </Select>
          </FilterContainer>

          <StartQuizButton 
            onClick={handleStartQuiz}
            disabled={questions.length === 0}
          >
            Start Quiz
          </StartQuizButton>
        </>
      )}

      {questions.length === 0 ? (
        <EmptyState>
          {user 
            ? 'No questions found in this folder. Add some questions to get started!'
            : 'Please log in to see questions.'}
        </EmptyState>
      ) : (
        <div style={{ marginTop: '1.5rem' }}>
          {questions
            .filter(q => !selectedCategory || q.category === selectedCategory)
            .filter(q => !selectedDifficulty || q.difficulty === selectedDifficulty)
            .map((question) => (
              <QuestionItem key={question.id}>
                <QuestionText>{question.question_text}</QuestionText>
                <OptionsList>
                  {Array.isArray(question.options) && question.options.map((option, index) => (
                    <Option 
                      key={index}
                      isCorrect={index === question.correct_option}
                    >
                      {option}
                    </Option>
                  ))}
                </OptionsList>
                <QuestionMeta>
                  {question.category && (
                    <QuestionCategory>{question.category}</QuestionCategory>
                  )}
                  {question.difficulty && (
                    <span>Difficulty: {question.difficulty}</span>
                  )}
                </QuestionMeta>
              </QuestionItem>
            ))
          }
        </div>
      )}
    </QuestionListContainer>
  );
};

export default QuestionList; 