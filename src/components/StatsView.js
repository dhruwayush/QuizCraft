import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { theme } from '../theme';

const OPENROUTER_API_KEY = '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';
const GEMINI_API_KEY = 'AIzaSyCX0KeV2M_q784a9SbfhJJV1k1YjPDVApE';

const StatsContainer = styled.div`
  padding: 2rem;
  background: white;
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.md};
`;

const StatsHeader = styled.div`
  margin-bottom: 2rem;
  text-align: center;
`;

const StatsTitle = styled.h2`
  color: ${theme.colors.textPrimary};
  margin-bottom: 0.5rem;
`;

const StatsSubtitle = styled.p`
  color: ${theme.colors.textSecondary};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  padding: 1.5rem;
  background: ${theme.colors.background};
  border-radius: ${theme.borderRadius.md};
  border: 1px solid ${theme.colors.border};
  transition: ${theme.transitions.default};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.md};
  }
`;

const StatCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const StatCardTitle = styled.h3`
  color: ${theme.colors.textPrimary};
  margin: 0;
`;

const StatsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const StatItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: white;
  border-radius: ${theme.borderRadius.sm};
`;

const StatLabel = styled.span`
  color: ${theme.colors.textSecondary};
`;

const StatValue = styled.span`
  color: ${theme.colors.textPrimary};
  font-weight: 500;
`;

const TabContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid ${theme.colors.border};
  padding-bottom: 1rem;
  flex-wrap: wrap;
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

  &:hover {
    color: ${theme.colors.primary};
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: ${theme.colors.background};
  border-radius: 4px;
  margin: 0.5rem 0;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  width: ${props => props.value}%;
  height: 100%;
  background: ${props => props.color || theme.colors.primary};
  border-radius: 4px;
  transition: width 0.3s ease;
`;

const InsightsCard = styled(StatCard)`
  grid-column: 1 / -1;
  background: ${theme.colors.primary}05;
`;

const InsightsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const InsightItem = styled.li`
  padding: 1rem;
  margin-bottom: 0.5rem;
  background: white;
  border-radius: ${theme.borderRadius.md};
  border-left: 4px solid ${theme.colors.primary};
`;

const TrendChart = styled.div`
  height: 100px;
  display: flex;
  align-items: flex-end;
  gap: 4px;
  padding: 1rem 0;
`;

const TrendBar = styled.div`
  flex: 1;
  background: ${theme.colors.primary}40;
  height: ${props => props.height}%;
  border-radius: 4px 4px 0 0;
  transition: height 0.3s ease;
  position: relative;
  
  &:hover::after {
    content: '${props => props.tooltip}';
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: ${theme.colors.dark};
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.75rem;
    white-space: nowrap;
  }
`;

const FileStatCard = styled(StatCard)`
  border-left: 4px solid ${theme.colors.primary};
`;

const FolderSection = styled.div`
  margin-bottom: 2rem;
`;

const FolderTitle = styled.h3`
  color: ${theme.colors.textPrimary};
  margin: 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid ${theme.colors.border};
`;

