/*
  # Add Milestones Feature

  1. New Tables
    - `milestones`
      - `id` (uuid, primary key)
      - `goal_id` (uuid, foreign key to goals)
      - `user_id` (uuid, foreign key to profiles)
      - `title` (text)
      - `description` (text, nullable)
      - `target_date` (date, nullable)
      - `is_completed` (boolean)
      - `order_index` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on milestones table
    - Add policies for authenticated users to manage their own milestones

  3. Indexes
    - Add indexes for frequently queried columns
*/

-- Create milestones table
CREATE TABLE IF NOT EXISTS milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id uuid REFERENCES goals(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  target_date date,
  is_completed boolean DEFAULT false,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;

-- Create policies for milestones
CREATE POLICY "Users can read own milestones"
  ON milestones
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own milestones"
  ON milestones
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own milestones"
  ON milestones
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own milestones"
  ON milestones
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_milestones_user_id ON milestones(user_id);
CREATE INDEX IF NOT EXISTS idx_milestones_goal_id ON milestones(goal_id);
CREATE INDEX IF NOT EXISTS idx_milestones_target_date ON milestones(target_date);

-- Create trigger for updated_at
CREATE TRIGGER update_milestones_updated_at
  BEFORE UPDATE ON milestones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();