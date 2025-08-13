import React, { useState } from 'react';
import { Calendar, Download, TrendingUp, TrendingDown, Target, Award } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { reportService } from '../../services/reportService'; // ADD THIS IMPORT

const AnnualReport = () => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [isDownloading, setIsDownloading] = useState(false); // ADD THIS STATE

  // Mock data - replace with actual API call
  const annualData = {
    totalExpenses: 156780.50,
    totalIncome: 224850.00,
    netProfit: 68069.50,
    expenseGrowth: 0.18,
    incomeGrowth: 0.23,
    profitMargin: 0.303,
    taxableIncome: 65420.00,
    estimatedTaxes: 16355.00,
    quarterlyData: [
      { quarter: 'Q1', income: 52450.00, expenses: 38920.50, profit: 13529.50 },
      { quarter: 'Q2', income: 58750.00, expenses: 41280.75, profit: 17469.25 },
      { quarter: 'Q3', income: 56320.00, expenses: 39450.25, profit: 16869.75 },
      { quarter: 'Q4', income: 57330.00, expenses: 37129.00, profit: 20201.00 },
    ],
    monthlyTrends: [
      { month: 'Jan', income: 18200, expenses: 12450 },
      { month: 'Feb', income: 16800, expenses: 13120 },
      { month: 'Mar', income: 17450, expenses: 13350 },
      { month: 'Apr', income: 19200, expenses: 13780 },
      { month: 'May', income: 19800, expenses: 13850 },
      { month: 'Jun', income: 19750, expenses: 13650 },
      { month: 'Jul', income: 18900, expenses: 13200 },
      { month: 'Aug', income: 18720, expenses: 13150 },
      { month: 'Sep', income: 18700, expenses: 13100 },
      { month: 'Oct', income: 19100, expenses: 12400 },
      { month: 'Nov', income: 19150, expenses: 12350 },
      { month: 'Dec', income: 19080, expenses: 12379 },
    ],
    categories: [
      { name: 'Office & Administrative', amount: 18560.00, percentage: 0.118, growth: 0.15 },
      { name: 'Travel & Transportation', amount: 24780.00, percentage: 0.158, growth: 0.22 },
      { name: 'Meals & Entertainment', amount: 12450.00, percentage: 0.079, growth: -0.05 },
      { name: 'Equipment & Technology', amount: 28920.00, percentage: 0.184, growth: 0.35 },
      { name: 'Software & Subscriptions', amount: 15680.00, percentage: 0.100, growth: 0.18 },
      { name: 'Marketing & Advertising', amount: 22150.00, percentage: 0.141, growth: 0.28 },
      { name: 'Professional Services', amount: 19840.00, percentage: 0.127, growth: 0.12 },
      { name: 'Other', amount: 14400.50, percentage: 0.092, growth: 0.08 },
    ],
    achievements: [
      { title: 'Revenue Growth', value: '23%', description: 'Exceeded target of 20%' },
      { title: 'Profit Margin', value: '30.3%', description: 'Above industry average' },
      { title: 'Cost Efficiency', value: '8.5%', description: 'Reduced operational costs' },
      { title: 'Tax Savings', value: '$4,250', description: 'Through optimization' },
    ],
  };

  // REPLACE THE OLD handleDownload FUNCTION WITH THIS:
  const handleDownload = async () => {
    if (isDownloading) return;
    
    setIsDownloading(true);
    try {
      console.log('🔧 Starting annual report download...');
      
      // Create date range for the selected year
      const start_date = `${selectedYear}-01-01`;
      const end_date = `${selectedYear}-12-31`;
      
      // Use the downloadReport method for annual reports
      await reportService.downloadReport('financial_summary', 'pdf', {
        start_date,
        end_date
      });
      
      console.log('✅ Annual report download completed successfully');
      
    } catch (error) {
      console.error('❌ Annual report download failed:', error);
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
          <p className="text-gray-600">Comprehensive year-end financial summary for {selectedYear}</p>
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
          
          {/* UPDATE THE BUTTON WITH LOADING STATE */}
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
            <p className="text-xs text-green-600 mt-1">
              +{formatPercentage(annualData.incomeGrowth)} YoY
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingDown className="w-8 h-8 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(annualData.totalExpenses)}</p>
            <p className="text-sm text-gray-600">Total Expenses</p>
            <p className="text-xs text-red-600 mt-1">
              +{formatPercentage(annualData.expenseGrowth)} YoY
            </p>
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
              {formatPercentage(annualData.estimatedTaxes / annualData.taxableIncome)} rate
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
        <div className="space-y-4">
          {annualData.categories.map((category, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">{category.name}</span>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600">{formatCurrency(category.amount)}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      category.growth >= 0 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {category.growth >= 0 ? '+' : ''}{formatPercentage(category.growth)}
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
              <span className="ml-4 text-sm text-gray-500 min-w-[3rem]">
                {formatPercentage(category.percentage)}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Tax Summary */}
      <Card title="Tax Summary">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Income Summary</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Gross Income:</span>
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
              <li>• Consider investing in marketing to maintain 23% growth rate</li>
              <li>• Equipment category shows strong ROI - plan for expansion</li>
              <li>• Q4 showed strongest performance - analyze seasonal factors</li>
              <li>• Professional services investment yielded good returns</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Cost Optimization</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Review meal & entertainment expenses (-5% suggests over-cutting)</li>
              <li>• Software subscriptions growing fast - audit for unused services</li>
              <li>• Travel expenses up 22% - evaluate cost vs. business value</li>
              <li>• Consider tax planning strategies to reduce effective rate</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AnnualReport;