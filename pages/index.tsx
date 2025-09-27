import { useState, useEffect, useMemo, FC, ChangeEvent } from 'react';
import type { NextPage } from 'next';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Sun, Moon, Info, TrendingUp, Calculator, DollarSign, Download, Share2, Target, AlertTriangle, Calendar, BarChart3, Percent, Clock, BookOpen, Save, Trash2 } from 'lucide-react';

// --- TYPE DEFINITIONS ---
type CalculatorState = {
  monthlyInvestment: number;
  annualRate: number;
  years: number;
  stepUp: boolean;
  stepUpPercentage: number;
  existingAmount: number;
  inflationRate: number;
  targetAmount: number;
  investmentFrequency: 'monthly' | 'quarterly' | 'yearly';
};

type ResultState = {
  investedAmount: number;
  estimatedReturns: number;
  futureValue: number;
} | null;

// --- HELPER COMPONENTS ---
interface SliderInputProps {
  label: string;
  id: keyof CalculatorState;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (id: keyof CalculatorState, value: number) => void;
  info?: string;
}

const SliderInput: FC<SliderInputProps> = ({ label, id, value, min, max, step, unit, onChange, info }) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <label htmlFor={id} className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      {info && (
        <div className="group relative">
          <Info className="h-4 w-4 text-gray-400 cursor-pointer" />
          <div className="absolute bottom-full mb-2 w-64 hidden group-hover:block bg-gray-800 text-white text-xs rounded-lg p-2 shadow-lg z-10 right-0">
            {info}
          </div>
        </div>
      )}
    </div>
    <div className="flex items-center space-x-4">
      <input
        type="range"
        id={id}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(id, parseFloat(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
      />
      <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(id, parseFloat(e.target.value) || 0)}
          className="w-24 text-right p-2 bg-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
        />
        <span className="px-2 text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 h-full flex items-center rounded-r-md">{unit}</span>
      </div>
    </div>
  </div>
);

