/*
  # Add start date fields to goals and habits

  1. Schema Changes
    - Add `start_date` column to `goals` table (date, nullable, default today)
    - Add `start_date` column to `habits` table (date, nullable, default today)

  2. Data Migration
    - Set existing records to have start_date as their created_at date
    - Ensure new records default to current date if not specified

  3. Indexes
    - Add indexes for start_date columns for better query performance
*/

-- Add start_date column to goals table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'goals' AND column_name = 'start_date'
  ) THEN
    ALTER TABLE goals ADD COLUMN start_date date DEFAULT CURRENT_DATE;
  END IF;
END $$;

-- Add start_date column to habits table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'habits' AND column_name = 'start_date'
  ) THEN
    ALTER TABLE habits ADD COLUMN start_date date DEFAULT CURRENT_DATE;
  END IF;
END $$;

-- Update existing goals to have start_date as their created_at date
UPDATE goals 
SET start_date = created_at::date 
WHERE start_date IS NULL;

-- Update existing habits to have start_date as their created_at date
UPDATE habits 
SET start_date = created_at::date 
WHERE start_date IS NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_goals_start_date ON goals(start_date);
CREATE INDEX IF NOT EXISTS idx_habits_start_date ON habits(start_date);