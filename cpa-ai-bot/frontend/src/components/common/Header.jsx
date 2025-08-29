import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
import ExpenseForm from '../expenses/ExpenseForm';
import toast from 'react-hot-toast';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { toggleSidebar } = useThemeContext();
  
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [profileImageKey, setProfileImageKey] = useState(0);
  const [showExpenseForm, setShowExpenseForm] = useState(false); // Add expense form state
  
  const profileDropdownRef = useRef(null);
  const notificationDropdownRef = useRef(null);

  // Get notifications from localStorage or use defaults
  const getNotifications = () => {
    const saved = localStorage.getItem('notifications');
    const defaultNotifications = [
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
    
    return saved ? JSON.parse(saved) : defaultNotifications;
  };

  const [notifications, setNotifications] = useState(getNotifications);

  // Update notifications when localStorage changes (from NotificationsPage)
  useEffect(() => {
    const handleStorageChange = () => {
      setNotifications(getNotifications());
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events from the same tab
    const handleNotificationUpdate = () => {
      setNotifications(getNotifications());
    };
    
    window.addEventListener('notificationsUpdated', handleNotificationUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('notificationsUpdated', handleNotificationUpdate);
    };
  }, []);

  // Force re-render when user profile picture changes
  useEffect(() => {
    setProfileImageKey(prev => prev + 1);
  }, [user?.profile_picture]);

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

  const handleMarkAllAsRead = () => {
    const updatedNotifications = notifications.map(notification => ({
      ...notification,
      unread: false
    }));
    
    setNotifications(updatedNotifications);
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
    
    // Trigger event for other components
    window.dispatchEvent(new Event('notificationsUpdated'));
    
    toast.success('All notifications marked as read');
  };

  const handleNotificationClick = (notificationId) => {
    const updatedNotifications = notifications.map(notification =>
      notification.id === notificationId 
        ? { ...notification, unread: false }
        : notification
    );
    
    setNotifications(updatedNotifications);
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
    
    // Trigger event for other components
    window.dispatchEvent(new Event('notificationsUpdated'));
  };

  // Handle Add Expense button click
  const handleAddExpenseClick = () => {
    setShowExpenseForm(true);
  };

  // Handle expense form close
  const handleExpenseFormClose = () => {
    setShowExpenseForm(false);
  };

  // Handle expense form success
  const handleExpenseFormSuccess = () => {
    setShowExpenseForm(false);
    toast.success('Expense added successfully!');
    
    // Trigger a custom event to notify other components about the new expense
    window.dispatchEvent(new CustomEvent('expenseAdded'));
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  // Get profile image with fallback
  const getProfileImage = () => {
    return user?.profile_picture;
  };

  // Get user initials
  const getUserInitials = () => {
    return user?.first_name?.charAt(0) || 'U';
  };

  // Check if current page is chat interface
  const isChatPage = location.pathname === '/chat';
  
  // Profile Avatar Component
  const ProfileAvatar = ({ size = 'w-8 h-8', textSize = 'text-sm' }) => {
    const profileImage = getProfileImage();
    
    if (profileImage) {
      return (
        <img
          key={`${profileImage}-${profileImageKey}`}
          src={profileImage}
          alt="Profile"
          className={`${size} rounded-full object-cover border-2 border-white shadow-sm`}
          onError={(e) => {
            console.error('Profile image failed to load:', profileImage);
          }}
        />
      );
    }
    
    return (
      <div 
        key={`initials-${user?.first_name || 'U'}-${profileImageKey}`}
        className={`${size} bg-primary-600 text-white rounded-full flex items-center justify-center ${textSize} font-medium`}
      >
        {getUserInitials()}
      </div>
    );
  };

  return (
    <>
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 fixed top-0 right-0 left-0 z-40">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Left Side */}
          <div className="flex items-center space-x-4">
            {/* Mobile Menu Button */}
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>

            {/* Logo (mobile) */}
            <Link to="/dashboard" className="lg:hidden flex items-center space-x-2">
              <Bot className="w-6 h-6 text-primary-600" />
              <span className="text-lg font-bold text-gray-900 dark:text-white">FinBotics</span>
            </Link>

            {/* Search Bar - CONDITIONAL POSITIONING */}
            <div className={`hidden md:block ${!isChatPage 
              ? 'absolute left-1/2 transform -translate-x-1/2 lg:left-72 lg:transform-none' 
              : ''
            }`}>
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search expenses, reports, or ask AI..."
                    className={`${!isChatPage ? 'w-80 lg:w-96' : 'w-96'} pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white`}
                  />
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                </div>
              </form>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Mobile Search Button */}
            <button className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <Search className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>

            {/* Quick Add Button - UPDATED TO WORK */}
            <button
              onClick={handleAddExpenseClick}
              className="btn btn-primary btn-sm hidden sm:inline-flex"
            >
              Add Expense
            </button>

            {/* Notifications */}
            <div className="relative" ref={notificationDropdownRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-hard border border-gray-200 dark:border-gray-700 z-50">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                      {unreadCount > 0 && (
                        <button 
                          onClick={handleMarkAllAsRead}
                          className="text-sm text-primary-600 hover:text-primary-700 transition-colors"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.slice(0, 5).map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification.id)}
                        className={`p-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                          notification.unread ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            notification.type === 'warning' ? 'bg-yellow-500' :
                            notification.type === 'success' ? 'bg-green-500' :
                            'bg-blue-500'
                          }`} />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white text-sm">
                              {notification.title}
                            </p>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                              {notification.message}
                            </p>
                            <p className="text-gray-500 dark:text-gray-500 text-xs mt-2">
                              {notification.time}
                            </p>
                          </div>
                          {notification.unread && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {notifications.length === 0 && (
                      <div className="p-8 text-center">
                        <Bell className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 dark:text-gray-400 text-sm">No notifications</p>
                      </div>
                    )}
                  </div>
                  <div className="p-4 border-t border-gray-200 dark:border-gray-600">
                    <Link
                      to="/notifications"
                      className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
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
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ProfileAvatar />
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.first_name} {user?.last_name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.business_name || user?.email}
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </button>

              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-hard border border-gray-200 dark:border-gray-700 z-50">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-600">
                    <div className="flex items-center space-x-3">
                      <ProfileAvatar size="w-10 h-10" textSize="text-base" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {user?.first_name} {user?.last_name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="py-2">
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setShowProfileDropdown(false)}
                    >
                      <User className="w-4 h-4 mr-3" />
                      Profile Settings
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setShowProfileDropdown(false)}
                    >
                      <Settings className="w-4 h-4 mr-3" />
                      Account Settings
                    </Link>
                  </div>
                  
                  <div className="border-t border-gray-200 dark:border-gray-600 py-2">
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
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

      {/* Expense Form Modal */}
      {showExpenseForm && (
        <ExpenseForm
          onClose={handleExpenseFormClose}
          onSuccess={handleExpenseFormSuccess}
        />
      )}
    </>
  );
};

export default Header;