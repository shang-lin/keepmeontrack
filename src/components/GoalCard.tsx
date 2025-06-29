import React, { useState } from 'react';
import { MoreHorizontal, Edit, Trash2, Target, Calendar, CheckCircle, Plus, Flag, TrendingUp, Check, Play, Clock } from 'lucide-react';
import { Database } from '../lib/supabase';
import { format, parseISO } from 'date-fns';
import { MilestoneCard } from './MilestoneCard';

type Goal = Database['public']['Tables']['goals']['Row'];
type Milestone = Database['public']['Tables']['milestones']['Row'];
type Habit = Database['public']['Tables']['habits']['Row'];

interface GoalCardProps {
  goal: Goal;
  milestones: Milestone[];
  habits: Habit[];
  realTimeProgress: number;
  onEdit: (goal: Goal) => void;
  onDelete: (id: string) => void;
  onMarkComplete: (id: string) => void;
  onAddMilestone: (goalId: string) => void;
  onAddHabit: (goalId: string) => void;
  onEditMilestone: (milestone: Milestone) => void;
  onDeleteMilestone: (id: string) => void;
  onToggleMilestoneComplete: (id: string, completed: boolean) => void;
  onEditHabit: (habit: Habit) => void;
  onDeleteHabit: (id: string) => void;
  onToggleHabitComplete: (id: string, completed: boolean) => void;
}

