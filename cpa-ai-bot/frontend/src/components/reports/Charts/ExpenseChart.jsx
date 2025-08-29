import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { formatCurrency, formatPercentage } from '../../../utils/formatters';

const ExpenseChart = ({ dateRange = 'this_year' }) => {
  const [chartType, setChartType] = useState('pie'); // 'pie' or 'bar'

  // Define colors directly in the component
  const CHART_COLORS = [
    '#3B82F6', // blue
    '#10B981', // emerald
    '#F59E0B', // amber
    '#EF4444', // red
    '#8B5CF6', // violet
    '#06B6D4', // cyan
    '#F97316', // orange
    '#84CC16', // lime
    '#EC4899', // pink
    '#6B7280'  // gray
  ];

  // Mock data - replace with actual API call based on dateRange
  const expenseData = [
    { category: 'Office Supplies', amount: 12450, percentage: 0.118, icon: '📝' },
    { category: 'Travel', amount: 18750, percentage: 0.178, icon: '✈️' },
    { category: 'Meals & Entertainment', amount: 8920, percentage: 0.085, icon: '🍽️' },
    { category: 'Equipment', amount: 22100, percentage: 0.210, icon: '💻' },
    { category: 'Software', amount: 9680, percentage: 0.092, icon: '📱' },
    { category: 'Marketing', amount: 15200, percentage: 0.144, icon: '📢' },
    { category: 'Professional Services', amount: 11250, percentage: 0.107, icon: '⚖️' },
    { category: 'Other', amount: 6950, percentage: 0.066, icon: '📊' },
  ];

  const monthlyTrends = [
    { month: 'Jan', amount: 8920 },
    { month: 'Feb', amount: 9150 },
    { month: 'Mar', amount: 8750 },
    { month: 'Apr', amount: 9280 },
    { month: 'May', amount: 9850 },
    { month: 'Jun', amount: 9650 },
    { month: 'Jul', amount: 8900 },
    { month: 'Aug', amount: 8720 },
    { month: 'Sep', amount: 8700 },
    { month: 'Oct', amount: 9100 },
    { month: 'Nov', amount: 9150 },
    { month: 'Dec', amount: 9080 },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-soft">
          <div className="flex items-center space-x-2 mb-2">
            {data.icon && <span className="text-lg">{data.icon}</span>}
            <p className="font-medium text-gray-900">{data.category || label}</p>
          </div>
          <p className="text-sm text-gray-600">
            Amount: <span className="font-medium">{formatCurrency(data.amount || payload[0].value)}</span>
          </p>
          {data.percentage && (
            <p className="text-sm text-gray-600">
              Percentage: <span className="font-medium">{formatPercentage(data.percentage)}</span>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null; // Don't show labels for slices smaller than 5%
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {formatPercentage(percent)}
      </text>
    );
  };

  const renderPieChart = () => (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={expenseData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={CustomLabel}
          outerRadius={120}
          innerRadius={40}
          paddingAngle={2}
          dataKey="amount"
        >
          {expenseData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={CHART_COLORS[index % CHART_COLORS.length]} 
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          verticalAlign="bottom" 
          height={36}
          iconType="circle"
          wrapperStyle={{ fontSize: '12px', color: '#6b7280' }}
          formatter={(value, entry) => (
            <span style={{ color: entry.color }}>
              {entry.payload.icon} {value}
            </span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );

  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={expenseData}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="category"
          tick={{ fontSize: 10, fill: '#6b7280' }}
          axisLine={{ stroke: '#e5e7eb' }}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis 
          tick={{ fontSize: 12, fill: '#6b7280' }}
          axisLine={{ stroke: '#e5e7eb' }}
          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar 
          dataKey="amount" 
          radius={[4, 4, 0, 0]}
        >
          {expenseData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={CHART_COLORS[index % CHART_COLORS.length]} 
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );

  return (
    <div className="w-full h-80">
      {/* Chart Type Toggle */}
      <div className="flex items-center justify-end mb-4 space-x-2">
        <button
          onClick={() => setChartType('pie')}
          className={`px-3 py-1 text-xs rounded-full transition-colors ${
            chartType === 'pie'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Pie Chart
        </button>
        <button
          onClick={() => setChartType('bar')}
          className={`px-3 py-1 text-xs rounded-full transition-colors ${
            chartType === 'bar'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Bar Chart
        </button>
      </div>

      {/* Chart */}
      <div className="h-full">
        {chartType === 'pie' ? renderPieChart() : renderBarChart()}
      </div>

      {/* Summary Stats */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="p-2 bg-gray-50 rounded-lg">
          <p className="text-lg font-semibold text-gray-900">
            {formatCurrency(expenseData.reduce((sum, item) => sum + item.amount, 0))}
          </p>
          <p className="text-xs text-gray-600">Total Expenses</p>
        </div>
        
        <div className="p-2 bg-gray-50 rounded-lg">
          <p className="text-lg font-semibold text-gray-900">
            {expenseData.length}
          </p>
          <p className="text-xs text-gray-600">Categories</p>
        </div>
        
        <div className="p-2 bg-gray-50 rounded-lg">
          <p className="text-lg font-semibold text-gray-900">
            {formatCurrency(Math.max(...expenseData.map(item => item.amount)))}
          </p>
          <p className="text-xs text-gray-600">Highest Category</p>
        </div>
        
        <div className="p-2 bg-gray-50 rounded-lg">
          <p className="text-lg font-semibold text-gray-900">
            {formatCurrency(expenseData.reduce((sum, item) => sum + item.amount, 0) / expenseData.length)}
          </p>
          <p className="text-xs text-gray-600">Average per Category</p>
        </div>
      </div>
    </div>
  );
};

export default ExpenseChart;