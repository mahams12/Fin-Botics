import React, { useState, useMemo } from 'react';
import { Calendar, Download, TrendingUp, TrendingDown, Target, BarChart3 } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { reportService } from '../../services/reportService';
import { useExpenses } from '../../hooks/useExpenses';

const MonthlyReport = () => {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [isDownloading, setIsDownloading] = useState(false);

  // Get all expenses (no filters to get full dataset)
  const { expenses: allExpenses } = useExpenses({});

  // Calculate monthly data from real expenses
  const monthlyData = useMemo(() => {
    // Filter expenses for selected month/year
    const monthExpenses = allExpenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() + 1 === selectedMonth && 
             expenseDate.getFullYear() === selectedYear;
    });

    // Get previous month expenses for comparison
    const prevMonth = selectedMonth === 1 ? 12 : selectedMonth - 1;
    const prevYear = selectedMonth === 1 ? selectedYear - 1 : selectedYear;
    const prevMonthExpenses = allExpenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() + 1 === prevMonth && 
             expenseDate.getFullYear() === prevYear;
    });

    console.log(`Calculating monthly data for ${selectedMonth}/${selectedYear}:`, monthExpenses.length, 'expenses');

    // Calculate totals
    const totalExpenses = monthExpenses.reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);
    const prevTotalExpenses = prevMonthExpenses.reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);
    
    // Calculate growth compared to previous month
    const expenseGrowth = prevTotalExpenses > 0 ? (totalExpenses - prevTotalExpenses) / prevTotalExpenses : 0;

    // Estimate income (you might want to add income tracking)
    const estimatedIncome = totalExpenses * 1.43; // Assuming 30% profit margin
    const netProfit = estimatedIncome - totalExpenses;
    const profitMargin = estimatedIncome > 0 ? netProfit / estimatedIncome : 0;

    // Calculate category breakdown
    const categoryBreakdown = monthExpenses.reduce((acc, expense) => {
      const category = expense.category || 'Other';
      if (!acc[category]) {
        acc[category] = { amount: 0, count: 0 };
      }
      acc[category].amount += parseFloat(expense.amount) || 0;
      acc[category].count += 1;
      return acc;
    }, {});

    const categories = Object.entries(categoryBreakdown).map(([name, data]) => ({
      name,
      amount: data.amount,
      percentage: totalExpenses > 0 ? data.amount / totalExpenses : 0,
      count: data.count
    })).sort((a, b) => b.amount - a.amount);

    // Calculate daily breakdown
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const dailyData = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dayExpenses = monthExpenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getDate() === day;
      });
      
      const dayTotal = dayExpenses.reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);
      
      dailyData.push({
        day,
        date: `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
        amount: dayTotal,
        count: dayExpenses.length
      });
    }

    // Find top spending days
    const topSpendingDays = dailyData
      .filter(day => day.amount > 0)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // Calculate tax estimation for the month
    const monthlyTaxableIncome = Math.max(0, netProfit);
    const estimatedMonthlyTaxes = monthlyTaxableIncome * 0.25; // 25% tax rate

    return {
      totalExpenses,
      estimatedIncome,
      netProfit,
      profitMargin,
      expenseGrowth,
      estimatedTaxes: estimatedMonthlyTaxes,
      categories,
      dailyData,
      topSpendingDays,
      expenseCount: monthExpenses.length,
      averageDaily: totalExpenses / daysInMonth
    };
  }, [allExpenses, selectedMonth, selectedYear]);

  const handleDownload = async () => {
    if (isDownloading) return;
    
    setIsDownloading(true);
    try {
      console.log('Starting monthly report download...');
      
      await reportService.downloadMonthlyReport({
        month: selectedMonth,
        year: selectedYear,
        format: 'pdf'
      });
      
      console.log('Monthly report download completed successfully');
      
    } catch (error) {
      console.error('Monthly report download failed:', error);
      alert('Failed to download monthly report. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - i);

  const monthName = months[selectedMonth - 1];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Monthly Report</h2>
          <p className="text-gray-600">
            Financial summary for {monthName} {selectedYear} 
            ({monthlyData.expenseCount} transactions)
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="form-select"
          >
            {months.map((month, index) => (
              <option key={index} value={index + 1}>
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
            <Download className="w-4 h-4 mr-2" />
            {isDownloading ? 'Downloading...' : 'Download PDF'}
          </Button>
        </div>
      </div>

      {/* Monthly Overview */}
      <Card title="Monthly Overview">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(monthlyData.estimatedIncome)}</p>
            <p className="text-sm text-gray-600">Estimated Income</p>
            <p className="text-xs text-gray-500 mt-1">Based on profit margin</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingDown className="w-8 h-8 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(monthlyData.totalExpenses)}</p>
            <p className="text-sm text-gray-600">Total Expenses</p>
            <p className={`text-xs mt-1 ${monthlyData.expenseGrowth >= 0 ? 'text-red-600' : 'text-green-600'}`}>
              {monthlyData.expenseGrowth >= 0 ? '+' : ''}{formatPercentage(monthlyData.expenseGrowth)} vs last month
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Target className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(monthlyData.netProfit)}</p>
            <p className="text-sm text-gray-600">Net Profit</p>
            <p className="text-xs text-blue-600 mt-1">
              {formatPercentage(monthlyData.profitMargin)} margin
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <BarChart3 className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(monthlyData.averageDaily)}</p>
            <p className="text-sm text-gray-600">Avg Daily Spend</p>
            <p className="text-xs text-purple-600 mt-1">
              {monthlyData.expenseCount} transactions
            </p>
          </div>
        </div>
      </Card>

      {/* Top Spending Days */}
      {monthlyData.topSpendingDays.length > 0 && (
        <Card title="Top Spending Days">
          <div className="space-y-3">
            {monthlyData.topSpendingDays.map((day, index) => (
              <div key={day.day} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary-600">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {new Date(day.date).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </p>
                    <p className="text-sm text-gray-600">{day.count} transactions</p>
                  </div>
                </div>
                <p className="text-lg font-semibold text-gray-900">{formatCurrency(day.amount)}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Expense Categories */}
      <Card title="Monthly Expense Breakdown">
        {monthlyData.categories.length > 0 ? (
          <div className="space-y-4">
            {monthlyData.categories.map((category, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">{category.name}</span>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-600">{formatCurrency(category.amount)}</span>
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                        {category.count} items
                      </span>
                      <span className="text-sm text-gray-500 min-w-[3rem]">
                        {formatPercentage(category.percentage)}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ width: `${category.percentage * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No expenses found for {monthName} {selectedYear}. Start adding expenses to see your breakdown.
          </div>
        )}
      </Card>

      {/* Daily Spending Pattern */}
      <Card title="Daily Spending Pattern">
        <div className="space-y-4">
          {/* Simple bar chart representation */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs text-gray-500 pb-2">
                {day}
              </div>
            ))}
          </div>
          
          {/* Week rows */}
          <div className="space-y-2">
            {Array.from({ length: Math.ceil(monthlyData.dailyData.length / 7) }, (_, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7 gap-1">
                {Array.from({ length: 7 }, (_, dayIndex) => {
                  const dayDataIndex = weekIndex * 7 + dayIndex;
                  const dayData = monthlyData.dailyData[dayDataIndex];
                  
                  if (!dayData) {
                    return <div key={dayIndex} className="h-8"></div>;
                  }
                  
                  const intensity = Math.min(1, dayData.amount / Math.max(...monthlyData.dailyData.map(d => d.amount), 1));
                  const bgColor = dayData.amount > 0 
                    ? `rgba(59, 130, 246, ${0.1 + intensity * 0.7})` 
                    : 'transparent';
                  
                  return (
                    <div
                      key={dayIndex}
                      className="h-8 rounded flex items-center justify-center text-xs font-medium border border-gray-200 hover:border-primary-300 transition-colors cursor-pointer"
                      style={{ backgroundColor: bgColor }}
                      title={`${dayData.date}: ${formatCurrency(dayData.amount)} (${dayData.count} transactions)`}
                    >
                      {dayData.day}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          
          <div className="text-xs text-gray-500 mt-4">
            Hover over days to see spending details. Darker colors indicate higher spending.
          </div>
        </div>
      </Card>

      {/* Monthly Statistics */}
      <Card title="Monthly Statistics">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Spending Summary</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Expenses:</span>
                <span className="text-sm font-medium">{formatCurrency(monthlyData.totalExpenses)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Average Daily:</span>
                <span className="text-sm font-medium">{formatCurrency(monthlyData.averageDaily)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Transactions:</span>
                <span className="text-sm font-medium">{monthlyData.expenseCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Categories Used:</span>
                <span className="text-sm font-medium">{monthlyData.categories.length}</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Tax Information</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Estimated Income:</span>
                <span className="text-sm font-medium">{formatCurrency(monthlyData.estimatedIncome)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Business Expenses:</span>
                <span className="text-sm font-medium">-{formatCurrency(monthlyData.totalExpenses)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Net Profit:</span>
                <span className="text-sm font-medium">{formatCurrency(monthlyData.netProfit)}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-sm font-medium text-gray-900">Estimated Tax:</span>
                <span className="text-sm font-semibold">{formatCurrency(monthlyData.estimatedTaxes)}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Comparison with Previous Month */}
      <Card title="Month-over-Month Comparison">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Expense Change</p>
            <p className={`text-2xl font-bold ${monthlyData.expenseGrowth >= 0 ? 'text-red-600' : 'text-green-600'}`}>
              {monthlyData.expenseGrowth >= 0 ? '+' : ''}{formatPercentage(monthlyData.expenseGrowth)}
            </p>
            <p className="text-xs text-gray-500">vs previous month</p>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Top Category</p>
            <p className="text-lg font-bold text-gray-900">
              {monthlyData.categories[0]?.name || 'None'}
            </p>
            <p className="text-xs text-gray-500">
              {monthlyData.categories[0] ? formatCurrency(monthlyData.categories[0].amount) : 'No expenses'}
            </p>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Profit Margin</p>
            <p className="text-lg font-bold text-blue-600">
              {formatPercentage(monthlyData.profitMargin)}
            </p>
            <p className="text-xs text-gray-500">estimated</p>
          </div>
        </div>
      </Card>

      {/* Recommendations */}
      <Card title="Monthly Insights & Recommendations">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Key Insights</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                {monthlyData.expenseCount === 0 ? (
                  <li>• No expenses recorded for this month</li>
                ) : (
                  <>
                    <li>• You spent {formatCurrency(monthlyData.totalExpenses)} across {monthlyData.expenseCount} transactions</li>
                    <li>• Your highest spending category was {monthlyData.categories[0]?.name || 'None'}</li>
                    <li>• Average daily spending was {formatCurrency(monthlyData.averageDaily)}</li>
                    {monthlyData.topSpendingDays.length > 0 && (
                      <li>• Highest spending day: {formatCurrency(monthlyData.topSpendingDays[0]?.amount || 0)}</li>
                    )}
                  </>
                )}
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Recommendations</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                {monthlyData.expenseCount === 0 ? (
                  <>
                    <li>• Start tracking your expenses to get insights</li>
                    <li>• Use the "Add Expense" button to record transactions</li>
                  </>
                ) : (
                  <>
                    <li>• {monthlyData.expenseGrowth > 0.1 ? 'Consider reviewing expense increases' : 'Good expense control this month'}</li>
                    <li>• Track income data for accurate profit calculations</li>
                    <li>• Set monthly budgets for major expense categories</li>
                    <li>• Review high-spending days for optimization opportunities</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MonthlyReport;