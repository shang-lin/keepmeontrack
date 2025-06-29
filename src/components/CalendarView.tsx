import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths, parseISO, startOfDay, isValid } from 'date-fns';
import { useGoals } from '../hooks/useGoals';
import { HabitModal } from './HabitModal';

export function CalendarView() {
  const { goals, habits, milestones, toggleHabitCompletion, isHabitCompletedOnDate, updateMilestone } = useGoals();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [habitModalOpen, setHabitModalOpen] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Helper function to parse date strings consistently
  const parseDate = (dateString: string) => {
    try {
      if (!dateString.includes('T')) {
        // Parse as local date by adding time component
        return startOfDay(new Date(dateString + 'T00:00:00'));
      } else {
        return startOfDay(parseISO(dateString));
      }
    } catch (error) {
      console.error('Error parsing date:', dateString, error);
      return null;
    }
  };

  // Helper function to determine if a habit should show on a specific date based on frequency
  const shouldShowHabitOnDate = (habit, date) => {
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const dayOfMonth = date.getDate();
    
    switch (habit.frequency) {
      case 'daily':
        return true; // Show every day
      case 'weekly':
        // For weekly habits, show on specific days of the week
        // For simplicity, let's show weekly habits on the same day of week as created
        // You could make this more sophisticated by storing preferred days
        return dayOfWeek === 1; // Show on Mondays for now
      case 'monthly':
        // Show on the same day of month as created, or last day if month is shorter
        return dayOfMonth === 1; // Show on 1st of month for now
      case 'custom':
        // For custom frequency, show every X days
        // This would need more sophisticated logic with a start date
        return true; // Show every day for now
      default:
        return true;
    }
  };

  // Get habits for a specific date - now properly filters by start, due dates, and goal target date
  const getHabitsForDate = (date: Date) => {
    const compareDate = startOfDay(date);
    
    return habits.filter(habit => {
      // Find the associated goal
      const associatedGoal = goals.find(goal => goal.id === habit.goal_id);
      
      // Parse habit start date
      let habitStartDate = null;
      if (habit.start_date) {
        habitStartDate = parseDate(habit.start_date);
        if (!habitStartDate || !isValid(habitStartDate)) {
          return false;
        }
      }

      // Parse habit due date
      let habitDueDate = null;
      if (habit.due_date) {
        habitDueDate = parseDate(habit.due_date);
        if (!habitDueDate || !isValid(habitDueDate)) {
          return false;
        }
      }

      // Parse goal target date (this is the key fix!)
      let goalTargetDate = null;
      if (associatedGoal?.target_date) {
        goalTargetDate = parseDate(associatedGoal.target_date);
        if (!goalTargetDate || !isValid(goalTargetDate)) {
          return false;
        }
      }

      // Check if the date is within the habit's active period
      const isAfterStartDate = !habitStartDate || compareDate >= habitStartDate;
      const isBeforeHabitDueDate = !habitDueDate || compareDate <= habitDueDate;
      const isBeforeGoalTargetDate = !goalTargetDate || compareDate <= goalTargetDate;
      
      // Only show if date is within ALL active periods AND should show based on frequency
      const isInActivePeriod = isAfterStartDate && isBeforeHabitDueDate && isBeforeGoalTargetDate;
      const shouldShowToday = shouldShowHabitOnDate(habit, date);
      
      return isInActivePeriod && shouldShowToday;
    });
  };

  // Get milestones for a specific date - now includes past dates
  const getMilestonesForDate = (date: Date) => {
    return milestones.filter(milestone => {
      if (!milestone.target_date) {
        return false; // Don't show milestones without target dates on calendar
      }
      
      try {
        const milestoneTargetDate = parseDate(milestone.target_date);
        const compareDate = startOfDay(date);
        
        if (!milestoneTargetDate || !isValid(milestoneTargetDate)) {
          return false;
        }
        
        // Show milestone if the date matches the target date
        return compareDate.getTime() === milestoneTargetDate.getTime();
      } catch (error) {
        console.error('Error parsing date for milestone:', milestone.title, error);
        return false;
      }
    });
  };

  // Get goals for a specific date - show goals on their target dates
  const getGoalsForDate = (date: Date) => {
    return goals.filter(goal => {
      if (!goal.target_date) {
        return false; // Don't show goals without target dates on calendar
      }
      
      try {
        const goalTargetDate = parseDate(goal.target_date);
        const compareDate = startOfDay(date);
        
        if (!goalTargetDate || !isValid(goalTargetDate)) {
          return false;
        }
        
        // Show goal if the date matches the target date
        return compareDate.getTime() === goalTargetDate.getTime();
      } catch (error) {
        console.error('Error parsing date for goal:', goal.title, error);
        return false;
      }
    });
  };

  const habitsForDate = useMemo(() => {
    return getHabitsForDate(selectedDate);
  }, [habits, goals, selectedDate]); // Added goals dependency

  const milestonesForDate = useMemo(() => {
    return getMilestonesForDate(selectedDate);
  }, [milestones, selectedDate]);

  const goalsForDate = useMemo(() => {
    return getGoalsForDate(selectedDate);
  }, [goals, selectedDate]);

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

  const handleToggleHabitComplete = async (habitId: string, date: Date) => {
    await toggleHabitCompletion(habitId, date);
  };

  const handleToggleMilestoneComplete = async (milestoneId: string, completed: boolean) => {
    await updateMilestone(milestoneId, { is_completed: completed });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-600 mt-1">View and manage your habits, milestones, and goal deadlines by date</p>
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
              const dayHabits = getHabitsForDate(day);
              const dayMilestones = getMilestonesForDate(day);
              const dayGoals = getGoalsForDate(day);
              const totalItems = dayHabits.length + dayMilestones.length + dayGoals.length;
              const isSelected = isSameDay(day, selectedDate);
              const isCurrentDay = isToday(day);
              const isCurrentMonth = isSameMonth(day, currentDate);

              return (
                <button
                  key={day.toString()}
                  onClick={() => handleDateClick(day)}
                  className={`p-3 text-sm rounded-lg transition-colors relative min-h-[3.5rem] flex flex-col items-center justify-start ${
                    isSelected
                      ? 'bg-indigo-600 text-white'
                      : isCurrentDay
                      ? 'bg-indigo-100 text-indigo-700'
                      : isCurrentMonth
                      ? 'text-gray-900 hover:bg-gray-100'
                      : 'text-gray-400'
                  }`}
                >
                  <span className="block mb-1">{format(day, 'd')}</span>
                  {totalItems > 0 && (
                    <div className="flex flex-col items-center">
                      {/* Dots row */}
                      <div className="flex space-x-1 mb-1">
                        {/* Show up to 3 dots for different types */}
                        {dayHabits.length > 0 && (
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            isSelected ? 'bg-white' : 'bg-emerald-600'
                          }`}></div>
                        )}
                        {dayMilestones.length > 0 && (
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            isSelected ? 'bg-white' : 'bg-purple-600'
                          }`}></div>
                        )}
                        {dayGoals.length > 0 && (
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            isSelected ? 'bg-white' : 'bg-blue-600'
                          }`}></div>
                        )}
                      </div>
                      {/* +n indicator below dots */}
                      {totalItems > 3 && (
                        <div className={`text-xs leading-none ${
                          isSelected ? 'text-white' : 'text-indigo-600'
                        }`}>
                          +{totalItems - 3}
                        </div>
                      )}
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

            {habitsForDate.length === 0 && milestonesForDate.length === 0 && goalsForDate.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <CalendarIcon className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm">No items for this date</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Goal Deadlines Section */}
                {goalsForDate.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-blue-900 mb-3 flex items-center">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                      Goal Deadlines ({goalsForDate.length})
                    </h4>
                    <div className="space-y-2">
                      {goalsForDate.map((goal) => (
                        <div
                          key={goal.id}
                          className={`p-3 border rounded-lg transition-colors ${
                            goal.status === 'completed'
                              ? 'border-blue-200 bg-blue-50'
                              : 'border-gray-200 bg-white hover:border-blue-300'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h5 className={`font-medium text-sm ${
                                goal.status === 'completed' ? 'text-blue-900 line-through' : 'text-gray-900'
                              }`}>
                                🎯 {goal.title}
                              </h5>
                              {goal.description && (
                                <p className={`text-xs mt-1 ${
                                  goal.status === 'completed' ? 'text-blue-700' : 'text-gray-600'
                                }`}>
                                  {goal.description}
                                </p>
                              )}
                              <div className="flex items-center mt-2 text-xs text-gray-500">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  goal.status === 'completed' 
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : goal.status === 'paused'
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-indigo-100 text-indigo-700'
                                }`}>
                                  {goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
                                </span>
                                <span className="ml-2">{goal.progress}% complete</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Milestones Section */}
                {milestonesForDate.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-purple-900 mb-3 flex items-center">
                      <div className="w-2 h-2 bg-purple-600 rounded-full mr-2"></div>
                      Milestones ({milestonesForDate.length})
                    </h4>
                    <div className="space-y-2">
                      {milestonesForDate.map((milestone) => (
                        <div
                          key={milestone.id}
                          className={`p-3 border rounded-lg transition-colors ${
                            milestone.is_completed
                              ? 'border-purple-200 bg-purple-50'
                              : 'border-gray-200 bg-white hover:border-purple-300'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h5 className={`font-medium text-sm ${
                                milestone.is_completed ? 'text-purple-900 line-through' : 'text-gray-900'
                              }`}>
                                {milestone.title}
                              </h5>
                              {milestone.description && (
                                <p className={`text-xs mt-1 ${
                                  milestone.is_completed ? 'text-purple-700' : 'text-gray-600'
                                }`}>
                                  {milestone.description}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => handleToggleMilestoneComplete(milestone.id, !milestone.is_completed)}
                              className={`px-2 py-1 text-xs font-medium rounded-full transition-colors ${
                                milestone.is_completed
                                  ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {milestone.is_completed ? 'Completed' : 'Mark Done'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Habits Section */}
                {habitsForDate.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-emerald-900 mb-3 flex items-center">
                      <div className="w-2 h-2 bg-emerald-600 rounded-full mr-2"></div>
                      Habits ({habitsForDate.length})
                    </h4>
                    <div className="space-y-2">
                      {habitsForDate.map((habit) => {
                        const isCompleted = isHabitCompletedOnDate(habit.id, selectedDate);
                        
                        return (
                          <div
                            key={habit.id}
                            className={`p-3 border rounded-lg transition-colors ${
                              isCompleted
                                ? 'border-emerald-200 bg-emerald-50'
                                : 'border-gray-200 bg-white hover:border-emerald-300'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h5 className={`font-medium text-sm ${
                                  isCompleted ? 'text-emerald-900 line-through' : 'text-gray-900'
                                }`}>
                                  {habit.title}
                                </h5>
                                {habit.description && (
                                  <p className={`text-xs mt-1 ${
                                    isCompleted ? 'text-emerald-700' : 'text-gray-600'
                                  }`}>
                                    {habit.description}
                                  </p>
                                )}
                                <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500">
                                  {habit.start_date && (
                                    <span>Started: {format(parseDate(habit.start_date) || new Date(), 'MMM dd, yyyy')}</span>
                                  )}
                                  {habit.due_date && (
                                    <span>Due: {format(parseDate(habit.due_date) || new Date(), 'MMM dd, yyyy')}</span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleToggleHabitComplete(habit.id, selectedDate)}
                                  className={`px-2 py-1 text-xs font-medium rounded-full transition-colors ${
                                    isCompleted
                                      ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                  }`}
                                >
                                  {isCompleted ? 'Completed' : 'Mark Done'}
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
                        );
                      })}
                    </div>
                  </div>
                )}
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