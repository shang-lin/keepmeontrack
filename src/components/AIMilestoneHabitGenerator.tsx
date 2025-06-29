import React, { useState } from 'react';
import { Sparkles, Plus, Clock, Target, Flag, Calendar } from 'lucide-react';
import { generateHabitsAndMilestonesForGoal, AIHabit, AIMilestone } from '../services/aiService';
import { Database } from '../lib/supabase';
import { format, addDays } from 'date-fns';

type Goal = Database['public']['Tables']['goals']['Row'];

interface AIMilestoneHabitGeneratorProps {
  goal: Goal;
  onItemsGenerated: (habits: AIHabit[], milestones: AIMilestone[]) => void;
  onAddHabit: (habitData: Omit<Database['public']['Tables']['habits']['Insert'], 'user_id'>) => void;
  onAddMilestone: (milestoneData: Omit<Database['public']['Tables']['milestones']['Insert'], 'user_id'>) => void;
}

export function AIMilestoneHabitGenerator({ 
  goal, 
  onItemsGenerated, 
  onAddHabit, 
  onAddMilestone 
}: AIMilestoneHabitGeneratorProps) {
  const [generatedHabits, setGeneratedHabits] = useState<AIHabit[]>([]);
  const [generatedMilestones, setGeneratedMilestones] = useState<AIMilestone[]>([]);
  const [loading, setLoading] = useState(false);
  const [showItems, setShowItems] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const breakdown = await generateHabitsAndMilestonesForGoal(goal.title, goal.description || undefined);
      setGeneratedHabits(breakdown.habits);
      setGeneratedMilestones(breakdown.milestones);
      setShowItems(true);
      onItemsGenerated(breakdown.habits, breakdown.milestones);
    } catch (error) {
      console.error('Error generating habits and milestones:', error);
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

  const handleAddMilestone = (milestone: AIMilestone) => {
    // Calculate target date based on goal start date and offset
    let targetDate = null;
    if (goal.start_date) {
      const startDate = new Date(goal.start_date);
      targetDate = format(addDays(startDate, milestone.target_date_offset), 'yyyy-MM-dd');
    }

    onAddMilestone({
      goal_id: goal.id,
      title: milestone.title,
      description: milestone.description,
      target_date: targetDate,
      is_completed: false,
      order_index: generatedMilestones.indexOf(milestone),
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

  const getMilestoneTargetDate = (milestone: AIMilestone) => {
    if (!goal.start_date) return 'No start date set';
    
    try {
      const startDate = new Date(goal.start_date);
      const targetDate = addDays(startDate, milestone.target_date_offset);
      return format(targetDate, 'MMM dd, yyyy');
    } catch (error) {
      return 'Invalid date';
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
            <h3 className="text-lg font-semibold text-gray-900">AI Milestone and Habit Generator</h3>
            <p className="text-sm text-gray-600">Let AI break down "{goal.title}" into actionable habits and milestones</p>
          </div>
        </div>
        
        <button
          onClick={handleGenerate}
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
              Generate Plan
            </div>
          )}
        </button>
      </div>

      {showItems && (generatedHabits.length > 0 || generatedMilestones.length > 0) && (
        <div className="space-y-6">
          {/* Milestones Section */}
          {generatedMilestones.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                <Flag className="w-4 h-4 text-purple-600 mr-2" />
                Suggested Milestones ({generatedMilestones.length})
              </h4>
              <div className="space-y-3">
                {generatedMilestones.map((milestone, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 border border-gray-200 hover:border-purple-300 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <Flag className="w-4 h-4 text-purple-600 mr-2" />
                          <h5 className="font-medium text-gray-900">{milestone.title}</h5>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{milestone.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            Target: {getMilestoneTargetDate(milestone)}
                          </div>
                          <div>
                            Timeline: {milestone.estimated_completion_time}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddMilestone(milestone)}
                        className="ml-4 p-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                        title="Add this milestone"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Habits Section */}
          {generatedHabits.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                <Target className="w-4 h-4 text-emerald-600 mr-2" />
                Suggested Habits ({generatedHabits.length})
              </h4>
              <div className="space-y-3">
                {generatedHabits.map((habit, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 border border-gray-200 hover:border-emerald-300 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <Target className="w-4 h-4 text-emerald-600 mr-2" />
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
                        className="ml-4 p-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Add this habit"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}