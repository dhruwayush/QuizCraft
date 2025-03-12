# QuizCraft

QuizCraft is an interactive MCQ quiz application built with React and Supabase.

## Features

- User authentication and profile management
- Create and organize questions in folders
- Take quizzes with real-time feedback
- Track performance and statistics
- Bookmark favorite questions
- Schedule quizzes for later

## Architecture

The application is built with the following architecture:

- **Frontend**: React with Emotion for styling
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Server**: Express.js middleware server (optional)

## Project Structure

```
QuizCraft/
├── src/                    # React frontend code
│   ├── components/         # React components
│   ├── config/             # Configuration files
│   ├── contexts/           # React context providers
│   ├── utils/              # Utility functions
│   ├── theme.js            # Theme configuration
│   └── App.js              # Main App component
├── server/                 # Backend server (optional)
│   ├── supabase-server.js  # Express server with Supabase integration
│   ├── init.js             # Server initialization script
│   └── README.md           # Server documentation
├── public/                 # Static files
├── supabase_schema.sql     # Database schema SQL
├── supabase_rls.sql        # Row Level Security policies
└── SUPABASE_SETUP.md       # Supabase setup guide
```

## Setup

### Frontend Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/QuizCraft.git
   cd QuizCraft
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your Supabase credentials:
   ```
   REACT_APP_SUPABASE_URL=your_supabase_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the development server:
   ```bash
   npm start
   ```

### Supabase Setup

See [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for detailed instructions on setting up Supabase for this project.

### Server Setup (Optional)

The QuizCraft application can be extended with a middleware server that provides additional features:

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install server dependencies:
   ```bash
   npm install
   ```

3. Initialize the server configuration:
   ```bash
   npm run init
   ```

4. Configure the server environment:
   - Copy `.env.example` to `.env`
   - Add your Supabase service role key

5. Start the server:
   ```bash
   npm run dev
   ```

For more details, see the [server README](server/README.md).

## Connecting Frontend to Server

To connect the React frontend to the Express server:

1. Add the server URL to your frontend `.env` file:
   ```
   REACT_APP_SERVER_URL=http://localhost:5000/api
   ```

2. Use the server API functions in your components:
   ```javascript
   import { serverQuestions, serverFolders } from '../utils/serverApi';

   // Example usage
   const fetchQuestions = async () => {
     try {
       const response = await serverQuestions.getAll();
       setQuestions(response.data);
     } catch (error) {
       console.error('Error fetching questions:', error);
     }
   };
   ```

## Development

### Direct Supabase Mode

By default, the frontend communicates directly with Supabase. This mode is simpler but places more responsibility on the client.

### Server Middleware Mode

When the server is running and configured, the frontend can communicate with Supabase through the Express server. This provides:

- Enhanced security (service key never exposed to clients)
- Additional validation and business logic
- Server-side caching
- Centralized error handling
- Unified API for frontend developers

## Troubleshooting

See the [SUPABASE_SETUP.md](SUPABASE_SETUP.md) and [server README](server/README.md) for troubleshooting guidelines.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
