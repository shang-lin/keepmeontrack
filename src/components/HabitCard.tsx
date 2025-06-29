import React, { useState } from 'react';
import { MoreHorizontal, Edit, Trash2, Clock, Calendar, CheckCircle2, Circle, Play } from 'lucide-react';
import { Database } from '../lib/supabase';
import { format, parseISO } from 'date-fns';

type Habit = Database['public']['Tables']['habits']['Row'];

interface HabitCardProps {
  habit: Habit;
  onEdit: (habit: Habit) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string, completed: boolean) => void;
}

export function HabitCard({ habit, onEdit, onDelete, onToggleComplete }: HabitCardProps) {
  const [showMenu, setShowMenu] = useState(false);

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
        return format(localDate, 'MMM dd');
      } else {
        // Parse as ISO string
        return format(parseISO(dateString), 'MMM dd');
      }
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return 'Invalid date';
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 ${habit.is_completed ? 'bg-emerald-50 border-emerald-200' : ''}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start flex-1">
          <button
            onClick={() => onToggleComplete(habit.id, !habit.is_completed)}
            className={`mt-1 mr-3 transition-colors ${
              habit.is_completed 
                ? 'text-emerald-600 hover:text-emerald-700' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {habit.is_completed ? (
              <CheckCircle2 className="w-6 h-6" />
            ) : (
              <Circle className="w-6 h-6" />
            )}
          </button>
          
          <div className="flex-1">
            <h3 className={`text-lg font-semibold ${habit.is_completed ? 'text-emerald-900 line-through' : 'text-gray-900'}`}>
              {habit.title}
            </h3>
            {habit.description && (
              <p className={`text-sm mt-1 ${habit.is_completed ? 'text-emerald-700' : 'text-gray-600'}`}>
                {habit.description}
              </p>
            )}
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
                  onEdit(habit);
                  setShowMenu(false);
                }}
                className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Edit className="w-4 h-4 mr-3" />
                Edit Habit
              </button>
              <button
                onClick={() => {
                  onDelete(habit.id);
                  setShowMenu(false);
                }}
                className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-3" />
                Delete Habit
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center text-gray-500">
          <Clock className="w-4 h-4 mr-1" />
          {getFrequencyText(habit.frequency, habit.frequency_value)}
        </div>
        
        <div className="flex items-center space-x-4 text-gray-500">
          {habit.start_date && (
            <div className="flex items-center">
              <Play className="w-4 h-4 mr-1" />
              {formatDate(habit.start_date)}
            </div>
          )}
          
          {habit.due_date && (
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {formatDate(habit.due_date)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}