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
    console.log(`Found ${questionSets.length} question sets in localStorage`);
    
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
      errors: 0,
      details: []
    };
    
    // Process each question set
    for (const set of questionSets) {
      try {
        // Skip sets with no questions or empty questions
        if (!set.questions || !Array.isArray(set.questions) || set.questions.length === 0) {
          console.log(`Skipping ${set.file_name} - no valid questions found`);
          results.skipped++;
          results.details.push({
            folder: set.folder_name,
            file: set.file_name,
            skipped: true,
            message: 'No valid questions found',
            success: true
          });
          continue;
        }
        
        console.log(`Processing ${set.folder_name}/${set.file_name} with ${set.questions.length} questions`);
      
        // Check if the question set already exists
        const { data: existingSet } = await supabase
          .from('question_sets')
          .select('id')
          .eq('file_name', set.file_name)
          .eq('user_id', user.id)
          .maybeSingle();
        
        // If the set exists and we're not overwriting, skip it
        if (existingSet && !overwriteExisting) {
          console.log(`Skipping ${set.file_name} - already exists`);
          results.skipped++;
          results.details.push({
            folder: set.folder_name,
            file: set.file_name,
            skipped: true,
            message: 'Already exists in Supabase',
            success: true
          });
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
          console.log(`Updating ${set.file_name}`);
          const { error } = await supabase
            .from('question_sets')
            .update(questionSetData)
            .eq('id', existingSet.id);
          
          if (error) throw error;
          
          results.details.push({
            folder: set.folder_name,
            file: set.file_name,
            updated: true,
            success: true
          });
        } else {
          // Otherwise, insert a new record
          console.log(`Creating new question set: ${set.file_name}`);
          const { error } = await supabase
            .from('question_sets')
            .insert(questionSetData);
          
          if (error) throw error;
          
          results.details.push({
            folder: set.folder_name,
            file: set.file_name,
            success: true
          });
        }
        
        results.migrated++;
      } catch (error) {
        console.error(`Error migrating question set ${set.file_name}:`, error);
        results.errors++;
        results.details.push({
          folder: set.folder_name || 'Unknown',
          file: set.file_name || 'Unknown',
          success: false,
          error: error.message
        });
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