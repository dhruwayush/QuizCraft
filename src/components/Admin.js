import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import QuestionUpload from './QuestionUpload';
import QuestionEditor from './QuestionEditor';
import FolderManager from './FolderManager';
import QuizNotifications from './QuizNotifications';
import { theme } from '../theme';
import axios from 'axios';
import { css } from '@emotion/react';
import QuizHistory from './QuizHistory';
import CustomQuiz from './CustomQuiz';
import DataSync from './DataSync';
import { getQuestionSets, saveQuestionSet, deleteQuestionSet } from '../utils/questionSetUtils';

const AdminContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.h1`
  text-align: center;
  color: #333;
  margin-bottom: 2rem;
`;

const TabContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const TabButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: ${props => props.active ? '#007bff' : '#f8f9fa'};
  color: ${props => props.active ? 'white' : '#333'};
  border: 1px solid #dee2e6;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background-color: ${props => props.active ? '#0056b3' : '#e9ecef'};
  }
`;

const SaveButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
  margin-left: auto;

  &:hover {
    background-color: #218838;
  }
`;

const FileList = styled.div`
  margin-top: 2rem;
`;

const FileItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  background-color: white;

  &:hover {
    background-color: #f8f9fa;
  }
`;

const TextInputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 200px;
  padding: 1rem;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-family: monospace;
  font-size: 14px;
  line-height: 1.5;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
`;

const InfoText = styled.div`
  color: #666;
  font-size: 0.9rem;
  line-height: 1.5;
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 4px;
  border-left: 4px solid #007bff;
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  font-size: 0.9rem;
  margin-top: 0.5rem;
`;

const ReportedQuestionsContainer = styled.div`
  margin-top: 2rem;
`;

const ReportCard = styled.div`
  background: white;
  border: 1px solid ${theme.colors.border};
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const ReportHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid ${theme.colors.border};
`;

const ReportStatus = styled.span`
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
  background: ${props => {
    switch (props.status) {
      case 'pending': return '#fff3cd';
      case 'reviewed': return '#cce5ff';
      case 'fixed': return '#d4edda';
      case 'invalid': return '#f8d7da';
      default: return '#f8f9fa';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'pending': return '#856404';
      case 'reviewed': return '#004085';
      case 'fixed': return '#155724';
      case 'invalid': return '#721c24';
      default: return '#383d41';
    }
  }};
`;

const ReportActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const ActionButton = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  background: ${props => props.variant === 'danger' ? '#dc3545' : '#007bff'};
  color: white;

  &:hover {
    opacity: 0.9;
  }
`;

const EditForm = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background: ${theme.colors.background};
  border-radius: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.5rem;
  margin: 0.5rem 0;
  border: 1px solid ${theme.colors.border};
  border-radius: 4px;
  font-size: 0.9rem;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 2px ${theme.colors.primary}20;
  }
`;

const OptionInput = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0.5rem 0;
`;

const RadioInput = styled.input`
  margin: 0;
`;

const GEMINI_API_KEY = 'gemini-2.0-pro-exp-02-05';

const animation0 = css`
  @keyframes animation0 {
    0% { transform: scale(1); }
    50% { transform: scale(1.02); }
    100% { transform: scale(1); }
  }
