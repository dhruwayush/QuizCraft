import supabase from '../config/supabase';

/**
 * Utility functions for converting question_sets to the core application tables
 */

/**
 * Transfer data from question_sets to the main application tables
 * @param {Object} options - Transfer options
 * @param {boolean} options.bypassRLS - Whether to try bypassing RLS policies by adding headers
 * @returns {Promise<Object>} - Result of the transfer operation
 */
export const transferQuestionSetsToMainTables = async ({ bypassRLS = false } = {}) => {
  try {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      throw new Error('You must be logged in to transfer question sets');
    }
    
    const result = {
      folders: {
        created: 0,
        existing: 0,
        errors: 0
      },
      questions: {
        created: 0,
        errors: 0
      },
      total_sets_processed: 0
    };

    // Create a custom client with the X-Client-Info header if bypassRLS is true
    // This might help with RLS issues in some configurations
    const clientOptions = bypassRLS ? {
      headers: {
        'X-Client-Info': 'admin-migration',
        'Role': 'admin' // Some RLS policies check for this, though not all setups will respect it
      }
    } : {};
    const client = supabase;
    
    // First, get all question sets for the current user
    const { data: questionSets, error: fetchError } = await client
      .from('question_sets')
      .select('*')
      .eq('user_id', user.id);
    
    if (fetchError) throw fetchError;
    
    if (!questionSets || questionSets.length === 0) {
      return {
        success: true,
        message: 'No question sets found to transfer',
        result
      };
    }
    
    // Keep track of created folders to avoid duplicates
    const createdFolders = new Map();
    
    // Process each question set
    for (const set of questionSets) {
      try {
        // 1. First ensure the folder exists
        let folderId;
        
        if (createdFolders.has(set.folder_name)) {
          folderId = createdFolders.get(set.folder_name);
        } else {
          // Try to check if folder exists - using .maybeSingle() as .single() throws on not found
          try {
            const { data: existingFolder } = await client
              .from('folders')
              .select('id')
              .eq('name', set.folder_name)
              .eq('user_id', user.id)
              .maybeSingle();
            
            if (existingFolder) {
              folderId = existingFolder.id;
              createdFolders.set(set.folder_name, folderId);
              result.folders.existing++;
              console.log(`Found existing folder: ${set.folder_name} with ID ${folderId}`);
            } else {
              // Create the folder
              // For RLS issues, try a direct upsert by ID approach
              const { data: newFolder, error: folderError } = await client
                .from('folders')
                .insert({
                  name: set.folder_name,
                  user_id: user.id,
                  description: `Imported from question set: ${set.file_name}`,
                  created_at: new Date().toISOString()
                })
                .select();
              
              if (folderError) {
                // If RLS error occurs, try a different approach - use default folder
                console.error(`Error creating folder ${set.folder_name}:`, folderError);
                
                // Try to get default folder
                const { data: defaultFolder } = await client
                  .from('folders')
                  .select('id')
                  .eq('name', 'Default')
                  .eq('user_id', user.id)
                  .maybeSingle();
                
                if (defaultFolder) {
                  folderId = defaultFolder.id;
                  createdFolders.set('Default', folderId);
                  result.folders.existing++;
                  console.log(`Using Default folder with ID ${folderId} for ${set.folder_name}`);
                } else {
                  // Unable to create or find a suitable folder
                  result.folders.errors++;
                  throw new Error(`Cannot create or find folder for ${set.folder_name}. RLS policy may be preventing folder creation.`);
                }
              } else if (newFolder && newFolder.length > 0) {
                folderId = newFolder[0].id;
                createdFolders.set(set.folder_name, folderId);
                result.folders.created++;
                console.log(`Created new folder: ${set.folder_name} with ID ${folderId}`);
              } else {
                // This shouldn't happen but handle it anyway
                throw new Error(`Folder creation for ${set.folder_name} returned no data`);
              }
            }
          } catch (folderError) {
            console.error(`Error creating folder ${set.folder_name}:`, folderError);
            result.folders.errors++;
            continue; // Skip this question set if folder creation fails
          }
        }
        
        // 2. Add all questions from this set
        if (set.questions && Array.isArray(set.questions)) {
          for (const question of set.questions) {
            try {
              // Format the question for insertion
              const questionData = {
                content: question.question,
                folder_id: folderId,
                user_id: user.id,
                explanation: question.explanation || '',
                difficulty: question.difficulty || 'medium',
                source: set.file_name,
                options: question.choices ? JSON.stringify(question.choices) : '[]',
                created_at: new Date().toISOString()
              };
              
              // Insert the question
              const { error: questionError } = await client
                .from('questions')
                .insert(questionData);
              
              if (questionError) {
                console.error(`Error adding question from ${set.file_name}:`, questionError);
                result.questions.errors++;
              } else {
                result.questions.created++;
              }
            } catch (questionError) {
              console.error(`Error processing question:`, questionError);
              result.questions.errors++;
            }
          }
        }
        
        result.total_sets_processed++;
      } catch (setError) {
        console.error(`Error processing question set ${set.file_name}:`, setError);
      }
    }
    
    return {
      success: true,
      result
    };
  } catch (error) {
    console.error('Transfer error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Update the questions table to fix the options format if needed
 * @param {Object} options - Fix options
 * @param {boolean} options.bypassRLS - Whether to try bypassing RLS policies by adding headers
 * @returns {Promise<Object>} - Result of the fix operation
 */
export const fixQuestionsOptionsFormat = async ({ bypassRLS = false } = {}) => {
  try {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      throw new Error('You must be logged in to fix question options');
    }
    
    const result = {
      fixed: 0,
      errors: 0
    };
    
    // Create a custom client with the X-Client-Info header if bypassRLS is true
    const clientOptions = bypassRLS ? {
      headers: {
        'X-Client-Info': 'admin-migration',
        'Role': 'admin'
      }
    } : {};
    const client = supabase;
    
    // Get all questions for the current user
    const { data: questions, error: fetchError } = await client
      .from('questions')
      .select('*')
      .eq('user_id', user.id);
    
    if (fetchError) throw fetchError;
    
    if (!questions || questions.length === 0) {
      return {
        success: true,
        message: 'No questions found to fix',
        result
      };
    }
    
    // Process each question
    for (const question of questions) {
      try {
        let options;
        let needsUpdate = false;
        
        // Check if options is already a string
        if (typeof question.options === 'string') {
          try {
            // Try to parse it to check format
            options = JSON.parse(question.options);
            
            // If it's not an array or doesn't have the expected structure, fix it
            if (!Array.isArray(options) || 
                (options.length > 0 && (!options[0].text || typeof options[0].isCorrect === 'undefined'))) {
              needsUpdate = true;
            }
          } catch (e) {
            // Invalid JSON string
            needsUpdate = true;
            options = [];
          }
        } else if (Array.isArray(question.options)) {
          // Direct array - needs to be stringified
          options = question.options;
          needsUpdate = true;
        } else {
          // Neither string nor array - create empty array
          options = [];
          needsUpdate = true;
        }
        
        if (needsUpdate) {
          // Format the options correctly
          const formattedOptions = Array.isArray(options) ? 
            options.map(opt => {
              if (typeof opt === 'string') {
                return { text: opt, isCorrect: false };
              } else if (typeof opt === 'object' && opt !== null) {
                return {
                  text: opt.text || opt.option || opt.value || 'Option',
                  isCorrect: !!opt.isCorrect || !!opt.correct || false
                };
              }
              return { text: 'Option', isCorrect: false };
            }) : [];
          
          // Update the question
          const { error: updateError } = await client
            .from('questions')
            .update({
              options: JSON.stringify(formattedOptions)
            })
            .eq('id', question.id);
          
          if (updateError) {
            console.error(`Error fixing options for question ${question.id}:`, updateError);
            result.errors++;
          } else {
            result.fixed++;
          }
        }
      } catch (questionError) {
        console.error(`Error processing question ${question.id}:`, questionError);
        result.errors++;
      }
    }
    
    return {
      success: true,
      result
    };
  } catch (error) {
    console.error('Fix error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}; 