export function GoalCard({ 
  goal, 
  milestones, 
  habits,
  realTimeProgress,
  onEdit, 
  onDelete,
  onMarkComplete,
  onAddMilestone,
  onAddHabit,
  onEditMilestone,
  onDeleteMilestone,
  onToggleMilestoneComplete,
  onEditHabit,
  onDeleteHabit,
  onToggleHabitComplete
}: GoalCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showMilestones, setShowMilestones] = useState(false);
  const [showHabits, setShowHabits] = useState(false);

  const getStatusColor = (status: Goal['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-100 text-emerald-700';
      case 'paused':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-indigo-100 text-indigo-700';
    }
  };

  const getStatusIcon = (status: Goal['status']) => {
    switch (status) {
      case 'completed':
        return CheckCircle;
      case 'paused':
        return Calendar;
      default:
        return Target;
    }
  };

  const getFrequencyText = (frequency: Habit['frequency'], value: number) => {
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

  // Helper function to format dates consistently
  const formatDate = (dateString: string) => {
    try {
      // If the date string doesn't include time, treat it as a local date
      if (!dateString.includes('T')) {
        // Parse as local date by adding time component
        const localDate = new Date(dateString + 'T00:00:00');
        return format(localDate, 'MMM dd, yyyy');
      } else {
        // Parse as ISO string
        return format(parseISO(dateString), 'MMM dd, yyyy');
      }
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return 'Invalid date';
    }
  };

  const StatusIcon = getStatusIcon(goal.status);
  const completedMilestones = milestones.filter(m => m.is_completed).length;
  const totalMilestones = milestones.length;
  const totalHabits = habits.length;

  // Use real-time progress instead of stored progress
  const currentProgress = realTimeProgress;

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-emerald-500';
    if (progress >= 60) return 'bg-blue-500';
    if (progress >= 40) return 'bg-amber-500';
    if (progress >= 20) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const isGoalActive = goal.status === 'active';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getStatusColor(goal.status)}`}>
            <StatusIcon className="w-5 h-5" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-semibold text-gray-900">{goal.title}</h3>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(goal.status)}`}>
              {goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Manual Complete Button - Only show for active goals */}
          {isGoalActive && (
            <button
              onClick={() => onMarkComplete(goal.id)}
              className="px-3 py-1.5 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors flex items-center"
              title="Mark goal as complete"
            >
              <Check className="w-4 h-4 mr-1" />
              Complete
            </button>
          )}
          
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                <button
                  onClick={() => {
                    onEdit(goal);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Edit className="w-4 h-4 mr-3" />
                  Edit Goal
                </button>
                {isGoalActive && (
                  <button
                    onClick={() => {
                      onMarkComplete(goal.id);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-50"
                  >
                    <CheckCircle className="w-4 h-4 mr-3" />
                    Mark as Complete
                  </button>
                )}
                <button
                  onClick={() => {
                    onDelete(goal.id);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-3" />
                  Delete Goal
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {goal.description && (
        <p className="text-gray-600 mb-4 line-clamp-2">{goal.description}</p>
      )}

      {/* Progress Section */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <TrendingUp className="w-4 h-4 text-gray-500 mr-1" />
              <span className="text-sm text-gray-500">Progress</span>
            </div>
            <span className="text-sm font-medium text-gray-900">{currentProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(currentProgress)}`}
              style={{ width: `${currentProgress}%` }}
            ></div>
          </div>
          
          {/* Progress breakdown */}
          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
            <span>{totalHabits} habits</span>
            <span>{completedMilestones}/{totalMilestones} milestones</span>
          </div>
        </div>
        
        <div className="ml-6 text-right">
          {/* Start Date */}
          {goal.start_date && (
            <div className="mb-2">
              <div className="flex items-center text-xs text-gray-500 mb-1">
                <Play className="w-3 h-3 mr-1" />
                <span>Started</span>
              </div>
              <p className="text-sm font-medium text-gray-900">
                {formatDate(goal.start_date)}
              </p>
            </div>
          )}
          
          {/* Target Date */}
          {goal.target_date && (
            <div>
              <div className="flex items-center text-xs text-gray-500 mb-1">
                <Calendar className="w-3 h-3 mr-1" />
                <span>Target</span>
              </div>
              <p className="text-sm font-medium text-gray-900">
                {formatDate(goal.target_date)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Milestones Section */}
      <div className="border-t border-gray-200 pt-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <Flag className="w-4 h-4 text-gray-500 mr-2" />
            <span className="text-sm font-medium text-gray-700">
              Milestones ({completedMilestones}/{totalMilestones})
            </span>
          </div>
          <div className="flex items-center space-x-2">
            {isGoalActive && (
              <button
                onClick={() => onAddMilestone(goal.id)}
                className="text-indigo-600 hover:text-indigo-700 p-1 rounded-full hover:bg-indigo-50 transition-colors"
                title="Add milestone"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
            {totalMilestones > 0 && (
              <button
                onClick={() => setShowMilestones(!showMilestones)}
                className="text-gray-500 hover:text-gray-700 text-xs font-medium transition-colors"
              >
                {showMilestones ? 'Hide' : 'Show'}
              </button>
            )}
          </div>
        </div>

        {totalMilestones === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">No milestones yet</p>
            {isGoalActive && (
              <button
                onClick={() => onAddMilestone(goal.id)}
                className="text-indigo-600 hover:text-indigo-700 text-sm font-medium mt-1 transition-colors"
              >
                Add your first milestone
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Milestone Progress Bar */}
            <div className="mb-3">
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            {showMilestones && (
              <div className="space-y-2">
                {milestones.map((milestone) => (
                  <MilestoneCard
                    key={milestone.id}
                    milestone={milestone}
                    onEdit={onEditMilestone}
                    onDelete={onDeleteMilestone}
                    onToggleComplete={onToggleMilestoneComplete}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Habits Section */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <Target className="w-4 h-4 text-gray-500 mr-2" />
            <span className="text-sm font-medium text-gray-700">
              Habits ({totalHabits})
            </span>
          </div>
          <div className="flex items-center space-x-2">
            {isGoalActive && (
              <button
                onClick={() => onAddHabit(goal.id)}
                className="text-emerald-600 hover:text-emerald-700 p-1 rounded-full hover:bg-emerald-50 transition-colors"
                title="Add habit"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
            {totalHabits > 0 && (
              <button
                onClick={() => setShowHabits(!showHabits)}
                className="text-gray-500 hover:text-gray-700 text-xs font-medium transition-colors"
              >
                {showHabits ? 'Hide' : 'Show'}
              </button>
            )}
          </div>
        </div>

        {totalHabits === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">No habits yet</p>
            {isGoalActive && (
              <button
                onClick={() => onAddHabit(goal.id)}
                className="text-emerald-600 hover:text-emerald-700 text-sm font-medium mt-1 transition-colors"
              >
                Add your first habit
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Habit Progress Indicator */}
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>Today's completion</span>
                <span>{habits.filter(h => h.is_completed).length}/{totalHabits}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${totalHabits > 0 ? (habits.filter(h => h.is_completed).length / totalHabits) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            {showHabits && (
              <div className="space-y-2">
                {habits.map((habit) => (
                  <div
                    key={habit.id}
                    className={`bg-gray-50 rounded-lg p-3 border transition-colors ${
                      habit.is_completed ? 'border-emerald-200 bg-emerald-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start flex-1">
                        <button
                          onClick={() => onToggleHabitComplete(habit.id, !habit.is_completed)}
                          className={`mt-0.5 mr-3 transition-colors ${
                            habit.is_completed 
                              ? 'text-emerald-600 hover:text-emerald-700' 
                              : 'text-gray-400 hover:text-gray-600'
                          }`}
                        >
                          {habit.is_completed ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <div className="w-4 h-4 border-2 border-current rounded-full"></div>
                          )}
                        </button>
                        
                        <div className="flex-1">
                          <h5 className={`font-medium text-sm ${
                            habit.is_completed ? 'text-emerald-900 line-through' : 'text-gray-900'
                          }`}>
                            {habit.title}
                          </h5>
                          <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
                            <div className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {getFrequencyText(habit.frequency, habit.frequency_value)}
                            </div>
                            {habit.due_date && (
                              <div className="flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                Due: {formatDate(habit.due_date)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => onEditHabit(habit)}
                          className="text-gray-400 hover:text-gray-600 p-1 rounded transition-colors"
                          title="Edit habit"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => onDeleteHabit(habit.id)}
                          className="text-gray-400 hover:text-red-600 p-1 rounded transition-colors"
                          title="Delete habit"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}