require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase with service key
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Supabase URL or service key is missing.');
  console.error('Please check your .env file and make sure both REACT_APP_SUPABASE_URL and SUPABASE_SERVICE_KEY are set.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  console.log('Initializing server configuration...');
  
  try {
    // Step 1: Check connection to Supabase
    console.log('Checking connection to Supabase...');
    const { data: healthCheck, error: healthError } = await supabase.rpc('pg_version');
    
    if (healthError) {
      throw new Error(`Failed to connect to Supabase: ${healthError.message}`);
    }
    
    console.log('✅ Connected to Supabase successfully');
    
    // Step 2: Check if tables exist
    console.log('Checking database tables...');
    
    const { data: tables, error: tablesError } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public');
    
    if (tablesError) {
      throw new Error(`Failed to check database tables: ${tablesError.message}`);
    }
    
    const requiredTables = ['profiles', 'folders', 'questions', 'quizzes', 'quiz_questions', 'quiz_attempts', 'starred_questions'];
    const existingTables = tables.map(t => t.tablename);
    
    const missingTables = requiredTables.filter(t => !existingTables.includes(t));
    
    if (missingTables.length > 0) {
      console.warn(`⚠️ Missing tables: ${missingTables.join(', ')}`);
      console.warn('Please run the database schema SQL to create these tables.');
    } else {
      console.log('✅ All required tables exist');
    }
    
    // Step 3: Create .env.example file if it doesn't exist
    console.log('Creating .env.example file...');
    
    const envExample = `# Server configuration
PORT=5000

# Supabase configuration
REACT_APP_SUPABASE_URL=your_supabase_url_here
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Get this from Supabase dashboard > Settings > API > service_role key
# IMPORTANT: This is a secret key with admin privileges, never expose this to clients
SUPABASE_SERVICE_KEY=your_supabase_service_role_key_here
`;
    
    fs.writeFileSync(path.join(__dirname, '.env.example'), envExample);
    console.log('✅ Created .env.example file');
    
    // Step 4: Create logs directory
    console.log('Creating logs directory...');
    
    const logsDir = path.join(__dirname, 'logs');
    
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir);
    }
    
    console.log('✅ Created logs directory');
    
    console.log('\nServer initialization complete! 🚀');
    console.log('\nNext steps:');
    console.log('1. Make sure your .env file is properly configured');
    console.log('2. Start the server with "npm run dev" or "npm start"');
    
  } catch (error) {
    console.error(`❌ Initialization failed: ${error.message}`);
    process.exit(1);
  }
}

main(); 