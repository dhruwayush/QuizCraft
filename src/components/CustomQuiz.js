import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { theme } from '../theme';

const Container = styled.div`
  padding: 2rem;
  background: white;
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.md};
`;

const Title = styled.h2`
  font-size: 1.5rem;
  color: ${theme.colors.textPrimary};
`;

const Input = styled.input`
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 1rem;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  background: ${theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.md};
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: ${theme.colors.primaryHover};
  }
`;

const CustomQuiz = () => {
  const [folders, setFolders] = useState([]);
  const [selectedFolders, setSelectedFolders] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [numberOfQuestions, setNumberOfQuestions] = useState(5); // Default number of questions

  useEffect(() => {
    // Load folder names from localStorage
    const folderNames = JSON.parse(localStorage.getItem('questionFolders') || '[]');
    setFolders(folderNames);
  }, []);

  const handleFolderChange = (e) => {
    const value = e.target.value;
    setSelectedFolders(prev => 
      prev.includes(value) ? prev.filter(folder => folder !== value) : [...prev, value]
    );
  };

  const createQuiz = () => {
    const allQuestions = [];
    selectedFolders.forEach(folder => {
      const savedFiles = JSON.parse(localStorage.getItem(`questionFiles_${folder}`) || '{}');
      Object.values(savedFiles).forEach(file => {
        allQuestions.push(...file.questions);
      });
    });

    // Shuffle and select the specified number of questions
    const selectedQuestions = allQuestions.sort(() => Math.random() - 0.5).slice(0, numberOfQuestions);
    setQuestions(selectedQuestions);
    console.log('Selected Questions:', selectedQuestions);
    // Here you can add logic to finalize the quiz or display the questions
  };

  return (
    <Container>
      <Title>Create Custom Quiz</Title>
      <div>
        <label>Select Folders:</label>
        {folders.map(folder => (
          <div key={folder}>
            <input 
              type="checkbox" 
              value={folder} 
              onChange={handleFolderChange} 
            />
            {folder}
          </div>
        ))}
      </div>
      <Input 
        type="number" 
        value={numberOfQuestions} 
        onChange={(e) => setNumberOfQuestions(e.target.value)} 
        placeholder="Number of Questions" 
        min="1" 
      />
      <Button onClick={createQuiz}>Create Quiz</Button>
      {questions.length > 0 && (
        <div>
          <h3>Selected Questions:</h3>
          <ul>
            {questions.map((q, index) => (
              <li key={index}>{q.question}</li>
            ))}
          </ul>
        </div>
      )}
    </Container>
  );
};

export default CustomQuiz; 