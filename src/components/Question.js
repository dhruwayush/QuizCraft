import React, { useState } from 'react';
import styled from '@emotion/styled';
import { theme, mixins } from '../theme';
import { keyframes } from '@emotion/react';
import Modal from './Modal';

const slideIn = keyframes`
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const QuestionContainer = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 2rem;
  margin-bottom: 2rem;
  animation: ${slideIn} 0.3s ease-out;
  position: relative;
  overflow: hidden;
`;

const QuestionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid ${theme.colors.border};
`;

const QuestionNumber = styled.div`
  font-size: 0.9rem;
  color: ${theme.colors.textSecondary};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const QuestionControls = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  z-index: 1;
`;

const QuestionText = styled.div`
  font-size: 1.2rem;
  color: ${theme.colors.textPrimary};
  line-height: 1.6;
  margin-bottom: 2rem;
  font-weight: 500;

  code {
    background: ${theme.colors.background};
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    font-size: 0.9em;
    font-family: 'Fira Code', monospace;
  }

  pre {
    background: ${theme.colors.background};
    padding: 1rem;
    border-radius: 8px;
    overflow-x: auto;
    font-family: 'Fira Code', monospace;
    font-size: 0.9em;
    line-height: 1.4;
    margin: 1rem 0;
  }
`;

const OptionsGrid = styled.div`
  display: grid;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const OptionButton = styled.button`
  width: 100%;
  padding: 1.25rem;
  border: 2px solid ${props => {
    if (props.isCorrect) return theme.colors.success;
    if (props.isSelected && !props.showAnswer) return theme.colors.primary;
    if (props.isSelected && props.showAnswer) return theme.colors.danger;
    return theme.colors.border;
  }};
  border-radius: 12px;
  background: ${props => {
    if (props.isCorrect) return `${theme.colors.success}10`;
    if (props.isSelected && !props.showAnswer) return `${theme.colors.primary}10`;
    if (props.isSelected && props.showAnswer) return `${theme.colors.danger}10`;
    return 'white';
  }};
  color: ${theme.colors.textPrimary};
  font-size: 1rem;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 1rem;
  position: relative;
  overflow: hidden;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    border-color: ${props => !props.showAnswer && theme.colors.primary};
    background: ${props => !props.showAnswer && `${theme.colors.primary}10`};
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    cursor: default;
    opacity: ${props => props.showAnswer ? 1 : 0.7};
  }

  ${props => props.isLoading && `
    &:before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        to right,
        transparent 0%,
        ${theme.colors.background} 50%,
        transparent 100%
      );
      animation: ${shimmer} 1.5s infinite;
    }
  `}
`;

const OptionIcon = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: 500;
  background: ${props => {
    if (props.isCorrect) return theme.colors.success;
    if (props.isSelected && !props.showAnswer) return theme.colors.primary;
    if (props.isSelected && props.showAnswer) return theme.colors.danger;
    return theme.colors.background;
  }};
  color: ${props => props.isSelected || props.isCorrect ? 'white' : theme.colors.textSecondary};
`;

const OptionText = styled.span`
  flex: 1;
