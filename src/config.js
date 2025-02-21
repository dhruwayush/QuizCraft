const config = {
  GEMINI_API_KEY: process.env.REACT_APP_GEMINI_API_KEY || ''
};

// Debug log to check if environment variable is loaded
console.log('Environment variables loaded:', {
  GEMINI_API_KEY_EXISTS: !!process.env.REACT_APP_GEMINI_API_KEY
});

export default config; 