import React, { useState } from 'react';
import styled from '@emotion/styled';
import { theme } from '../theme';
import { exportDatabase, importDatabase } from '../utils/supabaseSync';
import { checkEnvironmentVariables } from '../utils/envCheck';
import EnvManager from './EnvManager';

const SyncContainer = styled.div`
  background: white;
  border-radius: ${theme.borderRadius.lg};
  padding: 2rem;
  box-shadow: ${theme.shadows.md};
  margin-bottom: 2rem;
`;

const SyncHeader = styled.h2`
  color: ${theme.colors.primary};
  margin-top: 0;
  margin-bottom: 1.5rem;
`;

const SyncDescription = styled.p`
  margin-bottom: 1.5rem;
  line-height: 1.6;
  color: ${theme.colors.textSecondary};
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

const EnvInfo = styled.div`
  background: ${theme.colors.backgroundLight};
  padding: 1rem;
  border-radius: ${theme.borderRadius.md};
  margin-bottom: 1.5rem;
  font-family: monospace;
  white-space: pre-wrap;
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 0.4rem 0.8rem;
  border-radius: ${theme.borderRadius.sm};
  background: ${props => 
    props.status === 'success' ? theme.colors.success : 
    props.status === 'error' ? theme.colors.error :
    props.status === 'warning' ? theme.colors.warning :
    theme.colors.infoLight};
  color: ${props => 
    props.status === 'success' ? theme.colors.successDark : 
    props.status === 'error' ? theme.colors.errorDark :
    props.status === 'warning' ? theme.colors.warningDark :
    theme.colors.infoDark};
  font-size: 0.85rem;
  font-weight: 600;
  margin-left: 1rem;
`;

const ImportArea = styled.textarea`
  width: 100%;
  min-height: 200px;
  margin: 1rem 0;
  padding: 1rem;
  border: 1px solid ${theme.colors.borderColor};
  border-radius: ${theme.borderRadius.md};
  font-family: monospace;
  resize: vertical;
`;

const DataSync = () => {
  const [exportData, setExportData] = useState(null);
  const [importData, setImportData] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [status, setStatus] = useState({ type: 'info', message: 'Ready to sync data' });
  const [showEnvInfo, setShowEnvInfo] = useState(false);
  const [envInfo, setEnvInfo] = useState(null);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      setStatus({ type: 'info', message: 'Exporting data...' });
      
      const data = await exportDatabase();
      setExportData(data);
      
      // Create a download link
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `quizcraft-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      setStatus({ 
        type: 'success', 
        message: `Successfully exported data from ${Object.keys(data.data).length} tables with ${
          Object.values(data.data).reduce((acc, curr) => acc + curr.length, 0)
        } total records` 
      });
    } catch (error) {
      console.error('Export error:', error);
      setStatus({ type: 'error', message: `Export failed: ${error.message}` });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async () => {
    try {
      setIsImporting(true);
      setStatus({ type: 'info', message: 'Validating import data...' });
      
      let data;
      try {
        data = JSON.parse(importData);
        
        if (!data.data || typeof data.data !== 'object') {
          throw new Error('Invalid data format. Expected object with "data" property.');
        }
      } catch (parseError) {
        throw new Error(`Invalid JSON format: ${parseError.message}`);
      }
      
      setStatus({ type: 'info', message: 'Importing data...' });
      const result = await importDatabase(data.data);
      
      if (result.success) {
        const tablesImported = Object.keys(result.results).length;
        const recordsImported = Object.values(result.results).reduce(
          (acc, curr) => acc + curr.count, 0
        );
        
        setStatus({ 
          type: 'success', 
          message: `Successfully imported data into ${tablesImported} tables with ${recordsImported} total records` 
        });
        setImportData('');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Import error:', error);
      setStatus({ type: 'error', message: `Import failed: ${error.message}` });
    } finally {
      setIsImporting(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setImportData(e.target.result);
    };
    reader.readAsText(file);
  };

  const checkEnvironment = () => {
    const info = checkEnvironmentVariables();
    setEnvInfo(info);
    setShowEnvInfo(true);
  };

  return (
    <>
      <EnvManager />
      
      <SyncContainer>
        <SyncHeader>Data Synchronization</SyncHeader>
        
        <SyncDescription>
          This tool helps you synchronize data between different environments (local development, staging, production).
          You can export data from one environment and import it into another to ensure consistency.
        </SyncDescription>
        
        <ButtonGroup>
          <Button onClick={checkEnvironment} secondary>
            Check Environment
          </Button>
        </ButtonGroup>
        
        {showEnvInfo && envInfo && (
          <EnvInfo>
            <div>Current Environment: {envInfo.NODE_ENV || 'development'}</div>
            <div>Supabase URL: {envInfo.SUPABASE_URL}</div>
            <div>Server URL: {envInfo.SERVER_URL}</div>
            <div>Supabase Key: {envInfo.HAS_SUPABASE_KEY}</div>
          </EnvInfo>
        )}
        
        <SyncHeader>Export Data</SyncHeader>
        <SyncDescription>
          Export your questions, folders, quizzes, and other data to a JSON file that you can import into another environment.
        </SyncDescription>
        
        <ButtonGroup>
          <Button 
            onClick={handleExport} 
            disabled={isExporting}
          >
            {isExporting ? 'Exporting...' : 'Export Data'}
          </Button>
        </ButtonGroup>
        
        <SyncHeader>Import Data</SyncHeader>
        <SyncDescription>
          Import data from a previously exported JSON file. This will merge the imported data with your existing data.
        </SyncDescription>
        
        <div>
          <label htmlFor="file-upload">
            <Button as="span" secondary>
              Select Import File
            </Button>
          </label>
          <input 
            id="file-upload" 
            type="file" 
            accept=".json" 
            onChange={handleFileUpload} 
            style={{ display: 'none' }}
          />
        </div>
        
        <ImportArea 
          value={importData} 
          onChange={(e) => setImportData(e.target.value)}
          placeholder="Paste exported JSON data here or use the file upload button above"
        />
        
        <ButtonGroup>
          <Button 
            onClick={handleImport} 
            disabled={isImporting || !importData.trim()}
          >
            {isImporting ? 'Importing...' : 'Import Data'}
          </Button>
        </ButtonGroup>
        
        <div>
          Status: {status.message}
          <StatusBadge status={status.type}>{status.type.toUpperCase()}</StatusBadge>
        </div>
      </SyncContainer>
    </>
  );
};

export default DataSync; 