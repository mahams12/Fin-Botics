import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useExpenseStats } from '../hooks/useExpenses';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  FileText, 
  Calendar,
  Target,
  AlertCircle,
  CheckCircle2,
  PieChart,
  BarChart3
} from 'lucide-react';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import { getDateRange } from '../utils/dateUtils';

const DashboardPage = () => {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState('this_month');
  const { stats, isLoading } = useExpenseStats(getDateRange(dateRange));

  const quickActions = [
    {
      title: 'Add Expense',
      description: 'Record a new business expense',
      icon: <DollarSign className="w-6 h-6" />,
      href: '/expenses?action=create',
      color: 'bg-blue-500'
    },
    {
      title: 'Chat with AI',
      description: 'Ask tax questions or get help',
      icon: <FileText className="w-6 h-6" />,
      href: '/chat',
      color: 'bg-purple-500'
    },
    {
      title: 'Generate Report',
      description: 'Create financial reports',
      icon: <BarChart3 className="w-6 h-6" />,
      href: '/reports?action=create',
      color: 'bg-green-500'
    },
    {
      title: 'View Analytics',
      description: 'Analyze spending patterns',
      icon: <PieChart className="w-6 h-6" />,
      href: '/reports',
      color: 'bg-orange-500'
    }
  ];

  const upcomingTasks = [
    {
      title: 'Quarterly Tax Filing',
      dueDate: '2024-04-15',
      priority: 'high',
      completed: false
    },
    {
      title: 'Expense Report Review',
      dueDate: '2024-03-20',
      priority: 'medium',
      completed: false
    },
    {
      title: 'Receipt Organization',
      dueDate: '2024-03-18',
      priority: 'low',
      completed: true
    }
  ];

  const recentActivity = [
    {
      type: 'expense',
      description: 'Office supplies expense added',
      amount: 150.00,
      time: '2 hours ago'
    },
    {
      type: 'report',
      description: 'Monthly report generated',
      time: '1 day ago'
    },
    {
      type: 'chat',
      description: 'Asked about tax deductions',
      time: '2 days ago'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 ml-64 p-8 pt-20">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.first_name || 'User'}!
            </h1>
            <p className="text-gray-600 mt-2">
              Here's an overview of your financial activity for {dateRange.replace('_', ' ')}.
            </p>
          </div>

          {/* Date Range Selector */}
          <div className="mb-8">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="form-select w-auto"
            >
              <option value="this_month">This Month</option>
              <option value="last_month">Last Month</option>
              <option value="this_quarter">This Quarter</option>
              <option value="this_year">This Year</option>
            </select>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {isLoading ? '...' : formatCurrency(stats?.totalExpenses || 0)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">
                  {formatPercentage(stats?.expenseGrowth || 0)} from last period
                </span>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tax Deductions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {isLoading ? '...' : formatCurrency(stats?.taxDeductions || 0)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">
                  {formatPercentage(stats?.deductionRate || 0)} of expenses
                </span>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Transactions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {isLoading ? '...' : stats?.transactionCount || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <Calendar className="w-4 h-4 text-gray-500 mr-1" />
                <span className="text-sm text-gray-600">
                  This period
                </span>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg per Transaction</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {isLoading ? '...' : formatCurrency(stats?.avgTransaction || 0)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                <span className="text-sm text-red-600">
                  {formatPercentage(stats?.avgChange || 0)} from last period
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Quick Actions */}
            <div className="lg:col-span-2">
              <div className="card p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quickActions.map((action, index) => (
                    <a
                      key={index}
                      href={action.href}
                      className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors group"
                    >
                      <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center text-white mr-4 group-hover:scale-110 transition-transform`}>
                        {action.icon}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{action.title}</h3>
                        <p className="text-sm text-gray-600">{action.description}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="card p-6 mt-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-3 ${
                          activity.type === 'expense' ? 'bg-red-500' :
                          activity.type === 'report' ? 'bg-green-500' :
                          'bg-blue-500'
                        }`} />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                          <p className="text-xs text-gray-500">{activity.time}</p>
                        </div>
                      </div>
                      {activity.amount && (
                        <span className="text-sm font-medium text-gray-900">
                          {formatCurrency(activity.amount)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <a href="/expenses" className="text-sm text-primary-600 hover:text-primary-700">
                    View all activity →
                  </a>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Upcoming Tasks */}
              <div className="card p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Upcoming Tasks</h2>
                <div className="space-y-4">
                  {upcomingTasks.map((task, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      {task.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                      ) : (
                        <div className={`w-5 h-5 rounded-full border-2 mt-0.5 ${
                          task.priority === 'high' ? 'border-red-500' :
                          task.priority === 'medium' ? 'border-yellow-500' :
                          'border-gray-300'
                        }`} />
                      )}
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${task.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                          {task.title}
                        </p>
                        <p className="text-xs text-gray-500">Due: {task.dueDate}</p>
                      </div>
                      {task.priority === 'high' && !task.completed && (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Tax Insights */}
              <div className="card p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Tax Insights</h2>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-medium text-blue-900 mb-2">Potential Savings</h3>
                    <p className="text-sm text-blue-700">
                      You could save up to {formatCurrency(stats?.potentialSavings || 0)} in taxes by optimizing your deductions.
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h3 className="font-medium text-green-900 mb-2">On Track</h3>
                    <p className="text-sm text-green-700">
                      Your expense tracking is {formatPercentage(stats?.trackingScore || 0.85)} complete for this quarter.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;