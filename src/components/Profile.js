import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { theme } from '../theme';
import { useSupabase } from '../contexts/SupabaseContext';
import LoadingSpinner from './LoadingSpinner';

// Styled components
const ProfileContainer = styled.div`
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: ${theme.shadows.md};
`;

const Title = styled.h2`
  color: ${theme.colors.primary};
  margin-bottom: 1.5rem;
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

const ErrorMessage = styled.div`
  color: ${theme.colors.error};
  background: ${theme.colors.errorLight};
  padding: 0.8rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
`;

const SuccessMessage = styled.div`
  color: ${theme.colors.success};
  background: ${theme.colors.successLight};
  padding: 0.8rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
`;

const ProfileStats = styled.div`
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid ${theme.colors.border};
`;

const StatTitle = styled.h3`
  color: ${theme.colors.textPrimary};
  margin-bottom: 1rem;
  font-size: 1.2rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
`;

const StatCard = styled.div`
  background: ${theme.colors.backgroundLight};
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${theme.colors.primary};
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: ${theme.colors.textSecondary};
`;

const Profile = () => {
  const { user, getUserProfile, updateUserProfile, error, clearError, loading } = useSupabase();
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        try {
          const profileData = await getUserProfile();
          setProfile(profileData);
          setFormData({
            username: profileData?.username || '',
            fullName: profileData?.full_name || '',
          });
        } catch (error) {
          console.error('Error fetching profile:', error);
        } finally {
          setLoadingProfile(false);
        }
      }
    };

    fetchProfile();
  }, [user, getUserProfile]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setSuccessMessage('');

    try {
      await updateUserProfile({
        username: formData.username,
        full_name: formData.fullName,
      });
      setSuccessMessage('Profile updated successfully!');
      
      // Update the local profile data
      setProfile({
        ...profile,
        username: formData.username,
        full_name: formData.fullName,
      });
    } catch (error) {
      // Error is handled in the context
      console.error('Error updating profile:', error);
    }
  };

  if (!user) {
    return (
      <ProfileContainer>
        <Title>Profile</Title>
        <p>Please log in to view your profile.</p>
      </ProfileContainer>
    );
  }

  if (loadingProfile) {
    return (
      <ProfileContainer>
        <LoadingSpinner />
      </ProfileContainer>
    );
  }

  return (
    <ProfileContainer>
      <Title>Your Profile</Title>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}
      
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            id="email"
            value={user.email}
            disabled
          />
        </FormGroup>
        
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
          />
        </FormGroup>
        
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Update Profile'}
        </Button>
      </Form>
      
      <ProfileStats>
        <StatTitle>Your Stats</StatTitle>
        <StatsGrid>
          <StatCard>
            <StatValue>0</StatValue>
            <StatLabel>Quizzes Taken</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>0</StatValue>
            <StatLabel>Average Score</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>0</StatValue>
            <StatLabel>Questions Created</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>0</StatValue>
            <StatLabel>Starred Questions</StatLabel>
          </StatCard>
        </StatsGrid>
      </ProfileStats>
    </ProfileContainer>
  );
};

export default Profile; 