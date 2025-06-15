import React, { useState } from 'react';
import { MoreHorizontal, Edit, Trash2, Target, Calendar, CheckCircle } from 'lucide-react';
import { Database } from '../lib/supabase';
import { format } from 'date-fns';

type Goal = Database['public']['Tables']['goals']['Row'];

interface GoalCardProps {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onDelete: (id: string) => void;
}

export function GoalCard({ goal, onEdit, onDelete }: GoalCardProps) {
  const [showMenu, setShowMenu] = useState(false);

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

  const StatusIcon = getStatusIcon(goal.status);

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

      {goal.description && (
        <p className="text-gray-600 mb-4 line-clamp-2">{goal.description}</p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Progress</span>
            <span className="text-sm font-medium text-gray-900">{goal.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${goal.progress}%` }}
            ></div>
          </div>
        </div>
        
        {goal.target_date && (
          <div className="ml-6 text-right">
            <p className="text-xs text-gray-500">Target Date</p>
            <p className="text-sm font-medium text-gray-900">
              {format(new Date(goal.target_date), 'MMM dd, yyyy')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}