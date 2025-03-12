# QuizCraft Migration Guide: localStorage to Supabase

This guide walks you through migrating your question sets from browser localStorage to Supabase cloud storage.

## Why Migrate?

LocalStorage has several limitations:
- It's browser-specific (data doesn't sync between devices)
- It's domain-specific (localhost data won't appear on Vercel)
- It has limited storage capacity
- It's vulnerable to browser clearing/cookie deletion

Migrating to Supabase provides:
- Cross-device synchronization
- Consistent data between local and deployed versions
- More storage capacity
- Better data permanence and security

## Migration Steps

### 1. Create the Supabase Table

First, you need to create the necessary table in your Supabase project:

1. Go to your Supabase dashboard: https://app.supabase.com
2. Select your project
3. Go to SQL Editor
4. Create a new query, paste the SQL from the file `migrate_question_sets.sql`
5. Run the SQL script

### 2. Make Sure You're Logged In

The migration requires an authenticated user since question sets are associated with user IDs in Supabase.

1. Open your QuizCraft application (locally)
2. Log in with your account
3. Verify you're logged in (you should see your profile picture/name)

### 3. Run the Migration

1. Go to the Admin panel in QuizCraft
2. Click the "Data Sync" tab
3. Find the "Migrate LocalStorage to Supabase" section
4. **Important**: Decide whether to skip or overwrite existing question sets
   - If you check "Overwrite existing question sets", any duplicate question sets will be replaced
   - If you leave it unchecked, duplicates will be skipped (safer option)
5. Click the "Migrate LocalStorage Question Sets" button
6. Wait for the migration to complete
7. Review the results to ensure all question sets were migrated successfully

### 4. Verify the Migration

After migration:

1. Refresh the Admin panel
2. Go to different folders to verify your question sets appear
3. Try loading some question sets to ensure the content is correct

### 5. Deploy to Vercel (if applicable)

If you're deploying to Vercel:

1. Make sure your Vercel deployment has the correct environment variables:
   - `REACT_APP_SUPABASE_URL` 
   - `REACT_APP_SUPABASE_ANON_KEY`
2. Deploy your application
3. Visit the deployed app and log in
4. Verify your question sets are now available in the deployed version

## Troubleshooting

If you encounter issues during migration:

### Error: "You must be logged in to migrate question sets"
- Sign out and sign back in
- Check your Supabase auth configuration

### "Duplicate key value" errors
- This means the question sets already exist in Supabase
- Try using the "Overwrite existing question sets" option if you want to update them
- Or leave it unchecked to skip duplicates (these will show as "Skipped" in the results)

### Some question sets didn't migrate
- Check the migration results for specific error messages
- Try running the migration again with the appropriate settings

### Question sets don't appear after migration
- Refresh the page
- Ensure you're viewing the correct folder
- Check the browser console for errors

## Next Steps

After successful migration:

1. Consider exporting your data using the "Export Data" feature as a backup
2. You can safely continue using the application as normal
3. Your question sets will now sync across all instances of the application

For technical support or questions, please reach out to the development team. 