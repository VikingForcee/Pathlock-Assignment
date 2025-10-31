import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import ThemeToggle from '../components/ThemeToggle';

interface Project {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/projects');
      setProjects(res.data);
      setError('');
    } catch (err: any) {
      console.error('Failed to fetch projects', err);
      setError('Failed to load projects. Please try again.');
      
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleDeleteProject = async (projectId: string, projectTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete "${projectTitle}"? This will also delete all tasks in this project.`)) {
      return;
    }

    try {
      await apiClient.delete(`/projects/${projectId}`);
      setProjects(projects.filter(p => p.id !== projectId));
    } catch (err: any) {
      console.error('Failed to delete project', err);
      if (err.response?.status === 405) {
        alert('Delete feature is not available. Please restart your backend server.');
      } else {
        alert('Failed to delete project. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">My Projects</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your projects and tasks</p>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Create Project Button */}
        <button
          onClick={() => navigate('/projects/new')}
          className="mb-6 w-full sm:w-auto px-6 py-3 bg-indigo-600 dark:bg-indigo-500 text-white font-medium rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create New Project
        </button>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading projects...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && projects.length === 0 && !error && (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <svg className="mx-auto h-20 w-20 sm:h-24 sm:w-24 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No projects yet</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Get started by creating your first project!</p>
          </div>
        )}

        {/* Projects Grid */}
        {!loading && projects.length > 0 && (
          <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700 overflow-hidden group"
              >
                <div className="p-4 sm:p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                      {project.title}
                    </h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProject(project.id, project.title);
                      }}
                      className="text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors flex-shrink-0 ml-2"
                      title="Delete project"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  
                  {project.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {project.description}
                    </p>
                  )}
                  
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-4">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Created {new Date(project.createdAt).toLocaleDateString()}
                  </div>
                  
                  <button
                    onClick={() => navigate(`/projects/${project.id}`)}
                    className="w-full px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors text-sm sm:text-base"
                  >
                    View Tasks
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}