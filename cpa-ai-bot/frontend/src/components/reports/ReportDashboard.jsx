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

const ReportDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('this_year');
  const [reportType, setReportType] = useState('financial_summary');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'monthly', label: 'Monthly Reports', icon: Calendar },
    { id: 'annual', label: 'Annual Reports', icon: FileText },
    { id: 'tax', label: 'Tax Estimation', icon: Calculator },
  ];

  const quickReports = [
    {
      title: 'Profit & Loss Statement',
      description: 'Summary of revenues and expenses',
      icon: TrendingUp,
      color: 'bg-blue-500',
      action: () => console.log('Generate P&L'),
    },
    {
      title: 'Tax Preparation Report',
      description: 'Ready-to-file tax documents',
      icon: FileText,
      color: 'bg-green-500',
      action: () => console.log('Generate Tax Report'),
    },
    {
      title: 'Expense Analysis',
      description: 'Detailed breakdown by category',
      icon: DollarSign,
      color: 'bg-purple-500',
      action: () => console.log('Generate Expense Analysis'),
    },
    {
      title: 'Cash Flow Report',
      description: 'Track money in and out',
      icon: Calendar,
      color: 'bg-orange-500',
      action: () => console.log('Generate Cash Flow'),
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
                  return (
                    <div
                      key={index}
                      className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors cursor-pointer"
                      onClick={report.action}
                    >
                      <div className={`w-10 h-10 ${report.color} rounded-lg flex items-center justify-center text-white mr-4`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{report.title}</h3>
                        <p className="text-sm text-gray-600">{report.description}</p>
                      </div>
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
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="form-select"
          >
            {DATE_RANGES.map(range => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
          
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
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