import { useState, useEffect } from 'react';
import { supabase, Database } from '../lib/supabase';
import { useAuth } from './useAuth';

type Goal = Database['public']['Tables']['goals']['Row'];
type Habit = Database['public']['Tables']['habits']['Row'];
type HabitCompletion = Database['public']['Tables']['habit_completions']['Row'];
type Milestone = Database['public']['Tables']['milestones']['Row'];

// Demo data for guest users
const DEMO_GOALS: Goal[] = [
  {
    id: 'demo-goal-1',
    user_id: 'guest_demo',
    title: 'Run a Marathon',
    description: 'Complete my first 26.2-mile marathon race',
    start_date: '2024-01-01',
    target_date: '2024-06-15',
    status: 'active',
    progress: 65,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'demo-goal-2',
    user_id: 'guest_demo',
    title: 'Learn Spanish',
    description: 'Achieve conversational fluency in Spanish',
    start_date: '2024-02-01',
    target_date: '2024-12-31',
    status: 'active',
    progress: 40,
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-02-01T00:00:00Z',
  },
];

const DEMO_HABITS: Habit[] = [
  {
    id: 'demo-habit-1',
    goal_id: 'demo-goal-1',
    user_id: 'guest_demo',
    title: 'Morning Run',
    description: 'Run for 30-45 minutes every morning',
    frequency: 'daily',
    frequency_value: 1,
    start_date: '2024-01-01',
    due_date: null,
    is_completed: false,
    order_index: 0,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'demo-habit-2',
    goal_id: 'demo-goal-1',
    user_id: 'guest_demo',
    title: 'Strength Training',
    description: 'Focus on leg strength and core stability',
    frequency: 'weekly',
    frequency_value: 3,
    start_date: '2024-01-01',
    due_date: null,
    is_completed: false,
    order_index: 1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'demo-habit-3',
    goal_id: 'demo-goal-2',
    user_id: 'guest_demo',
    title: 'Daily Spanish Practice',
    description: 'Practice Spanish vocabulary and grammar for 30 minutes',
    frequency: 'daily',
    frequency_value: 1,
    start_date: '2024-02-01',
    due_date: null,
    is_completed: false,
    order_index: 0,
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-02-01T00:00:00Z',
  },
];

const DEMO_MILESTONES: Milestone[] = [
  {
    id: 'demo-milestone-1',
    goal_id: 'demo-goal-1',
    user_id: 'guest_demo',
    title: 'Complete First 5K',
    description: 'Run your first 5K without stopping',
    target_date: '2024-02-01',
    is_completed: true,
    order_index: 0,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'demo-milestone-2',
    goal_id: 'demo-goal-1',
    user_id: 'guest_demo',
    title: 'Reach 10K Distance',
    description: 'Successfully complete a 10K run',
    target_date: '2024-03-15',
    is_completed: true,
    order_index: 1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'demo-milestone-3',
    goal_id: 'demo-goal-1',
    user_id: 'guest_demo',
    title: 'Half Marathon Ready',
    description: 'Complete a 21K half marathon',
    target_date: '2024-05-01',
    is_completed: false,
    order_index: 2,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'demo-milestone-4',
    goal_id: 'demo-goal-2',
    user_id: 'guest_demo',
    title: 'Basic Vocabulary (500 words)',
    description: 'Learn and retain 500 essential Spanish words',
    target_date: '2024-04-01',
    is_completed: true,
    order_index: 0,
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-02-01T00:00:00Z',
  },
];

