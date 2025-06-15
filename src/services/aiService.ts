// Mock AI service - replace with actual AI API integration
export interface AIHabit {
  title: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  frequency_value: number;
  estimated_duration: string;
}

export async function generateHabitsForGoal(goalTitle: string, goalDescription?: string): Promise<AIHabit[]> {
  // Mock AI response - replace with actual API call
  await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API delay

  const mockHabits: Record<string, AIHabit[]> = {
    'run marathon': [
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
    'write book': [
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
    default: [
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
  };

  const searchKey = goalTitle.toLowerCase();
  const matchingKey = Object.keys(mockHabits).find(key => 
    key !== 'default' && searchKey.includes(key)
  );

  return mockHabits[matchingKey || 'default'];
}

// Real AI integration would look like this:
/*
export async function generateHabitsForGoal(goalTitle: string, goalDescription?: string): Promise<AIHabit[]> {
  const prompt = `Break down the goal "${goalTitle}" ${goalDescription ? `(${goalDescription})` : ''} into 3-5 actionable habits with specific frequencies. Return as JSON array with title, description, frequency (daily/weekly/monthly), frequency_value (number), and estimated_duration fields.`;

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
          content: 'You are a helpful assistant that breaks down goals into actionable habits. Always respond with valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    }),
  });

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}
*/