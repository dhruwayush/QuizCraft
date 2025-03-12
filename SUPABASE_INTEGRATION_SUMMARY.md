# Supabase Integration for QuizCraft

## Overview

We have successfully integrated Supabase with the QuizCraft application. This integration provides:

1. **User Authentication** - Sign up, login, and profile management
2. **Database Storage** - Tables for questions, quizzes, user data, and more
3. **Real-time Capabilities** - For potential collaborative features in the future

## Implementation Details

### Database Schema

We've created the following tables in Supabase:

- **profiles** - Extended user profiles linked to Supabase Auth
- **folders** - Categories/folders for organizing questions
- **questions** - Individual MCQ questions with options and answers
- **quizzes** - Quizzes created from questions
- **quiz_questions** - Junction table linking quizzes to questions
- **quiz_attempts** - Records of quiz attempts by users
- **starred_questions** - Bookmarked/starred questions by users
- **question_reports** - User-reported issues with questions

### Files Created

1. **Configuration Files**:
   - `src/config/supabase.js` - Supabase client configuration

2. **Context and State Management**:
   - `src/contexts/SupabaseContext.js` - React context for Supabase state management

3. **Utility Functions**:
   - `src/utils/supabaseUtils.js` - Utility functions for Supabase operations
   - `src/utils/index.js` - Exports from utility files

4. **UI Components**:
   - `src/components/Auth.js` - Login and registration form
   - `src/components/Profile.js` - User profile management

5. **Database Schema**:
   - `supabase_schema.sql` - SQL schema for Supabase tables

6. **Documentation**:
   - `SUPABASE_SETUP.md` - Guide for setting up and using Supabase

### App Updates

We've updated the main `App.js` file to:
- Include the Supabase provider
- Add login/logout functionality
- Add user profile access
- Maintain the existing quiz functionality

## Next Steps

To complete the integration with the existing components, the following tasks should be addressed:

1. Update the `QuestionSetSelector.js` component to fetch questions from Supabase
2. Update the `Quiz.js` component to save quiz attempts to Supabase
3. Update the `StarredQuestionsList.js` component to use Supabase for starred questions
4. Update the `StatsView.js` component to fetch statistics from Supabase
5. Update the `ScheduledQuizzes.js` component to use Supabase for scheduling
6. Update the `SavedQuizzes.js` component to use Supabase for saved quizzes

## Security Considerations

Row Level Security (RLS) has been implemented in the database to ensure users can only access their own data. Additional security considerations include:

- Ensuring proper token management for authentication
- Validating inputs before sending to Supabase
- Implementing proper error handling for failed operations

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [React Supabase Auth Example](https://supabase.com/docs/guides/auth/auth-helpers/auth-ui)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security) 