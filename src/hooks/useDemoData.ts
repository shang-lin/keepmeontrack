import { useState, useEffect } from 'react';
import { Database } from '../lib/supabase';
import { addDays, subDays, format } from 'date-fns';

type Goal = Database['public']['Tables']['goals']['Row'];
type Habit = Database['public']['Tables']['habits']['Row'];
type HabitCompletion = Database['public']['Tables']['habit_completions']['Row'];
type Milestone = Database['public']['Tables']['milestones']['Row'];

// Demo data
const createDemoGoals = (): Goal[] => {
  const today = new Date();
  const startDate = subDays(today, 30);
  const targetDate = addDays(today, 90);

  return [
    {
      id: 'demo-goal-1',
      user_id: 'demo-user-id',
      title: 'Run a Marathon',
      description: 'Complete my first 26.2-mile marathon race by the end of the year',
      start_date: format(startDate, 'yyyy-MM-dd'),
      target_date: format(targetDate, 'yyyy-MM-dd'),
      status: 'active' as const,
      progress: 65,
      created_at: startDate.toISOString(),
      updated_at: today.toISOString(),
    },
    {
      id: 'demo-goal-2',
      user_id: 'demo-user-id',
      title: 'Learn Spanish',
      description: 'Achieve conversational fluency in Spanish for my upcoming trip to Spain',
      start_date: format(subDays(today, 45), 'yyyy-MM-dd'),
      target_date: format(addDays(today, 120), 'yyyy-MM-dd'),
      status: 'active' as const,
      progress: 40,
      created_at: subDays(today, 45).toISOString(),
      updated_at: today.toISOString(),
    },
    {
      id: 'demo-goal-3',
      user_id: 'demo-user-id',
      title: 'Write a Novel',
      description: 'Complete the first draft of my science fiction novel',
      start_date: format(subDays(today, 60), 'yyyy-MM-dd'),
      target_date: format(addDays(today, 180), 'yyyy-MM-dd'),
      status: 'active' as const,
      progress: 25,
      created_at: subDays(today, 60).toISOString(),
      updated_at: today.toISOString(),
    },
    {
      id: 'demo-goal-4',
      user_id: 'demo-user-id',
      title: 'Build a Mobile App',
      description: 'Develop and launch my first mobile application on the App Store',
      start_date: format(subDays(today, 15), 'yyyy-MM-dd'),
      target_date: format(addDays(today, 150), 'yyyy-MM-dd'),
      status: 'completed' as const,
      progress: 100,
      created_at: subDays(today, 90).toISOString(),
      updated_at: subDays(today, 5).toISOString(),
    },
  ];
};

const createDemoHabits = (): Habit[] => {
  const today = new Date();
  
  return [
    {
      id: 'demo-habit-1',
      goal_id: 'demo-goal-1',
      user_id: 'demo-user-id',
      title: 'Morning Run',
      description: 'Run 5K every morning to build endurance',
      frequency: 'daily' as const,
      frequency_value: 1,
      start_date: format(subDays(today, 30), 'yyyy-MM-dd'),
      due_date: null,
      is_completed: false,
      order_index: 0,
      created_at: subDays(today, 30).toISOString(),
      updated_at: today.toISOString(),
    },
    {
      id: 'demo-habit-2',
      goal_id: 'demo-goal-1',
      user_id: 'demo-user-id',
      title: 'Strength Training',
      description: 'Focus on leg strength and core stability',
      frequency: 'weekly' as const,
      frequency_value: 3,
      start_date: format(subDays(today, 30), 'yyyy-MM-dd'),
      due_date: null,
      is_completed: false,
      order_index: 1,
      created_at: subDays(today, 30).toISOString(),
      updated_at: today.toISOString(),
    },
    {
      id: 'demo-habit-3',
      goal_id: 'demo-goal-2',
      user_id: 'demo-user-id',
      title: 'Daily Spanish Practice',
      description: 'Practice Spanish vocabulary and grammar for 30 minutes',
      frequency: 'daily' as const,
      frequency_value: 1,
      start_date: format(subDays(today, 45), 'yyyy-MM-dd'),
      due_date: null,
      is_completed: false,
      order_index: 0,
      created_at: subDays(today, 45).toISOString(),
      updated_at: today.toISOString(),
    },
    {
      id: 'demo-habit-4',
      goal_id: 'demo-goal-2',
      user_id: 'demo-user-id',
      title: 'Spanish Conversation',
      description: 'Practice speaking with native speakers online',
      frequency: 'weekly' as const,
      frequency_value: 2,
      start_date: format(subDays(today, 45), 'yyyy-MM-dd'),
      due_date: null,
      is_completed: false,
      order_index: 1,
      created_at: subDays(today, 45).toISOString(),
      updated_at: today.toISOString(),
    },
    {
      id: 'demo-habit-5',
      goal_id: 'demo-goal-3',
      user_id: 'demo-user-id',
      title: 'Daily Writing',
      description: 'Write at least 500 words every day',
      frequency: 'daily' as const,
      frequency_value: 1,
      start_date: format(subDays(today, 60), 'yyyy-MM-dd'),
      due_date: null,
      is_completed: false,
      order_index: 0,
      created_at: subDays(today, 60).toISOString(),
      updated_at: today.toISOString(),
    },
  ];
};

