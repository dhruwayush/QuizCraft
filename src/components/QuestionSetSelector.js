import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { css, keyframes } from '@emotion/react';
import { theme } from '../theme';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
`;

const scaleAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
`;

const SelectorContainer = styled.div`
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 2.5rem;
  margin-bottom: 2rem;
  animation: ${fadeIn} 0.3s ease-out;
  max-width: 1200px;
  margin: 0 auto;
`;

const PageTitle = styled.h2`
  font-size: 2rem;
  color: #2d3748;
  margin-bottom: 1.5rem;
  font-weight: 600;
  text-align: center;
  position: relative;
  
  &:after {
    content: '';
    display: block;
    width: 60px;
    height: 4px;
    background: #007bff;
    margin: 0.5rem auto;
    border-radius: 2px;
  }
`;

const FolderList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin: 1.5rem 0;
`;

const FolderItem = styled.div`
  border: 2px solid ${props => props.selected ? '#007bff' : '#e2e8f0'};
  border-radius: 12px;
  padding: 1.25rem;
  background-color: ${props => props.selected ? '#f8faff' : 'white'};
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: ${props => props.selected ? '#007bff' : '#cbd5e0'};
  }

  &:active {
    transform: translateY(0);
  }

  ${props => props.selected && `
    animation: ${pulse} 0.3s ease-in-out;
    &:before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 4px;
      height: 100%;
      background: #007bff;
    }
  `}
`;

const FolderHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  font-weight: 500;
  color: #2d3748;
`;

const FolderIcon = styled.span`
  font-size: 1.5rem;
  color: ${props => props.selected ? '#007bff' : '#4a5568'};
  transition: color 0.2s ease;
`;

const FolderStats = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  background: ${props => props.selected ? 'rgba(0, 123, 255, 0.05)' : '#f8fafc'};
  padding: 1rem;
  border-radius: 8px;
  transition: all 0.2s ease;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #4a5568;
  padding: 0.5rem;
  border-radius: 6px;
  background: ${props => props.highlighted ? 'rgba(0, 123, 255, 0.1)' : 'transparent'};
  transition: all 0.2s ease;

  &:hover {
    background: rgba(0, 123, 255, 0.05);
  }
`;

const FileList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
  animation: ${fadeIn} 0.3s ease-out;
`;

const FileItem = styled.div`
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.25rem;
  background-color: ${props => props.selected ? '#f8faff' : 'white'};
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }

  &:active {
    transform: translateY(0);
  }

  ${props => props.selected && `
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
  `}
`;

const FileHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.hasStats ? '1rem' : '0'};
  padding-bottom: ${props => props.hasStats ? '0.75rem' : '0'};
  border-bottom: ${props => props.hasStats ? '1px dashed #e2e8f0' : 'none'};
`;

const FileStats = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
  color: ${theme.colors.textSecondary};
  font-size: 0.9rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  margin-top: 1.5rem;
  position: relative;
  overflow: hidden;

  &:hover:not(:disabled) {
    background-color: #0056b3;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 123, 255, 0.2);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    background-color: #e2e8f0;
    cursor: not-allowed;
    opacity: 0.7;
  }

  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    transform: translateX(-100%);
  }

  &:hover:not(:disabled):after {
    transform: translateX(100%);
    transition: transform 0.4s ease;
  }
`;

const StatsPanel = styled.div`
  margin-top: 1.5rem;
  padding: 2rem;
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  animation: ${fadeIn} 0.3s ease-out;
`;

const StatsSectionTitle = styled.h4`
  color: #2d3748;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #007bff;
  font-size: 1.2rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:before {
    content: '${props => props.icon || '📊'}';
    font-size: 1.4rem;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.25rem;
  margin-bottom: 2.5rem;
`;

const StatBox = styled.div`
  background: white;
  padding: 1.25rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: #4a5568;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
  color: #2d3748;
  display: flex;
  align-items: baseline;
  gap: 0.25rem;

  ${props => props.trend && `
    &:after {
      content: '${props.trend > 0 ? '↑' : '↓'}';
      font-size: 1rem;
      color: ${props.trend > 0 ? '#38a169' : '#e53e3e'};
    }
  `}
`;

const ResetButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  opacity: 0.9;

  &:hover {
    background-color: #c82333;
    transform: translateY(-1px);
    opacity: 1;
  }

  &:active {
    transform: translateY(0);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-left: auto;
`;

const StatsSection = styled.div`
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: white;
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.md};
`;

const ToggleStatsButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  background: ${theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-left: 1rem;
  
  &:hover {
    background: #0056b3;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const formatTime = (seconds) => {
  if (!seconds) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const QuestionCard = styled.div`
  ${({ isSelected }) => css`
    position: relative;
    padding: 1rem;
    border: 1px solid ${theme.colors.border};
    border-radius: ${theme.borderRadius.md};
    margin-bottom: 1rem;
    cursor: pointer;
    transition: ${theme.transitions.default};
    animation: ${scaleAnimation} 0.3s ease-in-out;
    
    &:before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 4px;
      height: 100%;
      background: ${isSelected ? theme.colors.primary : 'transparent'};
      border-radius: ${theme.borderRadius.md} 0 0 ${theme.borderRadius.md};
    }
  `}
`;

const FileCard = styled.div`
  padding: 1rem;
  background: white;
  border-radius: ${theme.borderRadius.md};
  border: 1px solid ${props => props.isSelected ? theme.colors.primary : theme.colors.border};
  cursor: pointer;
  transition: ${theme.transitions.default};
  margin-bottom: 0.5rem;

  &:hover {
    border-color: ${theme.colors.primary};
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.md};
  }

  ${props => props.isSelected && `
    background: ${theme.colors.primary}10;
  `}
`;

const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  margin: 0;
  font: inherit;
  color: inherit;
  transition: ${theme.transitions.default};

  &:hover {
    color: ${theme.colors.primary};
  }
`;

