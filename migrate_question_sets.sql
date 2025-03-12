-- Create question_sets table
CREATE TABLE IF NOT EXISTS question_sets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  folder_name TEXT NOT NULL,
  file_name TEXT NOT NULL,
  questions JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, folder_name, file_name)
);

-- Add RLS policies
ALTER TABLE question_sets ENABLE ROW LEVEL SECURITY;

-- Allow users to select their own question sets
CREATE POLICY "Users can view their own question sets" 
  ON question_sets FOR SELECT 
  USING (auth.uid() = user_id);

-- Allow users to insert their own question sets
CREATE POLICY "Users can create their own question sets" 
  ON question_sets FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own question sets
CREATE POLICY "Users can update their own question sets" 
  ON question_sets FOR UPDATE 
  USING (auth.uid() = user_id);

-- Allow users to delete their own question sets
CREATE POLICY "Users can delete their own question sets" 
  ON question_sets FOR DELETE 
  USING (auth.uid() = user_id);

-- Optional: Create an index on user_id and folder_name for faster lookups
CREATE INDEX IF NOT EXISTS idx_question_sets_user_folder 
  ON question_sets(user_id, folder_name); 