const DEMO_HABIT_COMPLETIONS: HabitCompletion[] = [
  {
    id: 'demo-completion-1',
    habit_id: 'demo-habit-1',
    user_id: 'guest_demo',
    completed_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
];

export function useGoals() {
  const { user, isGuest } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitCompletions, setHabitCompletions] = useState<HabitCompletion[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      if (isGuest) {
        // Load demo data for guest users
        setGoals(DEMO_GOALS);
        setHabits(DEMO_HABITS);
        setMilestones(DEMO_MILESTONES);
        setHabitCompletions(DEMO_HABIT_COMPLETIONS);
        setLoading(false);
      } else {
        // Load real data for authenticated users
        fetchGoals();
        fetchHabits();
        fetchHabitCompletions();
        fetchMilestones();
      }
    }
  }, [user, isGuest]);

  // Calculate goal progress based on habits and milestones
  const calculateGoalProgress = (goalId: string) => {
    const goalHabits = habits.filter(habit => habit.goal_id === goalId);
    const goalMilestones = milestones.filter(milestone => milestone.goal_id === goalId);
    
    // If no habits or milestones, return 0
    if (goalHabits.length === 0 && goalMilestones.length === 0) {
      return 0;
    }

    let totalWeight = 0;
    let completedWeight = 0;

    // Weight system: Milestones = 60%, Habits = 40%
    const milestoneWeight = 0.6;
    const habitWeight = 0.4;

    // Calculate milestone progress
    if (goalMilestones.length > 0) {
      const completedMilestones = goalMilestones.filter(m => m.is_completed).length;
      const milestoneProgress = (completedMilestones / goalMilestones.length) * milestoneWeight;
      completedWeight += milestoneProgress;
      totalWeight += milestoneWeight;
    }

    // Calculate habit progress (based on recent completions)
    if (goalHabits.length > 0) {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      let habitProgressSum = 0;
      
      goalHabits.forEach(habit => {
        // Get completions for this habit in the last 30 days
        const recentCompletions = habitCompletions.filter(completion => {
          const completionDate = new Date(completion.completed_at);
          return completion.habit_id === habit.id && 
                 completionDate >= thirtyDaysAgo && 
                 completionDate <= now;
        });

        // Calculate expected completions based on frequency
        let expectedCompletions = 0;
        switch (habit.frequency) {
          case 'daily':
            expectedCompletions = 30 * habit.frequency_value;
            break;
          case 'weekly':
            expectedCompletions = Math.floor(30 / 7) * habit.frequency_value;
            break;
          case 'monthly':
            expectedCompletions = habit.frequency_value;
            break;
          case 'custom':
            expectedCompletions = Math.floor(30 / habit.frequency_value);
            break;
        }

        // Calculate completion rate for this habit (capped at 100%)
        const completionRate = expectedCompletions > 0 
          ? Math.min(recentCompletions.length / expectedCompletions, 1) 
          : 0;
        
        habitProgressSum += completionRate;
      });

      const averageHabitProgress = habitProgressSum / goalHabits.length;
      completedWeight += averageHabitProgress * habitWeight;
      totalWeight += habitWeight;
    }

    // Return progress as percentage (0-100)
    return totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0;
  };

  // Update goal progress automatically
  const updateGoalProgress = async (goalId: string) => {
    if (isGuest) return; // Skip for guest users
    
    const newProgress = calculateGoalProgress(goalId);
    
    // Only update if progress has changed
    const currentGoal = goals.find(g => g.id === goalId);
    if (currentGoal && currentGoal.progress !== newProgress) {
      await supabase
        .from('goals')
        .update({ progress: newProgress })
        .eq('id', goalId);
      
      // Update local state
      setGoals(prevGoals => 
        prevGoals.map(goal => 
          goal.id === goalId ? { ...goal, progress: newProgress } : goal
        )
      );
    }
  };

  // Update all goal progress
  const updateAllGoalProgress = async () => {
    if (isGuest) return; // Skip for guest users
    
    for (const goal of goals) {
      await updateGoalProgress(goal.id);
    }
  };

  const fetchGoals = async () => {
    if (!user || isGuest) return;

    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching goals:', error);
    } else {
      setGoals(data || []);
    }
    setLoading(false);
  };

  const fetchHabits = async () => {
    if (!user || isGuest) return;

    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', user.id)
      .order('order_index', { ascending: true });

    if (error) {
      console.error('Error fetching habits:', error);
    } else {
      setHabits(data || []);
    }
  };

  const fetchHabitCompletions = async () => {
    if (!user || isGuest) return;

    const { data, error } = await supabase
      .from('habit_completions')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching habit completions:', error);
    } else {
      setHabitCompletions(data || []);
    }
  };

  const fetchMilestones = async () => {
    if (!user || isGuest) return;

    const { data, error } = await supabase
      .from('milestones')
      .select('*')
      .eq('user_id', user.id)
      .order('order_index', { ascending: true });

    if (error) {
      console.error('Error fetching milestones:', error);
    } else {
      setMilestones(data || []);
    }
  };

  const createGoal = async (goalData: Omit<Database['public']['Tables']['goals']['Insert'], 'user_id'>) => {
    if (!user) return null;
    
    if (isGuest) {
      // For guest users, just update local state
      const newGoal: Goal = {
        id: `demo-goal-${Date.now()}`,
        user_id: user.id,
        ...goalData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as Goal;
      
      setGoals(prev => [newGoal, ...prev]);
      return newGoal;
    }

    const { data, error } = await supabase
      .from('goals')
      .insert([{ ...goalData, user_id: user.id }])
      .select()
      .single();

    if (error) {
      console.error('Error creating goal:', error);
      return null;
    }

    await fetchGoals();
    return data;
  };

  const updateGoal = async (id: string, updates: Database['public']['Tables']['goals']['Update']) => {
    if (isGuest) {
      // For guest users, just update local state
      setGoals(prev => prev.map(goal => 
        goal.id === id ? { ...goal, ...updates, updated_at: new Date().toISOString() } : goal
      ));
      return goals.find(g => g.id === id) || null;
    }

    const { data, error } = await supabase
      .from('goals')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating goal:', error);
      return null;
    }

    await fetchGoals();
    return data;
  };

  const deleteGoal = async (id: string) => {
    if (isGuest) {
      // For guest users, just update local state
      setGoals(prev => prev.filter(goal => goal.id !== id));
      setHabits(prev => prev.filter(habit => habit.goal_id !== id));
      setMilestones(prev => prev.filter(milestone => milestone.goal_id !== id));
      return true;
    }

    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting goal:', error);
      return false;
    }

    await fetchGoals();
    await fetchHabits();
    await fetchMilestones();
    return true;
  };

  const createHabit = async (habitData: Omit<Database['public']['Tables']['habits']['Insert'], 'user_id'>) => {
    if (!user) return null;

    if (isGuest) {
      // For guest users, just update local state
      const newHabit: Habit = {
        id: `demo-habit-${Date.now()}`,
        user_id: user.id,
        ...habitData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as Habit;
      
      setHabits(prev => [...prev, newHabit]);
      return newHabit;
    }

    const { data, error } = await supabase
      .from('habits')
      .insert([{ ...habitData, user_id: user.id }])
      .select()
      .single();

    if (error) {
      console.error('Error creating habit:', error);
      return null;
    }

    await fetchHabits();
    // Update goal progress after adding habit
    await updateGoalProgress(habitData.goal_id);
    return data;
  };

  const updateHabit = async (id: string, updates: Database['public']['Tables']['habits']['Update']) => {
    if (isGuest) {
      // For guest users, just update local state
      setHabits(prev => prev.map(habit => 
        habit.id === id ? { ...habit, ...updates, updated_at: new Date().toISOString() } : habit
      ));
      return habits.find(h => h.id === id) || null;
    }

    const { data, error } = await supabase
      .from('habits')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating habit:', error);
      return null;
    }

    await fetchHabits();
    // Update goal progress after updating habit
    if (data) {
      await updateGoalProgress(data.goal_id);
    }
    return data;
  };

  const deleteHabit = async (id: string) => {
    // Get the habit to know which goal to update
    const habit = habits.find(h => h.id === id);
    
    if (isGuest) {
      // For guest users, just update local state
      setHabits(prev => prev.filter(h => h.id !== id));
      setHabitCompletions(prev => prev.filter(completion => completion.habit_id !== id));
      return true;
    }

    const { error } = await supabase
      .from('habits')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting habit:', error);
      return false;
    }

    await fetchHabits();
    await fetchHabitCompletions();
    
    // Update goal progress after deleting habit
    if (habit) {
      await updateGoalProgress(habit.goal_id);
    }
    return true;
  };

  const createMilestone = async (milestoneData: Omit<Database['public']['Tables']['milestones']['Insert'], 'user_id'>) => {
    if (!user) return null;

    if (isGuest) {
      // For guest users, just update local state
      const newMilestone: Milestone = {
        id: `demo-milestone-${Date.now()}`,
        user_id: user.id,
        ...milestoneData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as Milestone;
      
      setMilestones(prev => [...prev, newMilestone]);
      return newMilestone;
    }

    const { data, error } = await supabase
      .from('milestones')
      .insert([{ ...milestoneData, user_id: user.id }])
      .select()
      .single();

    if (error) {
      console.error('Error creating milestone:', error);
      return null;
    }

    await fetchMilestones();
    // Update goal progress after adding milestone
    await updateGoalProgress(milestoneData.goal_id);
    return data;
  };

  const updateMilestone = async (id: string, updates: Database['public']['Tables']['milestones']['Update']) => {
    if (isGuest) {
      // For guest users, just update local state
      setMilestones(prev => prev.map(milestone => 
        milestone.id === id ? { ...milestone, ...updates, updated_at: new Date().toISOString() } : milestone
      ));
      return milestones.find(m => m.id === id) || null;
    }

    const { data, error } = await supabase
      .from('milestones')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating milestone:', error);
      return null;
    }

    await fetchMilestones();
    // Update goal progress after updating milestone
    if (data) {
      await updateGoalProgress(data.goal_id);
    }
    return data;
  };

  const deleteMilestone = async (id: string) => {
    // Get the milestone to know which goal to update
    const milestone = milestones.find(m => m.id === id);
    
    if (isGuest) {
      // For guest users, just update local state
      setMilestones(prev => prev.filter(m => m.id !== id));
      return true;
    }

    const { error } = await supabase
      .from('milestones')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting milestone:', error);
      return false;
    }

    await fetchMilestones();
    
    // Update goal progress after deleting milestone
    if (milestone) {
      await updateGoalProgress(milestone.goal_id);
    }
    return true;
  };

  const toggleHabitCompletion = async (habitId: string, date: Date) => {
    if (!user) return false;

    const dateString = date.toISOString().split('T')[0];
    
    // Check if completion already exists for this habit on this date
    const existingCompletion = habitCompletions.find(
      completion => 
        completion.habit_id === habitId && 
        completion.completed_at?.split('T')[0] === dateString
    );

    if (isGuest) {
      // For guest users, just update local state
      if (existingCompletion) {
        setHabitCompletions(prev => prev.filter(c => c.id !== existingCompletion.id));
      } else {
        const newCompletion: HabitCompletion = {
          id: `demo-completion-${Date.now()}`,
          habit_id: habitId,
          user_id: user.id,
          completed_at: date.toISOString(),
          created_at: new Date().toISOString(),
        };
        setHabitCompletions(prev => [...prev, newCompletion]);
      }
      return true;
    }

    if (existingCompletion) {
      // Remove completion
      const { error } = await supabase
        .from('habit_completions')
        .delete()
        .eq('id', existingCompletion.id);

      if (error) {
        console.error('Error removing habit completion:', error);
        return false;
      }
    } else {
      // Add completion
      const { error } = await supabase
        .from('habit_completions')
        .insert([{
          habit_id: habitId,
          user_id: user.id,
          completed_at: date.toISOString(),
        }]);

      if (error) {
        console.error('Error adding habit completion:', error);
        return false;
      }
    }

    await fetchHabitCompletions();
    
    // Update goal progress after habit completion change
    const habit = habits.find(h => h.id === habitId);
    if (habit) {
      await updateGoalProgress(habit.goal_id);
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

  const reorderHabits = async (habitIds: string[]) => {
    if (isGuest) {
      // For guest users, just update local state
      const reorderedHabits = habitIds.map((id, index) => {
        const habit = habits.find(h => h.id === id);
        return habit ? { ...habit, order_index: index } : null;
      }).filter(Boolean) as Habit[];
      
      setHabits(reorderedHabits);
      return;
    }

    const updates = habitIds.map((id, index) => ({
      id,
      order_index: index,
    }));

    for (const update of updates) {
      await supabase
        .from('habits')
        .update({ order_index: update.order_index })
        .eq('id', update.id);
    }

    await fetchHabits();
  };

  const reorderMilestones = async (milestoneIds: string[]) => {
    if (isGuest) {
      // For guest users, just update local state
      const reorderedMilestones = milestoneIds.map((id, index) => {
        const milestone = milestones.find(m => m.id === id);
        return milestone ? { ...milestone, order_index: index } : null;
      }).filter(Boolean) as Milestone[];
      
      setMilestones(reorderedMilestones);
      return;
    }

    const updates = milestoneIds.map((id, index) => ({
      id,
      order_index: index,
    }));

    for (const update of updates) {
      await supabase
        .from('milestones')
        .update({ order_index: update.order_index })
        .eq('id', update.id);
    }

    await fetchMilestones();
  };

  const getMilestonesForGoal = (goalId: string) => {
    return milestones.filter(milestone => milestone.goal_id === goalId);
  };

  const getHabitsForGoal = (goalId: string) => {
    return habits.filter(habit => habit.goal_id === goalId);
  };

  // Get goal progress with real-time calculation
  const getGoalProgress = (goalId: string) => {
    return calculateGoalProgress(goalId);
  };

  // Update progress for all goals when data changes
  useEffect(() => {
    if (goals.length > 0 && habits.length >= 0 && milestones.length >= 0 && !isGuest) {
      updateAllGoalProgress();
    }
  }, [habitCompletions, milestones, isGuest]);

  return {
    goals,
    habits,
    habitCompletions,
    milestones,
    loading,
    isGuest,
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
    reorderHabits,
    reorderMilestones,
    getMilestonesForGoal,
    getHabitsForGoal,
    getGoalProgress,
    calculateGoalProgress,
    updateGoalProgress,
    refetch: () => {
      if (!isGuest) {
        fetchGoals();
        fetchHabits();
        fetchHabitCompletions();
        fetchMilestones();
      }
    },
  };
}