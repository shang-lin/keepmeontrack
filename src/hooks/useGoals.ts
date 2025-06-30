import { useState, useEffect } from 'react';
import { supabase, Database } from '../lib/supabase';
import { useAuth } from './useAuth';
import { useDemoData } from './useDemoData';

type Goal = Database['public']['Tables']['goals']['Row'];
type Habit = Database['public']['Tables']['habits']['Row'];
type HabitCompletion = Database['public']['Tables']['habit_completions']['Row'];
type Milestone = Database['public']['Tables']['milestones']['Row'];

export function useGoals() {
  const { user, isDemoMode } = useAuth();
  const demoData = useDemoData();
  
  const [goals, setGoals] = useState<Goal[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitCompletions, setHabitCompletions] = useState<HabitCompletion[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isDemoMode) {
      // Set demo data to local state
      setGoals(demoData.goals);
      setHabits(demoData.habits);
      setHabitCompletions(demoData.habitCompletions);
      setMilestones(demoData.milestones);
      setLoading(false);
    } else if (user) {
      fetchGoals();
      fetchHabits();
      fetchHabitCompletions();
      fetchMilestones();
    }
  }, [user, isDemoMode, demoData]);

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
    if (isDemoMode) return;

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
    if (isDemoMode) return;

    for (const goal of goals) {
      await updateGoalProgress(goal.id);
    }
  };

  const fetchGoals = async () => {
    if (!user || isDemoMode) return;

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
    if (!user || isDemoMode) return;

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
    if (!user || isDemoMode) return;

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
    if (!user || isDemoMode) return;

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
    if (isDemoMode) {
      // For demo mode, use the demo data method
      const result = await demoData.createGoal(goalData);
      if (result) {
        setGoals(demoData.goals);
      }
      return result;
    }

    if (!user) return null;

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
    if (isDemoMode) {
      const result = await demoData.updateGoal(id, updates);
      if (result) {
        setGoals(demoData.goals);
      }
      return result;
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
    if (isDemoMode) {
      const result = await demoData.deleteGoal(id);
      if (result) {
        setGoals(demoData.goals);
        setHabits(demoData.habits);
        setMilestones(demoData.milestones);
      }
      return result;
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
    if (isDemoMode) {
      const result = await demoData.createHabit(habitData);
      if (result) {
        setHabits(demoData.habits);
      }
      return result;
    }

    if (!user) return null;

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
    if (isDemoMode) {
      const result = await demoData.updateHabit(id, updates);
      if (result) {
        setHabits(demoData.habits);
      }
      return result;
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
    if (isDemoMode) {
      // Get the habit to know which goal to update
      const habit = habits.find(h => h.id === id);
      const result = await demoData.deleteHabit(id);
      if (result) {
        setHabits(demoData.habits);
        setHabitCompletions(demoData.habitCompletions);
      }
      return result;
    }

    // Get the habit to know which goal to update
    const habit = habits.find(h => h.id === id);
    
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
    if (isDemoMode) {
      const result = await demoData.createMilestone(milestoneData);
      if (result) {
        setMilestones(demoData.milestones);
      }
      return result;
    }

    if (!user) return null;

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
    if (isDemoMode) {
      const result = await demoData.updateMilestone(id, updates);
      if (result) {
        setMilestones(demoData.milestones);
      }
      return result;
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
    if (isDemoMode) {
      const result = await demoData.deleteMilestone(id);
      if (result) {
        setMilestones(demoData.milestones);
      }
      return result;
    }

    // Get the milestone to know which goal to update
    const milestone = milestones.find(m => m.id === id);
    
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
    if (isDemoMode) {
      const result = await demoData.toggleHabitCompletion(habitId, date);
      if (result) {
        setHabitCompletions(demoData.habitCompletions);
      }
      return result;
    }

    if (!user) return false;

    const dateString = date.toISOString().split('T')[0];
    
    // Check if completion already exists for this habit on this date
    const existingCompletion = habitCompletions.find(
      completion => 
        completion.habit_id === habitId && 
        completion.completed_at?.split('T')[0] === dateString
    );

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
    if (isDemoMode) {
      return demoData.isHabitCompletedOnDate(habitId, date);
    }

    const dateString = date.toISOString().split('T')[0];
    return habitCompletions.some(
      completion => 
        completion.habit_id === habitId && 
        completion.completed_at?.split('T')[0] === dateString
    );
  };

  const reorderHabits = async (habitIds: string[]) => {
    if (isDemoMode) {
      await demoData.reorderHabits(habitIds);
      setHabits(demoData.habits);
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
    if (isDemoMode) {
      await demoData.reorderMilestones(milestoneIds);
      setMilestones(demoData.milestones);
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
    if (goals.length > 0 && habits.length >= 0 && milestones.length >= 0 && !isDemoMode) {
      updateAllGoalProgress();
    }
  }, [habitCompletions, milestones, isDemoMode]);

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
    reorderHabits,
    reorderMilestones,
    getMilestonesForGoal,
    getHabitsForGoal,
    getGoalProgress,
    calculateGoalProgress,
    updateGoalProgress,
    refetch: () => {
      if (isDemoMode) {
        setGoals(demoData.goals);
        setHabits(demoData.habits);
        setHabitCompletions(demoData.habitCompletions);
        setMilestones(demoData.milestones);
      } else {
        fetchGoals();
        fetchHabits();
        fetchHabitCompletions();
        fetchMilestones();
      }
    },
  };
}