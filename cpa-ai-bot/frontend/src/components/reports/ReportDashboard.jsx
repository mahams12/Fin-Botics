import React, { useState } from 'react';
import { FileText, Download, Calendar, TrendingUp, DollarSign, Calculator } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import MonthlyReport from './MonthlyReport';
import AnnualReport from './AnnualReport';
import TaxEstimation from './TaxEstimation';
import IncomeChart from './Charts/IncomeChart';
import ExpenseChart from './Charts/ExpenseChart';
import { DATE_RANGES, REPORT_TYPES } from '../../utils/constants';
import { reportService } from '../../services/reportService';
import toast from 'react-hot-toast';

const ReportDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  // Removed dateRange and reportType state variables since filters are removed
  // Set default values for any functions that still need them
  const dateRange = 'this_year'; // Default to this year
  const reportType = 'financial_summary'; // Default to financial summary
  const [isExporting, setIsExporting] = useState(false);
  const [isGenerating, setIsGenerating] = useState({});

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'monthly', label: 'Monthly Reports', icon: Calendar },
    { id: 'annual', label: 'Annual Reports', icon: FileText },
    { id: 'tax', label: 'Tax Estimation', icon: Calculator },
  ];

  // Handle export functionality
  const handleExport = async (format = 'csv') => {
    setIsExporting(true);
    try {
      console.log(`Starting ${format.toUpperCase()} export...`);
      
      // Convert dateRange to actual date values
      const dateParams = getDateRangeParams(dateRange);
      
      // Use direct download method instead of generate + export
      await reportService.downloadReport(reportType, format, dateParams);
      toast.success(`${format.toUpperCase()} download completed successfully!`);
      
    } catch (error) {
      console.error('Export failed:', error);
      toast.error(`Failed to export ${format.toUpperCase()}. Please try again.`);
    } finally {
      setIsExporting(false);
    }
  };

  // Generate quick reports with proper error handling
  const generateQuickReport = async (reportType) => {
    setIsGenerating(prev => ({ ...prev, [reportType]: true }));
    
    try {
      const dateParams = getDateRangeParams(dateRange);

      // Use direct download instead of generate + export
      switch (reportType) {
        case 'profit_loss':
          await reportService.downloadReport('profit-loss', 'pdf', dateParams);
          toast.success('Profit & Loss report downloaded successfully!');
          break;
        case 'tax_report':
          await reportService.downloadReport('financial-summary', 'pdf', dateParams);
          toast.success('Tax preparation report downloaded successfully!');
          break;
        case 'expense_analysis':
          await reportService.downloadReport('expense-analysis', 'pdf', dateParams);
          toast.success('Expense analysis report downloaded successfully!');
          break;
        case 'cash_flow':
          await reportService.downloadReport('cash-flow', 'pdf', dateParams);
          toast.success('Cash flow report downloaded successfully!');
          break;
        default:
          throw new Error('Unknown report type');
      }
    } catch (error) {
      console.error(`Error generating ${reportType}:`, error);
      toast.error(`Failed to generate ${reportType.replace('_', ' ')} report. Please try again.`);
    } finally {
      setIsGenerating(prev => ({ ...prev, [reportType]: false }));
    }
  };

  // Helper function to convert dateRange to API params
  const getDateRangeParams = (range) => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    switch (range) {
      case 'this_month':
        return {
          start_date: new Date(currentYear, currentMonth, 1).toISOString(),
          end_date: new Date(currentYear, currentMonth + 1, 0).toISOString(),
        };
      case 'last_month':
        return {
          start_date: new Date(currentYear, currentMonth - 1, 1).toISOString(),
          end_date: new Date(currentYear, currentMonth, 0).toISOString(),
        };
      case 'this_quarter':
        const quarterStart = Math.floor(currentMonth / 3) * 3;
        return {
          start_date: new Date(currentYear, quarterStart, 1).toISOString(),
          end_date: new Date(currentYear, quarterStart + 3, 0).toISOString(),
        };
      case 'this_year':
        return {
          start_date: new Date(currentYear, 0, 1).toISOString(),
          end_date: new Date(currentYear, 11, 31).toISOString(),
        };
      case 'last_year':
        return {
          start_date: new Date(currentYear - 1, 0, 1).toISOString(),
          end_date: new Date(currentYear - 1, 11, 31).toISOString(),
        };
      default:
        return {
          start_date: new Date(currentYear, 0, 1).toISOString(),
          end_date: new Date(currentYear, 11, 31).toISOString(),
        };
    }
  };

  const quickReports = [
    {
      title: 'Profit & Loss Statement',
      description: 'Summary of revenues and expenses',
      icon: TrendingUp,
      color: 'bg-blue-500',
      type: 'profit_loss',
      action: () => generateQuickReport('profit_loss'),
    },
    {
      title: 'Tax Preparation Report',
      description: 'Ready-to-file tax documents',
      icon: FileText,
      color: 'bg-green-500',
      type: 'tax_report',
      action: () => generateQuickReport('tax_report'),
    },
    {
      title: 'Expense Analysis',
      description: 'Detailed breakdown by category',
      icon: DollarSign,
      color: 'bg-purple-500',
      type: 'expense_analysis',
      action: () => generateQuickReport('expense_analysis'),
    },
    {
      title: 'Cash Flow Report',
      description: 'Track money in and out',
      icon: Calendar,
      color: 'bg-orange-500',
      type: 'cash_flow',
      action: () => generateQuickReport('cash_flow'),
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card title="Quick Reports">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickReports.map((report, index) => {
                  const Icon = report.icon;
                  const isLoading = isGenerating[report.type];
                  
                  return (
                    <div
                      key={index}
                      className={`flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors cursor-pointer ${
                        isLoading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      onClick={isLoading ? undefined : report.action}
                    >
                      <div className={`w-10 h-10 ${report.color} rounded-lg flex items-center justify-center text-white mr-4`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{report.title}</h3>
                        <p className="text-sm text-gray-600">{report.description}</p>
                      </div>
                      {isLoading && (
                        <div className="ml-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card title="Income vs Expenses">
                <IncomeChart dateRange={dateRange} />
              </Card>
              <Card title="Expense Breakdown">
                <ExpenseChart dateRange={dateRange} />
              </Card>
            </div>
          </div>
        );
      case 'monthly':
        return <MonthlyReport />;
      case 'annual':
        return <AnnualReport />;
      case 'tax':
        return <TaxEstimation />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Generate insights and reports for your business</p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Removed the two dropdown filters */}
          <div className="relative">
            <Button 
              variant="outline" 
              onClick={() => handleExport('csv')}
              disabled={isExporting}
            >
              <Download className="w-4 h-4 mr-2" />
              {isExporting ? 'Exporting...' : 'Export'}
            </Button>
            
            {/* Export dropdown menu (optional enhancement) */}
            <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <button
                onClick={() => handleExport('csv')}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                disabled={isExporting}
              >
                Export CSV
              </button>
              <button
                onClick={() => handleExport('excel')}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                disabled={isExporting}
              >
                Export Excel
              </button>
              <button
                onClick={() => handleExport('pdf')}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                disabled={isExporting}
              >
                Export PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default ReportDashboard;