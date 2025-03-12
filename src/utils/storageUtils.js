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
    const questionSetKeys = keys.filter(key => 
      key.startsWith('questionSet_') || 
      key.includes('/questions.json')
    );
    
    // Process each question set key
    questionSetKeys.forEach(key => {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        
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
          }
          
          // Create a standardized question set object
          const questionSet = {
            file_name: fileName,
            folder_name: folderName,
            questions: Array.isArray(data) ? data : (data.questions || []),
            metadata: !Array.isArray(data) && typeof data === 'object' ? 
              (data.metadata || {}) : 
              { source: 'localStorage', importedAt: new Date().toISOString() }
          };
          
          questionSets.push(questionSet);
        }
      } catch (parseError) {
        console.error(`Error parsing localStorage item ${key}:`, parseError);
      }
    });
    
    return questionSets;
  } catch (error) {
    console.error('Error getting question sets from localStorage:', error);
    return [];
  }
}; 