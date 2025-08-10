import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../../../utils/formatters';

const IncomeChart = ({ dateRange = 'this_year' }) => {
  // Mock data - replace with actual API call based on dateRange
  const monthlyData = [
    { month: 'Jan', income: 18200, expenses: 12450, profit: 5750 },
    { month: 'Feb', income: 16800, expenses: 13120, profit: 3680 },
    { month: 'Mar', income: 17450, expenses: 13350, profit: 4100 },
    { month: 'Apr', income: 19200, expenses: 13780, profit: 5420 },
    { month: 'May', income: 19800, expenses: 13850, profit: 5950 },
    { month: 'Jun', income: 19750, expenses: 13650, profit: 6100 },
    { month: 'Jul', income: 18900, expenses: 13200, profit: 5700 },
    { month: 'Aug', income: 18720, expenses: 13150, profit: 5570 },
    { month: 'Sep', income: 18700, expenses: 13100, profit: 5600 },
    { month: 'Oct', income: 19100, expenses: 12400, profit: 6700 },
    { month: 'Nov', income: 19150, expenses: 12350, profit: 6800 },
    { month: 'Dec', income: 19080, expenses: 12379, profit: 6701 },
  ];

  const quarterlyData = [
    { quarter: 'Q1 2024', income: 52450, expenses: 38920, profit: 13530 },
    { quarter: 'Q2 2024', income: 58750, expenses: 41280, profit: 17470 },
    { quarter: 'Q3 2024', income: 56320, expenses: 39450, profit: 16870 },
    { quarter: 'Q4 2024', income: 57330, expenses: 37129, profit: 20201 },
  ];

  const yearlyData = [
    { year: '2020', income: 180000, expenses: 135000, profit: 45000 },
    { year: '2021', income: 195000, expenses: 142000, profit: 53000 },
    { year: '2022', income: 210000, expenses: 148000, profit: 62000 },
    { year: '2023', income: 225000, expenses: 156000, profit: 69000 },
    { year: '2024', income: 245000, expenses: 168000, profit: 77000 },
  ];

  const getChartData = () => {
    switch (dateRange) {
      case 'this_quarter':
      case 'last_quarter':
        return quarterlyData;
      case 'this_year':
      case 'last_year':
        return monthlyData;
      default:
        return yearlyData;
    }
  };

  const data = getChartData();

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-soft">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const formatYAxisTick = (value) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value}`;
  };

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey={data === yearlyData ? 'year' : data === quarterlyData ? 'quarter' : 'month'}
            tick={{ fontSize: 12, fill: '#6b7280' }}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: '#6b7280' }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickFormatter={formatYAxisTick}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ fontSize: '12px', color: '#6b7280' }}
          />
          <Line
            type="monotone"
            dataKey="income"
            stroke="#10b981"
            strokeWidth={3}
            dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
            name="Income"
          />
          <Line
            type="monotone"
            dataKey="expenses"
            stroke="#ef4444"
            strokeWidth={3}
            dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#ef4444', strokeWidth: 2 }}
            name="Expenses"
          />
          <Line
            type="monotone"
            dataKey="profit"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
            name="Profit"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default IncomeChart;