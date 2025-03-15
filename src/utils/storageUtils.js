/**
 * Utility functions for working with localStorage
 */

/**
 * Gets all localStorage keys
 * @returns {Array<string>} Array of localStorage keys
 */
export const getLocalStorageKeys = () => {
  try {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      keys.push(localStorage.key(i));
    }
    return keys;
  } catch (error) {
    console.error('Error getting localStorage keys:', error);
    return [];
  }
};

/**
 * Gets all question sets from localStorage
 * @returns {Array<Object>} Array of question set objects
 */
export const getAllQuestionSets = () => {
  try {
    const keys = getLocalStorageKeys();
    const questionSets = [];
    
    // Filter keys for those that match the question set pattern
    // Expanded to include more formats visible in the user's localStorage
    const questionSetKeys = keys.filter(key => 
      key.startsWith('questionSet_') || 
      key.includes('/questions.json') ||
      key.startsWith('questionFiles_') ||
      key.startsWith('starredQuestions_') ||
      key === 'questionFolders' ||
      key.startsWith('quizStats_')
    );
    
    console.log('Found localStorage keys:', questionSetKeys);
    
    // Process each question set key
    questionSetKeys.forEach(key => {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        console.log(`Processing key: ${key}`, data);
        
        if (data) {
          // Try to determine folder name from key
          let folderName = 'Default';
          let fileName = key;
          
          if (key.includes('/')) {
            // Extract folder name from path structure
            const parts = key.split('/');
            folderName = parts[parts.length - 2] || 'Default';
            fileName = parts[parts.length - 1];
          } else if (key.startsWith('questionSet_')) {
            // For legacy questionSet_[name] format
            fileName = key.replace('questionSet_', '');
            
            // Try to extract folder from name if it contains separator
            if (fileName.includes('_')) {
              const parts = fileName.split('_');
              if (parts.length > 1) {
                folderName = parts[0];
                fileName = parts.slice(1).join('_');
              }
            }
          } else if (key.startsWith('questionFiles_')) {
            // For questionFiles_[subject] format
            folderName = key.replace('questionFiles_', '');
            fileName = `${folderName}_questions.json`;
            
            // The questionFiles_ format might have questions directly or in a different structure
            // Try to extract questions from common formats we've seen
            if (typeof data === 'object' && !Array.isArray(data)) {
              // Some formats might have a "questions" array property
              if (data.questions && Array.isArray(data.questions)) {
                questions = data.questions;
              }
              // Try the "question" array (singular)
              else if (data.question && Array.isArray(data.question)) {
                questions = data.question;
              }
              // If we have entries with question text and choices, this may be the questions
              else if (data.length === undefined && Object.keys(data).length > 0) {
                // Try to convert object entries to questions array
                questions = Object.entries(data).map(([key, value]) => {
                  // If value is an object with question property
                  if (value && typeof value === 'object' && value.question) {
                    return {
                      question: value.question,
                      choices: value.choices || value.options || [],
                      correctAnswer: value.correctAnswer || value.correct || 0,
                      explanation: value.explanation || ''
                    };
                  }
                  // If key is a number and value has text that looks like a question
                  else if (!isNaN(key) && value && typeof value === 'string' && value.includes('?')) {
                    return {
                      question: value,
                      choices: [],
                      correctAnswer: 0
                    };
                  }
                  return null;
                }).filter(q => q !== null);
              }
            }
          } else if (key.startsWith('starredQuestions_')) {
            // For starred questions
            folderName = key.replace('starredQuestions_', '');
            fileName = `${folderName}_starred.json`;
            
            // Starred questions might be stored as arrays or objects with different structures
            if (Array.isArray(data)) {
              questions = data;
            } else if (typeof data === 'object' && data !== null) {
              // Some formats store an array of question IDs
              if (data.starredQuestions && Array.isArray(data.starredQuestions)) {
                // Convert IDs to simple question objects
                questions = data.starredQuestions.map(id => ({
                  question: `Question ID: ${id}`,
                  isStarred: true,
                  originalId: id
                }));
              }
              // If the object directly contains the questions
              else if (Object.keys(data).length > 0) {
                try {
                  // Try to convert object entries to questions array
                  questions = Object.entries(data).map(([key, value]) => {
                    if (value && typeof value === 'object') {
                      return {
                        question: value.question || value.text || key,
                        choices: value.choices || value.options || [],
                        correctAnswer: value.correctAnswer || value.correct || 0,
                        explanation: value.explanation || '',
                        isStarred: true
                      };
                    }
                    return {
                      question: `Starred Item: ${key}`,
                      isStarred: true
                    };
                  });
                } catch (err) {
                  console.error(`Error processing starred questions for ${key}:`, err);
                }
              }
            }
          } else if (key.startsWith('quizStats_')) {
            // For quiz stats
            folderName = key.replace('quizStats_', '');
            fileName = `${folderName}_stats.json`;
          } else {
            // Generic handling
            folderName = 'System';
            fileName = key;
          }
          
          // Handle different data formats
          let questions = [];
          if (Array.isArray(data)) {
            questions = data;
          } else if (data.questions && Array.isArray(data.questions)) {
            questions = data.questions;
          } else if (typeof data === 'object' && data !== null) {
            // For other object formats, try to convert to questions array format
            if (key === 'questionFolders') {
              // Special handling for folders
              Object.keys(data).forEach(folder => {
                const folderSet = {
                  file_name: `${folder}_folder.json`,
                  folder_name: folder,
                  questions: [],
                  metadata: { 
                    type: 'folder',
                    source: 'localStorage',
                    importedAt: new Date().toISOString()
                  }
                };
                questionSets.push(folderSet);
              });
              return; // Skip normal processing for this key
            } else if (key.startsWith('quizStats_')) {
              // Skip quiz stats if they don't contain actual questions
              if (!data.questions) return;
              questions = data.questions;
            }
          }
          
          // Create a standardized question set object
          const questionSet = {
            file_name: fileName,
            folder_name: folderName,
            questions: questions,
            metadata: !Array.isArray(data) && typeof data === 'object' ? 
              (data.metadata || {
                source: 'localStorage',
                originalKey: key,
                importedAt: new Date().toISOString()
              }) : 
              { 
                source: 'localStorage',
                originalKey: key,
                importedAt: new Date().toISOString()
              }
          };
          
          questionSets.push(questionSet);
        }
      } catch (parseError) {
        console.error(`Error parsing localStorage item ${key}:`, parseError);
      }
    });
    
    console.log('Processed question sets:', questionSets.length);
    return questionSets;
  } catch (error) {
    console.error('Error getting question sets from localStorage:', error);
    return [];
  }
}; 