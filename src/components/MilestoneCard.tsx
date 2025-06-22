import React, { useState } from 'react';
import { MoreHorizontal, Edit, Trash2, Calendar, CheckCircle2, Circle } from 'lucide-react';
import { Database } from '../lib/supabase';
import { format } from 'date-fns';

type Milestone = Database['public']['Tables']['milestones']['Row'];

interface MilestoneCardProps {
  milestone: Milestone;
  onEdit: (milestone: Milestone) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string, completed: boolean) => void;
}

export function MilestoneCard({ milestone, onEdit, onDelete, onToggleComplete }: MilestoneCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-all duration-200 ${
      milestone.is_completed ? 'border-emerald-200 bg-emerald-50' : 'border-gray-200'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start flex-1">
          <button
            onClick={() => onToggleComplete(milestone.id, !milestone.is_completed)}
            className={`mt-1 mr-3 transition-colors ${
              milestone.is_completed 
                ? 'text-emerald-600 hover:text-emerald-700' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {milestone.is_completed ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <Circle className="w-5 h-5" />
            )}
          </button>
          
          <div className="flex-1">
            <h4 className={`font-medium ${
              milestone.is_completed ? 'text-emerald-900 line-through' : 'text-gray-900'
            }`}>
              {milestone.title}
            </h4>
            {milestone.description && (
              <p className={`text-sm mt-1 ${
                milestone.is_completed ? 'text-emerald-700' : 'text-gray-600'
              }`}>
                {milestone.description}
              </p>
            )}
            {milestone.target_date && (
              <div className="flex items-center mt-2 text-xs text-gray-500">
                <Calendar className="w-3 h-3 mr-1" />
                {format(new Date(milestone.target_date), 'MMM dd, yyyy')}
              </div>
            )}
          </div>
        </div>
        
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
              <button
                onClick={() => {
                  onEdit(milestone);
                  setShowMenu(false);
                }}
                className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Edit className="w-4 h-4 mr-3" />
                Edit Milestone
              </button>
              <button
                onClick={() => {
                  onDelete(milestone.id);
                  setShowMenu(false);
                }}
                className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-3" />
                Delete Milestone
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}