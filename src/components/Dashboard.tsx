import React, { useState } from 'react';
import { Plus, Target, TrendingUp, Calendar, CheckCircle, Flag, AlertCircle } from 'lucide-react';
import { useGoals } from '../hooks/useGoals';
import { useAuth } from '../hooks/useAuth';
import { GoalCard } from './GoalCard';
import { GoalModal } from './GoalModal';
import { HabitModal } from './HabitModal';
import { MilestoneModal } from './MilestoneModal';
import { HabitCard } from './HabitCard';
import { AIMilestoneHabitGenerator } from './AIMilestoneHabitGenerator';
import toast from 'react-hot-toast';

export function Dashboard() {
  const { 
    goals, 
    habits, 
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
    getMilestonesForGoal,
    getHabitsForGoal,
    getGoalProgress
  } = useGoals();
  const { signOut } = useAuth();
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [habitModalOpen, setHabitModalOpen] = useState(false);
  const [milestoneModalOpen, setMilestoneModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [selectedGoalForMilestone, setSelectedGoalForMilestone] = useState('');
  const [selectedGoalForHabit, setSelectedGoalForHabit] = useState('');

  const handleCreateGoal = async (goalData) => {
    const result = await createGoal(goalData);
    if (result) {
      toast.success('Goal created successfully!');
    } else {
      toast.error('Failed to create goal');
    }
  };

  const handleUpdateGoal = async (goalData) => {
    if (!selectedGoal) return;
    const result = await updateGoal(selectedGoal.id, goalData);
    if (result) {
      toast.success('Goal updated successfully!');
    } else {
      toast.error('Failed to update goal');
    }
  };

  const handleDeleteGoal = async (id) => {
    const result = await deleteGoal(id);
    if (result) {
      toast.success('Goal deleted successfully!');
    } else {
      toast.error('Failed to delete goal');
    }
  };

  const handleMarkGoalComplete = async (id) => {
    const result = await updateGoal(id, { 
      status: 'completed',
      progress: 100 
    });
    if (result) {
      toast.success('🎉 Goal marked as complete! Congratulations!');
    } else {
      toast.error('Failed to mark goal as complete');
    }
  };

  const handleCreateHabit = async (habitData) => {
    const result = await createHabit(habitData);
    if (result) {
      toast.success('Habit created successfully!');
    } else {
      toast.error('Failed to create habit');
    }
  };

  const handleUpdateHabit = async (habitData) => {
    if (!selectedHabit) return;
    const result = await updateHabit(selectedHabit.id, habitData);
    if (result) {
      toast.success('Habit updated successfully!');
    } else {
      toast.error('Failed to update habit');
    }
  };

  const handleDeleteHabit = async (id) => {
    const result = await deleteHabit(id);
    if (result) {
      toast.success('Habit deleted successfully!');
    } else {
      toast.error('Failed to delete habit');
    }
  };

  const handleCreateMilestone = async (milestoneData) => {
    const result = await createMilestone(milestoneData);
    if (result) {
      toast.success('Milestone created successfully!');
    } else {
      toast.error('Failed to create milestone');
    }
  };

  const handleUpdateMilestone = async (milestoneData) => {
    if (!selectedMilestone) return;
    const result = await updateMilestone(selectedMilestone.id, milestoneData);
    if (result) {
      toast.success('Milestone updated successfully!');
    } else {
      toast.error('Failed to update milestone');
    }
  };

  const handleDeleteMilestone = async (id) => {
    const result = await deleteMilestone(id);
    if (result) {
      toast.success('Milestone deleted successfully!');
    } else {
      toast.error('Failed to delete milestone');
    }
  };

  const handleToggleHabitComplete = async (id, completed) => {
    const today = new Date();
    const result = await toggleHabitCompletion(id, today);
    if (result) {
      const isNowCompleted = isHabitCompletedOnDate(id, today);
      toast.success(isNowCompleted ? 'Habit completed!' : 'Habit marked as incomplete');
    }
  };

  const handleToggleMilestoneComplete = async (id, completed) => {
    const result = await updateMilestone(id, { is_completed: completed });
    if (result) {
      toast.success(completed ? 'Milestone completed!' : 'Milestone marked as incomplete');
    }
  };

  const handleEndGuestSession = async () => {
    await signOut();
  };

  const openGoalModal = (goal = null) => {
    setSelectedGoal(goal);
    setGoalModalOpen(true);
  };

  const openHabitModal = (habit = null, goalId = '') => {
    setSelectedHabit(habit);
    setSelectedGoalForHabit(goalId);
    setHabitModalOpen(true);
  };

  const openMilestoneModal = (milestone = null, goalId = '') => {
    setSelectedMilestone(milestone);
    setSelectedGoalForMilestone(goalId);
    setMilestoneModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const activeGoals = goals.filter(goal => goal.status === 'active');
  const completedGoals = goals.filter(goal => goal.status === 'completed');
  const totalHabits = habits.length;
  const today = new Date();
  const completedHabitsToday = habits.filter(habit => isHabitCompletedOnDate(habit.id, today)).length;
  const completionRate = totalHabits > 0 ? Math.round((completedHabitsToday / totalHabits) * 100) : 0;
  const totalMilestones = milestones.length;
  const completedMilestones = milestones.filter(m => m.is_completed).length;

  // Calculate overall progress across all active goals
  const overallProgress = activeGoals.length > 0 
    ? Math.round(activeGoals.reduce((sum, goal) => sum + getGoalProgress(goal.id), 0) / activeGoals.length)
    : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            {isGuest ? 'Exploring demo data - create an account to save your progress' : 'Track your goals and build better habits'}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => openHabitModal()}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2 inline" />
            Add Habit
          </button>
          <button
            onClick={() => openGoalModal()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2 inline" />
            Add Goal
          </button>
        </div>
      </div>

      {/* Guest Mode Notice */}
      {isGuest && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <div className="flex items-start">
            <AlertCircle className="w-6 h-6 text-amber-600 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-amber-800 mb-2">You're in Guest Mode</h3>
              <p className="text-amber-700 mb-4">
                You're viewing demo data. Changes you make won't be saved. Create a free account to start tracking your real goals and habits.
              </p>
              <button
                onClick={handleEndGuestSession}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors"
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Goals</p>
              <p className="text-2xl font-bold text-gray-900">{activeGoals.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed Goals</p>
              <p className="text-2xl font-bold text-gray-900">{completedGoals.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-amber-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Today's Habits</p>
              <p className="text-2xl font-bold text-gray-900">{completedHabitsToday}/{totalHabits}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Overall Progress</p>
              <p className="text-2xl font-bold text-gray-900">{overallProgress}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-rose-100 rounded-lg flex items-center justify-center">
              <Flag className="w-6 h-6 text-rose-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Milestones</p>
              <p className="text-2xl font-bold text-gray-900">{completedMilestones}/{totalMilestones}</p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Milestone and Habit Generator - now with goal selector */}
      {goals.length > 0 && (
        <AIMilestoneHabitGenerator
          goals={goals}
          onItemsGenerated={() => {}}
          onAddHabit={handleCreateHabit}
          onAddMilestone={handleCreateMilestone}
        />
      )}

      {/* Goals Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Your Goals</h2>
        </div>
        
        {goals.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No goals yet</h3>
            <p className="text-gray-600 mb-6">Create your first goal to get started on your journey</p>
            <button
              onClick={() => openGoalModal()}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Create Your First Goal
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {goals.map((goal) => {
              const goalHabits = getHabitsForGoal(goal.id);
              const goalHabitsWithCompletion = goalHabits.map(habit => ({
                ...habit,
                is_completed: isHabitCompletedOnDate(habit.id, today)
              }));

              return (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  milestones={getMilestonesForGoal(goal.id)}
                  habits={goalHabitsWithCompletion}
                  realTimeProgress={getGoalProgress(goal.id)}
                  onEdit={openGoalModal}
                  onDelete={handleDeleteGoal}
                  onMarkComplete={handleMarkGoalComplete}
                  onAddMilestone={(goalId) => openMilestoneModal(null, goalId)}
                  onAddHabit={(goalId) => openHabitModal(null, goalId)}
                  onEditMilestone={(milestone) => openMilestoneModal(milestone, milestone.goal_id)}
                  onDeleteMilestone={handleDeleteMilestone}
                  onToggleMilestoneComplete={handleToggleMilestoneComplete}
                  onEditHabit={(habit) => openHabitModal(habit)}
                  onDeleteHabit={handleDeleteHabit}
                  onToggleHabitComplete={handleToggleHabitComplete}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Habits Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Your Habits</h2>
        </div>
        
        {habits.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No habits yet</h3>
            <p className="text-gray-600 mb-6">Create habits to break down your goals into actionable steps</p>
            <button
              onClick={() => openHabitModal()}
              className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
            >
              Create Your First Habit
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {habits.map((habit) => {
              const isCompletedToday = isHabitCompletedOnDate(habit.id, today);
              return (
                <HabitCard
                  key={habit.id}
                  habit={{...habit, is_completed: isCompletedToday}}
                  onEdit={openHabitModal}
                  onDelete={handleDeleteHabit}
                  onToggleComplete={handleToggleHabitComplete}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      <GoalModal
        isOpen={goalModalOpen}
        onClose={() => {
          setGoalModalOpen(false);
          setSelectedGoal(null);
        }}
        onSave={selectedGoal ? handleUpdateGoal : handleCreateGoal}
        goal={selectedGoal}
      />

      <HabitModal
        isOpen={habitModalOpen}
        onClose={() => {
          setHabitModalOpen(false);
          setSelectedHabit(null);
          setSelectedGoalForHabit('');
        }}
        onSave={selectedHabit ? handleUpdateHabit : handleCreateHabit}
        habit={selectedHabit}
        goals={goals}
        preselectedGoalId={selectedGoalForHabit}
      />

      <MilestoneModal
        isOpen={milestoneModalOpen}
        onClose={() => {
          setMilestoneModalOpen(false);
          setSelectedMilestone(null);
          setSelectedGoalForMilestone('');
        }}
        onSave={selectedMilestone ? handleUpdateMilestone : handleCreateMilestone}
        milestone={selectedMilestone}
        goalId={selectedGoalForMilestone}
      />
    </div>
  );
}