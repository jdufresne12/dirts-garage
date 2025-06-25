'use client';

import { useAuth } from '@/app/contexts/AuthContext';

export default function Home() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Dirt's Garage
              </h1>
              <p className="text-gray-600">Welcome back, {user?.username}!</p>
            </div>
            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* User Info Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">
                      {user?.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <div>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      User Information
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {user?.username}
                    </dd>
                    <dd className="text-sm text-gray-500">
                      {user?.email}
                    </dd>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button className="w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors">
                  View Profile
                </button>
                <button className="w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors">
                  Settings
                </button>
                <button className="w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors">
                  Help Center
                </button>
              </div>
            </div>
          </div>

          {/* Stats Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                System Status
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Status</span>
                  <span className="text-sm font-medium text-green-600">Online</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Version</span>
                  <span className="text-sm font-medium text-gray-900">1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Environment</span>
                  <span className="text-sm font-medium text-gray-900">Development</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="mt-8">
          <div className="bg-white shadow rounded-lg">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Welcome to Dirt's Garage Dashboard
              </h2>
              <p className="text-gray-600 mb-4">
                This is your main dashboard where you can manage your garage operations.
                The authentication system is now set up and working with:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Secure cookie-based authentication</li>
                <li>Protected routes with middleware</li>
                <li>Automatic redirects for authenticated/unauthenticated users</li>
                <li>Demo login credentials for testing</li>
              </ul>
              <div className="mt-6 p-4 bg-blue-50 rounded-md">
                <h3 className="text-sm font-medium text-blue-800">
                  Demo Accounts Available:
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p><strong>Admin:</strong> username: admin, password: password123</p>
                  <p><strong>User:</strong> username: user, password: user123</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}