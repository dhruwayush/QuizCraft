import React from 'react';
import styled from '@emotion/styled';
import { theme } from '../theme';

const StatsContainer = styled.div`
  margin-top: 2rem;
  padding: 1.5rem;
  border-radius: ${theme.borderRadius.medium};
  background-color: ${theme.colors.light};
`;

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const StatItem = styled.div`
  text-align: center;
  padding: 1.2rem;
  background-color: white;
  border-radius: ${theme.borderRadius.medium};
  box-shadow: ${theme.shadows.small};
  transition: ${theme.transitions.fast};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.medium};
  }
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: ${theme.colors.secondary};
  margin-bottom: 0.5rem;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${props => props.color || theme.colors.primary};
`;

const ResetButton = styled.button`
  background-color: ${theme.colors.danger};
  color: white;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: ${theme.borderRadius.small};
  cursor: pointer;
  transition: ${theme.transitions.fast};
  margin-top: 1.5rem;
  width: 100%;
  max-width: 300px;
  display: block;
  margin-left: auto;
  margin-right: auto;
  font-size: 1rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  &:hover {
    background-color: ${theme.colors.danger}dd;
    transform: scale(1.02);
    box-shadow: ${theme.shadows.medium};
  }

  &:active {
    transform: scale(0.98);
  }
`;

const StatSection = styled.div`
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h3`
  color: ${theme.colors.dark};
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid ${theme.colors.light};
`;

const Stats = ({ stats, onResetStats, folderName = 'All' }) => {
  const calculatePercentage = (value, total) => {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };

  const getAccuracyColor = (percentage) => {
    if (percentage >= 80) return theme.colors.success;
    if (percentage >= 60) return theme.colors.warning;
    return theme.colors.danger;
  };

  const formatTime = (seconds) => {
    if (seconds === Infinity || seconds === 0) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all statistics? This cannot be undone.')) {
      onResetStats();
    }
  };

  const accuracyPercentage = calculatePercentage(stats.correctAnswers, stats.totalQuestions);

  return (
    <StatsContainer>
      <SectionTitle>Statistics for {folderName}</SectionTitle>
      <StatSection>
        <SectionTitle>Overall Performance</SectionTitle>
        <StatGrid>
          <StatItem>
            <StatLabel>Total Questions Attempted</StatLabel>
            <StatValue>{stats.totalQuestions}</StatValue>
          </StatItem>
          <StatItem>
            <StatLabel>Overall Accuracy</StatLabel>
            <StatValue color={getAccuracyColor(accuracyPercentage)}>
              {accuracyPercentage}%
            </StatValue>
          </StatItem>
          <StatItem>
            <StatLabel>Quizzes Completed</StatLabel>
            <StatValue>{stats.quizzesCompleted || 0}</StatValue>
          </StatItem>
          <StatItem>
            <StatLabel>Questions per Quiz (Avg)</StatLabel>
            <StatValue>
              {stats.quizzesCompleted ? Math.round(stats.totalQuestions / stats.quizzesCompleted) : 0}
            </StatValue>
          </StatItem>
        </StatGrid>
      </StatSection>

      <StatSection>
        <SectionTitle>Time Statistics</SectionTitle>
        <StatGrid>
          <StatItem>
            <StatLabel>Average Time per Question</StatLabel>
            <StatValue>{formatTime(stats.averageTime)}</StatValue>
          </StatItem>
          <StatItem>
            <StatLabel>Best Time for a Question</StatLabel>
            <StatValue color={theme.colors.success}>{formatTime(stats.bestTime)}</StatValue>
          </StatItem>
          <StatItem>
            <StatLabel>Total Study Time</StatLabel>
            <StatValue>{formatTime(stats.totalTime || 0)}</StatValue>
          </StatItem>
          <StatItem>
            <StatLabel>Longest Streak</StatLabel>
            <StatValue color={theme.colors.info}>{stats.longestStreak || 0}</StatValue>
          </StatItem>
        </StatGrid>
      </StatSection>

      <StatSection>
        <SectionTitle>Question Categories</SectionTitle>
        <StatGrid>
          <StatItem>
            <StatLabel>Starred Questions</StatLabel>
            <StatValue>{stats.totalStarred || 0}</StatValue>
          </StatItem>
          <StatItem>
            <StatLabel>Most Challenging Category</StatLabel>
            <StatValue color={theme.colors.warning}>
              {stats.challengingCategory || '-'}
            </StatValue>
          </StatItem>
          <StatItem>
            <StatLabel>Strongest Category</StatLabel>
            <StatValue color={theme.colors.success}>
              {stats.strongestCategory || '-'}
            </StatValue>
          </StatItem>
          <StatItem>
            <StatLabel>Practice Sessions</StatLabel>
            <StatValue>{stats.practiceSessions || 0}</StatValue>
          </StatItem>
        </StatGrid>
      </StatSection>

      <ResetButton onClick={handleReset}>
        🔄 Reset Statistics for {folderName}
      </ResetButton>
    </StatsContainer>
  );
};

export default Stats; 