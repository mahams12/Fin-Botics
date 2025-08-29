import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard,
  MessageSquare,
  Receipt,
  FileText,
  BarChart3,
  Settings,
  Bot,
  ChevronLeft,
  ChevronRight,
  Plus
} from 'lucide-react';
import { useThemeContext } from '../../context/ThemeContext';

const Sidebar = () => {
  const location = useLocation();
  const { sidebarCollapsed, toggleSidebar } = useThemeContext();

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      description: 'Overview and analytics'
    },
    {
      name: 'AI Chat',
      href: '/chat',
      icon: MessageSquare,
      description: 'Ask tax questions',
      badge: 'AI'
    },
    {
      name: 'Expenses',
      href: '/expenses',
      icon: Receipt,
      description: 'Track business expenses'
    },
    {
      name: 'Reports',
      href: '/reports',
      icon: FileText,
      description: 'Financial reports'
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: BarChart3,
      description: 'Spending insights'
    }
  ];

  const quickActions = [
    {
      name: 'Add Expense',
      href: '/expenses?action=create',
      icon: Plus,
      color: 'text-green-600 bg-green-100'
    },
    {
      name: 'Ask AI',
      href: '/chat',
      icon: Bot,
      color: 'text-purple-600 bg-purple-100'
    }
  ];

  const isActive = (href) => {
    if (href === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {!sidebarCollapsed && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full bg-white border-r border-gray-200 transition-all duration-300 ease-in-out
        ${sidebarCollapsed ? '-translate-x-full lg:translate-x-0 lg:w-20' : 'w-64'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            {!sidebarCollapsed && (
              <Link to="/dashboard" className="flex items-center space-x-2">
                <Bot className="w-8 h-8 text-primary-600" />
                <span className="text-xl font-bold text-gray-900">FinBotics</span>
              </Link>
            )}
            
            <button
              onClick={toggleSidebar}
              className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${
                sidebarCollapsed ? 'mx-auto' : ''
              }`}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-5 h-5 text-gray-600" />
              ) : (
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {/* Main Navigation */}
            <div className="space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`
                      flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group relative
                      ${active 
                        ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-600' 
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }
                      ${sidebarCollapsed ? 'justify-center' : ''}
                    `}
                    title={sidebarCollapsed ? item.name : ''}
                  >
                    <Icon className={`${sidebarCollapsed ? 'w-8 h-8' : 'w-5 h-5'} ${active ? 'text-primary-600' : ''}`} />
                    {!sidebarCollapsed && (
                      <>
                        <span className="flex-1">{item.name}</span>
                        {item.badge && (
                          <span className="px-2 py-1 text-xs bg-purple-100 text-purple-600 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                    
                    {/* Tooltip for collapsed sidebar */}
                    {sidebarCollapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 whitespace-nowrap">
                        {item.name}
                        <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-0 h-0 border-r-4 border-r-gray-900 border-t-2 border-t-transparent border-b-2 border-b-transparent" />
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Quick Actions */}
            {!sidebarCollapsed && (
              <div className="pt-6">
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Quick Actions
                </h3>
                <div className="space-y-1">
                  {quickActions.map((action) => {
                    const Icon = action.icon;
                    
                    return (
                      <Link
                        key={action.name}
                        to={action.href}
                        className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                      >
                        <div className={`w-6 h-6 rounded-md flex items-center justify-center ${action.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span>{action.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <Link
              to="/settings"
              className={`
                flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors group relative
                ${sidebarCollapsed ? 'justify-center' : ''}
              `}
              title={sidebarCollapsed ? 'Settings' : ''}
            >
              <Settings className={`${sidebarCollapsed ? 'w-8 h-8' : 'w-5 h-5'}`} />
              {!sidebarCollapsed && <span>Settings</span>}
              
              {/* Tooltip for collapsed sidebar */}
              {sidebarCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 whitespace-nowrap">
                  Settings
                  <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-0 h-0 border-r-4 border-r-gray-900 border-t-2 border-t-transparent border-b-2 border-b-transparent" />
                </div>
              )}
            </Link>
          </div>
        </div>
      </aside>

      {/* Main content spacer */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`} />
    </>
  );
};

export default Sidebar;