const createDemoMilestones = (): Milestone[] => {
  const today = new Date();
  
  return [
    {
      id: 'demo-milestone-1',
      goal_id: 'demo-goal-1',
      user_id: 'demo-user-id',
      title: 'Complete First 5K',
      description: 'Run 5K without stopping',
      target_date: format(subDays(today, 15), 'yyyy-MM-dd'),
      is_completed: true,
      order_index: 0,
      created_at: subDays(today, 30).toISOString(),
      updated_at: subDays(today, 15).toISOString(),
    },
    {
      id: 'demo-milestone-2',
      goal_id: 'demo-goal-1',
      user_id: 'demo-user-id',
      title: 'Complete 10K Run',
      description: 'Successfully finish a 10K race',
      target_date: format(addDays(today, 15), 'yyyy-MM-dd'),
      is_completed: false,
      order_index: 1,
      created_at: subDays(today, 30).toISOString(),
      updated_at: today.toISOString(),
    },
    {
      id: 'demo-milestone-3',
      goal_id: 'demo-goal-1',
      user_id: 'demo-user-id',
      title: 'Half Marathon Ready',
      description: 'Complete a 21K half marathon',
      target_date: format(addDays(today, 45), 'yyyy-MM-dd'),
      is_completed: false,
      order_index: 2,
      created_at: subDays(today, 30).toISOString(),
      updated_at: today.toISOString(),
    },
    {
      id: 'demo-milestone-4',
      goal_id: 'demo-goal-2',
      user_id: 'demo-user-id',
      title: 'Basic Vocabulary (500 words)',
      description: 'Learn and retain 500 essential Spanish words',
      target_date: format(subDays(today, 10), 'yyyy-MM-dd'),
      is_completed: true,
      order_index: 0,
      created_at: subDays(today, 45).toISOString(),
      updated_at: subDays(today, 10).toISOString(),
    },
    {
      id: 'demo-milestone-5',
      goal_id: 'demo-goal-2',
      user_id: 'demo-user-id',
      title: 'Hold Basic Conversation',
      description: 'Have a 10-minute conversation with a native speaker',
      target_date: format(addDays(today, 30), 'yyyy-MM-dd'),
      is_completed: false,
      order_index: 1,
      created_at: subDays(today, 45).toISOString(),
      updated_at: today.toISOString(),
    },
    {
      id: 'demo-milestone-6',
      goal_id: 'demo-goal-3',
      user_id: 'demo-user-id',
      title: 'Complete Book Outline',
      description: 'Finish detailed chapter-by-chapter outline',
      target_date: format(subDays(today, 50), 'yyyy-MM-dd'),
      is_completed: true,
      order_index: 0,
      created_at: subDays(today, 60).toISOString(),
      updated_at: subDays(today, 50).toISOString(),
    },
    {
      id: 'demo-milestone-7',
      goal_id: 'demo-goal-3',
      user_id: 'demo-user-id',
      title: 'First Draft - 25% Complete',
      description: 'Complete first quarter of the novel',
      target_date: format(addDays(today, 20), 'yyyy-MM-dd'),
      is_completed: false,
      order_index: 1,
      created_at: subDays(today, 60).toISOString(),
      updated_at: today.toISOString(),
    },
  ];
};

const createDemoHabitCompletions = (): HabitCompletion[] => {
  const today = new Date();
  const completions: HabitCompletion[] = [];
  
  // Generate completions for the last 30 days
  for (let i = 0; i < 30; i++) {
    const date = subDays(today, i);
    
    // Morning run - completed most days (80% completion rate)
    if (Math.random() > 0.2) {
      completions.push({
        id: `demo-completion-run-${i}`,
        habit_id: 'demo-habit-1',
        user_id: 'demo-user-id',
        completed_at: date.toISOString(),
        created_at: date.toISOString(),
      });
    }
    
    // Spanish practice - completed regularly (70% completion rate)
    if (Math.random() > 0.3) {
      completions.push({
        id: `demo-completion-spanish-${i}`,
        habit_id: 'demo-habit-3',
        user_id: 'demo-user-id',
        completed_at: date.toISOString(),
        created_at: date.toISOString(),
      });
    }
    
    // Writing - completed most days (75% completion rate)
    if (Math.random() > 0.25) {
      completions.push({
        id: `demo-completion-writing-${i}`,
        habit_id: 'demo-habit-5',
        user_id: 'demo-user-id',
        completed_at: date.toISOString(),
        created_at: date.toISOString(),
      });
    }
    
    // Strength training - 3x per week
    if (date.getDay() === 1 || date.getDay() === 3 || date.getDay() === 5) {
      if (Math.random() > 0.2) {
        completions.push({
          id: `demo-completion-strength-${i}`,
          habit_id: 'demo-habit-2',
          user_id: 'demo-user-id',
          completed_at: date.toISOString(),
          created_at: date.toISOString(),
        });
      }
    }
    
    // Spanish conversation - 2x per week
    if (date.getDay() === 2 || date.getDay() === 6) {
      if (Math.random() > 0.3) {
        completions.push({
          id: `demo-completion-conversation-${i}`,
          habit_id: 'demo-habit-4',
          user_id: 'demo-user-id',
          completed_at: date.toISOString(),
          created_at: date.toISOString(),
        });
      }
    }
  }
  
  return completions;
};