const StatsView = () => {
  const [activeTab, setActiveTab] = useState('overall');
  const [stats, setStats] = useState({
    overall: {},
    folders: {},
    files: {},
    trends: {},
    insights: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const calculateTrends = (data) => {
    // Calculate trends from the last 7 quizzes
    const recentQuizzes = data.recentQuizzes || [];
    return {
      accuracyTrend: recentQuizzes.map(q => q.accuracy),
      timeTrend: recentQuizzes.map(q => q.timePerQuestion),
      improvementRate: calculateImprovementRate(recentQuizzes)
    };
  };

  const calculateImprovementRate = (quizzes) => {
    if (quizzes.length < 2) return 0;
    const firstHalf = quizzes.slice(0, Math.floor(quizzes.length / 2));
    const secondHalf = quizzes.slice(Math.floor(quizzes.length / 2));
    
    const firstAvg = average(firstHalf.map(q => q.accuracy));
    const secondAvg = average(secondHalf.map(q => q.accuracy));
    
    return ((secondAvg - firstAvg) / firstAvg) * 100;
  };

  const average = arr => arr.reduce((a, b) => a + b, 0) / arr.length;

  const generateAIInsights = async (statsData) => {
    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `As an expert quiz performance analyst, analyze these quiz statistics and provide 3-5 specific insights and recommendations:
                Overall Accuracy: ${statsData.overall.accuracy}%
                Total Quizzes: ${statsData.overall.totalQuizzes}
                Average Time per Question: ${statsData.overall.averageTimePerQuestion}s
                Improvement Rate: ${statsData.trends?.improvementRate}%
                Strong Categories: ${statsData.strongCategories?.join(', ')}
                Weak Categories: ${statsData.weakCategories?.join(', ')}
                Recent Performance Trend: ${statsData.trends?.accuracyTrend?.join(', ')}%

                Format your response as a bullet-point list with clear, actionable insights.`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate insights');
      }

      const data = await response.json();
      const text = data.candidates[0].content.parts[0].text;
      
      // Split the response into bullet points and clean them up
      return text
        .split('\n')
        .filter(line => line.trim().startsWith('•') || line.trim().startsWith('-'))
        .map(line => line.trim().replace(/^[•-]\s*/, ''))
        .filter(line => line.length > 0);
    } catch (error) {
      console.error('Error generating insights:', error);
      return [
        'Your overall accuracy shows room for improvement',
        'Focus on reviewing questions in weak categories',
        'Try to maintain a consistent study schedule'
      ];
    }
  };

  const loadStats = async () => {
    setIsLoading(true);
    const folders = JSON.parse(localStorage.getItem('questionFolders') || '[]');
    let totalQuestions = 0;
    let totalCorrect = 0;
    let totalQuizzes = 0;
    let totalTime = 0;
    let bestTime = Infinity;
    let recentQuizzes = [];
    let categoryPerformance = {};
    let fileStats = {};

    // Process folder and file stats
    const folderStats = {};
    folders.forEach(folder => {
      const stats = JSON.parse(localStorage.getItem(`quizStats_${folder}`) || '{}');
      const files = JSON.parse(localStorage.getItem(`questionFiles_${folder}`) || '{}');
      
      fileStats[folder] = {};
      
      // Process file stats
      Object.keys(files).forEach(fileName => {
        const fileStatKey = `fileStats_${folder}_${fileName}`;
        const fileStat = JSON.parse(localStorage.getItem(fileStatKey) || '{}');
        
        if (fileStat.attempts) {
          fileStats[folder][fileName] = {
            ...fileStat,
            accuracy: (fileStat.correctAnswers / fileStat.totalQuestions) * 100,
            averageTimePerQuestion: fileStat.totalTime / fileStat.totalQuestions,
            lastAttemptDate: new Date(fileStat.lastAttemptDate).toLocaleDateString()
          };
        }
      });

      if (stats.quizzesCompleted) {
        totalQuestions += stats.totalQuestions || 0;
        totalCorrect += stats.correctAnswers || 0;
        totalQuizzes += stats.quizzesCompleted || 0;
        totalTime += stats.totalTime || 0;
        bestTime = Math.min(bestTime, stats.bestTime || Infinity);
        
        categoryPerformance[folder] = {
          accuracy: (stats.correctAnswers / stats.totalQuestions) * 100,
          attempts: stats.quizzesCompleted
        };

        if (stats.recentQuizzes) {
          recentQuizzes = [...recentQuizzes, ...stats.recentQuizzes];
        }

        folderStats[folder] = {
          ...stats,
          accuracy: (stats.correctAnswers / stats.totalQuestions) * 100,
          averageTimePerQuestion: stats.totalTime / stats.totalQuestions,
          consistencyScore: calculateConsistencyScore(stats.recentQuizzes || [])
        };
      }
    });

    // Sort recent quizzes by timestamp and take last 7
    recentQuizzes.sort((a, b) => b.timestamp - a.timestamp);
    recentQuizzes = recentQuizzes.slice(0, 7);

    // Calculate strong and weak categories
    const categories = Object.entries(categoryPerformance)
      .sort((a, b) => b[1].accuracy - a[1].accuracy);
    
    const strongCategories = categories.slice(0, 3).map(([cat]) => cat);
    const weakCategories = categories.slice(-3).map(([cat]) => cat);

    const overallStats = {
      totalQuestions,
      totalCorrect,
      totalQuizzes,
      totalTime,
      bestTime: bestTime === Infinity ? 0 : bestTime,
      accuracy: totalQuestions ? (totalCorrect / totalQuestions) * 100 : 0,
      averageTimePerQuestion: totalQuestions ? totalTime / totalQuestions : 0,
      recentQuizzes,
      strongCategories,
      weakCategories
    };

    const trends = calculateTrends({ recentQuizzes });
    
    // Generate AI insights
    const insights = await generateAIInsights({
      overall: overallStats,
      trends,
      strongCategories,
      weakCategories
    });

    setStats({
      overall: overallStats,
      folders: folderStats,
      files: fileStats,
      trends,
      insights
    });
    setIsLoading(false);
  };

  const calculateConsistencyScore = (quizzes) => {
    if (!quizzes || quizzes.length < 2) return 100;
    
    const accuracies = quizzes.map(q => q.accuracy);
    const mean = average(accuracies);
    const variance = average(accuracies.map(x => Math.pow(x - mean, 2)));
    const standardDeviation = Math.sqrt(variance);
    
    // Convert to a 0-100 score where lower deviation means higher consistency
    return Math.max(0, 100 - (standardDeviation * 2));
  };

  const formatTime = (seconds) => {
    if (!seconds) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <StatsContainer>
      <StatsHeader>
        <StatsTitle>Quiz Statistics</StatsTitle>
        <StatsSubtitle>Track your progress and performance</StatsSubtitle>
      </StatsHeader>

      <TabContainer>
        <TabButton 
          active={activeTab === 'overall'} 
          onClick={() => setActiveTab('overall')}
        >
          Overall Stats
        </TabButton>
        <TabButton 
          active={activeTab === 'folders'} 
          onClick={() => setActiveTab('folders')}
        >
          Category Stats
        </TabButton>
        <TabButton 
          active={activeTab === 'questionSets'} 
          onClick={() => setActiveTab('questionSets')}
        >
          Question Sets
        </TabButton>
        <TabButton 
          active={activeTab === 'trends'} 
          onClick={() => setActiveTab('trends')}
        >
          Trends & Analysis
        </TabButton>
      </TabContainer>

      {activeTab === 'overall' && (
        <StatsGrid>
          <StatCard>
            <StatCardHeader>
              <StatCardTitle>Performance Overview</StatCardTitle>
            </StatCardHeader>
            <StatsList>
              <StatItem>
                <StatLabel>Overall Accuracy</StatLabel>
                <StatValue>{Math.round(stats.overall.accuracy)}%</StatValue>
              </StatItem>
              <ProgressBar>
                <ProgressFill 
                  value={stats.overall.accuracy}
                  color={theme.colors.primary}
                />
              </ProgressBar>
              <StatItem>
                <StatLabel>Total Quizzes Completed</StatLabel>
                <StatValue>{stats.overall.totalQuizzes}</StatValue>
              </StatItem>
              <StatItem>
                <StatLabel>Questions Attempted</StatLabel>
                <StatValue>{stats.overall.totalQuestions}</StatValue>
              </StatItem>
              <StatItem>
                <StatLabel>Average Time per Question</StatLabel>
                <StatValue>{formatTime(stats.overall.averageTimePerQuestion)}</StatValue>
              </StatItem>
            </StatsList>
          </StatCard>

          <StatCard>
            <StatCardHeader>
              <StatCardTitle>Strengths & Weaknesses</StatCardTitle>
            </StatCardHeader>
            <StatsList>
              <StatItem>
                <StatLabel>Strongest Categories</StatLabel>
                <StatValue>{stats.overall.strongCategories?.join(', ')}</StatValue>
              </StatItem>
              <StatItem>
                <StatLabel>Areas for Improvement</StatLabel>
                <StatValue>{stats.overall.weakCategories?.join(', ')}</StatValue>
              </StatItem>
            </StatsList>
          </StatCard>

          <InsightsCard>
            <StatCardHeader>
              <StatCardTitle>AI-Powered Insights</StatCardTitle>
            </StatCardHeader>
            <InsightsList>
              {stats.insights.map((insight, index) => (
                <InsightItem key={index}>{insight}</InsightItem>
              ))}
            </InsightsList>
          </InsightsCard>
        </StatsGrid>
      )}

      {activeTab === 'folders' && (
        <StatsGrid>
          {Object.entries(stats.folders).map(([folder, folderStat]) => (
            <StatCard key={folder}>
              <StatCardHeader>
                <StatCardTitle>{folder}</StatCardTitle>
              </StatCardHeader>
              <StatsList>
                <StatItem>
                  <StatLabel>Accuracy</StatLabel>
                  <StatValue>{Math.round(folderStat.accuracy)}%</StatValue>
                </StatItem>
                <ProgressBar>
                  <ProgressFill value={folderStat.accuracy} />
                </ProgressBar>
                <StatItem>
                  <StatLabel>Consistency Score</StatLabel>
                  <StatValue>{Math.round(folderStat.consistencyScore)}%</StatValue>
                </StatItem>
                <StatItem>
                  <StatLabel>Average Time</StatLabel>
                  <StatValue>{formatTime(folderStat.averageTime)}</StatValue>
                </StatItem>
                <StatItem>
                  <StatLabel>Total Questions</StatLabel>
                  <StatValue>{folderStat.totalQuestions}</StatValue>
                </StatItem>
              </StatsList>
            </StatCard>
          ))}
        </StatsGrid>
      )}

      {activeTab === 'questionSets' && (
        <div>
          {Object.entries(stats.files)
            .filter(([_, folderFiles]) => Object.keys(folderFiles).length > 0)
            .map(([folder, folderFiles]) => (
              <FolderSection key={folder}>
                <FolderTitle>{folder}</FolderTitle>
                <StatsGrid>
                  {Object.entries(folderFiles).map(([fileName, fileStat]) => (
                    <FileStatCard key={fileName}>
                      <StatCardHeader>
                        <StatCardTitle>{fileName}</StatCardTitle>
                      </StatCardHeader>
                      <StatsList>
                        <StatItem>
                          <StatLabel>Accuracy</StatLabel>
                          <StatValue>{Math.round(fileStat.accuracy)}%</StatValue>
                        </StatItem>
                        <ProgressBar>
                          <ProgressFill value={fileStat.accuracy} />
                        </ProgressBar>
                        <StatItem>
                          <StatLabel>Total Attempts</StatLabel>
                          <StatValue>{fileStat.attempts}</StatValue>
                        </StatItem>
                        <StatItem>
                          <StatLabel>Questions</StatLabel>
                          <StatValue>{fileStat.totalQuestions}</StatValue>
                        </StatItem>
                        <StatItem>
                          <StatLabel>Average Time</StatLabel>
                          <StatValue>{formatTime(fileStat.averageTimePerQuestion)}</StatValue>
                        </StatItem>
                        <StatItem>
                          <StatLabel>Best Time</StatLabel>
                          <StatValue>{formatTime(fileStat.bestTime)}</StatValue>
                        </StatItem>
                        <StatItem>
                          <StatLabel>Last Attempt</StatLabel>
                          <StatValue>{fileStat.lastAttemptDate}</StatValue>
                        </StatItem>
                      </StatsList>
                    </FileStatCard>
                  ))}
                </StatsGrid>
              </FolderSection>
          ))}
          {Object.keys(stats.files).length === 0 || 
           Object.values(stats.files).every(folder => Object.keys(folder).length === 0) ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '2rem', 
              color: theme.colors.textSecondary 
            }}>
              No question set statistics available yet. Complete some quizzes to see statistics here.
            </div>
          ) : null}
        </div>
      )}

      {activeTab === 'trends' && (
        <StatsGrid>
          <StatCard>
            <StatCardHeader>
              <StatCardTitle>Recent Accuracy Trend</StatCardTitle>
            </StatCardHeader>
            <TrendChart>
              {stats.trends.accuracyTrend?.map((accuracy, index) => (
                <TrendBar 
                  key={index}
                  height={accuracy}
                  tooltip={`Quiz ${index + 1}: ${Math.round(accuracy)}%`}
                />
              ))}
            </TrendChart>
          </StatCard>

          <StatCard>
            <StatCardHeader>
              <StatCardTitle>Progress Indicators</StatCardTitle>
            </StatCardHeader>
            <StatsList>
              <StatItem>
                <StatLabel>Improvement Rate</StatLabel>
                <StatValue>
                  {stats.trends.improvementRate > 0 ? '+' : ''}
                  {Math.round(stats.trends.improvementRate)}%
                </StatValue>
              </StatItem>
              <StatItem>
                <StatLabel>Learning Curve</StatLabel>
                <StatValue>
                  {stats.trends.improvementRate > 5 ? 'Rapid Growth' :
                   stats.trends.improvementRate > 0 ? 'Steady Progress' :
                   'Needs Focus'}
                </StatValue>
              </StatItem>
            </StatsList>
          </StatCard>
        </StatsGrid>
      )}
    </StatsContainer>
  );
};

export default StatsView; 