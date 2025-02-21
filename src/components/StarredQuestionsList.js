import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { theme } from '../theme';

const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h2`
  color: ${theme.colors.textPrimary};
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FolderSection = styled.div`
  background: white;
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.md};
  margin-bottom: 2rem;
  overflow: hidden;
`;

const FolderHeader = styled.div`
  padding: 1.5rem;
  background: ${theme.colors.background};
  border-bottom: 1px solid ${theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const FolderTitle = styled.h3`
  margin: 0;
  color: ${theme.colors.textPrimary};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.2rem;
`;

const SetSection = styled.div`
  padding: 1rem;
  border-bottom: 1px solid ${theme.colors.border};
  
  &:last-child {
    border-bottom: none;
  }
`;

const SetHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0.5rem;
  background: ${theme.colors.background};
  border-radius: ${theme.borderRadius.md};
`;

const SetTitle = styled.h4`
  margin: 0;
  color: ${theme.colors.textPrimary};
  font-size: 1rem;
`;

const QuestionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const QuestionCard = styled.div`
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

const QuestionText = styled.div`
  color: ${theme.colors.textPrimary};
  margin-bottom: 1rem;
  font-weight: 500;
`;

const ChoicesList = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Choice = styled.div`
  padding: 0.75rem;
  background: white;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  color: ${props => props.isCorrect ? theme.colors.success : theme.colors.textSecondary};
  font-size: 0.9rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: ${theme.borderRadius.md};
  font-weight: 500;
  cursor: pointer;
  transition: ${theme.transitions.default};
  
  background: ${props => props.variant === 'primary' ? theme.colors.primary : 'transparent'};
  color: ${props => props.variant === 'primary' ? 'white' : theme.colors.textPrimary};
  border: 1px solid ${props => props.variant === 'primary' ? 'transparent' : theme.colors.border};

  &:hover {
    transform: translateY(-1px);
    box-shadow: ${theme.shadows.sm};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: ${theme.colors.textSecondary};
`;

const FolderStats = styled.div`
  display: flex;
  gap: 1rem;
  color: ${theme.colors.textSecondary};
  font-size: 0.9rem;
`;

const StatBadge = styled.span`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background: ${theme.colors.background};
  border-radius: ${theme.borderRadius.md};
  font-size: 0.8rem;
`;

const StarredQuestionsList = ({ onStartQuiz }) => {
  const [starredByFolder, setStarredByFolder] = useState({});
  const [expandedFolders, setExpandedFolders] = useState({});

  useEffect(() => {
    loadStarredQuestions();
  }, []);

  const loadStarredQuestions = () => {
    const folders = JSON.parse(localStorage.getItem('questionFolders') || '[]');
    const starredQuestions = {};

    folders.forEach(folder => {
      const starredIds = JSON.parse(localStorage.getItem(`starredQuestions_${folder}`) || '[]');
      if (starredIds.length === 0) return;

      const files = JSON.parse(localStorage.getItem(`questionFiles_${folder}`) || '{}');
      starredQuestions[folder] = {};

      Object.entries(files).forEach(([fileName, fileData]) => {
        const starredFromFile = fileData.questions.filter((_, index) => 
          starredIds.includes(`${folder}-${index}`)
        ).map((q, idx) => ({
          ...q,
          originalIndex: idx,
          fileName,
          // Ensure choices are strings
          choices: q.choices.map(choice => typeof choice === 'object' ? choice.text : choice)
        }));

        if (starredFromFile.length > 0) {
          starredQuestions[folder][fileName] = starredFromFile;
        }
      });

      // Remove folder if it has no starred questions
      if (Object.keys(starredQuestions[folder]).length === 0) {
        delete starredQuestions[folder];
      }
    });

    setStarredByFolder(starredQuestions);
    // Initialize expanded state for folders
    const initialExpandedState = {};
    Object.keys(starredQuestions).forEach(folder => {
      initialExpandedState[folder] = true;
    });
    setExpandedFolders(initialExpandedState);
  };

  const toggleFolder = (folder) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folder]: !prev[folder]
    }));
  };

  const handleStartQuiz = (folder, questions) => {
    // Add necessary properties to questions
    const processedQuestions = questions.map(q => ({
      ...q,
      folder,
      choices: q.choices.map((choice, index) => ({
        text: choice,
        isCorrect: index === q.correctAnswer
      }))
    }));
    onStartQuiz(processedQuestions, folder);
  };

  const handleUnstar = (folder, fileName, questionIndex) => {
    const starredIds = JSON.parse(localStorage.getItem(`starredQuestions_${folder}`) || '[]');
    const updatedStarredIds = starredIds.filter(id => id !== `${folder}-${questionIndex}`);
    localStorage.setItem(`starredQuestions_${folder}`, JSON.stringify(updatedStarredIds));
    loadStarredQuestions();
  };

  if (Object.keys(starredByFolder).length === 0) {
    return (
      <Container>
        <Title>⭐ Starred Questions</Title>
        <EmptyState>
          <p>No starred questions found.</p>
          <p>Star questions while taking quizzes to review them later.</p>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <Title>⭐ Starred Questions</Title>
      {Object.entries(starredByFolder).map(([folder, sets]) => (
        <FolderSection key={folder}>
          <FolderHeader>
            <FolderTitle>
              📁 {folder}
            </FolderTitle>
            <FolderStats>
              <StatBadge>
                📚 {Object.keys(sets).length} Sets
              </StatBadge>
              <StatBadge>
                ⭐ {Object.values(sets).reduce((acc, questions) => acc + questions.length, 0)} Questions
              </StatBadge>
              <Button onClick={() => toggleFolder(folder)}>
                {expandedFolders[folder] ? 'Collapse' : 'Expand'}
              </Button>
            </FolderStats>
          </FolderHeader>
          
          {expandedFolders[folder] && Object.entries(sets).map(([fileName, questions]) => (
            <SetSection key={fileName}>
              <SetHeader>
                <SetTitle>📄 {fileName}</SetTitle>
                <ButtonGroup>
                  <Button 
                    variant="primary"
                    onClick={() => handleStartQuiz(folder, questions)}
                  >
                    Practice Set
                  </Button>
                </ButtonGroup>
              </SetHeader>
              
              <QuestionList>
                {questions.map((question, idx) => (
                  <QuestionCard key={idx}>
                    <QuestionText>{question.question}</QuestionText>
                    <ChoicesList>
                      {question.choices.map((choice, choiceIdx) => (
                        <Choice 
                          key={choiceIdx}
                          isCorrect={choiceIdx === question.correctAnswer}
                        >
                          {String.fromCharCode(65 + choiceIdx)}) {choice}
                        </Choice>
                      ))}
                    </ChoicesList>
                    <ButtonGroup>
                      <Button 
                        onClick={() => handleUnstar(folder, fileName, question.originalIndex)}
                      >
                        Remove Star
                      </Button>
                    </ButtonGroup>
                  </QuestionCard>
                ))}
              </QuestionList>
            </SetSection>
          ))}
        </FolderSection>
      ))}
    </Container>
  );
};

export default StarredQuestionsList; 