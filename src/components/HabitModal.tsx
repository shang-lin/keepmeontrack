import React, { useState, useEffect } from 'react';
import { X, Target, Calendar, FileText, Clock, Play } from 'lucide-react';
import { Database } from '../lib/supabase';

type Habit = Database['public']['Tables']['habits']['Row'];
type Goal = Database['public']['Tables']['goals']['Row'];

interface HabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (habitData: Omit<Database['public']['Tables']['habits']['Insert'], 'user_id'>) => void;
  habit?: Habit | null;
  goals: Goal[];
  preselectedGoalId?: string;
}

export function HabitModal({ isOpen, onClose, onSave, habit, goals, preselectedGoalId }: HabitModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [goalId, setGoalId] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'custom'>('daily');
  const [frequencyValue, setFrequencyValue] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    if (habit) {
      setTitle(habit.title);
      setDescription(habit.description || '');
      setGoalId(habit.goal_id);
      setFrequency(habit.frequency);
      setFrequencyValue(habit.frequency_value);
      setStartDate(habit.start_date ? habit.start_date.split('T')[0] : '');
      setDueDate(habit.due_date ? habit.due_date.split('T')[0] : '');
    } else {
      setTitle('');
      setDescription('');
      // Use preselected goal ID if provided, otherwise use first goal
      const targetGoalId = preselectedGoalId || goals[0]?.id || '';
      setGoalId(targetGoalId);
      setFrequency('daily');
      setFrequencyValue(1);
      
      // Default to goal's start date if available, otherwise today
      const selectedGoal = goals.find(g => g.id === targetGoalId);
      const defaultStartDate = selectedGoal?.start_date 
        ? selectedGoal.start_date.split('T')[0] 
        : new Date().toISOString().split('T')[0];
      setStartDate(defaultStartDate);
      setDueDate('');
    }
  }, [habit, goals, preselectedGoalId, isOpen]);

  // Update start date when goal changes (for new habits)
  useEffect(() => {
    if (!habit && goalId) {
      const selectedGoal = goals.find(g => g.id === goalId);
      if (selectedGoal?.start_date) {
        setStartDate(selectedGoal.start_date.split('T')[0]);
      }
    }
  }, [goalId, goals, habit]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      description: description || null,
      goal_id: goalId,
      frequency,
      frequency_value: frequencyValue,
      start_date: startDate || null,
      due_date: dueDate || null,
      is_completed: habit?.is_completed || false,
      order_index: habit?.order_index || 0,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {habit ? 'Edit Habit' : 'Create New Habit'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label htmlFor="goalId" className="block text-sm font-medium text-gray-700 mb-2">
              Associated Goal
            </label>
            <select
              id="goalId"
              required
              value={goalId}
              onChange={(e) => setGoalId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
            >
              {goals.map((goal) => (
                <option key={goal.id} value={goal.id}>
                  {goal.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Habit Title
            </label>
            <div className="relative">
              <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                placeholder="e.g., Morning run, Read for 30 minutes"
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <textarea
                id="description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors resize-none"
                placeholder="Describe this habit..."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-2">
                Frequency
              </label>
              <select
                id="frequency"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as 'daily' | 'weekly' | 'monthly' | 'custom')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div>
              <label htmlFor="frequencyValue" className="block text-sm font-medium text-gray-700 mb-2">
                {frequency === 'daily' ? 'Times per day' : frequency === 'weekly' ? 'Times per week' : frequency === 'monthly' ? 'Times per month' : 'Every X days'}
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="frequencyValue"
                  type="number"
                  min="1"
                  value={frequencyValue}
                  onChange={(e) => setFrequencyValue(parseInt(e.target.value))}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <div className="relative">
                <Play className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-2">
                Due Date (Optional)
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg font-medium transition-colors"
            >
              {habit ? 'Update Habit' : 'Create Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}