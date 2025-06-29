import React, { useState } from 'react';
import { Sparkles, Plus, Clock, Target, Flag, Calendar, ChevronDown } from 'lucide-react';
import { generateHabitsAndMilestonesForGoal, AIHabit, AIMilestone } from '../services/aiService';
import { Database } from '../lib/supabase';
import { format, addDays } from 'date-fns';

type Goal = Database['public']['Tables']['goals']['Row'];

interface AIMilestoneHabitGeneratorProps {
  goals: Goal[];
  onItemsGenerated: (habits: AIHabit[], milestones: AIMilestone[]) => void;
  onAddHabit: (habitData: Omit<Database['public']['Tables']['habits']['Insert'], 'user_id'>) => void;
  onAddMilestone: (milestoneData: Omit<Database['public']['Tables']['milestones']['Insert'], 'user_id'>) => void;
}

export function AIMilestoneHabitGenerator({ 
  goals, 
  onItemsGenerated, 
  onAddHabit, 
  onAddMilestone 
}: AIMilestoneHabitGeneratorProps) {
  // Default to the most recently created goal (first in the array since they're sorted by created_at desc)
  const [selectedGoalId, setSelectedGoalId] = useState(goals[0]?.id || '');
  const [generatedHabits, setGeneratedHabits] = useState<AIHabit[]>([]);
  const [generatedMilestones, setGeneratedMilestones] = useState<AIMilestone[]>([]);
  const [loading, setLoading] = useState(false);
  const [showItems, setShowItems] = useState(false);

  const selectedGoal = goals.find(goal => goal.id === selectedGoalId);

  const handleGenerate = async () => {
    if (!selectedGoal) return;
    
    setLoading(true);
    try {
      const breakdown = await generateHabitsAndMilestonesForGoal(selectedGoal.title, selectedGoal.description || undefined);
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
    if (!selectedGoal) return;
    
    onAddHabit({
      goal_id: selectedGoal.id,
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
    if (!selectedGoal) return;
    
    // Calculate target date based on goal start date and offset
    let targetDate = null;
    if (selectedGoal.start_date) {
      const startDate = new Date(selectedGoal.start_date);
      targetDate = format(addDays(startDate, milestone.target_date_offset), 'yyyy-MM-dd');
    }

    onAddMilestone({
      goal_id: selectedGoal.id,
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
    if (!selectedGoal?.start_date) return 'No start date set';
    
    try {
      const startDate = new Date(selectedGoal.start_date);
      const targetDate = addDays(startDate, milestone.target_date_offset);
      return format(targetDate, 'MMM dd, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getGoalStatusColor = (status: Goal['status']) => {
    switch (status) {
      case 'completed':
        return 'text-emerald-600';
      case 'paused':
        return 'text-amber-600';
      default:
        return 'text-indigo-600';
    }
  };

  // Don't render if no goals available
  if (goals.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-semibold text-gray-900">Goal Planner</h3>
          </div>
        </div>
        
        <button
          onClick={handleGenerate}
          disabled={loading || !selectedGoal}
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

      {/* Goal Selector */}
      <div className="mb-6">
        <label htmlFor="goalSelect" className="block text-sm font-medium text-gray-700 mb-2">
          Select Goal to Generate Plan For:
        </label>
        <div className="relative">
          <select
            id="goalSelect"
            value={selectedGoalId}
            onChange={(e) => {
              setSelectedGoalId(e.target.value);
              setShowItems(false); // Hide previous results when changing goal
            }}
            className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors appearance-none bg-white"
          >
            {goals.map((goal) => (
              <option key={goal.id} value={goal.id}>
                {goal.title} ({goal.status})
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
        </div>
        
        {/* Selected Goal Preview */}
        {selectedGoal && (
          <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">{selectedGoal.title}</h4>
                {selectedGoal.description && (
                  <p className="text-sm text-gray-600 mt-1">{selectedGoal.description}</p>
                )}
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                selectedGoal.status === 'completed' 
                  ? 'bg-emerald-100 text-emerald-700'
                  : selectedGoal.status === 'paused'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-indigo-100 text-indigo-700'
              }`}>
                {selectedGoal.status.charAt(0).toUpperCase() + selectedGoal.status.slice(1)}
              </span>
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
              <span>Progress: {selectedGoal.progress}%</span>
              {selectedGoal.start_date && (
                <span>Started: {format(new Date(selectedGoal.start_date), 'MMM dd, yyyy')}</span>
              )}
              {selectedGoal.target_date && (
                <span>Target: {format(new Date(selectedGoal.target_date), 'MMM dd, yyyy')}</span>
              )}
            </div>
          </div>
        )}
      </div>

      {showItems && selectedGoal && (generatedHabits.length > 0 || generatedMilestones.length > 0) && (
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