const QuestionSetSelector = ({ onSelectQuestions, onStartQuiz }) => {
  const [folders, setFolders] = useState(['Default']);
  const [selectedFolder, setSelectedFolder] = useState('Default');
  const [files, setFiles] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [folderStats, setFolderStats] = useState({});
  const [fileStats, setFileStats] = useState({});
  const [showDetailedStats, setShowDetailedStats] = useState(false);

  useEffect(() => {
    // Load folders
    const savedFolders = localStorage.getItem('questionFolders');
    if (savedFolders) {
      const parsedFolders = JSON.parse(savedFolders);
      setFolders(parsedFolders);
      if (!parsedFolders.includes('Default') && parsedFolders.length > 0) {
        setSelectedFolder(parsedFolders[0]);
      }
    }

    // Load stats for each folder
    folders.forEach(folder => {
      try {
        const stats = localStorage.getItem(`quizStats_${folder}`);
        if (stats) {
          setFolderStats(prev => ({
            ...prev,
            [folder]: JSON.parse(stats)
          }));
        }
      } catch (e) {
        console.error(`Error loading stats for folder ${folder}:`, e);
      }
    });
  }, []);

  useEffect(() => {
    // Load files and their stats for selected folder
    if (selectedFolder) {
      const savedFiles = localStorage.getItem(`questionFiles_${selectedFolder}`);
      if (savedFiles) {
        const parsedFiles = JSON.parse(savedFiles);
        setFiles(parsedFiles);

        // Load quiz history to calculate stats for each file
        const quizHistory = localStorage.getItem('quizHistory');
        if (quizHistory) {
          const history = JSON.parse(quizHistory);
          const fileStatsMap = {};

          // Calculate stats for each file
          Object.keys(parsedFiles).forEach(fileName => {
            const fileQuizzes = history.filter(quiz => 
              quiz.folder === selectedFolder && quiz.fileName === fileName
            );

            if (fileQuizzes.length > 0) {
              const totalAttempts = fileQuizzes.length;
              const averageScore = fileQuizzes.reduce((sum, quiz) => 
                sum + (quiz.score / quiz.total), 0) / totalAttempts * 100;
              const bestScore = Math.max(...fileQuizzes.map(quiz => 
                (quiz.score / quiz.total) * 100));
              const averageTime = fileQuizzes.reduce((sum, quiz) => 
                sum + quiz.averageTime, 0) / totalAttempts;

              fileStatsMap[fileName] = {
                attempts: totalAttempts,
                averageScore: Math.round(averageScore),
                bestScore: Math.round(bestScore),
                averageTime: Math.round(averageTime)
              };
            }
          });

          setFileStats(fileStatsMap);
        }
      } else {
        setFiles({});
        setFileStats({});
      }
    }
  }, [selectedFolder]);

  const handleFolderSelect = (folder) => {
    setSelectedFolder(folder);
    setSelectedFile(null);
  };

  const handleFileSelect = (fileName) => {
    setSelectedFile(fileName);
  };

  const handleStartQuiz = () => {
    if (selectedFolder && selectedFile) {
      const fileData = files[selectedFile];
      if (fileData && fileData.questions) {
        // Add fileName to each question
        const questionsWithFileName = fileData.questions.map(q => ({
          ...q,
          fileName: selectedFile
        }));
        onStartQuiz(questionsWithFileName, selectedFolder);
      }
    }
  };

  const handleResetFolderStats = (folder, e) => {
    e.stopPropagation(); // Prevent folder selection when clicking reset
    if (window.confirm(`Are you sure you want to reset all statistics for the "${folder}" folder? This cannot be undone.`)) {
      // Reset folder stats
      const newStats = {
        totalQuestions: 0,
        correctAnswers: 0,
        averageTime: 0,
        bestTime: Infinity,
        quizzesCompleted: 0,
        totalTime: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalStarred: 0,
        practiceSessions: 0,
        categoryStats: {
          General: { total: 0, correct: 0 }
        },
        challengingCategory: null,
        strongestCategory: null,
        lastQuizDate: null
      };
      
      localStorage.setItem(`quizStats_${folder}`, JSON.stringify(newStats));
      setFolderStats(prev => ({
        ...prev,
        [folder]: newStats
      }));

      // Also reset all file stats for this folder
      const newFileStats = { ...fileStats };
      Object.keys(files).forEach(fileName => {
        delete newFileStats[fileName];
      });
      setFileStats(newFileStats);

      // Clear quiz history for this folder
      const quizHistory = localStorage.getItem('quizHistory');
      if (quizHistory) {
        const history = JSON.parse(quizHistory);
        const updatedHistory = history.filter(quiz => quiz.folder !== folder);
        localStorage.setItem('quizHistory', JSON.stringify(updatedHistory));
      }
    }
  };

  const handleResetFileStats = (folder, fileName, e) => {
    e.stopPropagation(); // Prevent file selection when clicking reset
    if (window.confirm(`Are you sure you want to reset statistics for "${fileName}"? This cannot be undone.`)) {
      // Remove file stats
      const newFileStats = { ...fileStats };
      delete newFileStats[fileName];
      setFileStats(newFileStats);

      // Update quiz history
      const quizHistory = localStorage.getItem('quizHistory');
      if (quizHistory) {
        const history = JSON.parse(quizHistory);
        const updatedHistory = history.filter(quiz => 
          !(quiz.folder === folder && quiz.fileName === fileName)
        );
        localStorage.setItem('quizHistory', JSON.stringify(updatedHistory));

        // Update folder stats by recalculating from remaining history
        const folderQuizzes = updatedHistory.filter(quiz => quiz.folder === folder);
        const newFolderStats = {
          totalQuestions: folderQuizzes.reduce((sum, quiz) => sum + quiz.total, 0),
          correctAnswers: folderQuizzes.reduce((sum, quiz) => sum + quiz.score, 0),
          quizzesCompleted: folderQuizzes.length,
          averageTime: folderQuizzes.length ? 
            Math.round(folderQuizzes.reduce((sum, quiz) => sum + quiz.averageTime, 0) / folderQuizzes.length) : 0,
          bestTime: folderQuizzes.length ?
            Math.min(...folderQuizzes.map(quiz => quiz.bestTime)) : Infinity,
          totalTime: folderQuizzes.reduce((sum, quiz) => sum + (quiz.averageTime * quiz.total), 0),
          longestStreak: folderStats[folder]?.longestStreak || 0,
          currentStreak: folderStats[folder]?.currentStreak || 0,
          totalStarred: folderStats[folder]?.totalStarred || 0,
          practiceSessions: folderStats[folder]?.practiceSessions || 0,
          categoryStats: folderStats[folder]?.categoryStats || { General: { total: 0, correct: 0 } },
          challengingCategory: folderStats[folder]?.challengingCategory || null,
          strongestCategory: folderStats[folder]?.strongestCategory || null,
          lastQuizDate: folderQuizzes.length ? 
            Math.max(...folderQuizzes.map(quiz => new Date(quiz.date))) : null
        };

        localStorage.setItem(`quizStats_${folder}`, JSON.stringify(newFolderStats));
        setFolderStats(prev => ({
          ...prev,
          [folder]: newFolderStats
        }));
      }
    }
  };

  const renderDetailedStats = (folder) => {
    const folderStats = JSON.parse(localStorage.getItem(`quizStats_${folder}`) || '{}');
    const accuracy = folderStats.correctAnswers && folderStats.totalQuestions
      ? Math.round((folderStats.correctAnswers / folderStats.totalQuestions) * 100)
      : 0;

    return (
      <StatsPanel>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.5rem', color: '#2d3748' }}>Statistics for {folder}</h3>
          <HeaderActions>
            <ResetButton onClick={(e) => handleResetFolderStats(folder, e)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Reset Stats
            </ResetButton>
          </HeaderActions>
        </div>

        <StatsSection>
          <StatsSectionTitle icon="🎯">Overall Performance</StatsSectionTitle>
          <StatsGrid>
            <StatBox>
              <StatLabel>Total Questions Attempted</StatLabel>
              <StatValue>{folderStats.totalQuestions || 0}</StatValue>
            </StatBox>
            <StatBox>
              <StatLabel>Overall Accuracy</StatLabel>
              <StatValue>
                {accuracy}%
              </StatValue>
            </StatBox>
            <StatBox>
              <StatLabel>Quizzes Completed</StatLabel>
              <StatValue>{folderStats.quizzesCompleted || 0}</StatValue>
            </StatBox>
            <StatBox>
              <StatLabel>Questions per Quiz (Avg)</StatLabel>
              <StatValue>
                {folderStats.quizzesCompleted ? Math.round(folderStats.totalQuestions / folderStats.quizzesCompleted) : 0}
              </StatValue>
            </StatBox>
          </StatsGrid>
        </StatsSection>

        <StatsSection>
          <StatsSectionTitle icon="⏱️">Time Statistics</StatsSectionTitle>
          <StatsGrid>
            <StatBox>
              <StatLabel>Average Time per Question</StatLabel>
              <StatValue>{formatTime(folderStats.averageTime)}</StatValue>
            </StatBox>
            <StatBox>
              <StatLabel>Best Time for a Question</StatLabel>
              <StatValue>{formatTime(folderStats.bestTime)}</StatValue>
            </StatBox>
            <StatBox>
              <StatLabel>Total Study Time</StatLabel>
              <StatValue>{formatTime(folderStats.totalTime)}</StatValue>
            </StatBox>
            <StatBox>
              <StatLabel>Longest Streak</StatLabel>
              <StatValue>{folderStats.longestStreak || 0}</StatValue>
            </StatBox>
          </StatsGrid>
        </StatsSection>

        <StatsSection>
          <StatsSectionTitle icon="📚">Question Categories</StatsSectionTitle>
          <StatsGrid>
            <StatBox>
              <StatLabel>Starred Questions</StatLabel>
              <StatValue>{folderStats.totalStarred || 0}</StatValue>
            </StatBox>
            <StatBox>
              <StatLabel>Most Challenging Category</StatLabel>
              <StatValue>{folderStats.challengingCategory || '-'}</StatValue>
            </StatBox>
            <StatBox>
              <StatLabel>Strongest Category</StatLabel>
              <StatValue>{folderStats.strongestCategory || '-'}</StatValue>
            </StatBox>
            <StatBox>
              <StatLabel>Practice Sessions</StatLabel>
              <StatValue>{folderStats.practiceSessions || 0}</StatValue>
            </StatBox>
          </StatsGrid>
        </StatsSection>
      </StatsPanel>
    );
  };

  const renderFileStats = (folder, fileName) => {
    const fileStats = JSON.parse(localStorage.getItem(`fileStats_${folder}_${fileName}`) || '{}');
    const accuracy = fileStats.correctAnswers && fileStats.totalQuestions
      ? Math.round((fileStats.correctAnswers / fileStats.totalQuestions) * 100)
      : 0;

    return (
      <FileStats>
        <StatItem>
          <span>🎯</span>
          <span>Avg: {accuracy}%</span>
        </StatItem>
        <StatItem>
          <span>��</span>
          <span>Best: {accuracy}%</span>
        </StatItem>
        <StatItem>
          <span>🔄</span>
          <span>Attempts: {fileStats.attempts || 0}</span>
        </StatItem>
      </FileStats>
    );
  };

  return (
    <SelectorContainer>
      <PageTitle>Select Question Set</PageTitle>
      <div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
        <h3>Available Folders</h3>
          <ToggleStatsButton
            active={showDetailedStats}
            onClick={() => setShowDetailedStats(!showDetailedStats)}
          >
            {showDetailedStats ? 'Hide Detailed Stats' : 'Show Detailed Stats'}
          </ToggleStatsButton>
        </div>
        <FolderList>
          {folders.map((folder) => (
            <FolderItem
              key={folder}
              selected={folder === selectedFolder}
              onClick={() => handleFolderSelect(folder)}
            >
              <div>📁 {folder}</div>
              {folderStats[folder] && !showDetailedStats && (
                <FolderStats>
                  <StatItem>
                    <span>📊</span> 
                    Success Rate: {Math.round((folderStats[folder].correctAnswers / folderStats[folder].totalQuestions) * 100) || 0}%
                  </StatItem>
                  <StatItem>
                    <span>🎯</span>
                    Total Questions: {folderStats[folder].totalQuestions || 0}
                  </StatItem>
                  <StatItem>
                    <span>⏱️</span>
                    Avg. Time: {folderStats[folder].averageTime || 0}s
                  </StatItem>
                  <StatItem>
                    <span>🏆</span>
                    Best Streak: {folderStats[folder].longestStreak || 0}
                  </StatItem>
                </FolderStats>
              )}
            </FolderItem>
          ))}
          {folders.length === 0 && (
            <p>No folders available. Create one in the Admin panel.</p>
          )}
        </FolderList>
        {showDetailedStats && selectedFolder && renderDetailedStats(selectedFolder)}
      </div>

      {selectedFolder && (
        <div>
          <h3>Question Sets in {selectedFolder}</h3>
          <FileList>
            {Object.entries(files).map(([name, data]) => (
              <FileCard
                key={name}
                isSelected={selectedFile === name}
                onClick={() => handleFileSelect(name)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ marginBottom: '0.25rem' }}>{name}</div>
                    <div style={{ fontSize: '0.9rem', color: theme.colors.textSecondary }}>
                      {data.questions.length} questions
                    </div>
                    {renderFileStats(selectedFolder, name)}
                  </div>
                  <IconButton
                    onClick={(e) => handleResetFileStats(selectedFolder, name, e)}
                    title="Reset file statistics"
                  >
                    🔄
                  </IconButton>
                </div>
              </FileCard>
            ))}
            {Object.keys(files).length === 0 && (
              <p>No question sets found in this folder. Upload some in the Admin panel.</p>
            )}
          </FileList>
        </div>
      )}

      <Button
        onClick={handleStartQuiz}
        disabled={!selectedFile}
      >
        Start Quiz with Selected Set
      </Button>
    </SelectorContainer>
  );
};

export default QuestionSetSelector; 