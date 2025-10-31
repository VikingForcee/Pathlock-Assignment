import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import SmartScheduler from '../components/SmartScheduler';

interface Task {
  id: string;
  title: string;
  dueDate?: string;
  isCompleted: boolean;
  createdAt: string;
  projectId: string;
}

export default function ProjectDetails() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [showScheduler, setShowScheduler] = useState(false);

  useEffect(() => {
    if (projectId && projectId !== 'new') {
      fetchProject();
      fetchTasks();
    }
  }, [projectId]);

  const fetchProject = async () => {
    if (!projectId || projectId === 'new') return;
    
    try {
      setLoading(true);
      const res = await apiClient.get(`/projects/${projectId}`);
      setProject(res.data);
    } catch (err: any) {
      console.error('Failed to fetch project', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    if (!projectId || projectId === 'new') return;
    
    try {
      const res = await apiClient.get(`/Tasks?projectId=${projectId}`);
      setTasks(res.data);
    } catch (err) {
      console.error('Failed to load tasks', err);
    }
  };

  const handleCreateProject = async () => {
    if (!newTitle.trim()) {
      alert('Please enter a project title.');
      return;
    }
    try {
      const res = await apiClient.post('/projects', {
        title: newTitle,
        description: newDesc,
      });
      navigate(`/projects/${res.data.id}`);
    } catch (err) {
      console.error('Failed to create project', err);
      alert('Failed to create project. Please try again.');
    }
  };

  const handleAddTask = async () => {
    if (!newTask.trim()) {
      alert('Task title cannot be empty.');
      return;
    }
    if (!projectId || projectId === 'new') {
      alert('Please create the project first before adding tasks.');
      return;
    }

    try {
      await apiClient.post(`/Tasks`, { 
        title: newTask,
        projectId: projectId 
      });
      setNewTask('');
      fetchTasks();
    } catch (err) {
      console.error('Failed to add task', err);
      alert('Failed to add task.');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await apiClient.delete(`/Tasks/${taskId}`);
      fetchTasks();
    } catch (err) {
      console.error('Failed to delete task', err);
    }
  };

  const handleToggleTask = async (taskId: string) => {
    try {
      await apiClient.patch(`/Tasks/${taskId}/toggle`);
      fetchTasks();
    } catch (err) {
      console.error('Failed to toggle task', err);
    }
  };

  // Create new project view
  if (projectId === 'new') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="mb-6 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6">Create New Project</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Project Title *
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Enter project title"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  autoComplete="off"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="What is this project about?"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  autoComplete="off"
                />
              </div>

              <button
                onClick={handleCreateProject}
                className="w-full px-6 py-3 bg-indigo-600 dark:bg-indigo-500 text-white font-medium rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors shadow-md hover:shadow-lg"
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Project details view
  const completedTasks = tasks.filter(t => t.isCompleted).length;
  const totalTasks = tasks.length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="mb-6 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </button>

        {/* Project Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
            <div className="flex-1">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {project ? project.title : 'Loading...'}
              </h2>
              {project?.description && (
                <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">{project.description}</p>
              )}
            </div>
            
            {/* Smart Scheduler Button */}
            <button
              onClick={() => setShowScheduler(true)}
              className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 dark:hover:from-indigo-600 dark:hover:to-purple-600 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm"
              title="AI-powered task scheduling"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span className="hidden sm:inline">Smart Schedule</span>
              <span className="sm:hidden">Schedule</span>
            </button>
          </div>
          
          {/* Progress Bar */}
          {totalTasks > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span>{completedTasks} of {totalTasks} tasks completed</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Add Task Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add New Task</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Enter task title..."
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddTask();
              }}
              autoComplete="off"
            />
            <button
              onClick={handleAddTask}
              className="w-full sm:w-auto px-6 py-3 bg-indigo-600 dark:bg-indigo-500 text-white font-medium rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Task
            </button>
          </div>
        </div>

        {/* Tasks List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tasks</h3>
          
          {tasks.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <svg className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p>No tasks yet. Add your first task above!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border-2 transition-all ${
                    task.isCompleted
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                      : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-600'
                  }`}
                >
                  <button
                    onClick={() => handleToggleTask(task.id)}
                    className={`flex-shrink-0 w-6 h-6 rounded-full border-2 transition-all ${
                      task.isCompleted
                        ? 'bg-green-500 border-green-500'
                        : 'border-gray-300 dark:border-gray-500 hover:border-indigo-500 dark:hover:border-indigo-400'
                    }`}
                  >
                    {task.isCompleted && (
                      <svg className="w-full h-full text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  
                  <span
                    className={`flex-1 text-sm sm:text-base ${
                      task.isCompleted 
                        ? 'line-through text-gray-500 dark:text-gray-400' 
                        : 'text-gray-900 dark:text-white'
                    }`}
                  >
                    {task.title}
                  </span>
                  
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="flex-shrink-0 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    title="Delete task"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Smart Scheduler Modal */}
      {showScheduler && (
        <SmartScheduler
          projectId={projectId!}
          onClose={() => setShowScheduler(false)}
        />
      )}
    </div>
  );
}