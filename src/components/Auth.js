import React, { useState } from 'react';
import styled from '@emotion/styled';
import { theme } from '../theme';
import { useSupabase } from '../contexts/SupabaseContext';

// Styled components
const AuthContainer = styled.div`
  max-width: 500px;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: ${theme.shadows.md};
`;

const Title = styled.h2`
  color: ${theme.colors.primary};
  margin-bottom: 1.5rem;
  text-align: center;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.9rem;
  color: ${theme.colors.textSecondary};
`;

const Input = styled.input`
  padding: 0.8rem;
  border: 1px solid ${theme.colors.border};
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 2px ${theme.colors.primaryLight};
  }
`;

const Button = styled.button`
  padding: 0.8rem;
  background: ${theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: ${theme.colors.primaryDark};
  }

  &:disabled {
    background: ${theme.colors.disabled};
    cursor: not-allowed;
  }
`;

const ToggleText = styled.p`
  text-align: center;
  color: ${theme.colors.textSecondary};
  margin-top: 1.5rem;
`;

const ToggleButton = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.primary};
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  margin-left: 0.5rem;
`;

const ErrorMessage = styled.div`
  color: ${theme.colors.error};
  background: ${theme.colors.errorLight};
  padding: 0.8rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
`;

const Auth = () => {
  const { signIn, signUp, error, clearError, loading } = useSupabase();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    username: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleToggleMode = () => {
    setIsLogin(!isLogin);
    clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    try {
      if (isLogin) {
        // Login
        await signIn(formData.email, formData.password);
      } else {
        // Register
        const userData = {
          full_name: formData.fullName,
          username: formData.username,
        };
        await signUp(formData.email, formData.password, userData);
      }
    } catch (error) {
      // Error is already handled in the context
      console.error('Authentication error:', error.message);
    }
  };

  return (
    <AuthContainer>
      <Title>{isLogin ? 'Log In' : 'Create Account'}</Title>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      <Form onSubmit={handleSubmit}>
        {!isLogin && (
          <>
            <FormGroup>
              <Label htmlFor="username">Username</Label>
              <Input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </FormGroup>
          </>
        )}
        
        <FormGroup>
          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="password">Password</Label>
          <Input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={6}
          />
        </FormGroup>
        
        <Button type="submit" disabled={loading}>
          {loading ? 'Processing...' : isLogin ? 'Log In' : 'Create Account'}
        </Button>
      </Form>
      
      <ToggleText>
        {isLogin ? "Don't have an account?" : "Already have an account?"}
        <ToggleButton type="button" onClick={handleToggleMode}>
          {isLogin ? 'Sign Up' : 'Log In'}
        </ToggleButton>
      </ToggleText>
    </AuthContainer>
  );
};

export default Auth; 