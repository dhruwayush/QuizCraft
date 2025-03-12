-- RLS policies for profiles table
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can create their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS policies for folders table
CREATE POLICY "Users can view their own folders"
  ON folders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own folders"
  ON folders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own folders"
  ON folders FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own folders"
  ON folders FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for questions table
CREATE POLICY "Users can view their own questions"
  ON questions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own questions"
  ON questions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own questions"
  ON questions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own questions"
  ON questions FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for quizzes table
CREATE POLICY "Users can view their own quizzes"
  ON quizzes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view public quizzes"
  ON quizzes FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can create their own quizzes"
  ON quizzes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quizzes"
  ON quizzes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own quizzes"
  ON quizzes FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for quiz_questions junction table
CREATE POLICY "Users can view their own quiz questions"
  ON quiz_questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM quizzes
      WHERE quizzes.id = quiz_questions.quiz_id
      AND (quizzes.user_id = auth.uid() OR quizzes.is_public = true)
    )
  );

CREATE POLICY "Users can create quiz questions for their quizzes"
  ON quiz_questions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM quizzes
      WHERE quizzes.id = quiz_questions.quiz_id
      AND quizzes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete quiz questions from their quizzes"
  ON quiz_questions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM quizzes
      WHERE quizzes.id = quiz_questions.quiz_id
      AND quizzes.user_id = auth.uid()
    )
  );

-- RLS policies for quiz_attempts table
CREATE POLICY "Users can view their own quiz attempts"
  ON quiz_attempts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own quiz attempts"
  ON quiz_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quiz attempts"
  ON quiz_attempts FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS policies for starred_questions table
CREATE POLICY "Users can view their own starred questions"
  ON starred_questions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own starred questions"
  ON starred_questions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own starred questions"
  ON starred_questions FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for question_reports table
CREATE POLICY "Users can create question reports"
  ON question_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own question reports"
  ON question_reports FOR SELECT
  USING (auth.uid() = user_id);

-- Admin policies (uncomment and customize as needed)
-- CREATE POLICY "Admins can view all profiles"
--   ON profiles FOR SELECT
--   USING (auth.uid() IN (SELECT id FROM admin_users));

-- CREATE POLICY "Admins can manage all resources"
--   ON profiles FOR ALL
--   USING (auth.uid() IN (SELECT id FROM admin_users)); 