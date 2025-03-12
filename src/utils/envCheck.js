// Environment variables checker for debugging

// Function to check and log environment variables
export const checkEnvironmentVariables = () => {
  const envVars = {
    SUPABASE_URL: process.env.REACT_APP_SUPABASE_URL,
    SERVER_URL: process.env.REACT_APP_SERVER_URL,
    NODE_ENV: process.env.NODE_ENV,
    // Redact sensitive information
    HAS_SUPABASE_KEY: process.env.REACT_APP_SUPABASE_ANON_KEY ? 'Set' : 'Not set'
  };
  
  console.log('Environment Variables:', envVars);
  return envVars;
};

// Function to check if we're in production
export const isProduction = () => {
  return process.env.NODE_ENV === 'production';
}; 