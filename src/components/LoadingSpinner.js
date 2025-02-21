import React from 'react';
import styled from '@emotion/styled';
import { theme } from '../theme';

const SpinnerContainer = styled.div`
  ${props => props.fullScreen ? `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.9);
    z-index: ${theme.zIndex[50]};
  ` : ''}
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: ${props => props.fullScreen ? '0' : theme.spacing[8]};
  gap: ${theme.spacing[4]};
`;

const SpinnerWrapper = styled.div`
  position: relative;
  width: ${props => props.size === 'small' ? '24px' : '48px'};
  height: ${props => props.size === 'small' ? '24px' : '48px'};
`;

const Spinner = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  border: 3px solid transparent;
  border-top-color: ${theme.colors.primary};
  border-radius: ${theme.borderRadius.full};
  animation: spin 1s cubic-bezier(0.76, 0.35, 0.2, 0.7) infinite;

  &::before {
    content: '';
    position: absolute;
    top: -3px;
    left: -3px;
    right: -3px;
    bottom: -3px;
    border: 3px solid ${theme.colors.primary}20;
    border-radius: ${theme.borderRadius.full};
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const SpinnerRing = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  border: 3px solid ${theme.colors.primary}10;
  border-radius: ${theme.borderRadius.full};
`;

const LoadingText = styled.div`
  color: ${theme.colors.textSecondary};
  font-family: ${theme.typography.fontFamily.primary};
  font-size: ${props => props.size === 'small' ? 
    theme.typography.fontSize.sm : 
    theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.medium};
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

const LoadingSpinner = ({ 
  size = 'default',
  text = 'Loading...',
  fullScreen = false,
  showText = true
}) => (
  <SpinnerContainer fullScreen={fullScreen}>
    <SpinnerWrapper size={size}>
      <SpinnerRing />
      <Spinner />
    </SpinnerWrapper>
    {showText && <LoadingText size={size}>{text}</LoadingText>}
  </SpinnerContainer>
);

export default LoadingSpinner; 