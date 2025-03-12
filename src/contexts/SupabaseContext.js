import React, { createContext, useState, useEffect, useContext } from 'react';
import supabase from '../config/supabase';

// Create the context
const SupabaseContext = createContext();

// Custom hook to use the context
export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
};

// Provider component
export const SupabaseProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initial session check
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }

        setUser(session?.user || null);
      } catch (error) {
        console.error('Error checking auth session:', error.message);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Set up auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    // Cleanup subscription
    return () => subscription?.unsubscribe();
  }, []);

  // Auth functions
  const signUp = async (email, password, userData = {}) => {
    try {
      setLoading(true);
      
      // First step: Sign up the user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      });

      if (error) throw error;
      
      // Second step: If signup successful, create a profile record
      // But only if we have a user and the signup didn't require email confirmation
      if (data.user && data.session) {
        try {
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: data.user.id,
              username: userData.username || email.split('@')[0],
              full_name: userData.full_name || '',
              avatar_url: userData.avatar_url || '',
              updated_at: new Date(),
            });

          if (profileError) {
            console.error('Error creating profile:', profileError.message);
            // Don't throw here, as the auth signup was successful
          }
        } catch (profileError) {
          console.error('Profile creation error:', profileError);
        }
      } else if (data.user) {
        // If email confirmation is required, we'll create the profile when they confirm
        console.log('Email confirmation required before profile creation');
      }

      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Profile functions
  const getUserProfile = async (userId = user?.id) => {
    if (!userId) return null;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error.message);
      setError(error.message);
      return null;
    }
  };

  const updateUserProfile = async (profileData, userId = user?.id) => {
    if (!userId) return null;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating user profile:', error.message);
      setError(error.message);
      throw error;
    }
  };

  // Reset error state
  const clearError = () => setError(null);

  // Context value
  const value = {
    user,
    loading,
    error,
    supabase,  // Expose the supabase client
    signUp,
    signIn,
    signOut,
    getUserProfile,
    updateUserProfile,
    clearError,
  };

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
};

export default SupabaseContext; 