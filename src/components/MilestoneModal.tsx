import React, { useState, useEffect } from 'react';
import { X, Target, Calendar, FileText } from 'lucide-react';
import { Database } from '../lib/supabase';

type Milestone = Database['public']['Tables']['milestones']['Row'];
type Goal = Database['public']['Tables']['goals']['Row'];

interface MilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (milestoneData: Omit<Database['public']['Tables']['milestones']['Insert'], 'user_id'>) => void;
  milestone?: Milestone | null;
  goalId: string;
}

export function MilestoneModal({ isOpen, onClose, onSave, milestone, goalId }: MilestoneModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState('');

  useEffect(() => {
    if (milestone) {
      setTitle(milestone.title);
      setDescription(milestone.description || '');
      setTargetDate(milestone.target_date ? milestone.target_date.split('T')[0] : '');
    } else {
      setTitle('');
      setDescription('');
      setTargetDate('');
    }
  }, [milestone, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      goal_id: goalId,
      title,
      description: description || null,
      target_date: targetDate || null,
      is_completed: milestone?.is_completed || false,
      order_index: milestone?.order_index || 0,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {milestone ? 'Edit Milestone' : 'Create New Milestone'}
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
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Milestone Title
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
                placeholder="e.g., Complete first draft, Reach 10K steps"
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
                placeholder="Describe this milestone in more detail..."
              />
            </div>
          </div>

          <div>
            <label htmlFor="targetDate" className="block text-sm font-medium text-gray-700 mb-2">
              Target Date (Optional)
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="targetDate"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              />
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
              {milestone ? 'Update Milestone' : 'Create Milestone'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}