export function useDemoData() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitCompletions, setHabitCompletions] = useState<HabitCompletion[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setGoals(createDemoGoals());
      setHabits(createDemoHabits());
      setMilestones(createDemoMilestones());
      setHabitCompletions(createDemoHabitCompletions());
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Mock CRUD operations for demo mode
  const createGoal = async (goalData: Omit<Database['public']['Tables']['goals']['Insert'], 'user_id'>) => {
    const newGoal: Goal = {
      id: `demo-goal-${Date.now()}`,
      user_id: 'demo-user-id',
      ...goalData,
      progress: goalData.progress || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setGoals(prev => [newGoal, ...prev]);
    return newGoal;
  };

  const updateGoal = async (id: string, updates: Database['public']['Tables']['goals']['Update']) => {
    setGoals(prev => prev.map(goal => 
      goal.id === id ? { ...goal, ...updates, updated_at: new Date().toISOString() } : goal
    ));
    return true;
  };

  const deleteGoal = async (id: string) => {
    setGoals(prev => prev.filter(goal => goal.id !== id));
    setHabits(prev => prev.filter(habit => habit.goal_id !== id));
    setMilestones(prev => prev.filter(milestone => milestone.goal_id !== id));
    return true;
  };

  const createHabit = async (habitData: Omit<Database['public']['Tables']['habits']['Insert'], 'user_id'>) => {
    const newHabit: Habit = {
      id: `demo-habit-${Date.now()}`,
      user_id: 'demo-user-id',
      ...habitData,
      is_completed: habitData.is_completed || false,
      order_index: habitData.order_index || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setHabits(prev => [...prev, newHabit]);
    return newHabit;
  };

  const updateHabit = async (id: string, updates: Database['public']['Tables']['habits']['Update']) => {
    setHabits(prev => prev.map(habit => 
      habit.id === id ? { ...habit, ...updates, updated_at: new Date().toISOString() } : habit
    ));
    return true;
  };

  const deleteHabit = async (id: string) => {
    setHabits(prev => prev.filter(habit => habit.id !== id));
    setHabitCompletions(prev => prev.filter(completion => completion.habit_id !== id));
    return true;
  };

  const createMilestone = async (milestoneData: Omit<Database['public']['Tables']['milestones']['Insert'], 'user_id'>) => {
    const newMilestone: Milestone = {
      id: `demo-milestone-${Date.now()}`,
      user_id: 'demo-user-id',
      ...milestoneData,
      is_completed: milestoneData.is_completed || false,
      order_index: milestoneData.order_index || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setMilestones(prev => [...prev, newMilestone]);
    return newMilestone;
  };

  const updateMilestone = async (id: string, updates: Database['public']['Tables']['milestones']['Update']) => {
    setMilestones(prev => prev.map(milestone => 
      milestone.id === id ? { ...milestone, ...updates, updated_at: new Date().toISOString() } : milestone
    ));
    return true;
  };

  const deleteMilestone = async (id: string) => {
    setMilestones(prev => prev.filter(milestone => milestone.id !== id));
    return true;
  };

  const toggleHabitCompletion = async (habitId: string, date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    const existingCompletion = habitCompletions.find(
      completion => 
        completion.habit_id === habitId && 
        completion.completed_at?.split('T')[0] === dateString
    );

    if (existingCompletion) {
      setHabitCompletions(prev => prev.filter(completion => completion.id !== existingCompletion.id));
    } else {
      const newCompletion: HabitCompletion = {
        id: `demo-completion-${Date.now()}`,
        habit_id: habitId,
        user_id: 'demo-user-id',
        completed_at: date.toISOString(),
        created_at: new Date().toISOString(),
      };
      setHabitCompletions(prev => [...prev, newCompletion]);
    }
    return true;
  };

  const isHabitCompletedOnDate = (habitId: string, date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return habitCompletions.some(
      completion => 
        completion.habit_id === habitId && 
        completion.completed_at?.split('T')[0] === dateString
    );
  };

  return {
    goals,
    habits,
    habitCompletions,
    milestones,
    loading,
    createGoal,
    updateGoal,
    deleteGoal,
    createHabit,
    updateHabit,
    deleteHabit,
    createMilestone,
    updateMilestone,
    deleteMilestone,
    toggleHabitCompletion,
    isHabitCompletedOnDate,
    // Helper functions
    getMilestonesForGoal: (goalId: string) => milestones.filter(m => m.goal_id === goalId),
    getHabitsForGoal: (goalId: string) => habits.filter(h => h.goal_id === goalId),
    refetch: () => {}, // No-op for demo mode
  };
}