import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths, parseISO, startOfDay } from 'date-fns';
import { useGoals } from '../hooks/useGoals';
import { HabitModal } from './HabitModal';

export function CalendarView() {
  const { goals, habits, updateHabit } = useGoals();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [habitModalOpen, setHabitModalOpen] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const habitsForDate = useMemo(() => {
    return habits.filter(habit => {
      if (!habit.due_date) return false;
      
      // Parse the due date from the database and normalize both dates to start of day
      const habitDate = startOfDay(parseISO(habit.due_date));
      const compareDate = startOfDay(selectedDate);
      
      return isSameDay(habitDate, compareDate);
    });
  }, [habits, selectedDate]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentDate(subMonths(currentDate, 1));
    } else {
      setCurrentDate(addMonths(currentDate, 1));
    }
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handleCreateHabit = () => {
    setSelectedHabit(null);
    setHabitModalOpen(true);
  };

  const handleEditHabit = (habit) => {
    setSelectedHabit(habit);
    setHabitModalOpen(true);
  };

  const handleToggleHabitComplete = async (habitId: string, completed: boolean) => {
    await updateHabit(habitId, { is_completed: completed });
  };

  const getHabitsForDay = (date: Date) => {
    return habits.filter(habit => {
      if (!habit.due_date) return false;
      
      // Parse the due date from the database and normalize both dates to start of day
      const habitDate = startOfDay(parseISO(habit.due_date));
      const compareDate = startOfDay(date);
      
      return isSameDay(habitDate, compareDate);
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-600 mt-1">View and manage your habits by date</p>
        </div>
        <button
          onClick={handleCreateHabit}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2 inline" />
          Add Habit
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="p-3 text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day) => {
              const dayHabits = getHabitsForDay(day);
              const isSelected = isSameDay(day, selectedDate);
              const isCurrentDay = isToday(day);
              const isCurrentMonth = isSameMonth(day, currentDate);

              return (
                <button
                  key={day.toString()}
                  onClick={() => handleDateClick(day)}
                  className={`p-3 text-sm rounded-lg transition-colors relative min-h-[3rem] ${
                    isSelected
                      ? 'bg-indigo-600 text-white'
                      : isCurrentDay
                      ? 'bg-indigo-100 text-indigo-700'
                      : isCurrentMonth
                      ? 'text-gray-900 hover:bg-gray-100'
                      : 'text-gray-400'
                  }`}
                >
                  <span className="block">{format(day, 'd')}</span>
                  {dayHabits.length > 0 && (
                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                      <div className={`w-2 h-2 rounded-full ${
                        isSelected ? 'bg-white' : 'bg-indigo-600'
                      }`}></div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Details */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <CalendarIcon className="w-5 h-5 text-indigo-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">
                {format(selectedDate, 'EEEE, MMMM d')}
              </h3>
            </div>

            {habitsForDate.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <CalendarIcon className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm">No habits scheduled for this date</p>
              </div>
            ) : (
              <div className="space-y-3">
                {habitsForDate.map((habit) => (
                  <div
                    key={habit.id}
                    className={`p-4 border rounded-lg transition-colors ${
                      habit.is_completed
                        ? 'border-emerald-200 bg-emerald-50'
                        : 'border-gray-200 bg-white hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className={`font-medium ${
                          habit.is_completed ? 'text-emerald-900 line-through' : 'text-gray-900'
                        }`}>
                          {habit.title}
                        </h4>
                        {habit.description && (
                          <p className={`text-sm mt-1 ${
                            habit.is_completed ? 'text-emerald-700' : 'text-gray-600'
                          }`}>
                            {habit.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleToggleHabitComplete(habit.id, !habit.is_completed)}
                          className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                            habit.is_completed
                              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {habit.is_completed ? 'Completed' : 'Mark Done'}
                        </button>
                        <button
                          onClick={() => handleEditHabit(habit)}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <HabitModal
        isOpen={habitModalOpen}
        onClose={() => {
          setHabitModalOpen(false);
          setSelectedHabit(null);
        }}
        onSave={async (habitData) => {
          // Handle creating/updating habit
          setHabitModalOpen(false);
          setSelectedHabit(null);
        }}
        habit={selectedHabit}
        goals={goals}
      />
    </div>
  );
}