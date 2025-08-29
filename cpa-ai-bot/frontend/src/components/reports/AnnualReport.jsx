import React, { useState, useMemo } from 'react';
import { Calendar, Download, TrendingUp, TrendingDown, Target, Award } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { reportService } from '../../services/reportService';
import { useExpenses } from '../../hooks/useExpenses';

const AnnualReport = () => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [isDownloading, setIsDownloading] = useState(false);

  // Get all expenses (no filters to get full dataset)
  const { expenses: allExpenses } = useExpenses({});

  // Calculate annual data from real expenses
  const annualData = useMemo(() => {
    // Filter expenses for selected year
    const yearExpenses = allExpenses.filter(expense => {
      const expenseYear = new Date(expense.date).getFullYear();
      return expenseYear === selectedYear;
    });

    console.log(`Calculating annual data for ${selectedYear}:`, yearExpenses.length, 'expenses');

    // Calculate totals
    const totalExpenses = yearExpenses.reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);
    
    // For income, we'll need to estimate or get from a separate source
    // For now, assuming a profit margin to calculate estimated income
    const estimatedIncome = totalExpenses * 1.43; // Assuming 30% profit margin
    const netProfit = estimatedIncome - totalExpenses;
    const profitMargin = estimatedIncome > 0 ? netProfit / estimatedIncome : 0;

    // Calculate category breakdown
    const categoryBreakdown = yearExpenses.reduce((acc, expense) => {
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
      growth: 0.1 // We'd need historical data to calculate real growth
    })).sort((a, b) => b.amount - a.amount);

    // Calculate quarterly data
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
    const quarterlyData = quarters.map((quarter, index) => {
      const startMonth = index * 3;
      const endMonth = startMonth + 2;
      
      const quarterExpenses = yearExpenses.filter(expense => {
        const expenseMonth = new Date(expense.date).getMonth();
        return expenseMonth >= startMonth && expenseMonth <= endMonth;
      });
      
      const quarterTotalExpenses = quarterExpenses.reduce((sum, expense) => 
        sum + (parseFloat(expense.amount) || 0), 0);
      const quarterIncome = quarterTotalExpenses * 1.43; // Estimated based on profit margin
      const quarterProfit = quarterIncome - quarterTotalExpenses;
      
      return {
        quarter,
        income: quarterIncome,
        expenses: quarterTotalExpenses,
        profit: quarterProfit
      };
    });

    // Calculate tax estimation (simplified)
    const taxableIncome = Math.max(0, netProfit);
    const estimatedTaxes = taxableIncome * 0.25; // Simplified 25% tax rate

    // Calculate some basic achievements
    const achievements = [
      { 
        title: 'Total Expenses', 
        value: formatCurrency(totalExpenses), 
        description: `Tracked ${yearExpenses.length} transactions` 
      },
      { 
        title: 'Profit Margin', 
        value: formatPercentage(profitMargin), 
        description: 'Estimated margin' 
      },
      { 
        title: 'Categories Tracked', 
        value: categories.length.toString(), 
        description: 'Expense categories' 
      },
      { 
        title: 'Avg Monthly', 
        value: formatCurrency(totalExpenses / 12), 
        description: 'Monthly expenses' 
      },
    ];

    return {
      totalExpenses,
      totalIncome: estimatedIncome,
      netProfit,
      profitMargin,
      taxableIncome,
      estimatedTaxes,
      quarterlyData,
      categories,
      achievements,
      expenseCount: yearExpenses.length
    };
  }, [allExpenses, selectedYear]);

  const handleDownload = async () => {
    if (isDownloading) return;
    
    setIsDownloading(true);
    try {
      console.log('Starting annual report download...');
      
      const start_date = `${selectedYear}-01-01`;
      const end_date = `${selectedYear}-12-31`;
      
      await reportService.downloadReport('financial_summary', 'pdf', {
        start_date,
        end_date
      });
      
      console.log('Annual report download completed successfully');
      
    } catch (error) {
      console.error('Annual report download failed:', error);
      alert('Failed to download annual report. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Annual Report</h2>
          <p className="text-gray-600">
            Comprehensive year-end financial summary for {selectedYear} 
            ({annualData.expenseCount} transactions)
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
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

      {/* Executive Summary */}
      <Card title="Executive Summary">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(annualData.totalIncome)}</p>
            <p className="text-sm text-gray-600">Total Revenue</p>
            <p className="text-xs text-gray-500 mt-1">Estimated</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingDown className="w-8 h-8 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(annualData.totalExpenses)}</p>
            <p className="text-sm text-gray-600">Total Expenses</p>
            <p className="text-xs text-green-600 mt-1">{annualData.expenseCount} transactions</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Target className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(annualData.netProfit)}</p>
            <p className="text-sm text-gray-600">Net Profit</p>
            <p className="text-xs text-blue-600 mt-1">
              {formatPercentage(annualData.profitMargin)} margin
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Award className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(annualData.estimatedTaxes)}</p>
            <p className="text-sm text-gray-600">Estimated Taxes</p>
            <p className="text-xs text-purple-600 mt-1">
              {formatPercentage(annualData.taxableIncome > 0 ? annualData.estimatedTaxes / annualData.taxableIncome : 0)} rate
            </p>
          </div>
        </div>
      </Card>

      {/* Quarterly Performance */}
      <Card title="Quarterly Performance">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {annualData.quarterlyData.map((quarter, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">{quarter.quarter} {selectedYear}</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Income:</span>
                  <span className="font-medium">{formatCurrency(quarter.income)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Expenses:</span>
                  <span className="font-medium">{formatCurrency(quarter.expenses)}</span>
                </div>
                <div className="flex justify-between text-sm border-t pt-2">
                  <span className="text-gray-600">Profit:</span>
                  <span className="font-semibold text-green-600">{formatCurrency(quarter.profit)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Key Achievements */}
      <Card title="Key Achievements">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {annualData.achievements.map((achievement, index) => (
            <div key={index} className="text-center p-4 border border-gray-200 rounded-lg">
              <p className="text-2xl font-bold text-primary-600 mb-1">{achievement.value}</p>
              <p className="font-medium text-gray-900 mb-2">{achievement.title}</p>
              <p className="text-sm text-gray-600">{achievement.description}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Expense Analysis */}
      <Card title="Annual Expense Breakdown">
        {annualData.categories.length > 0 ? (
          <div className="space-y-4">
            {annualData.categories.map((category, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">{category.name}</span>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-600">{formatCurrency(category.amount)}</span>
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
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
            No expenses found for {selectedYear}. Start adding expenses to see your breakdown.
          </div>
        )}
      </Card>

      {/* Tax Summary */}
      <Card title="Tax Summary">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Income Summary</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Estimated Income:</span>
                <span className="text-sm font-medium">{formatCurrency(annualData.totalIncome)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Business Expenses:</span>
                <span className="text-sm font-medium">-{formatCurrency(annualData.totalExpenses)}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-sm font-medium text-gray-900">Taxable Income:</span>
                <span className="text-sm font-semibold">{formatCurrency(annualData.taxableIncome)}</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Tax Obligations</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Federal Tax:</span>
                <span className="text-sm font-medium">{formatCurrency(annualData.estimatedTaxes * 0.7)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">State Tax:</span>
                <span className="text-sm font-medium">{formatCurrency(annualData.estimatedTaxes * 0.2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Self-Employment:</span>
                <span className="text-sm font-medium">{formatCurrency(annualData.estimatedTaxes * 0.1)}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-sm font-medium text-gray-900">Total Estimated:</span>
                <span className="text-sm font-semibold">{formatCurrency(annualData.estimatedTaxes)}</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">After-Tax Summary</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Net Profit:</span>
                <span className="text-sm font-medium">{formatCurrency(annualData.netProfit)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Estimated Taxes:</span>
                <span className="text-sm font-medium">-{formatCurrency(annualData.estimatedTaxes)}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-sm font-medium text-gray-900">After-Tax Profit:</span>
                <span className="text-sm font-semibold text-green-600">
                  {formatCurrency(annualData.netProfit - annualData.estimatedTaxes)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Recommendations */}
      <Card title="Recommendations for Next Year">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Growth Opportunities</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Track income data to get accurate profit calculations</li>
              <li>• {annualData.categories[0]?.name} is your largest expense category</li>
              <li>• Consider setting up monthly budgets for better control</li>
              <li>• Q4 typically shows different spending patterns - plan accordingly</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Cost Optimization</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Review high-expense categories for optimization opportunities</li>
              <li>• Set up expense alerts for categories exceeding budgets</li>
              <li>• Consider bulk purchasing for recurring expenses</li>
              <li>• Use tax planning strategies throughout the year</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AnnualReport;