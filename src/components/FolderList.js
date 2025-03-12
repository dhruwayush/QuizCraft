import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { theme } from '../theme';
import { useSupabase } from '../contexts/SupabaseContext';
import { getFolders, createFolder } from '../utils/supabaseUtils';
import LoadingSpinner from './LoadingSpinner';

const FolderListContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: ${theme.shadows.sm};
  padding: 1.5rem;
  height: 100%;
`;

const FolderListHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const FolderListTitle = styled.h2`
  font-size: 1.2rem;
  color: ${theme.colors.textPrimary};
  margin: 0;
`;

const FolderItem = styled.div`
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  cursor: pointer;
  background: ${props => props.selected ? theme.colors.primaryLight : 'transparent'};
  color: ${props => props.selected ? theme.colors.primary : theme.colors.textPrimary};
  transition: ${theme.transitions.default};
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: ${props => props.selected ? theme.colors.primaryLight : theme.colors.backgroundLight};
  }
`;

const FolderIcon = styled.span`
  font-size: 1.1rem;
`;

const AddButton = styled.button`
  background: ${theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  transition: ${theme.transitions.default};

  &:hover {
    background: ${theme.colors.primaryDark};
  }
`;

const CreateFolderForm = styled.form`
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background: ${theme.colors.backgroundLight};
  border-radius: 8px;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid ${theme.colors.border};
  border-radius: 8px;
  font-size: 0.9rem;
  transition: ${theme.transitions.default};

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 2px ${theme.colors.primaryLight};
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid ${theme.colors.border};
  border-radius: 8px;
  font-size: 0.9rem;
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
  transition: ${theme.transitions.default};

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 2px ${theme.colors.primaryLight};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
`;

const SubmitButton = styled.button`
  background: ${theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 0.9rem;
  transition: ${theme.transitions.default};

  &:hover {
    background: ${theme.colors.primaryDark};
  }

  &:disabled {
    background: ${theme.colors.disabled};
    cursor: not-allowed;
  }
`;

const CancelButton = styled.button`
  background: transparent;
  color: ${theme.colors.textSecondary};
  border: 1px solid ${theme.colors.border};
  border-radius: 8px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 0.9rem;
  transition: ${theme.transitions.default};

  &:hover {
    background: ${theme.colors.backgroundLight};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem 1rem;
  color: ${theme.colors.textSecondary};
`;

const ErrorMessage = styled.div`
  color: ${theme.colors.error};
  padding: 0.75rem;
  background: ${theme.colors.errorLight};
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
`;

const FolderList = ({ selectedFolder, onFolderSelect }) => {
  const { user } = useSupabase();
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    const fetchFolders = async () => {
      if (!user) {
        setFolders([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const folderData = await getFolders(user.id);
        setFolders(folderData || []);
        setError(null);
      } catch (error) {
        console.error('Error fetching folders:', error);
        setError('Failed to load folders. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchFolders();
  }, [user]);

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to create folders.');
      return;
    }

    if (!formData.name.trim()) {
      setError('Folder name is required.');
      return;
    }

    try {
      const newFolder = await createFolder({
        name: formData.name.trim(),
        description: formData.description.trim(),
        user_id: user.id,
      });

      setFolders([newFolder, ...folders]);
      setFormData({ name: '', description: '' });
      setShowCreateForm(false);
      setError(null);
    } catch (error) {
      console.error('Error creating folder:', error);
      setError('Failed to create folder. Please try again.');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFolderSelect = (folderId) => {
    onFolderSelect(folderId);
  };

  if (loading) {
    return (
      <FolderListContainer>
        <FolderListHeader>
          <FolderListTitle>Folders</FolderListTitle>
        </FolderListHeader>
        <LoadingSpinner />
      </FolderListContainer>
    );
  }

  return (
    <FolderListContainer>
      <FolderListHeader>
        <FolderListTitle>Folders</FolderListTitle>
        {user && (
          <AddButton onClick={() => setShowCreateForm(!showCreateForm)}>
            <span>+</span> New Folder
          </AddButton>
        )}
      </FolderListHeader>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {showCreateForm && (
        <CreateFolderForm onSubmit={handleCreateFolder}>
          <Input
            type="text"
            name="name"
            placeholder="Folder Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <TextArea
            name="description"
            placeholder="Description (optional)"
            value={formData.description}
            onChange={handleChange}
          />
          <ButtonGroup>
            <CancelButton 
              type="button" 
              onClick={() => {
                setShowCreateForm(false);
                setFormData({ name: '', description: '' });
                setError(null);
              }}
            >
              Cancel
            </CancelButton>
            <SubmitButton type="submit">Create Folder</SubmitButton>
          </ButtonGroup>
        </CreateFolderForm>
      )}

      {folders.length === 0 ? (
        <EmptyState>
          {user 
            ? 'No folders yet. Create your first folder to organize your questions!'
            : 'Please log in to see your folders.'}
        </EmptyState>
      ) : (
        folders.map((folder) => (
          <FolderItem
            key={folder.id}
            selected={selectedFolder === folder.id}
            onClick={() => handleFolderSelect(folder.id)}
          >
            <FolderIcon>📁</FolderIcon>
            {folder.name}
          </FolderItem>
        ))
      )}
    </FolderListContainer>
  );
};

export default FolderList; 