# Supabase Setup for QuizCraft

This guide explains how to set up and use Supabase with the QuizCraft application.

## Overview

QuizCraft uses Supabase for:
- User authentication
- Database storage for questions, quizzes, and user data
- Real-time updates for collaborative features

## Configuration

The following environment variables are already set up in your `.env` file:

```
REACT_APP_SUPABASE_URL=https://dssxmfxquqwbdlqetilv.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Database Schema

The following tables have been created in your Supabase project:

1. **profiles** - Extended user profiles linked to Supabase Auth
2. **folders** - Categories/folders for organizing questions
3. **questions** - Individual MCQ questions with options and answers
4. **quizzes** - Quizzes created from questions
5. **quiz_questions** - Junction table linking quizzes to questions
6. **quiz_attempts** - Records of quiz attempts by users
7. **starred_questions** - Bookmarked/starred questions by users
8. **question_reports** - User-reported issues with questions

## Creating the Database Schema

To create the database schema:

1. Go to the [Supabase Dashboard](https://app.supabase.com/)
2. Open your project
3. Go to the SQL Editor
4. Copy the contents of the `supabase_schema.sql` file in your project
5. Run the SQL commands to create the tables and relationships

## Setting Up Row-Level Security (RLS)

Supabase uses Row-Level Security to control access to your data. To properly set up RLS:

1. Go to the SQL Editor in your Supabase dashboard
2. Copy the contents of the `supabase_rls.sql` file 
3. Run the SQL commands to create all necessary RLS policies

### Important: Fixing RLS for User Registration

If you encounter this error during user registration:
```
new row violates row-level security policy for table "profiles"
```

Run the following SQL in the Supabase SQL Editor:

```sql
-- Fix profiles table insertion permission
CREATE POLICY "Users can create their own profile" 
  ON profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);
```

## Integration with QuizCraft

The following files in your project have been created/updated to work with Supabase:

1. `src/config/supabase.js` - Supabase client configuration
2. `src/utils/supabaseUtils.js` - Utility functions for working with Supabase
3. `src/contexts/SupabaseContext.js` - React context for global Supabase access

## Using Supabase in Components

### Authentication

```jsx
import { signIn, signUp, signOut, getCurrentUser } from '../utils/supabaseUtils';

// Sign up a new user
const handleSignUp = async () => {
  try {
    const userData = { full_name: 'John Doe' };
    await signUp('user@example.com', 'password123', userData);
    // Handle successful sign up
  } catch (error) {
    // Handle error
  }
};

// Sign in a user
const handleSignIn = async () => {
  try {
    await signIn('user@example.com', 'password123');
    // Handle successful sign in
  } catch (error) {
    // Handle error
  }
};

// Sign out
const handleSignOut = async () => {
  await signOut();
  // Handle sign out
};

// Get current user
const fetchCurrentUser = async () => {
  const user = await getCurrentUser();
  if (user) {
    // User is signed in
  } else {
    // No user is signed in
  }
};
```

### Working with Questions

```jsx
import { getQuestions, createQuestion, updateQuestion } from '../utils/supabaseUtils';

// Get questions
const fetchQuestions = async (folderId) => {
  const userId = '123'; // Get from current user
  const questions = await getQuestions(folderId, userId);
  // Use questions
};

// Create a question
const handleCreateQuestion = async () => {
  const questionData = {
    question_text: 'What is 2+2?',
    options: ['1', '3', '4', '5'],
    correct_option: 2, // 0-indexed, so 2 = '4'
    explanation: 'Basic arithmetic',
    category: 'Math',
    user_id: '123', // Get from current user
  };
  
  await createQuestion(questionData);
};
```

### Working with Quizzes

```jsx
import { createQuiz, getQuizzes, getQuizWithQuestions } from '../utils/supabaseUtils';

// Create a quiz
const handleCreateQuiz = async () => {
  const quizData = {
    title: 'Math Quiz',
    description: 'Test your math skills',
    user_id: '123', // Get from current user
  };
  
  const questionIds = ['q1', 'q2', 'q3']; // Question IDs
  
  await createQuiz(quizData, questionIds);
};

// Get a quiz with questions
const fetchQuizWithQuestions = async (quizId) => {
  const quiz = await getQuizWithQuestions(quizId);
  // Use quiz data and questions
};
```

## Troubleshooting

### RLS Policy Errors

If you encounter errors related to Row-Level Security policies:

1. Check the specific error message to identify which table and operation is failing
2. Make sure the appropriate RLS policy exists for that table and operation
3. Verify that the user has the necessary permissions for the operation

### Authentication Issues

If users can't sign up or sign in:

1. Check browser console for detailed error messages
2. Verify that environment variables are correctly set
3. Check email confirmation settings in your Supabase project

## Further Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Supabase Database](https://supabase.com/docs/guides/database)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security) 