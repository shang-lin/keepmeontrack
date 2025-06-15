/*
  # Goal and Habit Tracking Database Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text, unique)
      - `full_name` (text, nullable)
      - `avatar_url` (text, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `goals`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `title` (text)
      - `description` (text, nullable)
      - `target_date` (date, nullable)
      - `status` (enum: active, completed, paused)
      - `progress` (integer, 0-100)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `habits`
      - `id` (uuid, primary key)
      - `goal_id` (uuid, foreign key to goals)
      - `user_id` (uuid, foreign key to profiles)
      - `title` (text)
      - `description` (text, nullable)
      - `frequency` (enum: daily, weekly, monthly, custom)
      - `frequency_value` (integer)
      - `due_date` (date, nullable)
      - `is_completed` (boolean)
      - `order_index` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `habit_completions`
      - `id` (uuid, primary key)
      - `habit_id` (uuid, foreign key to habits)
      - `user_id` (uuid, foreign key to profiles)
      - `completed_at` (timestamp)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Users can only access their own goals, habits, and completions

  3. Indexes
    - Add indexes for frequently queried columns
    - Foreign key indexes for better join performance
*/

-- Create custom types
CREATE TYPE goal_status AS ENUM ('active', 'completed', 'paused');
CREATE TYPE habit_frequency AS ENUM ('daily', 'weekly', 'monthly', 'custom');

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create goals table
CREATE TABLE IF NOT EXISTS goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  target_date date,
  status goal_status DEFAULT 'active',
  progress integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create habits table
CREATE TABLE IF NOT EXISTS habits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id uuid REFERENCES goals(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  frequency habit_frequency DEFAULT 'daily',
  frequency_value integer DEFAULT 1 CHECK (frequency_value > 0),
  due_date date,
  is_completed boolean DEFAULT false,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create habit_completions table
CREATE TABLE IF NOT EXISTS habit_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id uuid REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  completed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_completions ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create policies for goals
CREATE POLICY "Users can read own goals"
  ON goals
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals"
  ON goals
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals"
  ON goals
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals"
  ON goals
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for habits
CREATE POLICY "Users can read own habits"
  ON habits
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own habits"
  ON habits
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own habits"
  ON habits
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own habits"
  ON habits
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for habit_completions
CREATE POLICY "Users can read own habit completions"
  ON habit_completions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own habit completions"
  ON habit_completions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own habit completions"
  ON habit_completions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own habit completions"
  ON habit_completions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_status ON goals(status);
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habits_goal_id ON habits(goal_id);
CREATE INDEX IF NOT EXISTS idx_habits_due_date ON habits(due_date);
CREATE INDEX IF NOT EXISTS idx_habit_completions_user_id ON habit_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_completions_habit_id ON habit_completions(habit_id);

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to call the function on user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_goals_updated_at
  BEFORE UPDATE ON goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_habits_updated_at
  BEFORE UPDATE ON habits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();