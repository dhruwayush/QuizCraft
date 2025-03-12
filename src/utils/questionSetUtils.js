import supabase from '../config/supabase';

/**
 * Utility functions for managing question sets in Supabase
 */

/**
 * Get all question sets for a folder
 * @param {string} folderName - The folder name
 * @returns {Promise<Object>} - The question sets in a format compatible with the Admin component
 */
export const getQuestionSets = async (folderName) => {
  try {
    const { data, error } = await supabase
      .from('question_sets')
      .select('*')
      .eq('folder_name', folderName);
    
    if (error) throw error;
    
    // Transform to the format expected by the Admin component
    const formattedFiles = {};
    data.forEach(item => {
      formattedFiles[item.file_name] = {
        questions: item.questions,
        timestamp: item.updated_at
      };
    });
    
    return formattedFiles;
  } catch (error) {
    console.error('Error loading question sets:', error);
    return {};
  }
};

/**
 * Save a question set
 * @param {string} folderName - The folder name
 * @param {string} fileName - The file name
 * @param {Array} questions - The questions array
 * @returns {Promise<Object>} - Result of the operation
 */
export const saveQuestionSet = async (folderName, fileName, questions) => {
  try {
    const timestamp = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('question_sets')
      .upsert({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        folder_name: folderName,
        file_name: fileName,
        questions: questions,
        updated_at: timestamp
      });
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('Error saving question set:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Delete a question set
 * @param {string} folderName - The folder name
 * @param {string} fileName - The file name to delete
 * @returns {Promise<Object>} - Result of the operation
 */
export const deleteQuestionSet = async (folderName, fileName) => {
  try {
    const { error } = await supabase
      .from('question_sets')
      .delete()
      .eq('folder_name', folderName)
      .eq('file_name', fileName);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting question set:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Migrate all localStorage question sets to Supabase
 * This should be run once to transition from localStorage to database storage
 * @returns {Promise<Object>} - Result of the migration
 */
export const migrateLocalStorageToSupabase = async () => {
  try {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      throw new Error('You must be logged in to migrate question sets');
    }
    
    const results = {
      migrated: 0,
      errors: 0,
      details: []
    };
    
    // Get all keys in localStorage that match the pattern
    const keys = Object.keys(localStorage).filter(key => key.startsWith('questionFiles_'));
    
    for (const key of keys) {
      const folderName = key.replace('questionFiles_', '');
      const files = JSON.parse(localStorage.getItem(key) || '{}');
      
      for (const [fileName, fileData] of Object.entries(files)) {
        try {
          const { error } = await supabase
            .from('question_sets')
            .upsert({
              user_id: user.id,
              folder_name: folderName,
              file_name: fileName,
              questions: fileData.questions,
              created_at: fileData.timestamp || new Date().toISOString(),
              updated_at: fileData.timestamp || new Date().toISOString()
            });
          
          if (error) {
            results.errors++;
            results.details.push({
              folder: folderName,
              file: fileName,
              success: false,
              error: error.message
            });
          } else {
            results.migrated++;
            results.details.push({
              folder: folderName,
              file: fileName,
              success: true
            });
          }
        } catch (error) {
          results.errors++;
          results.details.push({
            folder: folderName,
            file: fileName,
            success: false,
            error: error.message
          });
        }
      }
    }
    
    return {
      success: true,
      results
    };
  } catch (error) {
    console.error('Migration error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}; 