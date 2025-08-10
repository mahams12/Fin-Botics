import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Bell, 
  Search, 
  Settings, 
  LogOut, 
  User, 
  Menu,
  Bot,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useThemeContext } from '../../context/ThemeContext';

const Header = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { toggleSidebar } = useThemeContext();
  
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const profileDropdownRef = useRef(null);
  const notificationDropdownRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
      if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const notifications = [
    {
      id: 1,
      title: 'Quarterly taxes due soon',
      message: 'Your Q1 2024 taxes are due in 5 days',
      time: '2 hours ago',
      type: 'warning',
      unread: true
    },
    {
      id: 2,
      title: 'Expense report generated',
      message: 'Your March expense report is ready',
      time: '1 day ago',
      type: 'success',
      unread: true
    },
    {
      id: 3,
      title: 'Receipt needs review',
      message: 'Office supplies receipt from 3/15',
      time: '2 days ago',
      type: 'info',
      unread: false
    }
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="bg-white border-b border-gray-200 fixed top-0 right-0 left-0 z-40">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left Side */}
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button */}
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>

          {/* Logo (mobile) */}
          <Link to="/dashboard" className="lg:hidden flex items-center space-x-2">
            <Bot className="w-6 h-6 text-primary-600" />
            <span className="text-lg font-bold text-gray-900">CPA AI Bot</span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:block">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search expenses, reports, or ask AI..."
                className="w-96 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
          </form>
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-4">
          {/* Mobile Search Button */}
          <button className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <Search className="w-5 h-5 text-gray-600" />
          </button>

          {/* Quick Add Button */}
          <Link
            to="/expenses?action=create"
            className="btn btn-primary btn-sm hidden sm:inline-flex"
          >
            Add Expense
          </Link>

          {/* Notifications */}
          <div className="relative" ref={notificationDropdownRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-hard border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                    {unreadCount > 0 && (
                      <button className="text-sm text-primary-600 hover:text-primary-700">
                        Mark all read
                      </button>
                    )}
                  </div>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 cursor-pointer ${
                        notification.unread ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          notification.type === 'warning' ? 'bg-yellow-500' :
                          notification.type === 'success' ? 'bg-green-500' :
                          'bg-blue-500'
                        }`} />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">
                            {notification.title}
                          </p>
                          <p className="text-gray-600 text-sm mt-1">
                            {notification.message}
                          </p>
                          <p className="text-gray-500 text-xs mt-2">
                            {notification.time}
                          </p>
                        </div>
                        {notification.unread && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-gray-200">
                  <Link
                    to="/notifications"
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                    onClick={() => setShowNotifications(false)}
                  >
                    View all notifications
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileDropdownRef}>
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                {user?.first_name?.charAt(0) || 'U'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-900">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.business_name || user?.email}
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>

            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-hard border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-medium">
                      {user?.first_name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {user?.first_name} {user?.last_name}
                      </p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>
                  </div>
                </div>
                
                <div className="py-2">
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowProfileDropdown(false)}
                  >
                    <User className="w-4 h-4 mr-3" />
                    Profile Settings
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowProfileDropdown(false)}
                  >
                    <Settings className="w-4 h-4 mr-3" />
                    Account Settings
                  </Link>
                </div>
                
                <div className="border-t border-gray-200 py-2">
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;