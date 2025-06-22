import { useState, useEffect } from 'react';
import { supabase, Database } from '../lib/supabase';
import { useAuth } from './useAuth';

type Goal = Database['public']['Tables']['goals']['Row'];
type Habit = Database['public']['Tables']['habits']['Row'];
type HabitCompletion = Database['public']['Tables']['habit_completions']['Row'];

export function useGoals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitCompletions, setHabitCompletions] = useState<HabitCompletion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchGoals();
      fetchHabits();
      fetchHabitCompletions();
    }
  }, [user]);

  const fetchGoals = async () => {
    if (!user) return;

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
    if (!user) return;

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
    if (!user) return;

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

  const createGoal = async (goalData: Omit<Database['public']['Tables']['goals']['Insert'], 'user_id'>) => {
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
    return true;
  };

  const createHabit = async (habitData: Omit<Database['public']['Tables']['habits']['Insert'], 'user_id'>) => {
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
    return data;
  };

  const updateHabit = async (id: string, updates: Database['public']['Tables']['habits']['Update']) => {
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
    return data;
  };

  const deleteHabit = async (id: string) => {
    const { error } = await supabase
      .from('habits')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting habit:', error);
      return false;
    }

    await fetchHabits();
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

  return {
    goals,
    habits,
    habitCompletions,
    loading,
    createGoal,
    updateGoal,
    deleteGoal,
    createHabit,
    updateHabit,
    deleteHabit,
    toggleHabitCompletion,
    isHabitCompletedOnDate,
    reorderHabits,
    refetch: () => {
      fetchGoals();
      fetchHabits();
      fetchHabitCompletions();
    },
  };
}