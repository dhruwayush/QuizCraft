import React, { useState } from 'react';
import styled from '@emotion/styled';

const FolderContainer = styled.div`
  margin-bottom: 2rem;
`;

const FolderList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin: 1rem 0;
`;

const FolderItem = styled.div`
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1rem;
  background-color: white;
  cursor: pointer;
  transition: all 0.3s;
  min-width: 200px;

  &:hover {
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  ${props => props.selected && `
    border-color: #007bff;
    background-color: #f8f9fa;
  `}
`;

const Input = styled.input`
  padding: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  margin-right: 1rem;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: #007bff;
  color: white;
  transition: all 0.3s;

  &:hover {
    background-color: #0056b3;
  }
`;

const FolderManager = ({ onFolderSelect, selectedFolder }) => {
  const [folders, setFolders] = useState(() => {
    const savedFolders = localStorage.getItem('questionFolders');
    return savedFolders ? JSON.parse(savedFolders) : ['Default'];
  });
  const [newFolderName, setNewFolderName] = useState('');

  const createFolder = () => {
    if (newFolderName.trim() && !folders.includes(newFolderName)) {
      const updatedFolders = [...folders, newFolderName];
      setFolders(updatedFolders);
      localStorage.setItem('questionFolders', JSON.stringify(updatedFolders));
      setNewFolderName('');
    }
  };

  const handleFolderSelect = (folder) => {
    onFolderSelect(folder);
  };

  return (
    <FolderContainer>
      <h2>Question Set Folders</h2>
      <div style={{ marginBottom: '1rem' }}>
        <Input
          type="text"
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
          placeholder="New folder name"
        />
        <Button onClick={createFolder}>Create Folder</Button>
      </div>
      <FolderList>
        {folders.map((folder) => (
          <FolderItem
            key={folder}
            selected={folder === selectedFolder}
            onClick={() => handleFolderSelect(folder)}
          >
            📁 {folder}
          </FolderItem>
        ))}
      </FolderList>
    </FolderContainer>
  );
};

export default FolderManager; 