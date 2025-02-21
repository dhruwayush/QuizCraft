import React from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { theme } from '../theme';

const pulse = keyframes`
  0% { transform: scale(0.95); opacity: 0.5; }
  50% { transform: scale(1); opacity: 1; }
  100% { transform: scale(0.95); opacity: 0.5; }
`;

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  animation: ${pulse} 2s infinite ease-in-out;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid ${theme.colors.background};
  border-top-color: ${theme.colors.primary};
  border-radius: 50%;
  animation: ${rotate} 1s infinite linear;
  margin-bottom: 1rem;
`;

const LoadingText = styled.div`
  color: ${theme.colors.textSecondary};
  font-size: ${theme.typography.fontSize.lg};
  margin-bottom: 0.5rem;
`;

const LoadingSubtext = styled.div`
  color: ${theme.colors.textMuted};
  font-size: ${theme.typography.fontSize.base};
`;

const SkeletonContainer = styled.div`
  padding: 2rem;
  background: white;
  border-radius: ${theme.borderRadius['2xl']};
  box-shadow: ${theme.shadows.lg};
`;

const SkeletonLine = styled.div`
  height: ${props => props.height || '1rem'};
  width: ${props => props.width || '100%'};
  background: linear-gradient(
    to right,
    ${theme.colors.background} 0%,
    ${theme.colors.light} 50%,
    ${theme.colors.background} 100%
  );
  background-size: 1000px 100%;
  animation: ${shimmer} 2s infinite;
  border-radius: ${theme.borderRadius.default};
  margin-bottom: ${props => props.marginBottom || '1rem'};
`;

const ErrorContainer = styled.div`
  padding: 2rem;
  background: ${`${theme.colors.danger}10`};
  border: 1px solid ${theme.colors.danger};
  border-radius: ${theme.borderRadius.xl};
  text-align: center;
  max-width: 500px;
  margin: 2rem auto;
`;

const ErrorIcon = styled.div`
  font-size: 3rem;
  color: ${theme.colors.danger};
  margin-bottom: 1rem;
`;

const ErrorTitle = styled.h3`
  color: ${theme.colors.danger};
  margin: 0 0 1rem;
  font-size: ${theme.typography.fontSize.xl};
`;

const ErrorMessage = styled.p`
  color: ${theme.colors.textSecondary};
  margin: 0 0 1.5rem;
  font-size: ${theme.typography.fontSize.base};
  line-height: ${theme.typography.lineHeight.relaxed};
`;

const RetryButton = styled.button`
  ${theme.mixins.button}
  background: ${theme.colors.danger};
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: ${theme.borderRadius.lg};
  font-weight: ${theme.typography.fontWeight.medium};
  
  &:hover {
    background: ${theme.colors.danger}dd;
  }
`;

export const LoadingSpinner = ({ text, subtext }) => (
  <LoadingContainer>
    <Spinner />
    {text && <LoadingText>{text}</LoadingText>}
    {subtext && <LoadingSubtext>{subtext}</LoadingSubtext>}
  </LoadingContainer>
);

export const SkeletonLoader = ({ lines = 3, options = 4 }) => (
  <SkeletonContainer>
    <SkeletonLine height="2rem" width="60%" marginBottom="2rem" />
    {[...Array(lines)].map((_, i) => (
      <SkeletonLine 
        key={i} 
        width={`${Math.random() * 40 + 60}%`}
        marginBottom="1.5rem"
      />
    ))}
    {[...Array(options)].map((_, i) => (
      <SkeletonLine 
        key={`option-${i}`}
        height="3rem"
        marginBottom="1rem"
      />
    ))}
  </SkeletonContainer>
);

export const ErrorState = ({ title, message, onRetry }) => (
  <ErrorContainer>
    <ErrorIcon>⚠️</ErrorIcon>
    <ErrorTitle>{title}</ErrorTitle>
    <ErrorMessage>{message}</ErrorMessage>
    {onRetry && (
      <RetryButton onClick={onRetry}>
        Try Again
      </RetryButton>
    )}
  </ErrorContainer>
);

export default {
  LoadingSpinner,
  SkeletonLoader,
  ErrorState,
}; 