`;

const Admin = () => {
  const [questions, setQuestions] = useState([]);
  const [activeTab, setActiveTab] = useState('upload');
  const [selectedFolder, setSelectedFolder] = useState('Default');
  const [files, setFiles] = useState({});
  const [fileName, setFileName] = useState('');
  const [textInput, setTextInput] = useState('');
  const [error, setError] = useState(null);
  const [reportedQuestions, setReportedQuestions] = useState([]);
  const [editingReport, setEditingReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    // Load question sets from Supabase for the selected folder
    loadQuestionSets();

    // Load reported questions (keep using localStorage for this for now)
    const savedReports = localStorage.getItem('reportedQuestions');
    if (savedReports) {
      setReportedQuestions(JSON.parse(savedReports));
    }
  }, [selectedFolder]);

  const loadQuestionSets = async () => {
    setLoading(true);
    try {
      const data = await getQuestionSets(selectedFolder);
      setFiles(data);
    } catch (error) {
      console.error('Error loading question sets:', error);
      setError('Failed to load question sets');
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionsUpload = (newQuestions) => {
    // Transform the questions to ensure choices are in the correct format
    const formattedQuestions = newQuestions.map(q => ({
      ...q,
      choices: Array.isArray(q.choices) ? q.choices.map((choice, index) => {
        // If choice is already an object with text and isCorrect, return it as is
        if (choice && typeof choice === 'object' && 'text' in choice) {
          return choice;
        }
        // Otherwise, create a new choice object
        return {
          text: typeof choice === 'string' ? choice : choice.toString(),
          isCorrect: String.fromCharCode(65 + index) === q.correctAnswer
        };
      }) : []
    }));
    setQuestions(formattedQuestions);
    setActiveTab('edit');
  };

  const handleSaveQuestions = async () => {
    if (questions.length === 0) return;
    
    const timestamp = new Date().toISOString().split('T')[0];
    const defaultFileName = fileName || `question_set_${timestamp}`;
    
    setSaveStatus({ type: 'info', message: 'Saving question set...' });
    
    try {
      const result = await saveQuestionSet(selectedFolder, defaultFileName, questions);
      
      if (result.success) {
        setSaveStatus({ type: 'success', message: 'Question set saved successfully!' });
        // Refresh the list
        loadQuestionSets();
        setFileName('');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error saving question set:', error);
      setSaveStatus({ type: 'error', message: `Failed to save: ${error.message}` });
    }
    
    // Clear status after 3 seconds
    setTimeout(() => {
      setSaveStatus({ type: '', message: '' });
    }, 3000);
  };

  const loadQuestionSet = (fileName) => {
    const fileData = files[fileName];
    if (fileData) {
      // Transform the questions to ensure choices are in the correct format
      const formattedQuestions = fileData.questions.map(q => ({
        ...q,
        choices: Array.isArray(q.choices) ? q.choices.map((choice, index) => {
          // If choice is already an object with text and isCorrect, return it as is
          if (choice && typeof choice === 'object' && 'text' in choice) {
            return choice;
          }
          // Otherwise, create a new choice object
          return {
            text: typeof choice === 'string' ? choice : choice.toString(),
            isCorrect: String.fromCharCode(65 + index) === q.correctAnswer
          };
        }) : []
      }));
      setQuestions(formattedQuestions);
      setActiveTab('edit');
    }
  };

  const handleDeleteQuestionSet = async (fileName) => {
    try {
      const result = await deleteQuestionSet(selectedFolder, fileName);
      
      if (result.success) {
        // Refresh the list
        loadQuestionSets();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error deleting question set:', error);
      setError(`Failed to delete: ${error.message}`);
    }
  };

  const parseTextQuestions = () => {
    if (!textInput.trim()) {
      setError('Please enter some questions in the text area.');
      return;
    }

    console.log('Starting to parse questions from text input');
    const lines = textInput.split('\n').map(line => line.trim()).filter(line => line);
    const parsedQuestions = [];
    let currentQuestion = null;
    let questionText = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      console.log('Processing line:', line);

      // Skip empty lines
      if (!line) continue;

      // Check for question start (e.g., "Q1. ...")
      const questionStart = line.match(/^Q\d+\.\s*(.+)/);
      if (questionStart) {
        // Save previous question if exists
        if (currentQuestion) {
          if (questionText.length > 0) {
            currentQuestion.question = questionText.join(' ');
          }
          if (
            currentQuestion.question &&
            currentQuestion.choices.length === 4 &&
            currentQuestion.correctAnswer
          ) {
            parsedQuestions.push(currentQuestion);
            console.log('Added question:', {
              question: currentQuestion.question,
              choices: currentQuestion.choices,
              correctAnswer: currentQuestion.correctAnswer
            });
          } else {
            console.log('Skipped invalid question:', {
              hasQuestion: Boolean(currentQuestion.question),
              numChoices: currentQuestion.choices.length,
              hasAnswer: Boolean(currentQuestion.correctAnswer),
              question: currentQuestion
            });
          }
        }
        // Start new question
        currentQuestion = {
          question: questionStart[1],
          choices: [],
          correctAnswer: ''
        };
        questionText = [questionStart[1]];
        continue;
      }

      if (!currentQuestion) continue;

      // Check if the line is an answer line first
      if (/^Answer:/i.test(line)) {
        const answerMatch = line.match(/^Answer:\s*\(?([A-D])\)?/i);
        if (answerMatch) {
          currentQuestion.correctAnswer = answerMatch[1].toUpperCase();
          console.log('Correct answer found:', currentQuestion.correctAnswer);
        }
        continue;
      }

      // Then check for choices (A, B, C, D) anchored at the start
      const choiceMatch = line.match(/^\(?([A-D])\)?\s*(.+)/);
      if (choiceMatch) {
        const choiceText = choiceMatch[2].trim();
        if (currentQuestion.choices.length < 4) { // Only add if less than 4 choices
          currentQuestion.choices.push(choiceText);
        }
        continue;
      }

      // If none of the above, treat it as additional question text if no choices have been added yet
      if (currentQuestion.choices.length === 0) {
        questionText.push(line);
      }

      console.log('Current Question State:', currentQuestion);
    }

    // Add the last question if it exists
    if (currentQuestion) {
      if (questionText.length > 0) {
        currentQuestion.question = questionText.join(' ');
      }
      if (
        currentQuestion.question &&
        currentQuestion.choices.length === 4 &&
        currentQuestion.correctAnswer
      ) {
        parsedQuestions.push(currentQuestion);
        console.log('Added question:', {
          question: currentQuestion.question,
          choices: currentQuestion.choices,
          correctAnswer: currentQuestion.correctAnswer
        });
      } else {
        console.log('Skipped invalid question:', {
          hasQuestion: Boolean(currentQuestion.question),
          numChoices: currentQuestion.choices.length,
          hasAnswer: Boolean(currentQuestion.correctAnswer),
          question: currentQuestion
        });
      }
    }

    console.log('Valid questions found:', parsedQuestions.length);
    if (parsedQuestions.length === 0) {
      setError('No valid questions found in QuizCraft. Please check the format and make sure each question has 4 choices and an answer.');
      return;
    }

    // Transform questions to include choice objects
    const formattedQuestions = parsedQuestions.map(q => ({
      ...q,
      choices: q.choices.map((choice, index) => ({
        text: choice,
        isCorrect: String.fromCharCode(65 + index) === q.correctAnswer
      }))
    }));

    setQuestions(formattedQuestions);
    setActiveTab('edit');
    setError(null);
  };

  const handleUpdateReportStatus = (reportId, newStatus) => {
    const updatedReports = reportedQuestions.map(report => 
      report.timestamp === reportId ? { ...report, status: newStatus } : report
    );
    setReportedQuestions(updatedReports);
    localStorage.setItem('reportedQuestions', JSON.stringify(updatedReports));
  };

  const handleDeleteReport = (reportId) => {
    const updatedReports = reportedQuestions.filter(report => report.timestamp !== reportId);
    setReportedQuestions(updatedReports);
    localStorage.setItem('reportedQuestions', JSON.stringify(updatedReports));
  };

  const handleEditReport = (report) => {
    setEditingReport({
      ...report,
      editedQuestion: report.question,
      editedOptions: report.options.map(opt => ({ ...opt })),
      editedExplanation: report.explanation || ''
    });
  };

  const handleSaveEdit = (reportId) => {
    const report = editingReport;
    if (!report) return;

    // Update the question in the original file
    const savedFiles = localStorage.getItem(`questionFiles_${report.folder}`);
    if (savedFiles) {
      const files = JSON.parse(savedFiles);
      if (files[report.fileName]) {
        const fileQuestions = files[report.fileName].questions;
        // Find and update the question
        const updatedQuestions = fileQuestions.map(q => {
          if (q.question === report.question) {
            return {
              ...q,
              question: report.editedQuestion,
              choices: report.editedOptions.map(opt => ({
                text: opt.text,
                isCorrect: opt.text === report.editedOptions.find(o => o.isCorrect)?.text
              })),
              explanation: report.editedExplanation
            };
          }
          return q;
        });

        // Save updated questions back to localStorage
        files[report.fileName].questions = updatedQuestions;
        localStorage.setItem(`questionFiles_${report.folder}`, JSON.stringify(files));

        // Update report status
        handleUpdateReportStatus(reportId, 'fixed');
      }
    }

    setEditingReport(null);
  };

  const handleCancelEdit = () => {
    setEditingReport(null);
  };

  return (
    <AdminContainer>
      <Header>QuizCraft Admin Panel</Header>
      
      <FolderManager 
        onFolderSelect={setSelectedFolder}
        selectedFolder={selectedFolder}
      />

      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
        <TabContainer>
          <TabButton 
            active={activeTab === 'upload'} 
            onClick={() => setActiveTab('upload')}
          >
            Upload Questions to QuizCraft
          </TabButton>
          <TabButton 
            active={activeTab === 'text'} 
            onClick={() => setActiveTab('text')}
          >
            Text Input for QuizCraft
          </TabButton>
          <TabButton 
            active={activeTab === 'edit'} 
            onClick={() => setActiveTab('edit')}
          >
            Edit Questions in QuizCraft ({questions.length})
          </TabButton>
          <TabButton 
            active={activeTab === 'reports'} 
            onClick={() => setActiveTab('reports')}
          >
            Reported Questions in QuizCraft ({reportedQuestions.length})
          </TabButton>
          <TabButton 
            active={activeTab === 'history'} 
            onClick={() => setActiveTab('history')}
          >
            Quiz History
          </TabButton>
          <TabButton 
            active={activeTab === 'notifications'} 
            onClick={() => setActiveTab('notifications')}
          >
            QuizCraft Notifications
          </TabButton>
          <TabButton 
            active={activeTab === 'customQuiz'} 
            onClick={() => setActiveTab('customQuiz')}
          >
            Create Custom Quiz
          </TabButton>
          <TabButton 
            active={activeTab === 'sync'} 
            onClick={() => setActiveTab('sync')}
          >
            Data Sync
          </TabButton>
        </TabContainer>

        {questions.length > 0 && (
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="File name"
              style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ced4da' }}
            />
            <SaveButton onClick={handleSaveQuestions}>
              Save Question Set
            </SaveButton>
            {saveStatus.message && (
              <span style={{ 
                color: saveStatus.type === 'success' ? '#28a745' : 
                       saveStatus.type === 'error' ? '#dc3545' : '#007bff',
                fontSize: '0.875rem',
                marginLeft: '0.5rem'
              }}>
                {saveStatus.message}
              </span>
            )}
          </div>
        )}
      </div>

      {activeTab === 'history' ? (
        <QuizHistory />
      ) : activeTab === 'upload' ? (
        <QuestionUpload onQuestionsUpload={handleQuestionsUpload} />
      ) : activeTab === 'text' ? (
        <TextInputContainer>
          <InfoText>
            Enter your questions in the following format for QuizCraft:
            <pre style={{ marginTop: '0.5rem' }}>
              1. What is the capital of France?
              A) London
              B) Paris
              C) Berlin
              D) Madrid
              Answer: B
              
              2. Next question...
            </pre>
          </InfoText>
          <TextArea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Enter your questions here..."
          />
          {error && (
            <ErrorMessage>
              {error}
            </ErrorMessage>
          )}
          <button 
            onClick={parseTextQuestions}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '1rem',
              transition: 'background-color 0.3s'
            }}
          >
            Process Questions
          </button>
        </TextInputContainer>
      ) : activeTab === 'edit' ? (
        <QuestionEditor 
          questions={questions} 
          onQuestionsChange={setQuestions}
        />
      ) : activeTab === 'reports' ? (
        <ReportedQuestionsContainer>
          {reportedQuestions.length === 0 ? (
            <p>No reported questions yet.</p>
          ) : (
            reportedQuestions.map((report) => (
              <ReportCard key={report.timestamp}>
                <ReportHeader>
                  <div>
                    <strong>Folder:</strong> {report.folder} / {report.fileName}
                  </div>
                  <ReportStatus status={report.status}>
                    {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                  </ReportStatus>
                </ReportHeader>
                {editingReport?.timestamp === report.timestamp ? (
                  <EditForm>
                    <div>
                      <strong>Question:</strong>
                      <Input
                        value={editingReport.editedQuestion}
                        onChange={(e) => setEditingReport({
                          ...editingReport,
                          editedQuestion: e.target.value
                        })}
                      />
                    </div>
                    <div>
                      <strong>Options:</strong>
                      {editingReport.editedOptions.map((option, index) => (
                        <OptionInput key={index}>
                          <RadioInput
                            type="radio"
                            name="correctAnswer"
                            checked={option.isCorrect}
                            onChange={() => {
                              const newOptions = editingReport.editedOptions.map((opt, i) => ({
                                ...opt,
                                isCorrect: i === index
                              }));
                              setEditingReport({
                                ...editingReport,
                                editedOptions: newOptions
                              });
                            }}
                          />
                          <Input
                            value={option.text}
                            onChange={(e) => {
                              const newOptions = [...editingReport.editedOptions];
                              newOptions[index] = {
                                ...newOptions[index],
                                text: e.target.value
                              };
                              setEditingReport({
                                ...editingReport,
                                editedOptions: newOptions
                              });
                            }}
                          />
                        </OptionInput>
                      ))}
                    </div>
                    <div>
                      <strong>Explanation:</strong>
                      <Input
                        value={editingReport.editedExplanation}
                        onChange={(e) => setEditingReport({
                          ...editingReport,
                          editedExplanation: e.target.value
                        })}
                      />
                    </div>
                    <ReportActions>
                      <ActionButton onClick={() => handleSaveEdit(report.timestamp)}>
                        Save Changes
                      </ActionButton>
                      <ActionButton variant="danger" onClick={handleCancelEdit}>
                        Cancel
                      </ActionButton>
                    </ReportActions>
                  </EditForm>
                ) : (
                  <>
                    <div>
                      <p><strong>Question:</strong> {report.question}</p>
                      <p><strong>Options:</strong></p>
                      <ul>
                        {report.options.map((option, index) => (
                          <li key={index} style={{ 
                            color: option.text === report.correctOption ? 'green' : 'inherit',
                            fontWeight: option.text === report.correctOption ? 'bold' : 'normal'
                          }}>
                            {option.text} {option.text === report.correctOption && '(Correct)'}
                          </li>
                        ))}
                      </ul>
                      <p><strong>Report Reason:</strong> {report.reason}</p>
                      {report.explanation && (
                        <p><strong>Explanation:</strong> {report.explanation}</p>
                      )}
                    </div>
                    <ReportActions>
                      {report.status === 'pending' && (
                        <>
                          <ActionButton onClick={() => handleEditReport(report)}>
                            Edit Question
                          </ActionButton>
                          <ActionButton onClick={() => handleUpdateReportStatus(report.timestamp, 'reviewed')}>
                            Mark as Reviewed
                          </ActionButton>
                          <ActionButton onClick={() => handleUpdateReportStatus(report.timestamp, 'fixed')}>
                            Mark as Fixed
                          </ActionButton>
                          <ActionButton onClick={() => handleUpdateReportStatus(report.timestamp, 'invalid')}>
                            Mark as Invalid
                          </ActionButton>
                        </>
                      )}
                      <ActionButton variant="danger" onClick={() => handleDeleteReport(report.timestamp)}>
                        Delete Report
                      </ActionButton>
                    </ReportActions>
                  </>
                )}
              </ReportCard>
            ))
          )}
        </ReportedQuestionsContainer>
      ) : activeTab === 'notifications' ? (
        <QuizNotifications />
      ) : activeTab === 'customQuiz' ? (
        <CustomQuiz />
      ) : activeTab === 'sync' ? (
        <DataSync />
      ) : null}

      <FileList>
        <h3>Saved Question Sets in {selectedFolder} for QuizCraft</h3>
        {loading ? (
          <p>Loading question sets...</p>
        ) : Object.entries(files).length === 0 ? (
          <p>No question sets found in this folder.</p>
        ) : (
          Object.entries(files).map(([name, data]) => (
            <FileItem key={name}>
              <span>📄 {name} ({data.questions.length} questions)</span>
              <div>
                <button 
                  onClick={() => loadQuestionSet(name)}
                  style={{ marginRight: '0.5rem' }}
                >
                  Load
                </button>
                <button 
                  onClick={() => handleDeleteQuestionSet(name)}
                  style={{ backgroundColor: '#dc3545', color: 'white', border: 'none' }}
                >
                  Delete
                </button>
              </div>
            </FileItem>
          ))
        )}
      </FileList>
    </AdminContainer>
  );
};

export default Admin; 