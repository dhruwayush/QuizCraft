import React, { useState } from 'react';
import styled from '@emotion/styled';
import { theme } from './theme';
import Quiz from './components/Quiz';
import Admin from './components/Admin';
import QuestionSetSelector from './components/QuestionSetSelector';
import ScheduledQuizzes from './components/ScheduledQuizzes';
import SavedQuizzes from './components/SavedQuizzes';
import StatsView from './components/StatsView';
import StarredQuestionsList from './components/StarredQuestionsList';

const AppContainer = styled.div`
  min-height: 100vh;
  background: ${theme.colors.background};
`;

const Header = styled.header`
  background: white;
  padding: 1rem 2rem;
  box-shadow: ${theme.shadows.sm};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled.h1`
  color: ${theme.colors.primary};
  margin: 0;
  font-size: 1.5rem;
`;

const Navigation = styled.nav`
  display: flex;
  gap: 1rem;
`;

const NavButton = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: ${theme.borderRadius.md};
  background: ${props => props.active ? theme.colors.primary : 'transparent'};
  color: ${props => props.active ? 'white' : theme.colors.textPrimary};
  cursor: pointer;
  transition: ${theme.transitions.default};
  font-weight: 500;

  &:hover {
    background: ${props => props.active ? theme.colors.primary : theme.colors.background};
  }
`;

const MainContent = styled.main`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
`;

const App = () => {
  const [currentView, setCurrentView] = useState('quiz');
  const [selectedQuestions, setSelectedQuestions] = useState(null);
  const [savedQuizId, setSavedQuizId] = useState(null);
  const [selectedFolder, setSelectedFolder] = useState(null);

  const handleStartQuiz = (questions, folder, quizId = null) => {
    setSelectedQuestions(questions);
    setSavedQuizId(quizId);
    setSelectedFolder(folder);
  };

  const handleResumeQuiz = (questions, quizId, folder) => {
    setSelectedQuestions(questions);
    setSavedQuizId(quizId);
    setCurrentView('quiz');
    setSelectedFolder(folder);
  };

  return (
    <AppContainer>
      <Header>
        <Logo>MCQ Quiz</Logo>
        <Navigation>
          <NavButton 
            active={currentView === 'quiz'} 
            onClick={() => setCurrentView('quiz')}
          >
            Take Quiz
          </NavButton>
          <NavButton 
            active={currentView === 'scheduled'} 
            onClick={() => setCurrentView('scheduled')}
          >
            Scheduled Quizzes
          </NavButton>
          <NavButton 
            active={currentView === 'saved'} 
            onClick={() => setCurrentView('saved')}
          >
            Saved Quizzes
          </NavButton>
          <NavButton 
            active={currentView === 'starred'} 
            onClick={() => setCurrentView('starred')}
          >
            Starred Questions
          </NavButton>
          <NavButton 
            active={currentView === 'stats'} 
            onClick={() => setCurrentView('stats')}
          >
            Statistics
          </NavButton>
          <NavButton 
            active={currentView === 'admin'} 
            onClick={() => setCurrentView('admin')}
          >
            Admin Panel
          </NavButton>
        </Navigation>
      </Header>

      <MainContent>
        {currentView === 'quiz' && !selectedQuestions && (
          <QuestionSetSelector onStartQuiz={handleStartQuiz} />
        )}
        {selectedQuestions && (
          <Quiz 
            questions={selectedQuestions}
            onClose={() => {
              setSelectedQuestions(null);
              setSavedQuizId(null);
            }}
            savedQuizId={savedQuizId}
            selectedFolder={selectedFolder}
            setSelectedFolder={setSelectedFolder}
          />
        )}
        {currentView === 'scheduled' && (
          <ScheduledQuizzes onStartQuiz={handleStartQuiz} />
        )}
        {currentView === 'saved' && (
          <SavedQuizzes onResumeQuiz={handleResumeQuiz} />
        )}
        {currentView === 'starred' && (
          <StarredQuestionsList onStartQuiz={handleStartQuiz} />
        )}
        {currentView === 'stats' && <StatsView />}
        {currentView === 'admin' && <Admin />}
      </MainContent>
    </AppContainer>
  );
};

export default App;
