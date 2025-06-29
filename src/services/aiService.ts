// Mock AI service - replace with actual AI API integration
export interface AIHabit {
  title: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  frequency_value: number;
  estimated_duration: string;
}

export interface AIMilestone {
  title: string;
  description: string;
  target_date_offset: number; // Days from goal start date
  estimated_completion_time: string;
}

export interface AIGoalBreakdown {
  habits: AIHabit[];
  milestones: AIMilestone[];
}

export async function generateHabitsAndMilestonesForGoal(goalTitle: string, goalDescription?: string): Promise<AIGoalBreakdown> {
  // Mock AI response - replace with actual API call
  await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API delay

  const mockBreakdowns: Record<string, AIGoalBreakdown> = {
    'run marathon': {
      habits: [
        {
          title: 'Morning Run',
          description: 'Start with 30-minute runs, gradually increasing distance',
          frequency: 'daily',
          frequency_value: 1,
          estimated_duration: '30-60 minutes',
        },
        {
          title: 'Strength Training',
          description: 'Focus on leg strength and core stability',
          frequency: 'weekly',
          frequency_value: 3,
          estimated_duration: '45 minutes',
        },
        {
          title: 'Long Run',
          description: 'Weekly long-distance run to build endurance',
          frequency: 'weekly',
          frequency_value: 1,
          estimated_duration: '1-3 hours',
        },
        {
          title: 'Rest and Recovery',
          description: 'Stretching, foam rolling, and adequate sleep',
          frequency: 'daily',
          frequency_value: 1,
          estimated_duration: '20 minutes',
        },
      ],
      milestones: [
        {
          title: 'Complete First 5K',
          description: 'Run your first 5K without stopping',
          target_date_offset: 30,
          estimated_completion_time: '2-4 weeks',
        },
        {
          title: 'Reach 10K Distance',
          description: 'Successfully complete a 10K run',
          target_date_offset: 60,
          estimated_completion_time: '6-8 weeks',
        },
        {
          title: 'Half Marathon Ready',
          description: 'Complete a 21K half marathon',
          target_date_offset: 120,
          estimated_completion_time: '12-16 weeks',
        },
        {
          title: 'Marathon Training Peak',
          description: 'Complete longest training run (32K+)',
          target_date_offset: 150,
          estimated_completion_time: '18-20 weeks',
        },
      ],
    },
    'write book': {
      habits: [
        {
          title: 'Daily Writing',
          description: 'Write at least 500 words every day',
          frequency: 'daily',
          frequency_value: 1,
          estimated_duration: '1-2 hours',
        },
        {
          title: 'Research and Planning',
          description: 'Research topics and plan upcoming chapters',
          frequency: 'weekly',
          frequency_value: 2,
          estimated_duration: '1 hour',
        },
        {
          title: 'Edit and Review',
          description: 'Review and edit previous chapters',
          frequency: 'weekly',
          frequency_value: 1,
          estimated_duration: '2 hours',
        },
        {
          title: 'Reading in Genre',
          description: 'Read books in your genre for inspiration',
          frequency: 'daily',
          frequency_value: 1,
          estimated_duration: '30 minutes',
        },
      ],
      milestones: [
        {
          title: 'Complete Book Outline',
          description: 'Finish detailed chapter-by-chapter outline',
          target_date_offset: 14,
          estimated_completion_time: '1-2 weeks',
        },
        {
          title: 'First Draft - 25% Complete',
          description: 'Complete first quarter of your book',
          target_date_offset: 45,
          estimated_completion_time: '6-8 weeks',
        },
        {
          title: 'First Draft - 50% Complete',
          description: 'Reach the halfway point of your first draft',
          target_date_offset: 90,
          estimated_completion_time: '12-14 weeks',
        },
        {
          title: 'Complete First Draft',
          description: 'Finish the entire first draft of your book',
          target_date_offset: 150,
          estimated_completion_time: '20-24 weeks',
        },
        {
          title: 'Complete First Edit',
          description: 'Finish comprehensive editing of your manuscript',
          target_date_offset: 180,
          estimated_completion_time: '24-28 weeks',
        },
      ],
    },
    'learn language': {
      habits: [
        {
          title: 'Daily Vocabulary Practice',
          description: 'Learn 10 new words and review previous ones',
          frequency: 'daily',
          frequency_value: 1,
          estimated_duration: '20-30 minutes',
        },
        {
          title: 'Grammar Exercises',
          description: 'Practice grammar rules and sentence structure',
          frequency: 'daily',
          frequency_value: 1,
          estimated_duration: '15-25 minutes',
        },
        {
          title: 'Speaking Practice',
          description: 'Practice speaking with native speakers or apps',
          frequency: 'weekly',
          frequency_value: 3,
          estimated_duration: '30-45 minutes',
        },
        {
          title: 'Listening Comprehension',
          description: 'Watch shows, podcasts, or music in target language',
          frequency: 'daily',
          frequency_value: 1,
          estimated_duration: '30 minutes',
        },
      ],
      milestones: [
        {
          title: 'Basic Vocabulary (500 words)',
          description: 'Learn and retain 500 essential words',
          target_date_offset: 30,
          estimated_completion_time: '4-6 weeks',
        },
        {
          title: 'Hold Basic Conversation',
          description: 'Have a 5-minute conversation with a native speaker',
          target_date_offset: 60,
          estimated_completion_time: '8-10 weeks',
        },
        {
          title: 'Intermediate Level (A2)',
          description: 'Pass an A2 level proficiency test',
          target_date_offset: 120,
          estimated_completion_time: '16-20 weeks',
        },
        {
          title: 'Advanced Conversation',
          description: 'Discuss complex topics fluently for 30+ minutes',
          target_date_offset: 180,
          estimated_completion_time: '24-28 weeks',
        },
      ],
    },
    default: {
      habits: [
        {
          title: 'Daily Practice',
          description: 'Dedicate time daily to work towards your goal',
          frequency: 'daily',
          frequency_value: 1,
          estimated_duration: '30-60 minutes',
        },
        {
          title: 'Weekly Review',
          description: 'Review progress and adjust strategy',
          frequency: 'weekly',
          frequency_value: 1,
          estimated_duration: '30 minutes',
        },
        {
          title: 'Skill Development',
          description: 'Learn new skills related to your goal',
          frequency: 'weekly',
          frequency_value: 3,
          estimated_duration: '45 minutes',
        },
      ],
      milestones: [
        {
          title: 'Foundation Complete',
          description: 'Complete basic setup and initial learning',
          target_date_offset: 30,
          estimated_completion_time: '3-4 weeks',
        },
        {
          title: 'Intermediate Progress',
          description: 'Reach 50% completion of your goal',
          target_date_offset: 90,
          estimated_completion_time: '12-14 weeks',
        },
        {
          title: 'Advanced Stage',
          description: 'Reach 80% completion with refined skills',
          target_date_offset: 150,
          estimated_completion_time: '20-22 weeks',
        },
      ],
    },
  };

  const searchKey = goalTitle.toLowerCase();
  const matchingKey = Object.keys(mockBreakdowns).find(key => 
    key !== 'default' && searchKey.includes(key)
  );

  return mockBreakdowns[matchingKey || 'default'];
}

// Legacy function for backward compatibility
export async function generateHabitsForGoal(goalTitle: string, goalDescription?: string): Promise<AIHabit[]> {
  const breakdown = await generateHabitsAndMilestonesForGoal(goalTitle, goalDescription);
  return breakdown.habits;
}

// Real AI integration would look like this:
/*
export async function generateHabitsAndMilestonesForGoal(goalTitle: string, goalDescription?: string): Promise<AIGoalBreakdown> {
  const prompt = `Break down the goal "${goalTitle}" ${goalDescription ? `(${goalDescription})` : ''} into:
  1. 3-5 actionable habits with specific frequencies
  2. 3-5 key milestones with target dates
  
  Return as JSON with "habits" and "milestones" arrays. 
  
  Habits should have: title, description, frequency (daily/weekly/monthly), frequency_value (number), estimated_duration
  Milestones should have: title, description, target_date_offset (days from start), estimated_completion_time`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that breaks down goals into actionable habits and milestones. Always respond with valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 1500,
      temperature: 0.7,
    }),
  });

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}
*/