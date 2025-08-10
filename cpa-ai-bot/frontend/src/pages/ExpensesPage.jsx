import React from 'react';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import ExpenseList from '../components/expenses/ExpenseList';

const ExpensesPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Sidebar />
      
      <main className="flex-1 ml-64 p-8 pt-24">
        <ExpenseList />
      </main>
    </div>
  );
};

export default ExpensesPage;