`;

const ExplanationBox = styled.div`
  margin-top: 2rem;
  padding: 1.5rem;
  background: ${theme.colors.background};
  border-radius: 12px;
  border-left: 4px solid ${theme.colors.primary};

  h4 {
    margin: 0 0 1rem;
    color: ${theme.colors.textPrimary};
    font-size: 1.1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  p {
    margin: 0;
    color: ${theme.colors.textSecondary};
    line-height: 1.6;
  }
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  background: ${props => {
    if (props.variant === 'primary') return theme.colors.primary;
    if (props.variant === 'danger') return theme.colors.danger;
    return theme.colors.background;
  }};
  
  color: ${props => props.variant ? 'white' : theme.colors.textPrimary};
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const StarButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: ${props => props.isStarred ? '#ffc107' : '#e0e0e0'};
  transition: all 0.2s ease;
  padding: 0.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;

  &:hover {
    transform: scale(1.1);
    color: ${props => props.isStarred ? '#ffc107' : '#ffd700'};
    background-color: ${props => props.isStarred ? 'rgba(255, 193, 7, 0.1)' : 'rgba(255, 215, 0, 0.1)'};
  }

  &:active {
    transform: scale(0.95);
  }
`;

const ReportButton = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.textSecondary};
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    color: ${theme.colors.danger};
    background: ${theme.colors.background};
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const ReportModal = styled.div`
  padding: 1rem;
`;

const ReportTextArea = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: 0.75rem;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  margin: 1rem 0;
  font-family: inherit;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 2px ${theme.colors.primary}20;
  }
`;

const Question = ({ 
  question, 
  selectedAnswer, 
  onSelectAnswer, 
  answered,
  isStarred,
  onToggleStar,
  questionNumber,
  category,
  options,
  selectedOption,
  showAnswer,
  correctOption,
  explanation,
  onSelectOption,
  isLoading,
  onReportQuestion,
  folder,
  fileName
}) => {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');

  const handleReport = () => {
    if (!reportReason.trim()) return;
    
    const report = {
      questionNumber,
      question,
      options,
      correctOption,
      explanation,
      folder,
      fileName,
      reason: reportReason,
      timestamp: new Date().toISOString(),
      status: 'pending' // pending, reviewed, fixed, invalid
    };

    onReportQuestion(report);
    setIsReportModalOpen(false);
    setReportReason('');
  };

  return (
    <QuestionContainer>
      <QuestionHeader>
        <QuestionNumber>
          <span>Question {questionNumber}</span>
          {category && (
            <>
              <span>•</span>
              <span>{category}</span>
            </>
          )}
        </QuestionNumber>
        <QuestionControls>
          <ReportButton
            onClick={() => setIsReportModalOpen(true)}
            title="Report question"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </ReportButton>
          <StarButton
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleStar();
            }}
            isStarred={isStarred}
            title={isStarred ? "Remove from starred" : "Add to starred"}
          >
            {isStarred ? '⭐' : '☆'}
          </StarButton>
        </QuestionControls>
      </QuestionHeader>

      <QuestionText dangerouslySetInnerHTML={{ __html: question }} />

      <OptionsGrid>
        {options.map((option, index) => (
          <OptionButton
            key={index}
            onClick={() => onSelectOption(option.text)}
            isSelected={selectedOption === option.text}
            isCorrect={showAnswer && correctOption === option.text}
            showAnswer={showAnswer}
            disabled={showAnswer || isLoading}
            isLoading={isLoading}
          >
            <OptionIcon
              isSelected={selectedOption === option.text}
              isCorrect={showAnswer && correctOption === option.text}
              showAnswer={showAnswer}
            >
              {String.fromCharCode(65 + index)}
            </OptionIcon>
            <OptionText dangerouslySetInnerHTML={{ __html: option.text }} />
          </OptionButton>
        ))}
      </OptionsGrid>

      {showAnswer && explanation && (
        <ExplanationBox>
          <h4>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Explanation
          </h4>
          <p dangerouslySetInnerHTML={{ __html: explanation }} />
        </ExplanationBox>
      )}

      <Modal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        title="Report Question"
        size="md"
        footer={
          <>
            <Button onClick={() => setIsReportModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={handleReport}
              disabled={!reportReason.trim()}
            >
              Submit Report
            </Button>
          </>
        }
      >
        <ReportModal>
          <p>Please describe the issue with this question:</p>
          <ReportTextArea
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            placeholder="e.g., Incorrect answer, unclear wording, missing information..."
          />
          <p style={{ color: theme.colors.textSecondary, fontSize: '0.9rem' }}>
            Your report will be reviewed by the administrators.
          </p>
        </ReportModal>
      </Modal>
    </QuestionContainer>
  );
};

export default Question;
