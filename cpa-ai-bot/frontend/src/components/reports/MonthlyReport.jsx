import React, { useState } from 'react';
import { Calendar, Download, TrendingUp, TrendingDown } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { getMonthNames } from '../../utils/dateUtils';
import { reportService } from '../../services/reportService';

const MonthlyReport = () => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(null);

  // Mock data - replace with actual API call
  const monthlyData = {
    totalExpenses: 12450.50,
    totalIncome: 18750.00,
    netProfit: 6299.50,
    expenseGrowth: 0.12,
    incomeGrowth: 0.08,
    profitMargin: 0.336,
    categories: [
      { name: 'Office Supplies', amount: 1250.00, percentage: 0.10 },
      { name: 'Travel', amount: 2100.00, percentage: 0.17 },
      { name: 'Meals & Entertainment', amount: 850.00, percentage: 0.07 },
      { name: 'Equipment', amount: 3200.00, percentage: 0.26 },
      { name: 'Software', amount: 1890.00, percentage: 0.15 },
      { name: 'Marketing', amount: 1560.00, percentage: 0.13 },
      { name: 'Other', amount: 1600.50, percentage: 0.12 },
    ],
    dailyExpenses: [
      { date: '2024-03-01', amount: 450.00 },
      { date: '2024-03-02', amount: 120.00 },
      { date: '2024-03-03', amount: 0 },
      { date: '2024-03-04', amount: 890.00 },
      { date: '2024-03-05', amount: 234.50 },
      // ... more daily data
    ]
  };

  const handleDownload = async () => {
    if (isDownloading) return;

    setIsDownloading(true);
    setDownloadError(null);

    try {
      // Format dates for API
      const startDate = `${selectedYear}-${(selectedMonth + 1).toString().padStart(2, '0')}-01`;
      const endDate = new Date(selectedYear, selectedMonth + 1, 0).toISOString().split('T')[0];

      console.log(`🔧 Downloading monthly report for ${selectedMonth + 1}/${selectedYear}`);
      
      // Call the download service
      await reportService.downloadMonthlyReport({
        month: selectedMonth + 1,
        year: selectedYear,
        start_date: startDate,
        end_date: endDate
      });

      console.log('✅ Download completed successfully');
      
    } catch (error) {
      console.error('❌ Download failed:', error);
      setDownloadError('Failed to download report. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const months = getMonthNames();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Monthly Report</h2>
          <p className="text-gray-600">
            {months[selectedMonth]} {selectedYear}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="form-select"
          >
            {months.map((month, index) => (
              <option key={index} value={index}>
                {month}
              </option>
            ))}
          </select>
          
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="form-select"
          >
            {years.map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          
          <Button 
            onClick={handleDownload} 
            variant="outline"
            disabled={isDownloading}
          >
            <Download className={`w-4 h-4 mr-2 ${isDownloading ? 'animate-spin' : ''}`} />
            {isDownloading ? 'Downloading...' : 'Download'}
          </Button>
        </div>
      </div>

      {/* Error message */}
      {downloadError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600 text-sm">{downloadError}</p>
        </div>
      )}

      {/* Rest of your existing component stays the same */}
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(monthlyData.totalExpenses)}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">
              {formatPercentage(monthlyData.expenseGrowth)} from last month
            </span>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Income</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(monthlyData.totalIncome)}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">
              {formatPercentage(monthlyData.incomeGrowth)} from last month
            </span>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Net Profit</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(monthlyData.netProfit)}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">
              Margin: {formatPercentage(monthlyData.profitMargin)}
            </span>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Daily Expense</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(monthlyData.totalExpenses / 31)}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-sm text-gray-600">
              Based on 31 days
            </span>
          </div>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card title="Expense Breakdown by Category">
        <div className="space-y-4">
          {monthlyData.categories.map((category, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">
                    {category.name}
                  </span>
                  <span className="text-sm text-gray-600">
                    {formatCurrency(category.amount)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full"
                    style={{ width: `${category.percentage * 100}%` }}
                  />
                </div>
              </div>
              <span className="ml-4 text-sm text-gray-500 min-w-[3rem]">
                {formatPercentage(category.percentage)}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Key Insights */}
      <Card title="Key Insights">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Top Spending Categories</h4>
            <div className="space-y-2">
              {monthlyData.categories.slice(0, 3).map((category, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-900">{category.name}</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(category.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Financial Health</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Profit Margin</span>
                <span className="text-sm font-medium text-green-600">
                  {formatPercentage(monthlyData.profitMargin)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Expense Ratio</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatPercentage(monthlyData.totalExpenses / monthlyData.totalIncome)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Growth Rate</span>
                <span className="text-sm font-medium text-blue-600">
                  {formatPercentage(monthlyData.incomeGrowth)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MonthlyReport;