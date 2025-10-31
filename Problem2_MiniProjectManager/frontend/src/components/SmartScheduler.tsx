import React, { useState } from 'react';
import apiClient from '../api/apiClient';

interface SchedulerProps {
  projectId: string;
  onClose: () => void;
}

interface ScheduledTask {
  taskId: string;
  title: string;
  suggestedHours: number;
  isPartial: boolean;
}

interface DaySchedule {
  date: string;
  tasks: ScheduledTask[];
}

interface ScheduleResult {
  projectId: string;
  generatedAt: string;
  schedule: DaySchedule[];
  overdueRiskTasks: string[];
}

export default function SmartScheduler({ projectId, onClose }: SchedulerProps) {
  const [loading, setLoading] = useState(false);
  const [schedule, setSchedule] = useState<ScheduleResult | null>(null);
  const [error, setError] = useState('');

  // Form inputs
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [dailyWorkHours, setDailyWorkHours] = useState(2);
  const [strategy, setStrategy] = useState('dueDatePriority');

  const generateSchedule = async () => {
    setLoading(true);
    setError('');
    setSchedule(null);

    try {
      const response = await apiClient.post(`/projects/${projectId}/schedule`, {
        startDate: startDate ? new Date(startDate).toISOString() : null,
        endDate: endDate ? new Date(endDate).toISOString() : null,
        dailyWorkHours,
        strategy
      });

      setSchedule(response.data);
    } catch (err: any) {
      console.error('Failed to generate schedule', err);
      setError('Failed to generate schedule. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">🤖 Smart Scheduler</h2>
            <p className="text-indigo-100 text-xs sm:text-sm mt-1">Smart task planning</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Configuration Form */}
          {!schedule && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  ℹ️ The scheduler will automatically organize your tasks based on due dates, 
                  dependencies, and your daily work capacity.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Daily Work Hours: {dailyWorkHours}h
                </label>
                <input
                  type="range"
                  min="1"
                  max="12"
                  step="0.5"
                  value={dailyWorkHours}
                  onChange={(e) => setDailyWorkHours(parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1h</span>
                  <span>12h</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scheduling Strategy
                </label>
                <select
                  value={strategy}
                  onChange={(e) => setStrategy(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                >
                  <option value="dueDatePriority">Due Date Priority</option>
                  <option value="balanced">Balanced</option>
                  <option value="sequential">Sequential</option>
                </select>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <button
                onClick={generateSchedule}
                disabled={loading}
                className="w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating Schedule...
                  </span>
                ) : (
                  '✨ Generate Smart Schedule'
                )}
              </button>
            </div>
          )}

          {/* Schedule Results */}
          {schedule && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-green-900">Schedule Generated Successfully!</p>
                    <p className="text-sm text-green-700 mt-1">
                      Generated at {new Date(schedule.generatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {schedule.overdueRiskTasks.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <p className="font-semibold text-yellow-900">⚠️ Overdue Risk Warning</p>
                      <p className="text-sm text-yellow-700 mt-1">
                        {schedule.overdueRiskTasks.length} task(s) may not be completed by their due dates with current settings.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Daily Schedule */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  📅 Your Schedule
                </h3>

                {schedule.schedule.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>All tasks are already completed! 🎉</p>
                  </div>
                ) : (
                  schedule.schedule.map((day, idx) => (
                    <div key={idx} className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-3 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                          <h4 className="font-semibold text-gray-900">
                            {new Date(day.date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </h4>
                          <span className="text-sm text-gray-600">
                            {day.tasks.reduce((sum, t) => sum + t.suggestedHours, 0).toFixed(1)}h total
                          </span>
                        </div>
                      </div>

                      <div className="p-4 space-y-3">
                        {day.tasks.map((task, taskIdx) => (
                          <div key={taskIdx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="flex-shrink-0 mt-1">
                              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-semibold">
                                {task.suggestedHours.toFixed(1)}h
                              </div>
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{task.title}</p>
                              {task.isPartial && (
                                <span className="inline-block mt-1 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                  Partial - continues tomorrow
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setSchedule(null)}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                  ← Adjust Settings
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}