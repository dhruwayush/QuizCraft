import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { theme } from '../theme';

const slideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
`;

const ToastContainer = styled.div`
  position: fixed;
  top: ${props => props.position === 'top' ? '1rem' : 'auto'};
  bottom: ${props => props.position === 'bottom' ? '1rem' : 'auto'};
  right: 1rem;
  z-index: ${theme.zIndex.toast};
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  pointer-events: none;
`;

const ToastItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  background: white;
  border-radius: ${theme.borderRadius.lg};
  padding: 1rem;
  box-shadow: ${theme.shadows.lg};
  min-width: 300px;
  max-width: 500px;
  pointer-events: auto;
  animation: ${props => props.isExiting ? slideOut : slideIn} 0.3s ease-in-out;
  border-left: 4px solid ${props => {
    switch (props.type) {
      case 'success': return theme.colors.success;
      case 'error': return theme.colors.danger;
      case 'warning': return theme.colors.warning;
      case 'info': return theme.colors.info;
      default: return theme.colors.primary;
    }
  }};
`;

const IconContainer = styled.div`
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => {
    switch (props.type) {
      case 'success': return theme.colors.success;
      case 'error': return theme.colors.danger;
      case 'warning': return theme.colors.warning;
      case 'info': return theme.colors.info;
      default: return theme.colors.primary;
    }
  }};
`;

const Content = styled.div`
  flex: 1;
`;

const Title = styled.div`
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.textPrimary};
  margin-bottom: 0.25rem;
`;

const Message = styled.div`
  color: ${theme.colors.textSecondary};
  font-size: ${theme.typography.fontSize.sm};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.textMuted};
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${theme.borderRadius.full};
  transition: ${theme.transitions.default};

  &:hover {
    background: ${theme.colors.background};
    color: ${theme.colors.textPrimary};
  }
`;

const ProgressBar = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: ${props => {
    switch (props.type) {
      case 'success': return theme.colors.success;
      case 'error': return theme.colors.danger;
      case 'warning': return theme.colors.warning;
      case 'info': return theme.colors.info;
      default: return theme.colors.primary;
    }
  }};
  width: ${props => (props.progress * 100)}%;
  transition: width 0.1s linear;
`;

const getIcon = (type) => {
  switch (type) {
    case 'success':
      return (
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      );
    case 'error':
      return (
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      );
    case 'warning':
      return (
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      );
    case 'info':
      return (
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
  }
};

const Toast = ({ 
  id, 
  type = 'info', 
  title, 
  message, 
  duration = 5000, 
  onClose,
  position = 'top'
}) => {
  const [progress, setProgress] = useState(1);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    const endTime = startTime + duration;
    
    const updateProgress = () => {
      const now = Date.now();
      const remaining = endTime - now;
      const newProgress = remaining / duration;
      
      if (newProgress <= 0) {
        handleClose();
      } else {
        setProgress(newProgress);
        requestAnimationFrame(updateProgress);
      }
    };

    const progressAnimation = requestAnimationFrame(updateProgress);

    return () => {
      cancelAnimationFrame(progressAnimation);
    };
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(id);
    }, 300);
  };

  return (
    <ToastItem type={type} isExiting={isExiting}>
      <IconContainer type={type}>
        {getIcon(type)}
      </IconContainer>
      <Content>
        {title && <Title>{title}</Title>}
        {message && <Message>{message}</Message>}
      </Content>
      <CloseButton onClick={handleClose} aria-label="Close notification">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </CloseButton>
      <ProgressBar type={type} progress={progress} />
    </ToastItem>
  );
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (toast) => {
    const id = Date.now();
    setToasts(prev => [...prev, { ...toast, id }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <>
      {children}
      <ToastContainer position="top">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            {...toast}
            onClose={removeToast}
          />
        ))}
      </ToastContainer>
    </>
  );
};

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const show = (options) => {
    const id = Date.now();
    const toast = { ...options, id };
    setToasts(prev => [...prev, toast]);
    
    if (options.duration !== 0) {
      setTimeout(() => {
        remove(id);
      }, options.duration || 5000);
    }
    
    return id;
  };

  const remove = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const success = (options) => show({ ...options, type: 'success' });
  const error = (options) => show({ ...options, type: 'error' });
  const warning = (options) => show({ ...options, type: 'warning' });
  const info = (options) => show({ ...options, type: 'info' });

  return {
    toasts,
    show,
    success,
    error,
    warning,
    info,
    remove,
  };
};

export default Toast; 