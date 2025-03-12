# Migration Guide: Moving from localStorage to Supabase

This guide explains how to migrate your question sets from browser localStorage to Supabase.

## The Two-Step Migration Process

**Important: Migration now requires two steps!**

1. **Step 1: Migrate from localStorage to the Supabase `question_sets` table**
2. **Step 2: Transfer from `question_sets` to the main application tables**

## Migration Steps

1. Make sure you're logged in to your QuizCraft account.
2. Go to the Admin page by clicking your profile picture in the top right and selecting "Admin".
3. Navigate to the "Data Sync" tab.
4. **Step 1:** Click the "Migrate from localStorage" button.
   - Decide whether to skip or overwrite existing question sets. If you check "Overwrite existing question sets," duplicates will be replaced. If left unchecked, duplicates will be skipped.
   - The migration will process all localStorage question sets and move them to Supabase.
   - You'll see a results summary showing how many sets were migrated, skipped, or had errors.
5. **Step 2:** After the first step completes, click the "Transfer to Main Tables" button.
   - This will convert your question sets into the format used by the main application.
   - It will create folders and questions in the main database tables.
   - When complete, you'll see how many folders and questions were created.

## Verifying Migration Success

1. After both steps complete, go to the main app homepage.
2. You should see your folders and questions listed.
3. Navigate to some questions to verify they appear correctly.
4. If data appears correctly, you can safely clear your localStorage.

## Troubleshooting

### Empty Export Data

If you see empty tables when exporting data (0 records in folders, questions, etc.) but you've successfully migrated your question sets:

1. Make sure you've completed **BOTH** steps of the migration process.
2. The first step only migrates data to a temporary storage table.
3. You must run the second step to transfer data to the main application tables.

### "Duplicate key value" errors

These errors occur when question sets already exist in Supabase. You have two options:

1. **Step 1 - Skipping duplicates**: Leave the "Overwrite existing question sets" option unchecked. Duplicate sets will be skipped and noted in the migration results.
2. **Step 1 - Replacing duplicates**: Check the "Overwrite existing question sets" option to replace existing question sets with the ones from localStorage.

### Data visible in local app but not in Vercel deployment

This usually means your Vercel deployment is using a different Supabase project. To fix this:

1. Check the Admin > Environment Info to compare your local and Vercel Supabase URLs.
2. If they differ, you'll need to migrate your data again on the Vercel deployment.
3. Or update your Vercel environment variables to match your local setup.

### Need further assistance?

If you encounter any issues during migration, please open an issue in the GitHub repository with a detailed description of the problem and any error messages you received. 