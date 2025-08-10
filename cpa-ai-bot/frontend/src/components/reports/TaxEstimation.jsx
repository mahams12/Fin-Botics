import React, { useState, useEffect } from 'react';
import { Calculator, DollarSign, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { BUSINESS_TYPES, TAX_YEARS } from '../../utils/constants';

const TaxEstimation = () => {
  const [formData, setFormData] = useState({
    taxYear: new Date().getFullYear(),
    businessType: 'sole_proprietorship',
    annualIncome: '',
    businessExpenses: '',
    filingStatus: 'single',
    dependents: 0,
    state: 'CA',
    estimatedPayments: '',
  });

  const [estimation, setEstimation] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const calculateTaxes = () => {
    setLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const income = parseFloat(formData.annualIncome) || 0;
      const expenses = parseFloat(formData.businessExpenses) || 0;
      const taxableIncome = Math.max(0, income - expenses);
      const estimatedPayments = parseFloat(formData.estimatedPayments) || 0;

      // Simplified tax calculation (replace with actual tax logic)
      const federalRate = calculateFederalRate(taxableIncome, formData.filingStatus);
      const stateRate = calculateStateRate(taxableIncome, formData.state);
      const selfEmploymentRate = 0.153; // 15.3% for Social Security and Medicare

      const federalTax = taxableIncome * federalRate;
      const stateTax = taxableIncome * stateRate;
      const selfEmploymentTax = taxableIncome * selfEmploymentRate;
      const totalTax = federalTax + stateTax + selfEmploymentTax;
      const quarterlyPayment = totalTax / 4;
      const remainingBalance = totalTax - estimatedPayments;

      setEstimation({
        taxableIncome,
        federalTax,
        stateTax,
        selfEmploymentTax,
        totalTax,
        quarterlyPayment,
        remainingBalance,
        effectiveRate: totalTax / taxableIncome,
        federalRate,
        stateRate,
      });
      
      setLoading(false);
    }, 1000);
  };

  const calculateFederalRate = (income, filingStatus) => {
    // Simplified federal tax brackets for demonstration
    if (income <= 10275) return 0.10;
    if (income <= 41775) return 0.12;
    if (income <= 89450) return 0.22;
    if (income <= 190750) return 0.24;
    if (income <= 364200) return 0.32;
    if (income <= 462500) return 0.35;
    return 0.37;
  };

  const calculateStateRate = (income, state) => {
    // Simplified state tax rates
    const stateRates = {
      'CA': 0.08,
      'NY': 0.07,
      'TX': 0.00,
      'FL': 0.00,
      'WA': 0.00,
      'IL': 0.05,
      'PA': 0.03,
      'OH': 0.04,
    };
    return stateRates[state] || 0.05;
  };

  const filingStatuses = [
    { value: 'single', label: 'Single' },
    { value: 'married_filing_jointly', label: 'Married Filing Jointly' },
    { value: 'married_filing_separately', label: 'Married Filing Separately' },
    { value: 'head_of_household', label: 'Head of Household' },
  ];

  const states = [
    { value: 'AL', label: 'Alabama' },
    { value: 'CA', label: 'California' },
    { value: 'FL', label: 'Florida' },
    { value: 'NY', label: 'New York' },
    { value: 'TX', label: 'Texas' },
    // Add more states as needed
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Tax Estimation Calculator</h2>
        <p className="text-gray-600">Estimate your tax liability and plan quarterly payments</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card title="Tax Information">
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Tax Year</label>
                <select
                  name="taxYear"
                  value={formData.taxYear}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  {TAX_YEARS.map(year => (
                    <option key={year.value} value={year.value}>
                      {year.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Business Type</label>
                <select
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  {BUSINESS_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Input
              label="Annual Business Income"
              name="annualIncome"
              type="number"
              value={formData.annualIncome}
              onChange={handleInputChange}
              placeholder="150000"
              icon={DollarSign}
              helpText="Total business revenue for the year"
            />

            <Input
              label="Business Expenses"
              name="businessExpenses"
              type="number"
              value={formData.businessExpenses}
              onChange={handleInputChange}
              placeholder="45000"
              icon={DollarSign}
              helpText="Total deductible business expenses"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Filing Status</label>
                <select
                  name="filingStatus"
                  value={formData.filingStatus}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  {filingStatuses.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Number of Dependents"
                name="dependents"
                type="number"
                value={formData.dependents}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">State</label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  {states.map(state => (
                    <option key={state.value} value={state.value}>
                      {state.label}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Estimated Payments Made"
                name="estimatedPayments"
                type="number"
                value={formData.estimatedPayments}
                onChange={handleInputChange}
                placeholder="0"
                icon={DollarSign}
                helpText="Quarterly payments already made"
              />
            </div>

            <Button 
              onClick={calculateTaxes}
              loading={loading}
              className="w-full"
              type="button"
            >
              <Calculator className="w-4 h-4 mr-2" />
              Calculate Tax Estimate
            </Button>
          </form>
        </Card>

        {/* Results */}
        {estimation && (
          <Card title="Tax Estimation Results">
            <div className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(estimation.totalTax)}
                  </p>
                  <p className="text-sm text-blue-700">Total Tax Liability</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(estimation.quarterlyPayment)}
                  </p>
                  <p className="text-sm text-green-700">Quarterly Payment</p>
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Tax Breakdown</h4>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Taxable Income:</span>
                    <span className="font-medium">{formatCurrency(estimation.taxableIncome)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Federal Tax ({formatPercentage(estimation.federalRate)}):</span>
                    <span className="font-medium">{formatCurrency(estimation.federalTax)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">State Tax ({formatPercentage(estimation.stateRate)}):</span>
                    <span className="font-medium">{formatCurrency(estimation.stateTax)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Self-Employment Tax (15.3%):</span>
                    <span className="font-medium">{formatCurrency(estimation.selfEmploymentTax)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm border-t pt-2">
                    <span className="font-medium text-gray-900">Total Tax:</span>
                    <span className="font-semibold">{formatCurrency(estimation.totalTax)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Payments Made:</span>
                    <span className="font-medium">-{formatCurrency(parseFloat(formData.estimatedPayments) || 0)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm border-t pt-2">
                    <span className="font-medium text-gray-900">Balance Due:</span>
                    <span className={`font-semibold ${estimation.remainingBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(Math.abs(estimation.remainingBalance))}
                      {estimation.remainingBalance < 0 && ' (Overpaid)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Effective Rate */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">Effective Tax Rate:</span>
                  <span className="text-lg font-semibold text-gray-900">
                    {formatPercentage(estimation.effectiveRate)}
                  </span>
                </div>
              </div>

              {/* Action Items */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Action Items</h4>
                <div className="space-y-2">
                  {estimation.remainingBalance > 1000 && (
                    <div className="flex items-start space-x-2 p-3 bg-yellow-50 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-yellow-800">Large Balance Due</p>
                        <p className="text-xs text-yellow-700">
                          Consider increasing quarterly payments to avoid penalties
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {estimation.remainingBalance <= 0 && (
                    <div className="flex items-start space-x-2 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-green-800">On Track</p>
                        <p className="text-xs text-green-700">
                          Your estimated payments are sufficient for this year
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg">
                    <FileText className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">Next Quarter Due</p>
                      <p className="text-xs text-blue-700">
                        Quarterly payment of {formatCurrency(estimation.quarterlyPayment)} due on next quarter deadline
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Tax Planning Tips */}
      <Card title="Tax Planning Tips">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Deduction Opportunities</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Home office expenses (if you work from home)</li>
              <li>• Business meals (50% deductible)</li>
              <li>• Professional development and training</li>
              <li>• Business equipment and software</li>
              <li>• Health insurance premiums (self-employed)</li>
              <li>• Retirement plan contributions</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Quarterly Payment Dates</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Q1 ({formData.taxYear}):</span>
                <span className="font-medium">April 15, {formData.taxYear}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Q2 ({formData.taxYear}):</span>
                <span className="font-medium">June 15, {formData.taxYear}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Q3 ({formData.taxYear}):</span>
                <span className="font-medium">September 15, {formData.taxYear}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Q4 ({formData.taxYear}):</span>
                <span className="font-medium">January 15, {formData.taxYear + 1}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Disclaimer */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <div className="flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-gray-600">
            <p className="font-medium mb-1">Important Disclaimer:</p>
            <p>
              This is an estimate only and should not be considered professional tax advice. 
              Tax calculations are simplified and may not account for all deductions, credits, 
              or specific circumstances. Please consult with a qualified tax professional or 
              CPA for accurate tax planning and filing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxEstimation;