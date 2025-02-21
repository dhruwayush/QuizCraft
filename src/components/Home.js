import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { theme } from '../theme';
import FolderList from './FolderList';
import QuestionList from './QuestionList';
import Quiz from './Quiz';
import ScheduledQuizzes from './ScheduledQuizzes';
import StatsView from './StatsView';
import QuizHistory from './QuizHistory';
import CustomQuiz from './CustomQuiz';

const HomeContainer = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  min-height: 100vh;
`;

const TabContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid ${theme.colors.border};
  padding-bottom: 1rem;
`;

const TabButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: none;
  border: none;
  border-bottom: 2px solid ${props => props.active ? theme.colors.primary : 'transparent'};
  color: ${props => props.active ? theme.colors.primary : theme.colors.textSecondary};
  cursor: pointer;
  transition: ${theme.transitions.default};
  font-weight: ${props => props.active ? 500 : 400};
  font-size: ${theme.typography.fontSize.base};

  &:hover {
    color: ${theme.colors.primary};
  }
`;

const ContentContainer = styled.div`
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;
  align-items: start;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const HomeHeader = styled.h1`
  font-size: 2rem;
  color: ${theme.colors.textPrimary};
`;

const Home = () => {
  const [selectedFolder, setSelectedFolder] = useState('');
  const [selectedQuestions, setSelectedQuestions] = useState(null);
  const [activeTab, setActiveTab] = useState('folders');

  return (
    <HomeContainer>
      <HomeHeader>Welcome to QuizCraft!</HomeHeader>
      <TabContainer>
        <TabButton 
          active={activeTab === 'folders'} 
          onClick={() => setActiveTab('folders')}
        >
          Question Sets
        </TabButton>
        <TabButton 
          active={activeTab === 'scheduled'} 
          onClick={() => setActiveTab('scheduled')}
        >
          Scheduled Quizzes
        </TabButton>
        <TabButton 
          active={activeTab === 'stats'} 
          onClick={() => setActiveTab('stats')}
        >
          Statistics
        </TabButton>
        <TabButton 
          active={activeTab === 'history'} 
          onClick={() => setActiveTab('history')}
        >
          Quiz History
        </TabButton>
        <TabButton 
          active={activeTab === 'custom'} 
          onClick={() => setActiveTab('custom')}
        >
          Create Custom Quiz
        </TabButton>
      </TabContainer>

      {selectedQuestions ? (
        <Quiz 
          questions={selectedQuestions} 
          onClose={() => setSelectedQuestions(null)}
          selectedFolder={selectedFolder}
          setSelectedFolder={setSelectedFolder}
        />
      ) : activeTab === 'folders' ? (
        <ContentContainer>
          <FolderList 
            selectedFolder={selectedFolder}
            onFolderSelect={setSelectedFolder}
          />
          {selectedFolder && (
            <QuestionList 
              selectedFolder={selectedFolder}
              onSelectQuestions={setSelectedQuestions}
            />
          )}
        </ContentContainer>
      ) : activeTab === 'scheduled' ? (
        <ScheduledQuizzes onStartQuiz={setSelectedQuestions} />
      ) : activeTab === 'history' ? (
        <QuizHistory />
      ) : activeTab === 'custom' ? (
        <CustomQuiz />
      ) : (
        <StatsView />
      )}
    </HomeContainer>
  );
};

export default Home; 