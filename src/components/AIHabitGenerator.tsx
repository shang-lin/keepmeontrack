import React, { useState } from 'react';
import { Sparkles, Plus, Clock, Target } from 'lucide-react';
import { generateHabitsForGoal, AIHabit } from '../services/aiService';
import { Database } from '../lib/supabase';

type Goal = Database['public']['Tables']['goals']['Row'];

interface AIHabitGeneratorProps {
  goal: Goal;
  onHabitsGenerated: (habits: AIHabit[]) => void;
  onAddHabit: (habitData: Omit<Database['public']['Tables']['habits']['Insert'], 'user_id'>) => void;
}

export function AIHabitGenerator({ goal, onHabitsGenerated, onAddHabit }: AIHabitGeneratorProps) {
  const [generatedHabits, setGeneratedHabits] = useState<AIHabit[]>([]);
  const [loading, setLoading] = useState(false);
  const [showHabits, setShowHabits] = useState(false);

  const handleGenerateHabits = async () => {
    setLoading(true);
    try {
      const habits = await generateHabitsForGoal(goal.title, goal.description || undefined);
      setGeneratedHabits(habits);
      setShowHabits(true);
      onHabitsGenerated(habits);
    } catch (error) {
      console.error('Error generating habits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddHabit = (habit: AIHabit) => {
    onAddHabit({
      goal_id: goal.id,
      title: habit.title,
      description: habit.description,
      frequency: habit.frequency,
      frequency_value: habit.frequency_value,
      due_date: null,
      is_completed: false,
      order_index: generatedHabits.indexOf(habit),
    });
  };

  const getFrequencyText = (frequency: AIHabit['frequency'], value: number) => {
    switch (frequency) {
      case 'daily':
        return 'Daily';
      case 'weekly':
        return value === 1 ? 'Weekly' : `${value}x per week`;
      case 'monthly':
        return value === 1 ? 'Monthly' : `${value}x per month`;
      default:
        return `Every ${value} days`;
    }
  };

  return (
    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-semibold text-gray-900">AI Habit Generator</h3>
            <p className="text-sm text-gray-600">Let AI break down "{goal.title}" into actionable habits</p>
          </div>
        </div>
        
        <button
          onClick={handleGenerateHabits}
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Generating...
            </div>
          ) : (
            <div className="flex items-center">
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Habits
            </div>
          )}
        </button>
      </div>

      {showHabits && generatedHabits.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Suggested Habits:</h4>
          {generatedHabits.map((habit, index) => (
            <div key={index} className="bg-white rounded-lg p-4 border border-gray-200 hover:border-indigo-300 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <Target className="w-4 h-4 text-indigo-600 mr-2" />
                    <h5 className="font-medium text-gray-900">{habit.title}</h5>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{habit.description}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {getFrequencyText(habit.frequency, habit.frequency_value)}
                    </div>
                    <div>
                      Duration: {habit.estimated_duration}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleAddHabit(habit)}
                  className="ml-4 p-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="Add this habit"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}