import supabase from '../config/supabase';

// Authentication functions
export const signUp = async (email, password, userData) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData, // Additional user data
      },
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error signing up:', error.message);
    throw error;
  }
};

export const signIn = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error signing in:', error.message);
    throw error;
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error('Error signing out:', error.message);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  } catch (error) {
    console.error('Error getting current user:', error.message);
    return null;
  }
};

// Folder functions
export const getFolders = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('folders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching folders:', error.message);
    throw error;
  }
};

export const createFolder = async (folderData) => {
  try {
    const { data, error } = await supabase
      .from('folders')
      .insert(folderData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating folder:', error.message);
    throw error;
  }
};

// Question functions
export const getQuestions = async (folderId = null, userId) => {
  try {
    let query = supabase
      .from('questions')
      .select('*')
      .eq('user_id', userId);
    
    if (folderId) {
      query = query.eq('folder_id', folderId);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching questions:', error.message);
    throw error;
  }
};

export const createQuestion = async (questionData) => {
  try {
    const { data, error } = await supabase
      .from('questions')
      .insert(questionData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating question:', error.message);
    throw error;
  }
};

export const updateQuestion = async (questionId, questionData) => {
  try {
    const { data, error } = await supabase
      .from('questions')
      .update(questionData)
      .eq('id', questionId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating question:', error.message);
    throw error;
  }
};

// Quiz functions
export const createQuiz = async (quizData, questions) => {
  try {
    // First create the quiz
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .insert(quizData)
      .select()
      .single();
    
    if (quizError) throw quizError;
    
    // Then create quiz_questions associations
    const quizQuestionsData = questions.map((questionId, index) => ({
      quiz_id: quiz.id,
      question_id: questionId,
      question_order: index + 1,
    }));
    
    const { error: questionsError } = await supabase
      .from('quiz_questions')
      .insert(quizQuestionsData);
    
    if (questionsError) throw questionsError;
    
    return quiz;
  } catch (error) {
    console.error('Error creating quiz:', error.message);
    throw error;
  }
};

export const getQuizzes = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching quizzes:', error.message);
    throw error;
  }
};

export const getQuizWithQuestions = async (quizId) => {
  try {
    // First get the quiz
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', quizId)
      .single();
    
    if (quizError) throw quizError;
    
    // Then get the questions for this quiz
    const { data: quizQuestions, error: questionsError } = await supabase
      .from('quiz_questions')
      .select(`
        question_id,
        question_order,
        questions(*)
      `)
      .eq('quiz_id', quizId)
      .order('question_order', { ascending: true });
    
    if (questionsError) throw questionsError;
    
    // Format the result
    return {
      ...quiz,
      questions: quizQuestions.map(qq => qq.questions),
    };
  } catch (error) {
    console.error('Error fetching quiz with questions:', error.message);
    throw error;
  }
};

// Quiz attempt functions
export const createQuizAttempt = async (attemptData) => {
  try {
    const { data, error } = await supabase
      .from('quiz_attempts')
      .insert(attemptData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating quiz attempt:', error.message);
    throw error;
  }
};

export const updateQuizAttempt = async (attemptId, attemptData) => {
  try {
    const { data, error } = await supabase
      .from('quiz_attempts')
      .update(attemptData)
      .eq('id', attemptId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating quiz attempt:', error.message);
    throw error;
  }
};

// Starred/Bookmarked questions functions
export const starQuestion = async (userId, questionId) => {
  try {
    const { data, error } = await supabase
      .from('starred_questions')
      .insert({ user_id: userId, question_id: questionId })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error starring question:', error.message);
    throw error;
  }
};

export const unstarQuestion = async (userId, questionId) => {
  try {
    const { error } = await supabase
      .from('starred_questions')
      .delete()
      .match({ user_id: userId, question_id: questionId });
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error unstarring question:', error.message);
    throw error;
  }
};

export const getStarredQuestions = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('starred_questions')
      .select(`
        question_id,
        questions(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Format the result
    return data.map(item => item.questions);
  } catch (error) {
    console.error('Error fetching starred questions:', error.message);
    throw error;
  }
};

// Question report functions
export const reportQuestion = async (reportData) => {
  try {
    const { data, error } = await supabase
      .from('question_reports')
      .insert(reportData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error reporting question:', error.message);
    throw error;
  }
}; 