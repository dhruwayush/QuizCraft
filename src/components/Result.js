import React from 'react';
import styled from '@emotion/styled';

const ResultContainer = styled.div`
  text-align: center;
  padding: 2rem;
`;

const Score = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: ${props => {
    const percentage = (props.score / props.total) * 100;
    if (percentage >= 80) return '#28a745';
    if (percentage >= 60) return '#ffc107';
    return '#dc3545';
  }};
  margin-bottom: 1rem;
`;

const TimeStats = styled.div`
  margin: 1rem 0;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
`;

const Result = ({ score, total, averageTime, bestTime }) => {
  const percentage = Math.round((score / total) * 100);
  
  return (
    <ResultContainer>
      <h2>Quiz Complete!</h2>
      <Score score={score} total={total}>
        {score} / {total} ({percentage}%)
      </Score>
      <TimeStats>
        <p>Average Time per Question: {averageTime}s</p>
        <p>Best Time for a Question: {bestTime}s</p>
      </TimeStats>
      <div>
        {percentage >= 80 && '🎉 Excellent work!'}
        {percentage >= 60 && percentage < 80 && '👍 Good job!'}
        {percentage < 60 && '📚 Keep practicing!'}
      </div>
    </ResultContainer>
  );
};

export default Result;
