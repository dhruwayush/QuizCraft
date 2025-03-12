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
import { SupabaseProvider, useSupabase } from './contexts/SupabaseContext';
import Home from './components/Home';
import QuizHistory from './components/QuizHistory';
import Auth from './components/Auth';
import Profile from './components/Profile';

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

const AppContent = () => {
  const { user, signOut } = useSupabase();
  const [view, setView] = useState('home');
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [savedQuizId, setSavedQuizId] = useState(null);

  const handleStartQuiz = (questions, folder, quizId = null) => {
    setQuizQuestions(questions);
    setSelectedFolder(folder);
    setSavedQuizId(quizId);
    setView('quiz');
  };

  const handleResumeQuiz = (questions, quizId, folder) => {
    setQuizQuestions(questions);
    setSavedQuizId(quizId);
    setSelectedFolder(folder);
    setView('quiz');
  };

  const handleSignOut = async () => {
    await signOut();
    setView('home');
  };

  return (
    <AppContainer>
      <Header>
        <Logo>QuizCraft</Logo>
        <Navigation>
          <NavButton 
            onClick={() => setView('home')}
            active={view === 'home'}
          >
            Home
          </NavButton>
          <NavButton 
            onClick={() => setView('quizzes')}
            active={view === 'quizzes'}
          >
            Question Sets
          </NavButton>
          <NavButton 
            onClick={() => setView('saved')}
            active={view === 'saved'}
          >
            Saved Quizzes
          </NavButton>
          <NavButton 
            onClick={() => setView('scheduled')}
            active={view === 'scheduled'}
          >
            Scheduled
          </NavButton>
          <NavButton 
            onClick={() => setView('starred')}
            active={view === 'starred'}
          >
            Starred
          </NavButton>
          <NavButton 
            onClick={() => setView('stats')}
            active={view === 'stats'}
          >
            Stats
          </NavButton>
          <NavButton 
            onClick={() => setView('admin')}
            active={view === 'admin'}
          >
            Admin
          </NavButton>
          <NavButton 
            onClick={() => setView('history')}
            active={view === 'history'}
          >
            History
          </NavButton>
          {user ? (
            <>
              <NavButton onClick={() => setView('profile')}>
                Profile
              </NavButton>
              <NavButton onClick={handleSignOut}>
                Sign Out
              </NavButton>
            </>
          ) : (
            <NavButton onClick={() => setView('login')}>
              Login
            </NavButton>
          )}
        </Navigation>
      </Header>

      {view === 'home' && <Home onStartQuiz={handleStartQuiz} />}
      {view === 'quiz' && (
        <Quiz 
          questions={quizQuestions} 
          onClose={() => setView('quizzes')}
          selectedFolder={selectedFolder}
          setSelectedFolder={setSelectedFolder}
          savedQuizId={savedQuizId}
        />
      )}
      {view === 'quizzes' && (
        <QuestionSetSelector onStartQuiz={handleStartQuiz} />
      )}
      {view === 'saved' && (
        <SavedQuizzes onResumeQuiz={handleResumeQuiz} />
      )}
      {view === 'scheduled' && (
        <ScheduledQuizzes onStartQuiz={handleStartQuiz} />
      )}
      {view === 'starred' && (
        <StarredQuestionsList />
      )}
      {view === 'stats' && (
        <StatsView />
      )}
      {view === 'admin' && (
        <Admin />
      )}
      {view === 'history' && (
        <QuizHistory />
      )}
      {view === 'login' && (
        <Auth />
      )}
      {view === 'profile' && (
        <Profile />
      )}
    </AppContainer>
  );
};

const App = () => {
  return (
    <SupabaseProvider>
      <AppContent />
    </SupabaseProvider>
  );
};

export default App;
