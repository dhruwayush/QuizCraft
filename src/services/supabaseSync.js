import supabase from '../config/supabase';
import { getAllQuestionSets, getLocalStorageKeys } from '../utils/storageUtils';

/**
 * Migrates question sets from localStorage to Supabase
 * @param {Object} options - Migration options
 * @param {boolean} options.overwriteExisting - Whether to overwrite existing question sets with the same ID
 * @returns {Promise<Object>} Migration results
 */
export const migrateLocalStorageToSupabase = async ({ overwriteExisting = false } = {}) => {
  try {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      throw new Error('You must be logged in to migrate question sets');
    }
    
    // Get all question sets from localStorage
    const questionSets = getAllQuestionSets();
    
    if (!questionSets || questionSets.length === 0) {
      return {
        success: true,
        message: 'No question sets found in localStorage',
        migrated: 0,
        skipped: 0,
        errors: 0
      };
    }
    
    const results = {
      migrated: 0,
      skipped: 0,
      errors: 0
    };
    
    // Process each question set
    for (const set of questionSets) {
      try {
        // Check if the question set already exists
        const { data: existingSet } = await supabase
          .from('question_sets')
          .select('id')
          .eq('file_name', set.file_name)
          .eq('user_id', user.id)
          .maybeSingle();
        
        // If the set exists and we're not overwriting, skip it
        if (existingSet && !overwriteExisting) {
          results.skipped++;
          continue;
        }
        
        // Prepare the question set for insertion
        const questionSetData = {
          file_name: set.file_name,
          folder_name: set.folder_name || 'Default',
          user_id: user.id,
          questions: set.questions || [],
          metadata: set.metadata || {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        // If the set exists and we're overwriting, update it
        if (existingSet && overwriteExisting) {
          const { error } = await supabase
            .from('question_sets')
            .update(questionSetData)
            .eq('id', existingSet.id);
          
          if (error) throw error;
        } else {
          // Otherwise, insert a new record
          const { error } = await supabase
            .from('question_sets')
            .insert(questionSetData);
          
          if (error) throw error;
        }
        
        results.migrated++;
      } catch (error) {
        console.error(`Error migrating question set ${set.file_name}:`, error);
        results.errors++;
      }
    }
    
    return {
      success: true,
      ...results
    };
  } catch (error) {
    console.error('Migration error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}; 