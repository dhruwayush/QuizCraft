import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { theme } from '../theme';
import { checkEnvironmentVariables } from '../utils/envCheck';

const Container = styled.div`
  background: white;
  border-radius: ${theme.borderRadius.lg};
  padding: 2rem;
  box-shadow: ${theme.shadows.md};
  margin-bottom: 2rem;
`;

const Header = styled.h2`
  color: ${theme.colors.primary};
  margin-top: 0;
  margin-bottom: 1.5rem;
`;

const Description = styled.p`
  margin-bottom: 1.5rem;
  line-height: 1.6;
  color: ${theme.colors.textSecondary};
`;

const EnvSection = styled.div`
  margin-bottom: 2rem;
`;

const EnvDisplay = styled.div`
  background: ${theme.colors.backgroundLight};
  padding: 1rem;
  border-radius: ${theme.borderRadius.md};
  font-family: monospace;
  margin-bottom: 1rem;
  position: relative;
`;

const EnvRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid ${theme.colors.borderColor};
  
  &:last-child {
    border-bottom: none;
  }
`;

const EnvLabel = styled.span`
  font-weight: 600;
  color: ${theme.colors.textPrimary};
`;

const EnvValue = styled.span`
  color: ${theme.colors.textSecondary};
  word-break: break-all;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin: 1.5rem 0;
`;

const Button = styled.button`
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: ${theme.borderRadius.md};
  background: ${props => props.secondary ? theme.colors.secondary : theme.colors.primary};
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: ${theme.transitions.default};

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    background: ${theme.colors.gray};
    cursor: not-allowed;
  }
`;

const Message = styled.div`
  padding: 1rem;
  border-radius: ${theme.borderRadius.md};
  margin: 1rem 0;
  background: ${props => props.type === 'success' 
    ? theme.colors.success 
    : props.type === 'error' 
      ? theme.colors.error 
      : theme.colors.infoLight};
  color: ${props => props.type === 'success' 
    ? theme.colors.successDark 
    : props.type === 'error' 
      ? theme.colors.errorDark 
      : theme.colors.infoDark};
`;

const EnvManager = () => {
  const [environment, setEnvironment] = useState({});
  const [message, setMessage] = useState(null);
  
  useEffect(() => {
    loadEnvironmentData();
  }, []);
  
  const loadEnvironmentData = () => {
    const envData = checkEnvironmentVariables();
    setEnvironment(envData);
  };
  
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setMessage({ type: 'success', text: 'Copied to clipboard!' });
        setTimeout(() => setMessage(null), 3000);
      },
      (err) => {
        setMessage({ type: 'error', text: 'Failed to copy text: ' + err });
      }
    );
  };
  
  const generateVercelConfig = () => {
    const vercelEnv = {};
    
    // Copy over the necessary environment variables
    if (environment.SUPABASE_URL) {
      vercelEnv.REACT_APP_SUPABASE_URL = environment.SUPABASE_URL;
    }
    
    if (environment.HAS_SUPABASE_KEY) {
      vercelEnv.REACT_APP_SUPABASE_ANON_KEY = '(Your Supabase Anon Key - add this manually)';
    }
    
    // Use a production server URL instead of localhost
    vercelEnv.REACT_APP_SERVER_URL = 'https://your-production-server.vercel.app/api';
    
    // Generate the configuration JSON
    const configJson = JSON.stringify(vercelEnv, null, 2);
    
    copyToClipboard(configJson);
  };
  
  return (
    <Container>
      <Header>Environment Manager</Header>
      
      <Description>
        Use this tool to manage environment configurations across different environments (local, staging, production).
        This helps ensure your app connects to the right Supabase project and server in each environment.
      </Description>
      
      <EnvSection>
        <Header>Current Environment</Header>
        
        <EnvDisplay>
          {Object.entries(environment).map(([key, value]) => (
            <EnvRow key={key}>
              <EnvLabel>{key}</EnvLabel>
              <EnvValue>{value}</EnvValue>
            </EnvRow>
          ))}
        </EnvDisplay>
        
        <Description>
          This shows the current environment configuration for your app. 
          The localhost version should be connecting to your development Supabase project.
        </Description>
      </EnvSection>
      
      <EnvSection>
        <Header>Deployment Configuration</Header>
        
        <Description>
          To ensure your Vercel deployment works correctly with Supabase:
        </Description>
        
        <ol style={{ marginLeft: '1.5rem', lineHeight: '1.6' }}>
          <li>Click the "Generate Vercel Config" button below</li>
          <li>Go to your Vercel project settings</li>
          <li>Navigate to the "Environment Variables" section</li>
          <li>Paste the copied configuration</li>
          <li>Update any placeholder values with your actual keys</li>
          <li>Redeploy your application</li>
        </ol>
        
        <ButtonGroup>
          <Button onClick={generateVercelConfig}>
            Generate Vercel Config
          </Button>
        </ButtonGroup>
        
        {message && (
          <Message type={message.type}>
            {message.text}
          </Message>
        )}
      </EnvSection>
      
      <EnvSection>
        <Header>Data Synchronization</Header>
        
        <Description>
          After setting up your environments correctly, use the Data Sync tool to transfer data between environments:
        </Description>
        
        <ol style={{ marginLeft: '1.5rem', lineHeight: '1.6' }}>
          <li>Use the Data Sync tab in this Admin panel</li>
          <li>Export data from your source environment (e.g., localhost)</li>
          <li>Import the data into your target environment (e.g., Vercel)</li>
        </ol>
      </EnvSection>
    </Container>
  );
};

export default EnvManager; 