// --- MAIN COMPONENT ---
const SIPCalculatorPage: NextPage = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [inputs, setInputs] = useState<CalculatorState>({
    monthlyInvestment: 25000,
    annualRate: 15,
    years: 10,
    stepUp: false,
    stepUpPercentage: 10,
    existingAmount: 0,
    inflationRate: 7,
    targetAmount: 10000000,
    investmentFrequency: 'monthly',
  });
  const [results, setResults] = useState<ResultState>(null);
  const [error, setError] = useState<string>('');
  const [displayFormat, setDisplayFormat] = useState<'currency' | 'units'>('currency');
  const [savedPlans, setSavedPlans] = useState<{id: string, name: string, plan: CalculatorState}[]>([]);
  const [showSavedPlans, setShowSavedPlans] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('psxSipPlans');
      if (saved) {
        try {
          setSavedPlans(JSON.parse(saved));
        } catch (error) {
          console.error('Error parsing saved plans:', error);
          localStorage.removeItem('psxSipPlans');
        }
      }
    }
  }, []);

  const savePlan = () => {
    const planName = prompt('Enter plan name:');
    if (planName && typeof window !== 'undefined') {
      const newPlan = {
        id: Date.now().toString(),
        name: planName,
        plan: inputs
      };
      const updatedPlans = [...savedPlans, newPlan];
      setSavedPlans(updatedPlans);
      try {
        localStorage.setItem('psxSipPlans', JSON.stringify(updatedPlans));
      } catch (error) {
        console.error('Error saving plan:', error);
        alert('Failed to save plan. Please try again.');
      }
    }
  };

  const loadPlan = (plan: CalculatorState) => {
    setInputs(plan);
    setResults(null);
    setShowSavedPlans(false);
  };

  const deletePlan = (id: string) => {
    const updatedPlans = savedPlans.filter(p => p.id !== id);
    setSavedPlans(updatedPlans);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('psxSipPlans', JSON.stringify(updatedPlans));
      } catch (error) {
        console.error('Error deleting plan:', error);
      }
    }
  };

  const investmentTemplates = [
    {
      name: 'Conservative Retirement',
      description: 'Low risk, steady growth for retirement',
      plan: {
        monthlyInvestment: 15000,
        annualRate: 12,
        years: 25,
        stepUp: true,
        stepUpPercentage: 5,
        existingAmount: 0,
        inflationRate: 7,
        targetAmount: 50000000,
        investmentFrequency: 'monthly' as const
      }
    },
    {
      name: 'Aggressive Wealth Building',
      description: 'High growth potential for young investors',
      plan: {
        monthlyInvestment: 25000,
        annualRate: 18,
        years: 15,
        stepUp: true,
        stepUpPercentage: 10,
        existingAmount: 0,
        inflationRate: 8,
        targetAmount: 25000000,
        investmentFrequency: 'monthly' as const
      }
    },
    {
      name: 'Child Education Fund',
      description: 'Medium term goal for education expenses',
      plan: {
        monthlyInvestment: 20000,
        annualRate: 15,
        years: 12,
        stepUp: true,
        stepUpPercentage: 8,
        existingAmount: 500000,
        inflationRate: 7,
        targetAmount: 10000000,
        investmentFrequency: 'monthly' as const
      }
    },
    {
      name: 'House Down Payment',
      description: 'Short to medium term savings goal',
      plan: {
        monthlyInvestment: 50000,
        annualRate: 14,
        years: 5,
        stepUp: false,
        stepUpPercentage: 10,
        existingAmount: 1000000,
        inflationRate: 8,
        targetAmount: 5000000,
        investmentFrequency: 'monthly' as const
      }
    }
  ];

  const handleInputChange = (id: keyof CalculatorState, value: number) => {
    setInputs(prev => ({ ...prev, [id]: value }));
  };

  const handleToggleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputs(prev => ({ ...prev, stepUp: e.target.checked }));
  };

  const validateInputs = (): boolean => {
    if (inputs.monthlyInvestment <= 0) {
      setError('Investment amount must be greater than zero.');
      return false;
    }
    if (inputs.annualRate <= 0 || inputs.annualRate > 50) {
      setError('Expected return must be between 0.1% and 50%.');
      return false;
    }
    if (inputs.years <= 0 || inputs.years > 50) {
      setError('Investment period must be between 1 and 50 years.');
      return false;
    }
    if (inputs.stepUp && (inputs.stepUpPercentage <= 0 || inputs.stepUpPercentage > 50)) {
      setError('Step-up percentage must be between 0.1% and 50%.');
      return false;
    }
    if (inputs.inflationRate < 0 || inputs.inflationRate > 30) {
      setError('Inflation rate must be between 0% and 30%.');
      return false;
    }
    if (inputs.targetAmount <= 0) {
      setError('Target amount must be greater than zero.');
      return false;
    }
    setError('');
    return true;
  };

  const handleCalculate = () => {
    if (!validateInputs()) {
      setResults(null);
      return;
    }

    const P = inputs.monthlyInvestment;
    const r = inputs.annualRate / 100;
    const t = inputs.years;
    const stepUpRate = inputs.stepUpPercentage / 100;
    const existingAmount = inputs.existingAmount;
    
    const frequency = inputs.investmentFrequency === 'monthly' ? 12 : inputs.investmentFrequency === 'quarterly' ? 4 : 1;
    const periodicRate = r / frequency;
    const periodicInvestment = inputs.investmentFrequency === 'monthly' ? P : inputs.investmentFrequency === 'quarterly' ? P * 3 : P * 12;

    // Calculate existing amount growth with compound interest
    let futureValue = existingAmount > 0 ? existingAmount * Math.pow(1 + r, t) : 0;
    let totalInvestment = existingAmount;
    let currentPeriodicInvestment = periodicInvestment;
    let sipFutureValue = 0;

    if (inputs.stepUp) {
        // Step-up SIP calculation with accurate compounding
        for (let year = 0; year < t; year++) {
            for (let period = 0; period < frequency; period++) {
                totalInvestment += currentPeriodicInvestment;
                const remainingPeriods = (t - year) * frequency - period - 1;
                sipFutureValue += currentPeriodicInvestment * Math.pow(1 + periodicRate, remainingPeriods);
            }
            currentPeriodicInvestment *= (1 + stepUpRate);
        }
        futureValue += sipFutureValue;
    } else {
        // Regular SIP calculation
        if (periodicInvestment > 0) {
            const n = t * frequency;
            totalInvestment += periodicInvestment * n;
            // Future value of annuity formula
            sipFutureValue = periodicInvestment * ((Math.pow(1 + periodicRate, n) - 1) / periodicRate);
            futureValue += sipFutureValue;
        }
    }

    setResults({
      futureValue: Math.round(futureValue),
      investedAmount: Math.round(totalInvestment),
      estimatedReturns: Math.round(futureValue - totalInvestment),
    });
  };

  const handleReset = () => {
    setInputs({
      monthlyInvestment: 25000,
      annualRate: 15,
      years: 10,
      stepUp: false,
      stepUpPercentage: 10,
      existingAmount: 0,
      inflationRate: 7,
      targetAmount: 10000000,
      investmentFrequency: 'monthly',
    });
    setResults(null);
    setError('');
  };

  const downloadReport = () => {
    if (!results) return;
    const report = `PSX SIP Calculator Report\n\nInputs:\n- Existing Amount: ${formatCurrency(inputs.existingAmount)}\n- Monthly SIP: ${formatCurrency(inputs.monthlyInvestment)}\n- Expected Return: ${inputs.annualRate}%\n- Time Period: ${inputs.years} years\n- Step-up: ${inputs.stepUp ? inputs.stepUpPercentage + '%' : 'No'}\n\nResults:\n- Future Value: ${formatCurrency(results.futureValue)}\n- Total Investment: ${formatCurrency(results.investedAmount)}\n- Wealth Gain: ${formatCurrency(results.estimatedReturns)}\n- Return Multiple: ${(results.futureValue / results.investedAmount).toFixed(1)}x\n\nInflation Adjusted Value: ${formatCurrency(results.futureValue / Math.pow(1 + inputs.inflationRate / 100, inputs.years))}\n\nGenerated on: ${new Date().toLocaleDateString()}`;
    
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'PSX-SIP-Report.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const shareResults = async () => {
    if (!results) return;
    const shareText = `My PSX SIP projection: ${formatCurrency(results.futureValue)} in ${inputs.years} years with ${formatCurrency(inputs.monthlyInvestment)} ${inputs.investmentFrequency} investment at ${inputs.annualRate}% expected return.`;
    
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ title: 'PSX SIP Calculator Results', text: shareText });
      } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(shareText);
        alert('Results copied to clipboard!');
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = shareText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Results copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing results:', error);
      alert('Failed to share results. Please try again.');
    }
  };

  const chartData = useMemo(() => {
    if (!results) return [];
    return [
      { name: 'Total Investment', value: results.investedAmount },
      { name: 'Wealth Gain', value: results.estimatedReturns },
    ];
  }, [results]);

  const COLORS = ['#059669', '#10b981']; // green-600, emerald-500

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatAmount = (value: number) => {
    if (displayFormat === 'currency') {
      return formatCurrency(value);
    }
    
    if (value >= 10000000000000) { // 10 Trillion
      return `${(value / 1000000000000).toFixed(2)} Trillion PKR`;
    } else if (value >= 1000000000000) { // 1 Trillion
      return `${(value / 1000000000000).toFixed(2)} Trillion PKR`;
    } else if (value >= 10000000000) { // 10 Billion
      return `${(value / 1000000000).toFixed(2)} Billion PKR`;
    } else if (value >= 1000000000) { // 1 Billion
      return `${(value / 1000000000).toFixed(2)} Billion PKR`;
    } else if (value >= 10000000) { // 1 Crore
      return `${(value / 10000000).toFixed(2)} Crore PKR`;
    } else if (value >= 100000) { // 1 Lakh
      return `${(value / 100000).toFixed(2)} Lakh PKR`;
    } else {
      return `${value.toLocaleString()} PKR`;
    }
  };

  const yearlyData = useMemo(() => {
    if (!results) return [];
    const data = [];
    const P = inputs.monthlyInvestment;
    const r = inputs.annualRate / 100;
    const stepUpRate = inputs.stepUpPercentage / 100;
    const existingAmount = inputs.existingAmount;
    const frequency = inputs.investmentFrequency === 'monthly' ? 12 : inputs.investmentFrequency === 'quarterly' ? 4 : 1;
    const periodicRate = r / frequency;
    const periodicInvestment = inputs.investmentFrequency === 'monthly' ? P : inputs.investmentFrequency === 'quarterly' ? P * 3 : P * 12;
    
    let cumulativeInvestment = existingAmount;
    let currentPeriodicInvestment = periodicInvestment;
    
    for (let year = 1; year <= inputs.years; year++) {
      // Calculate existing amount growth
      const existingGrowth = existingAmount > 0 ? existingAmount * Math.pow(1 + r, year) : 0;
      
      // Calculate SIP growth for this year
      let sipValue = 0;
      let yearlyInvestment = 0;
      
      if (inputs.stepUp) {
        // Step-up calculation year by year
        let tempInvestment = periodicInvestment;
        for (let y = 0; y < year; y++) {
          for (let period = 0; period < frequency; period++) {
            yearlyInvestment += tempInvestment;
            const remainingPeriods = (year - y) * frequency - period - 1;
            sipValue += tempInvestment * Math.pow(1 + periodicRate, remainingPeriods);
          }
          tempInvestment *= (1 + stepUpRate);
        }
      } else {
        // Regular SIP calculation
        const n = year * frequency;
        yearlyInvestment = periodicInvestment * n;
        if (periodicInvestment > 0) {
          sipValue = periodicInvestment * ((Math.pow(1 + periodicRate, n) - 1) / periodicRate);
        }
      }
      
      cumulativeInvestment = existingAmount + yearlyInvestment;
      const cumulativeValue = existingGrowth + sipValue;
      
      data.push({
        year,
        invested: Math.round(cumulativeInvestment),
        value: Math.round(cumulativeValue),
        returns: Math.round(cumulativeValue - cumulativeInvestment)
      });
    }
    return data;
  }, [inputs, results]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-gray-100 font-sans transition-all duration-300">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 max-w-7xl">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl shadow-lg">
              <TrendingUp className="h-7 w-7 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
                PSX SIP Calculator
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">Pakistan Stock Exchange Investment Planner</p>
            </div>
          </div>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-3 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 lg:gap-8">
          {/* --- INPUTS CARD --- */}
          <div className="xl:col-span-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl transition-all duration-300">
            <div className="space-y-6">
              <SliderInput
                label="Existing Investment Amount"
                id="existingAmount"
                value={inputs.existingAmount}
                min={0}
                max={10000000}
                step={10000}
                unit="PKR"
                onChange={handleInputChange}
                info="Amount you have already invested in PSX (current portfolio value)"
              />
              <div className="flex space-x-2">
                {[0, 100000, 500000, 1000000].map(amount => (
                  <button key={amount} onClick={() => handleInputChange('existingAmount', amount)} className="flex-1 text-xs py-1.5 px-2 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900 transition-colors">
                    {amount === 0 ? 'New' : amount >= 1000000 ? `${amount / 1000000}M` : `${amount / 100000}L`}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Investment Frequency</label>
                <div className="flex space-x-2">
                  {[
                    { key: 'monthly', label: 'Monthly', icon: Calendar },
                    { key: 'quarterly', label: 'Quarterly', icon: BarChart3 },
                    { key: 'yearly', label: 'Yearly', icon: Clock }
                  ].map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => setInputs(prev => ({ ...prev, investmentFrequency: key as CalculatorState['investmentFrequency'] }))}
                      className={`flex-1 p-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center space-x-1 ${
                        inputs.investmentFrequency === key
                          ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-600'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      <Icon className="h-3 w-3" />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <SliderInput
                label={`${inputs.investmentFrequency.charAt(0).toUpperCase() + inputs.investmentFrequency.slice(1)} Investment`}
                id="monthlyInvestment"
                value={inputs.monthlyInvestment}
                min={1000}
                max={500000}
                step={1000}
                unit="PKR"
                onChange={handleInputChange}
                info={`Amount you plan to invest ${inputs.investmentFrequency}`}
              />
              <div className="flex space-x-2">
                {[10000, 25000, 50000, 100000].map(amount => (
                  <button key={amount} onClick={() => handleInputChange('monthlyInvestment', amount)} className="flex-1 text-xs py-1.5 px-2 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded-md hover:bg-green-200 dark:hover:bg-green-900 transition-colors">
                    {amount >= 100000 ? `${amount / 100000}L` : `${amount / 1000}k`}
                  </button>
                ))}
              </div>

              <SliderInput
                label="Expected Annual Return"
                id="annualRate"
                value={inputs.annualRate}
                min={8}
                max={25}
                step={0.5}
                info="PSX historical average: 12-18% annually. Conservative: 10-12%, Aggressive: 15-20%"
                unit="%"
                onChange={handleInputChange}
              />

              <SliderInput
                label="Investment Duration"
                id="years"
                value={inputs.years}
                min={1}
                max={40}
                step={1}
                unit="Yrs"
                onChange={handleInputChange}
              />

              <SliderInput
                label="Target Amount"
                id="targetAmount"
                value={inputs.targetAmount}
                min={1000000}
                max={100000000}
                step={100000}
                unit="PKR"
                onChange={handleInputChange}
                info="Your financial goal - calculator will show if you'll reach it"
              />
              <div className="flex space-x-2">
                {[5000000, 10000000, 25000000, 50000000].map(amount => (
                  <button key={amount} onClick={() => handleInputChange('targetAmount', amount)} className="flex-1 text-xs py-1.5 px-2 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-md hover:bg-purple-200 dark:hover:bg-purple-900 transition-colors">
                    {amount >= 10000000 ? `${amount / 10000000}Cr` : `${amount / 1000000}M`}
                  </button>
                ))}
              </div>

              <SliderInput
                label="Inflation Rate"
                id="inflationRate"
                value={inputs.inflationRate}
                min={3}
                max={15}
                step={0.5}
                unit="%"
                onChange={handleInputChange}
                info="Pakistan's average inflation rate (7-9% historically)"
              />

              <div className="pt-2">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inputs.stepUp}
                    onChange={handleToggleChange}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">Annual Step-up</span>
                </label>
                {inputs.stepUp && (
                  <div className="mt-4 pl-2 border-l-2 border-blue-500">
                    <SliderInput
                      label="Step-up Percentage"
                      id="stepUpPercentage"
                      value={inputs.stepUpPercentage}
                      min={1}
                      max={25}
                      step={1}
                      unit="%"
                      onChange={handleInputChange}
                      info="The percentage by which your monthly SIP amount increases annually."
                    />
                  </div>
                )}
              </div>

              {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}

              {/* Investment Templates & Saved Plans */}
              {showSavedPlans && (
                <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-200 dark:border-gray-600">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center space-x-2">
                    <BookOpen className="h-4 w-4" />
                    <span>Investment Plans</span>
                  </h4>
                  
                  {/* Templates */}
                  <div>
                    <h5 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Templates</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {investmentTemplates.map((template, index) => (
                        <button
                          key={index}
                          onClick={() => loadPlan(template.plan)}
                          className="p-3 text-left bg-white dark:bg-gray-600 rounded-lg border border-gray-200 dark:border-gray-500 hover:border-blue-300 dark:hover:border-blue-500 transition-all"
                        >
                          <p className="font-medium text-sm text-gray-800 dark:text-gray-200">{template.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{template.description}</p>
                          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-300 mt-2">
                            <span>{formatCurrency(template.plan.monthlyInvestment)}/{template.plan.investmentFrequency}</span>
                            <span>{template.plan.annualRate}% • {template.plan.years}y</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Saved Plans */}
                  {savedPlans.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Saved Plans</h5>
                      <div className="space-y-2">
                        {savedPlans.map((savedPlan) => (
                          <div key={savedPlan.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-600 rounded-lg border border-gray-200 dark:border-gray-500">
                            <button
                              onClick={() => loadPlan(savedPlan.plan)}
                              className="flex-1 text-left"
                            >
                              <p className="font-medium text-sm text-gray-800 dark:text-gray-200">{savedPlan.name}</p>
                              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-300 mt-1">
                                <span>{formatCurrency(savedPlan.plan.monthlyInvestment)}/{savedPlan.plan.investmentFrequency}</span>
                                <span>{savedPlan.plan.annualRate}% • {savedPlan.plan.years}y</span>
                              </div>
                            </button>
                            <button
                              onClick={() => deletePlan(savedPlan.id)}
                              className="ml-2 p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-3 pt-4">
                <button
                  onClick={handleCalculate}
                  className="w-full py-3 px-4 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-gray-800 transition-all flex items-center justify-center space-x-2"
                >
                  <Calculator className="h-4 w-4" />
                  <span>Calculate</span>
                </button>
                <div className="flex space-x-2">
                  <button
                    onClick={handleReset}
                    className="flex-1 py-2 px-3 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => setShowSavedPlans(!showSavedPlans)}
                    className="flex-1 py-2 px-3 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 font-medium rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-all flex items-center justify-center space-x-1"
                  >
                    <BookOpen className="h-3 w-3" />
                    <span>Plans</span>
                  </button>
                  {results && (
                    <>
                      <button
                        onClick={downloadReport}
                        className="flex-1 py-2 px-3 bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 font-medium rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900 transition-all flex items-center justify-center space-x-1"
                      >
                        <Download className="h-3 w-3" />
                        <span>Export</span>
                      </button>
                      <button
                        onClick={shareResults}
                        className="flex-1 py-2 px-3 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 font-medium rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-900 transition-all flex items-center justify-center space-x-1"
                      >
                        <Share2 className="h-3 w-3" />
                        <span>Share</span>
                      </button>
                      <button
                        onClick={savePlan}
                        className="flex-1 py-2 px-3 bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 font-medium rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900 transition-all flex items-center justify-center space-x-1"
                      >
                        <Save className="h-3 w-3" />
                        <span>Save</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* --- RESULTS CARD --- */}
          <div className="xl:col-span-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl transition-all duration-300">
            {results ? (
              <div className="space-y-8">
                {/* Goal Achievement Alert */}
                {results && (
                  <div className={`p-4 rounded-lg border-l-4 ${
                    results.futureValue >= inputs.targetAmount 
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-500 text-green-800 dark:text-green-200'
                      : 'bg-orange-50 dark:bg-orange-900/20 border-orange-500 text-orange-800 dark:text-orange-200'
                  }`}>
                    <div className="flex items-center space-x-2">
                      {results.futureValue >= inputs.targetAmount ? (
                        <Target className="h-5 w-5" />
                      ) : (
                        <AlertTriangle className="h-5 w-5" />
                      )}
                      <p className="font-semibold">
                        {results.futureValue >= inputs.targetAmount 
                          ? `🎯 Goal Achieved! You'll exceed your target by ${formatAmount(results.futureValue - inputs.targetAmount)}`
                          : `⚠️ Shortfall: You'll be ${formatAmount(inputs.targetAmount - results.futureValue)} short of your ${formatAmount(inputs.targetAmount)} goal`
                        }
                      </p>
                    </div>
                    {results.futureValue < inputs.targetAmount && (
                      <p className="text-sm mt-2 opacity-80">
                        💡 Increase {inputs.investmentFrequency} SIP to {(() => {
                          const frequency = inputs.investmentFrequency === 'monthly' ? 12 : inputs.investmentFrequency === 'quarterly' ? 4 : 1;
                          const periodicRate = inputs.annualRate / 100 / frequency;
                          const n = inputs.years * frequency;
                          const existingGrowth = inputs.existingAmount * Math.pow(1 + inputs.annualRate / 100, inputs.years);
                          const requiredSipValue = inputs.targetAmount - existingGrowth;
                          const requiredPeriodicInvestment = requiredSipValue / ((Math.pow(1 + periodicRate, n) - 1) / periodicRate);
                          return formatCurrency(Math.ceil(requiredPeriodicInvestment / 1000) * 1000);
                        })()} to reach your goal.
                      </p>
                    )}
                  </div>
                )}

                {/* Display Format Toggle */}
                <div className="flex justify-center mb-6">
                  <div className="bg-gray-100/80 dark:bg-gray-700/80 backdrop-blur-sm p-1 rounded-xl flex shadow-inner">
                    <button
                      onClick={() => setDisplayFormat('currency')}
                      className={`px-4 sm:px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                        displayFormat === 'currency'
                          ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-lg transform scale-105'
                          : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-600/50'
                      }`}
                    >
                      Currency
                    </button>
                    <button
                      onClick={() => setDisplayFormat('units')}
                      className={`px-4 sm:px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                        displayFormat === 'units'
                          ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-lg transform scale-105'
                          : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-600/50'
                      }`}
                    >
                      Units
                    </button>
                  </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div className="p-4 sm:p-5 bg-gradient-to-br from-green-50 via-green-100 to-emerald-100 dark:from-green-900/30 dark:via-green-800/20 dark:to-emerald-800/20 rounded-xl border border-green-200/50 dark:border-green-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="p-2 bg-green-200/50 dark:bg-green-800/50 rounded-lg">
                        <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <p className="text-xs sm:text-sm font-medium text-green-700 dark:text-green-300">Total Investment</p>
                    </div>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-800 dark:text-green-200 break-words">{formatAmount(results.investedAmount)}</p>
                  </div>
                  <div className="p-4 sm:p-5 bg-gradient-to-br from-emerald-50 via-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:via-emerald-800/20 dark:to-teal-800/20 rounded-xl border border-emerald-200/50 dark:border-emerald-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="p-2 bg-emerald-200/50 dark:bg-emerald-800/50 rounded-lg">
                        <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <p className="text-xs sm:text-sm font-medium text-emerald-700 dark:text-emerald-300">Wealth Gain</p>
                    </div>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-emerald-800 dark:text-emerald-200 break-words">{formatAmount(results.estimatedReturns)}</p>
                  </div>
                  <div className="p-4 sm:p-5 bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 dark:from-blue-900/30 dark:via-blue-800/20 dark:to-indigo-800/20 rounded-xl border border-blue-200/50 dark:border-blue-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="p-2 bg-blue-200/50 dark:bg-blue-800/50 rounded-lg">
                        <Calculator className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <p className="text-xs sm:text-sm font-medium text-blue-700 dark:text-blue-300">Future Value</p>
                    </div>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-800 dark:text-blue-200 break-words">{formatAmount(results.futureValue)}</p>
                  </div>
                  <div className="p-4 sm:p-5 bg-gradient-to-br from-purple-50 via-purple-100 to-pink-100 dark:from-purple-900/30 dark:via-purple-800/20 dark:to-pink-800/20 rounded-xl border border-purple-200/50 dark:border-purple-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="p-2 bg-purple-200/50 dark:bg-purple-800/50 rounded-lg">
                        <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <p className="text-xs sm:text-sm font-medium text-purple-700 dark:text-purple-300">Inflation Adjusted</p>
                    </div>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-800 dark:text-purple-200 break-words">{formatAmount(results.futureValue / Math.pow(1 + inputs.inflationRate / 100, inputs.years))}</p>
                    <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">Today's buying power</p>
                  </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/30 dark:to-gray-600/20 p-4 sm:p-5 rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-600/50">
                    <h3 className="text-base sm:text-lg font-semibold mb-4 text-center text-gray-800 dark:text-gray-200">Investment Breakdown</h3>
                    <div className="h-48 sm:h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => formatAmount(value)} />
                          <Legend iconType="circle" />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/30 dark:to-gray-600/20 p-4 sm:p-5 rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-600/50">
                    <h3 className="text-base sm:text-lg font-semibold mb-4 text-center text-gray-800 dark:text-gray-200">Growth Over Time</h3>
                    <div className="h-48 sm:h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={yearlyData}>
                          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                          <XAxis dataKey="year" />
                          <YAxis tickFormatter={(value) => `${(value / 100000).toFixed(0)}L`} />
                          <Tooltip formatter={(value: number) => formatAmount(value)} />
                          <Line type="monotone" dataKey="invested" stroke="#059669" strokeWidth={2} name="Invested" />
                          <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} name="Total Value" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Tax & Risk Information */}
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-700">
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">📋 Important Considerations</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-yellow-700 dark:text-yellow-300">
                    <div>
                      <p><strong>Capital Gains Tax:</strong> 15% on gains above PKR 2.5M annually</p>
                      <p><strong>Dividend Tax:</strong> 25% withholding tax on dividends</p>
                    </div>
                    <div>
                      <p><strong>Market Risk:</strong> PSX can be volatile, diversify investments</p>
                      <p><strong>Currency Risk:</strong> PKR devaluation affects real returns</p>
                    </div>
                  </div>
                </div>

                {/* Scenario Analysis */}
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-200 dark:border-indigo-700">
                  <h4 className="font-semibold text-indigo-800 dark:text-indigo-200 mb-3 flex items-center space-x-2">
                    <Percent className="h-4 w-4" />
                    <span>Scenario Analysis</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    {[
                      { label: 'Conservative (10%)', rate: 10, color: 'text-red-600 dark:text-red-400' },
                      { label: 'Moderate (15%)', rate: 15, color: 'text-blue-600 dark:text-blue-400' },
                      { label: 'Aggressive (20%)', rate: 20, color: 'text-green-600 dark:text-green-400' }
                    ].map(({ label, rate, color }) => {
                      const frequency = inputs.investmentFrequency === 'monthly' ? 12 : inputs.investmentFrequency === 'quarterly' ? 4 : 1;
                      const periodicRate = rate / 100 / frequency;
                      const periodicInvestment = inputs.investmentFrequency === 'monthly' ? inputs.monthlyInvestment : inputs.investmentFrequency === 'quarterly' ? inputs.monthlyInvestment * 3 : inputs.monthlyInvestment * 12;
                      const n = inputs.years * frequency;
                      
                      const existingGrowth = inputs.existingAmount > 0 ? inputs.existingAmount * Math.pow(1 + rate / 100, inputs.years) : 0;
                      const sipGrowth = periodicInvestment > 0 ? periodicInvestment * ((Math.pow(1 + periodicRate, n) - 1) / periodicRate) : 0;
                      const scenarioValue = existingGrowth + sipGrowth;
                      return (
                        <div key={rate} className="text-center">
                          <p className="font-medium text-gray-700 dark:text-gray-300">{label}</p>
                          <p className={`text-lg font-bold ${color}`}>{formatAmount(scenarioValue)}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Additional Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-3 text-center">
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700/50 dark:to-gray-600/30 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Existing Amount</p>
                    <p className="text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-200 break-words">{formatCurrency(inputs.existingAmount)}</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700/50 dark:to-gray-600/30 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{inputs.investmentFrequency.charAt(0).toUpperCase() + inputs.investmentFrequency.slice(1)} SIP</p>
                    <p className="text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-200 break-words">{formatCurrency(inputs.monthlyInvestment)}</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700/50 dark:to-gray-600/30 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Expected Return</p>
                    <p className="text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-200">{inputs.annualRate}% p.a.</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700/50 dark:to-gray-600/30 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Time Period</p>
                    <p className="text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-200">{inputs.years} Years</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700/50 dark:to-gray-600/30 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Return Multiple</p>
                    <p className="text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-200">{(results.futureValue / results.investedAmount).toFixed(1)}x</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700/50 dark:to-gray-600/30 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Real Return</p>
                    <p className="text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-200">{(inputs.annualRate - inputs.inflationRate).toFixed(1)}%</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700/50 dark:to-gray-600/30 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Frequency</p>
                    <p className="text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-200 capitalize">{inputs.investmentFrequency}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12 lg:py-16 px-4">
                <div className="bg-gradient-to-br from-green-100 via-emerald-100 to-teal-100 dark:from-green-900/30 dark:via-emerald-900/30 dark:to-teal-900/30 border-2 border-dashed border-green-300 dark:border-green-600 rounded-2xl w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6 flex items-center justify-center shadow-lg">
                  <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3">PSX Investment Calculator</h3>
                <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">Calculate your potential returns from Pakistan Stock Exchange investments</p>
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 sm:p-6 rounded-xl max-w-lg mx-auto shadow-lg border border-blue-200/50 dark:border-blue-700/50">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-300">
                        <span className="text-lg">💡</span>
                        <p className="text-sm font-semibold">For New Investors:</p>
                      </div>
                      <p className="text-sm text-blue-600 dark:text-blue-400 text-left">Set existing amount to 0 and plan your monthly SIP.</p>
                      <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-300">
                        <span className="text-lg">📈</span>
                        <p className="text-sm font-semibold">For Existing Investors:</p>
                      </div>
                      <p className="text-sm text-blue-600 dark:text-blue-400 text-left">Enter your current portfolio value and continue with SIP.</p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-xl max-w-lg mx-auto shadow-lg border border-purple-200/50 dark:border-purple-700/50">
                    <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-3 flex items-center justify-center space-x-2">
                      <BookOpen className="h-4 w-4" />
                      <span>Quick Start Templates</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {investmentTemplates.slice(0, 4).map((template, index) => (
                        <button
                          key={index}
                          onClick={() => loadPlan(template.plan)}
                          className="p-2 text-left bg-white/80 dark:bg-gray-700/80 rounded-lg border border-purple-200/50 dark:border-purple-600/50 hover:border-purple-400 dark:hover:border-purple-400 transition-all text-xs"
                        >
                          <p className="font-medium text-purple-800 dark:text-purple-200">{template.name}</p>
                          <p className="text-purple-600 dark:text-purple-400 mt-1">{formatCurrency(template.plan.monthlyInvestment)} • {template.plan.years}y</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SIPCalculatorPage;
