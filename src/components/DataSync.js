import React, { useState } from 'react';
import styled from '@emotion/styled';
import { theme } from '../theme';
import { exportDatabase, importDatabase } from '../utils/supabaseSync';
import { checkEnvironmentVariables } from '../utils/envCheck';
import { migrateLocalStorageToSupabase } from '../utils/questionSetUtils';
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

const MigrationSection = styled.div`
  margin: 2rem 0;
  padding: 1.5rem;
  border: 1px solid ${theme.colors.borderColor};
  border-radius: ${theme.borderRadius.md};
  background-color: ${theme.colors.backgroundLight};
`;

const MigrationResults = styled.div`
  margin-top: 1.5rem;
  max-height: 300px;
  overflow-y: auto;
  font-family: monospace;
  font-size: 0.85rem;
  padding: 1rem;
  background: white;
  border-radius: ${theme.borderRadius.sm};
  border: 1px solid ${theme.colors.borderColor};
`;

const ResultItem = styled.div`
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  border-radius: ${theme.borderRadius.sm};
  background-color: ${props => props.success ? 'rgba(40, 167, 69, 0.1)' : 'rgba(220, 53, 69, 0.1)'};
  border-left: 3px solid ${props => props.success ? '#28a745' : '#dc3545'};
`;

const DataSync = () => {
  const [exportData, setExportData] = useState(null);
  const [importData, setImportData] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [status, setStatus] = useState({ type: 'info', message: 'Ready to sync data' });
  const [showEnvInfo, setShowEnvInfo] = useState(false);
  const [envInfo, setEnvInfo] = useState(null);
  const [migrationResults, setMigrationResults] = useState(null);

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

  const handleMigrateLocalStorage = async () => {
    try {
      setIsMigrating(true);
      setStatus({ type: 'info', message: 'Migrating localStorage question sets to Supabase...' });
      setMigrationResults(null);
      
      const result = await migrateLocalStorageToSupabase();
      
      if (result.success) {
        setStatus({ 
          type: 'success', 
          message: `Successfully migrated ${result.results.migrated} question sets to Supabase (${result.results.errors} errors)`
        });
        setMigrationResults(result.results);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Migration error:', error);
      setStatus({ type: 'error', message: `Migration failed: ${error.message}` });
    } finally {
      setIsMigrating(false);
    }
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
        
        <MigrationSection>
          <SyncHeader>Migrate LocalStorage to Supabase</SyncHeader>
          <SyncDescription>
            If you've been using the app locally and storing question sets in your browser's localStorage,
            you can migrate that data to Supabase so it will be available on all devices and in your Vercel deployment.
            This is a one-time operation to transition from local to cloud storage.
          </SyncDescription>
          
          <ButtonGroup>
            <Button 
              onClick={handleMigrateLocalStorage} 
              disabled={isMigrating}
              secondary
            >
              {isMigrating ? 'Migrating...' : 'Migrate LocalStorage Question Sets'}
            </Button>
          </ButtonGroup>
          
          {migrationResults && (
            <MigrationResults>
              <p>Migration summary:</p>
              <p>- Successfully migrated: {migrationResults.migrated}</p>
              <p>- Errors: {migrationResults.errors}</p>
              
              {migrationResults.details.length > 0 && (
                <>
                  <p>Details:</p>
                  {migrationResults.details.map((detail, index) => (
                    <ResultItem key={index} success={detail.success}>
                      <div>Folder: {detail.folder}</div>
                      <div>File: {detail.file}</div>
                      {detail.error && <div>Error: {detail.error}</div>}
                      <div>Status: {detail.success ? 'Success' : 'Failed'}</div>
                    </ResultItem>
                  ))}
                </>
              )}
            </MigrationResults>
          )}
        </MigrationSection>
        
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