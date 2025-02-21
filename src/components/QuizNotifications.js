import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { theme } from '../theme';
import Modal from './Modal';

const NotificationContainer = styled.div`
  padding: 1rem;
  background: white;
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.md};
`;

const SettingsGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: ${theme.colors.textPrimary};
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  margin-bottom: 1rem;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 2px ${theme.colors.primary}20;
  }
`;

const Switch = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
`;

const SwitchInput = styled.input`
  display: none;
`;

const SwitchSlider = styled.div`
  width: 48px;
  height: 24px;
  background: ${props => props.checked ? theme.colors.primary : theme.colors.border};
  border-radius: 12px;
  position: relative;
  transition: ${theme.transitions.default};

  &:before {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: white;
    top: 2px;
    left: ${props => props.checked ? '26px' : '2px'};
    transition: ${theme.transitions.default};
  }
`;

const NotificationHeader = styled.h2`
  font-size: 1.5rem;
  color: ${theme.colors.textPrimary};
`;

const QuizNotifications = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [email, setEmail] = useState('');
  const [interval, setInterval] = useState(2);
  const [questionCount, setQuestionCount] = useState(30);
  const [lastSentTime, setLastSentTime] = useState(null);

  useEffect(() => {
    // Load saved preferences
    const savedPrefs = localStorage.getItem('quizNotificationPrefs');
    if (savedPrefs) {
      const prefs = JSON.parse(savedPrefs);
      setIsEnabled(prefs.isEnabled);
      setEmail(prefs.email);
      setInterval(prefs.interval);
      setQuestionCount(prefs.questionCount);
      setLastSentTime(prefs.lastSentTime);
    }
  }, []);

  useEffect(() => {
    if (!isEnabled) return;

    const checkAndSendQuiz = () => {
      const now = Date.now();
      const hoursSinceLastSent = lastSentTime 
        ? (now - lastSentTime) / (1000 * 60 * 60)
        : Infinity;

      if (hoursSinceLastSent >= interval) {
        sendQuizLink();
      }
    };

    // Check every minute
    const timer = setInterval(checkAndSendQuiz, 60 * 1000);
    return () => clearInterval(timer);
  }, [isEnabled, lastSentTime, interval]);

  const savePreferences = () => {
    const prefs = {
      isEnabled,
      email,
      interval,
      questionCount,
      lastSentTime
    };
    localStorage.setItem('quizNotificationPrefs', JSON.stringify(prefs));
  };

  const generateQuizLink = () => {
    // Get all starred questions
    const folders = JSON.parse(localStorage.getItem('questionFolders') || '[]');
    let allStarredQuestions = [];

    folders.forEach(folder => {
      const starredIds = JSON.parse(localStorage.getItem(`starredQuestions_${folder}`) || '[]');
      const files = JSON.parse(localStorage.getItem(`questionFiles_${folder}`) || '{}');

      Object.entries(files).forEach(([fileName, fileData]) => {
        const starredFromFile = fileData.questions.filter((_, index) => 
          starredIds.includes(`${folder}-${index}`)
        ).map(q => ({
          ...q,
          folder,
          fileName
        }));

        allStarredQuestions = [...allStarredQuestions, ...starredFromFile];
      });
    });

    // Shuffle questions and take required number
    const shuffled = allStarredQuestions.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, questionCount);

    // Generate a unique ID for this quiz
    const quizId = Date.now().toString(36);
    
    // Save the quiz
    localStorage.setItem(`generatedQuiz_${quizId}`, JSON.stringify({
      questions: selected,
      timestamp: Date.now(),
      type: 'scheduled'
    }));

    return `${window.location.origin}/quiz/${quizId}`;
  };

  const sendQuizLink = async () => {
    if (!email) return;

    const quizLink = generateQuizLink();
    
    // Here you would typically send this via your backend
    // For now, we'll just log it
    console.log(`Quiz link generated: ${quizLink}`);
    console.log(`Would send to: ${email}`);

    // Update last sent time
    const now = Date.now();
    setLastSentTime(now);
    savePreferences();
  };

  const handleToggle = (e) => {
    setIsEnabled(e.target.checked);
    if (e.target.checked && !lastSentTime) {
      // If enabling for the first time, send immediately
      sendQuizLink();
    }
  };

  return (
    <NotificationContainer>
      <NotificationHeader>QuizCraft Notifications</NotificationHeader>
      
      <SettingsGroup>
        <Switch>
          <SwitchInput
            type="checkbox"
            checked={isEnabled}
            onChange={handleToggle}
          />
          <SwitchSlider checked={isEnabled} />
          <span>Enable scheduled quizzes</span>
        </Switch>
      </SettingsGroup>

      <SettingsGroup>
        <Label>Email Address</Label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
        />
      </SettingsGroup>

      <SettingsGroup>
        <Label>Send every (hours)</Label>
        <Input
          type="number"
          min="1"
          value={interval}
          onChange={(e) => setInterval(Number(e.target.value))}
        />
      </SettingsGroup>

      <SettingsGroup>
        <Label>Questions per quiz</Label>
        <Input
          type="number"
          min="1"
          max="100"
          value={questionCount}
          onChange={(e) => setQuestionCount(Number(e.target.value))}
        />
      </SettingsGroup>

      {lastSentTime && (
        <p>Last quiz sent: {new Date(lastSentTime).toLocaleString()}</p>
      )}

      <button 
        onClick={savePreferences}
        style={{
          background: theme.colors.primary,
          color: 'white',
          padding: '0.75rem 1.5rem',
          borderRadius: theme.borderRadius.md,
          border: 'none',
          cursor: 'pointer'
        }}
      >
        Save Preferences
      </button>
    </NotificationContainer>
  );
};

export default QuizNotifications; 