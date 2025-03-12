import supabase from '../config/supabase';

/**
 * Utility functions for synchronizing Supabase data between environments
 */

/**
 * Export data from a specified table
 * @param {string} tableName - Name of the table to export
 * @param {Object} options - Query options (filters, etc.)
 * @returns {Promise<Object>} - The exported data
 */
export const exportTableData = async (tableName, options = {}) => {
  try {
    let query = supabase.from(tableName).select('*');
    
    // Apply filters if provided
    if (options.filters) {
      Object.entries(options.filters).forEach(([column, value]) => {
        query = query.eq(column, value);
      });
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw error;
    }
    
    return {
      tableName,
      data,
      exportedAt: new Date().toISOString(),
      count: data.length
    };
  } catch (error) {
    console.error(`Error exporting data from ${tableName}:`, error.message);
    throw error;
  }
};

/**
 * Import data into a specified table
 * @param {string} tableName - Name of the table to import into
 * @param {Array} data - Data to import
 * @param {Object} options - Import options
 * @returns {Promise<Object>} - Results of the import operation
 */
export const importTableData = async (tableName, data, options = {}) => {
  try {
    // Handle conflict strategy - default to 'upsert'
    const { conflictStrategy = 'upsert' } = options;
    
    let result;
    
    if (conflictStrategy === 'upsert') {
      // Upsert operation - update existing records, insert new ones
      const { data: upsertData, error } = await supabase
        .from(tableName)
        .upsert(data, { onConflict: options.onConflict || 'id' });
      
      result = { operation: 'upsert', data: upsertData, error };
    } else if (conflictStrategy === 'insert') {
      // Insert operation - only insert new records
      const { data: insertData, error } = await supabase
        .from(tableName)
        .insert(data);
      
      result = { operation: 'insert', data: insertData, error };
    } else if (conflictStrategy === 'update') {
      // Update operation - only update existing records
      // This requires handling each record individually
      const updateResults = await Promise.all(
        data.map(async (record) => {
          const { data: updateData, error } = await supabase
            .from(tableName)
            .update(record)
            .eq('id', record.id);
          
          return { record: record.id, data: updateData, error };
        })
      );
      
      result = { operation: 'update', data: updateResults };
    }
    
    if (result.error) {
      throw result.error;
    }
    
    return {
      tableName,
      importedAt: new Date().toISOString(),
      count: data.length,
      result
    };
  } catch (error) {
    console.error(`Error importing data into ${tableName}:`, error.message);
    throw error;
  }
};

/**
 * Export all database data for selected tables
 * @param {Array<string>} tables - List of tables to export
 * @returns {Promise<Object>} - Exported data for all tables
 */
export const exportDatabase = async (tables = ['questions', 'folders', 'quizzes', 'quiz_questions']) => {
  try {
    const exportData = {};
    const exportPromises = tables.map(async (tableName) => {
      const tableData = await exportTableData(tableName);
      exportData[tableName] = tableData.data;
    });
    
    await Promise.all(exportPromises);
    
    return {
      data: exportData,
      metadata: {
        exportedAt: new Date().toISOString(),
        tables: tables,
        counts: Object.entries(exportData).reduce((acc, [table, data]) => {
          acc[table] = data.length;
          return acc;
        }, {})
      }
    };
  } catch (error) {
    console.error('Error exporting database:', error.message);
    throw error;
  }
};

/**
 * Import data into multiple tables
 * @param {Object} data - Data object with table names as keys
 * @param {Object} options - Import options
 * @returns {Promise<Object>} - Results of the import operation
 */
export const importDatabase = async (data, options = {}) => {
  try {
    const importResults = {};
    
    // Determine table import order to handle dependencies
    const tableOrder = determineImportOrder(Object.keys(data));
    
    for (const tableName of tableOrder) {
      if (data[tableName] && Array.isArray(data[tableName])) {
        const tableOptions = options[tableName] || {};
        const result = await importTableData(tableName, data[tableName], tableOptions);
        importResults[tableName] = result;
      }
    }
    
    return {
      success: true,
      importedAt: new Date().toISOString(),
      results: importResults
    };
  } catch (error) {
    console.error('Error importing database:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Determine the order to import tables based on dependencies
 * @param {Array<string>} tables - List of tables
 * @returns {Array<string>} - Ordered list of tables
 */
const determineImportOrder = (tables) => {
  // Define table dependencies (tables that should be imported first)
  const dependencies = {
    'quiz_questions': ['quizzes', 'questions'],
    'quizzes': ['folders'],
    'questions': ['folders']
  };
  
  // Simple topological sort
  const result = [];
  const visited = new Set();
  
  const visit = (table) => {
    if (visited.has(table)) return;
    visited.add(table);
    
    // Visit dependencies first
    if (dependencies[table]) {
      dependencies[table].forEach(dep => {
        if (tables.includes(dep)) {
          visit(dep);
        }
      });
    }
    
    result.push(table);
  };
  
  tables.forEach(table => visit(table));
  
  return result;
}; 