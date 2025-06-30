// AI service for generating habits and milestones from goals
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
  source: 'openai' | 'mock';
  model?: string;
  timestamp: string;
}

// Configuration for guest AI query limits
const GUEST_AI_QUERY_LIMIT = 1; // Easy to change this number

// Check if guest user has exceeded AI query limit
function hasExceededGuestLimit(): boolean {
  // Check if we're in guest mode
  const guestSession = sessionStorage.getItem('guest_session');
  if (!guestSession) return false; // Not a guest user
  
  const savedCount = sessionStorage.getItem('guest_ai_query_count');
  const queryCount = parseInt(savedCount || '0', 10);
  
  return queryCount >= GUEST_AI_QUERY_LIMIT;
}

// Secure AI integration using Supabase Edge Functions
export async function generateHabitsAndMilestonesForGoal(goalTitle: string, goalDescription?: string): Promise<AIGoalBreakdown> {
  // Check if guest user has exceeded limit - if so, use mock data immediately
  if (hasExceededGuestLimit()) {
    console.log('Guest AI query limit exceeded, using mock data');
    return getMockBreakdown(goalTitle);
  }

  try {
    // Call the secure Supabase Edge Function
    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-goal-breakdown`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        goalTitle,
        goalDescription,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const breakdown = await response.json();
    
    // Validate the response structure
    if (!breakdown.habits || !breakdown.milestones || !Array.isArray(breakdown.habits) || !Array.isArray(breakdown.milestones)) {
      throw new Error('Invalid response structure from API');
    }

    // Increment guest query count if this was a successful AI query
    const guestSession = sessionStorage.getItem('guest_session');
    if (guestSession && breakdown.source === 'openai') {
      const currentCount = parseInt(sessionStorage.getItem('guest_ai_query_count') || '0', 10);
      sessionStorage.setItem('guest_ai_query_count', (currentCount + 1).toString());
    }

    return breakdown;
  } catch (error) {
    console.error('Error calling AI service:', error);
    
    // Fall back to local mock data if the API fails
    return getMockBreakdown(goalTitle);
  }
}

// Local fallback function
function getMockBreakdown(goalTitle: string): AIGoalBreakdown {
  const mockBreakdowns: Record<string, Omit<AIGoalBreakdown, 'source' | 'timestamp'>> = {
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
    'lose weight': {
      habits: [
        {
          title: 'Daily Exercise',
          description: 'Engage in 30-45 minutes of physical activity',
          frequency: 'daily',
          frequency_value: 1,
          estimated_duration: '30-45 minutes',
        },
        {
          title: 'Meal Planning',
          description: 'Plan healthy meals and track calories',
          frequency: 'weekly',
          frequency_value: 1,
          estimated_duration: '1 hour',
        },
        {
          title: 'Water Intake',
          description: 'Drink at least 8 glasses of water daily',
          frequency: 'daily',
          frequency_value: 1,
          estimated_duration: '5 minutes',
        },
        {
          title: 'Sleep Schedule',
          description: 'Maintain consistent 7-8 hours of sleep',
          frequency: 'daily',
          frequency_value: 1,
          estimated_duration: '7-8 hours',
        },
      ],
      milestones: [
        {
          title: 'First 5 Pounds Lost',
          description: 'Achieve initial weight loss milestone',
          target_date_offset: 21,
          estimated_completion_time: '2-3 weeks',
        },
        {
          title: 'Establish Exercise Routine',
          description: 'Complete 30 consecutive days of exercise',
          target_date_offset: 30,
          estimated_completion_time: '4-5 weeks',
        },
        {
          title: 'Halfway to Goal',
          description: 'Reach 50% of your weight loss target',
          target_date_offset: 90,
          estimated_completion_time: '12-14 weeks',
        },
        {
          title: 'Target Weight Achieved',
          description: 'Reach your goal weight',
          target_date_offset: 180,
          estimated_completion_time: '24-26 weeks',
        },
      ],
    },
    'start business': {
      habits: [
        {
          title: 'Market Research',
          description: 'Research target market and competitors daily',
          frequency: 'daily',
          frequency_value: 1,
          estimated_duration: '1-2 hours',
        },
        {
          title: 'Business Plan Development',
          description: 'Work on business plan sections',
          frequency: 'weekly',
          frequency_value: 3,
          estimated_duration: '2 hours',
        },
        {
          title: 'Networking',
          description: 'Connect with potential customers and partners',
          frequency: 'weekly',
          frequency_value: 2,
          estimated_duration: '1 hour',
        },
        {
          title: 'Skill Development',
          description: 'Learn business and industry-specific skills',
          frequency: 'daily',
          frequency_value: 1,
          estimated_duration: '30-60 minutes',
        },
      ],
      milestones: [
        {
          title: 'Business Idea Validation',
          description: 'Validate your business concept with potential customers',
          target_date_offset: 30,
          estimated_completion_time: '3-4 weeks',
        },
        {
          title: 'Complete Business Plan',
          description: 'Finish comprehensive business plan',
          target_date_offset: 60,
          estimated_completion_time: '8-10 weeks',
        },
        {
          title: 'Secure Initial Funding',
          description: 'Obtain startup capital or investment',
          target_date_offset: 120,
          estimated_completion_time: '16-18 weeks',
        },
        {
          title: 'Launch MVP',
          description: 'Launch minimum viable product',
          target_date_offset: 180,
          estimated_completion_time: '24-26 weeks',
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

  const baseBreakdown = mockBreakdowns[matchingKey || 'default'];
  
  return {
    ...baseBreakdown,
    source: 'mock',
    timestamp: new Date().toISOString(),
  };
}

// Legacy function for backward compatibility
export async function generateHabitsForGoal(goalTitle: string, goalDescription?: string): Promise<AIHabit[]> {
  const breakdown = await generateHabitsAndMilestonesForGoal(goalTitle, goalDescription);
  return breakdown.habits;
}