import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

interface AIHabit {
  title: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  frequency_value: number;
  estimated_duration: string;
}

interface AIMilestone {
  title: string;
  description: string;
  target_date_offset: number;
  estimated_completion_time: string;
}

interface AIGoalBreakdown {
  habits: AIHabit[];
  milestones: AIMilestone[];
  source: 'openai' | 'mock';
  model?: string;
  timestamp: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { goalTitle, goalDescription } = await req.json();

    if (!goalTitle) {
      return new Response(
        JSON.stringify({ error: "Goal title is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get OpenAI API key from environment variables (secure server-side)
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openaiKey) {
      // Return mock data if no API key is configured
      const mockData = getMockBreakdown(goalTitle);
      return new Response(
        JSON.stringify(mockData),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Generate with OpenAI
    const breakdown = await generateWithOpenAI(goalTitle, goalDescription, openaiKey);
    
    return new Response(
      JSON.stringify(breakdown),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error('Error generating goal breakdown:', error);
    
    // Fall back to mock data on error
    try {
      const { goalTitle } = await req.json();
      const mockData = getMockBreakdown(goalTitle);
      
      return new Response(
        JSON.stringify(mockData),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } catch {
      return new Response(
        JSON.stringify({ 
          error: "Internal server error",
          source: 'error',
          timestamp: new Date().toISOString()
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  }
});

async function generateWithOpenAI(goalTitle: string, goalDescription: string | undefined, apiKey: string): Promise<AIGoalBreakdown> {
  const model = 'gpt-3.5-turbo';
  
  const prompt = `Break down the goal "${goalTitle}" ${goalDescription ? `(${goalDescription})` : ''} into actionable habits and milestones.

Return a JSON object with this exact structure:
{
  "habits": [
    {
      "title": "Specific habit name",
      "description": "Clear description of what to do",
      "frequency": "daily" | "weekly" | "monthly",
      "frequency_value": number (how many times per frequency period),
      "estimated_duration": "time estimate like '30 minutes'"
    }
  ],
  "milestones": [
    {
      "title": "Milestone name",
      "description": "What this milestone represents",
      "target_date_offset": number (days from goal start date),
      "estimated_completion_time": "time estimate like '4-6 weeks'"
    }
  ]
}

Guidelines:
- Create 3-5 habits that are specific, measurable, and actionable
- Create 3-5 milestones that mark significant progress points
- Make habits realistic for daily/weekly practice
- Space milestones appropriately throughout the goal timeline
- Use realistic time estimates
- Focus on building momentum with early wins`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that breaks down goals into actionable habits and milestones. Always respond with valid JSON only, no additional text.',
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

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`OpenAI API error: ${response.status} ${response.statusText}. ${errorData.error?.message || ''}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;
  
  if (!content) {
    throw new Error('No content received from OpenAI');
  }

  const parsed = JSON.parse(content);
  
  // Validate the response structure
  if (!parsed.habits || !parsed.milestones || !Array.isArray(parsed.habits) || !Array.isArray(parsed.milestones)) {
    throw new Error('Invalid response structure from OpenAI');
  }

  // Add metadata about the AI generation
  return {
    ...parsed,
    source: 'openai',
    model,
    timestamp: new Date().toISOString(),
  };
}

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