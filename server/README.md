# QuizCraft Server

This is the backend server for the QuizCraft application, providing an API layer between the frontend and Supabase.

## Features

- Middleware for Supabase authentication and authorization
- Enhanced validation and business logic
- Analytics and reporting endpoints
- Webhook handling for Supabase events
- Server-side caching options

## Setup

### Prerequisites

- Node.js 14+ installed
- A Supabase project already set up (see main README)
- Supabase Service Role Key (admin privileges)

### Installation

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file:
   Copy the `.env.example` file to `.env` and fill in your Supabase credentials:
   ```
   PORT=5000
   REACT_APP_SUPABASE_URL=your_supabase_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_KEY=your_supabase_service_role_key
   ```

   > **IMPORTANT**: The SUPABASE_SERVICE_KEY is a sensitive credential with admin privileges. Never expose it to the client or commit it to version control.

4. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Health Check
- `GET /api/health` - Check if the server is running

### Questions
- `GET /api/questions` - Get all questions
- `GET /api/questions/:id` - Get a specific question
- `POST /api/questions` - Create a new question
- `PUT /api/questions/:id` - Update a question
- `DELETE /api/questions/:id` - Delete a question

### Folders
- `GET /api/folders` - Get all folders
- `GET /api/folders/:id` - Get a specific folder
- `POST /api/folders` - Create a new folder
- `PUT /api/folders/:id` - Update a folder
- `DELETE /api/folders/:id` - Delete a folder

### Analytics
- `GET /api/analytics` - Get dashboard analytics
- `GET /api/analytics/users/:id` - Get user-specific analytics

### Webhooks
- `POST /api/webhooks/supabase` - Webhook handler for Supabase events

## Setting Up Supabase Webhooks

1. Go to your Supabase dashboard
2. Navigate to Database → Webhooks
3. Create a new webhook:
   - Name: `QuizCraftEvents`
   - Table: Select tables you want to monitor (e.g., `profiles`, `quiz_attempts`)
   - Events: Select events to trigger the webhook (e.g., `INSERT`, `UPDATE`, `DELETE`)
   - URL: Your server webhook URL (e.g., `https://your-server.com/api/webhooks/supabase`)
   - HTTP Method: `POST`
   - Headers: Add `Content-Type: application/json`

## Security Considerations

This server uses Supabase's service role key, which has admin privileges. Always follow these security practices:

1. Never expose the service key to clients
2. Implement proper request validation
3. Use HTTPS in production
4. Set up proper CORS configuration
5. Implement rate limiting for public endpoints

## Production Deployment

For production deployment:

1. Update the `.env` file with production values
2. Set `NODE_ENV=production`
3. Set up a proper process manager like PM2
4. Configure a reverse proxy (Nginx/Apache)
5. Set up SSL certificates
6. Implement proper logging

## Troubleshooting

### Common Issues

- **Connection refused**: Check if Supabase URL is correct and the server is running
- **Authentication error**: Verify your Supabase service key
- **CORS errors**: Check CORS configuration in the server
- **Webhook not triggering**: Verify webhook URL and Supabase configuration

For more help, check the Supabase documentation or open an issue in the GitHub repository. 