import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { 
  SoftUILayout, 
  SoftUISection, 
  SoftUIGrid, 
  SoftUIFlex,
  SoftUIContainer,
  SoftUISpacer,
  SoftUIDivider
} from '@/components/soft-ui/SoftUILayout';
import { 
  SoftUICard, 
  SoftUICardHeader, 
  SoftUICardBody, 
  SoftUICardFooter,
  SoftUIStatCard,
  SoftUIProgressCard,
  SoftUIFeatureCard
} from '@/components/soft-ui/SoftUICard';
import { 
  SoftUIButton, 
  SoftUIIconButton,
  SoftUIFloatingButton
} from '@/components/soft-ui/SoftUIButton';
import { SoftUINavigation, SoftUIBreadcrumb, SoftUITabNavigation } from '@/components/soft-ui/SoftUINavigation';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  PiggyBank, 
  CreditCard, 
  RefreshCw, 
  Plus,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Target,
  AlertTriangle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical
} from 'lucide-react';

interface Budget {
  id: number;
  name: string;
  type: string;
  target_amount: number;
  currency: string;
  budget_year: number;
  budget_month: number;
  status: string;
  total_income: number;
  total_expenses: number;
  remaining_balance: number;
  budget_utilization: number;
  formatted_target_amount: string;
  formatted_total_income: string;
  formatted_total_expenses: string;
  formatted_remaining_balance: string;
  budget_period: string;
}

interface Transaction {
  id: number;
  description: string;
  amount: number;
  type: string;
  transaction_date: string;
  formatted_amount: string;
  budget: {
    name: string;
    currency: string;
  };
  category?: {
    name: string;
  };
}

interface Props {
  currentBudgets: Budget[];
  statistics: {
    totalTargetAmount: number;
    totalIncome: number;
    totalExpenses: number;
    totalRemaining: number;
    budgetCount: number;
  };
  recentTransactions: Transaction[];
  currentPeriod: {
    year: number;
    month: number;
    monthName: string;
  };
}

export default function SoftUIDashboard({ 
  currentBudgets, 
  statistics, 
  recentTransactions, 
  currentPeriod 
}: Props) {
  const formatCurrency = (amount: number, currency: string = 'PKR') => {
    const symbol = currency === 'PKR' ? '₨' : '﷼';
    return `${symbol} ${amount.toLocaleString()}`;
  };

  const getBudgetTypeColor = (type: string) => {
    const colors = {
      personal: 'bg-blue-100 text-blue-800',
      household: 'bg-green-100 text-green-800',
      travel: 'bg-purple-100 text-purple-800',
      custom: 'bg-orange-100 text-orange-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 90) return 'text-red-600';
    if (utilization >= 75) return 'text-orange-600';
    if (utilization >= 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getUtilizationGradient = (utilization: number) => {
    if (utilization >= 90) return 'from-red-400 to-red-600';
    if (utilization >= 75) return 'from-orange-400 to-orange-600';
    if (utilization >= 50) return 'from-yellow-400 to-yellow-600';
    return 'from-green-400 to-green-600';
  };

  const breadcrumbs = [
    { label: 'Budget', href: '#' },
    { label: 'Dashboard', href: '/budgets/dashboard' },
  ];

  return (
    <>
      <Head title="Budget Dashboard" />
      
      <SoftUILayout variant="fluid" padding="md">
        {/* Navigation */}
        <SoftUINavigation>
          <div />
        </SoftUINavigation>
        
        {/* Page Header */}
        <SoftUISection spacing="lg">
          <SoftUIContainer>
            <SoftUIFlex direction="col" gap="md">
              <div className="text-center sm:text-left">
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-4">
                  Budget Dashboard
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto sm:mx-0">
                  {currentPeriod.monthName} {currentPeriod.year} - Comprehensive overview of your financial budgets and spending patterns
                </p>
              </div>
              
              <SoftUIBreadcrumb items={breadcrumbs} />
            </SoftUIFlex>
          </SoftUIContainer>
        </SoftUISection>

        {/* Statistics Cards */}
        <SoftUISection spacing="lg">
          <SoftUIContainer>
            <SoftUIGrid cols={1} gap="md" className="grid-cols-2 lg:grid-cols-4">
              <SoftUIStatCard
                title="Total Budget Target"
                value={formatCurrency(statistics.totalTargetAmount)}
                change={{
                  value: `Across ${statistics.budgetCount} budgets`,
                  type: 'neutral'
                }}
                icon={DollarSign}
                iconColor="text-blue-500"
              />
              
              <SoftUIStatCard
                title="Total Income"
                value={formatCurrency(statistics.totalIncome)}
                change={{
                  value: 'All income sources',
                  type: 'neutral'
                }}
                icon={TrendingUp}
                iconColor="text-green-500"
              />
              
              <SoftUIStatCard
                title="Total Expenses"
                value={formatCurrency(statistics.totalExpenses)}
                change={{
                  value: 'All tracked expenses',
                  type: 'neutral'
                }}
                icon={TrendingDown}
                iconColor="text-red-500"
              />
              
              <SoftUIStatCard
                title="Remaining Balance"
                value={formatCurrency(statistics.totalRemaining)}
                change={{
                  value: statistics.totalRemaining >= 0 ? 'Positive balance' : 'Deficit',
                  type: statistics.totalRemaining >= 0 ? 'increase' : 'decrease'
                }}
                icon={PiggyBank}
                iconColor={statistics.totalRemaining >= 0 ? 'text-green-500' : 'text-red-500'}
              />
            </SoftUIGrid>
          </SoftUIContainer>
        </SoftUISection>

        {/* Main Content Grid */}
        <SoftUISection spacing="lg">
          <SoftUIContainer>
            <SoftUIGrid cols={1} gap="lg" className="lg:grid-cols-3">
              {/* Current Budgets - Takes 2 columns on large screens */}
              <div className="lg:col-span-2 space-y-6">
                <SoftUICard variant="neumorphic" className="overflow-hidden">
                  <SoftUICardHeader
                    title="Current Budgets"
                    subtitle={`Your active budgets for ${currentPeriod.monthName} ${currentPeriod.year}`}
                    icon={PiggyBank}
                    iconColor="text-blue-500"
                    actions={
                      <SoftUIButton
                        variant="primary"
                        size="sm"
                        icon={Plus}
                        href="/budgets/create"
                      >
                        Create Budget
                      </SoftUIButton>
                    }
                  >
                    <div />
                  </SoftUICardHeader>
                  
                  <SoftUICardBody>
                    {currentBudgets.length > 0 ? (
                      <div className="space-y-4">
                        {currentBudgets.map((budget) => (
                          <div key={budget.id} className="group">
                            <SoftUICard 
                              variant="glass" 
                              hover={true}
                              className="p-6 relative overflow-hidden"
                            >
                              <div className="relative z-10">
                                <SoftUIFlex justify="between" align="start" gap="md">
                                  <div className="flex-1">
                                    <SoftUIFlex gap="sm" className="mb-3">
                                      <h3 className="font-semibold text-gray-900 text-lg">
                                        {budget.name}
                                      </h3>
                                      <span className={cn(
                                        'px-3 py-1 rounded-full text-xs font-medium',
                                        getBudgetTypeColor(budget.type)
                                      )}>
                                        {budget.type}
                                      </span>
                                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                        {budget.currency}
                                      </span>
                                    </SoftUIFlex>
                                    
                                    <SoftUIGrid cols={2} gap="sm" className="grid-cols-4 mb-4">
                                      <div>
                                        <p className="text-xs text-gray-500 mb-1">Target</p>
                                        <p className="font-semibold text-gray-900">
                                          {budget.formatted_target_amount}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-500 mb-1">Income</p>
                                        <p className="font-semibold text-green-600">
                                          {budget.formatted_total_income}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-500 mb-1">Expenses</p>
                                        <p className="font-semibold text-red-600">
                                          {budget.formatted_total_expenses}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-500 mb-1">Utilization</p>
                                        <p className={cn(
                                          'font-semibold',
                                          getUtilizationColor(budget.budget_utilization)
                                        )}>
                                          {budget.budget_utilization.toFixed(1)}%
                                        </p>
                                      </div>
                                    </SoftUIGrid>
                                    
                                    <div className="mb-4">
                                      <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm text-gray-600">Budget Progress</span>
                                        <span className={cn(
                                          'text-sm font-medium',
                                          getUtilizationColor(budget.budget_utilization)
                                        )}>
                                          {budget.budget_utilization.toFixed(1)}%
                                        </span>
                                      </div>
                                      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                          className={cn(
                                            'h-full rounded-full transition-all duration-500',
                                            'bg-gradient-to-r',
                                            getUtilizationGradient(budget.budget_utilization)
                                          )}
                                          style={{ width: `${Math.min(budget.budget_utilization, 100)}%` }}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="flex gap-2">
                                    <SoftUIButton
                                      variant="outline"
                                      size="sm"
                                      icon={Eye}
                                      href={`/budgets/${budget.id}`}
                                    >
                                      View
                                    </SoftUIButton>
                                    <SoftUIButton
                                      variant="ghost"
                                      size="sm"
                                      icon={Edit}
                                      href={`/budgets/${budget.id}/edit`}
                                    >
                                      Edit
                                    </SoftUIButton>
                                  </div>
                                </SoftUIFlex>
                              </div>
                              
                              {/* Subtle gradient overlay */}
                              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 pointer-events-none rounded-2xl" />
                            </SoftUICard>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                          <PiggyBank className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">
                          No budgets yet
                        </h3>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                          Create your first budget to start tracking your finances and gaining insights into your spending patterns.
                        </p>
                        <SoftUIButton
                          variant="primary"
                          size="lg"
                          icon={Plus}
                          href="/budgets/create"
                        >
                          Create Budget
                        </SoftUIButton>
                      </div>
                    )}
                  </SoftUICardBody>
                </SoftUICard>
              </div>

              {/* Recent Transactions Sidebar */}
              <div className="space-y-6">
                <SoftUICard variant="neumorphic">
                  <SoftUICardHeader
                    title="Recent Transactions"
                    subtitle="Latest income and expense transactions"
                    icon={DollarSign}
                    iconColor="text-purple-500"
                  >
                    <div />
                  </SoftUICardHeader>
                  
                  <SoftUICardBody>
                    {recentTransactions.length > 0 ? (
                      <div className="space-y-3">
                        {recentTransactions.map((transaction) => (
                          <div key={transaction.id} className="group">
                            <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                              <div className={cn(
                                'w-10 h-10 rounded-full flex items-center justify-center',
                                transaction.type === 'income' 
                                  ? 'bg-green-100 text-green-600' 
                                  : 'bg-red-100 text-red-600'
                              )}>
                                {transaction.type === 'income' ? (
                                  <ArrowUpRight className="w-5 h-5" />
                                ) : (
                                  <ArrowDownRight className="w-5 h-5" />
                                )}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 text-sm truncate">
                                  {transaction.description}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs text-gray-500">
                                    {transaction.budget.name}
                                  </span>
                                  {transaction.category && (
                                    <>
                                      <span className="text-gray-400">•</span>
                                      <span className="text-xs text-gray-500">
                                        {transaction.category.name}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                              
                              <div className="text-right">
                                <p className={cn(
                                  'font-semibold text-sm',
                                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                                )}>
                                  {transaction.formatted_amount}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {new Date(transaction.transaction_date).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                          <DollarSign className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 text-sm">
                          No transactions yet
                        </p>
                      </div>
                    )}
                  </SoftUICardBody>
                  
                  {recentTransactions.length > 0 && (
                    <SoftUICardFooter className="justify-center">
                      <SoftUIButton
                        variant="outline"
                        size="sm"
                        href="/budgets/transactions"
                      >
                        View All Transactions
                      </SoftUIButton>
                    </SoftUICardFooter>
                  )}
                </SoftUICard>

                {/* Quick Actions */}
                <SoftUICard variant="glass">
                  <SoftUICardHeader
                    title="Quick Actions"
                    subtitle="Common tasks and shortcuts"
                    icon={Target}
                    iconColor="text-orange-500"
                  >
                    <div />
                  </SoftUICardHeader>
                  
                  <SoftUICardBody>
                    <div className="space-y-3">
                      <SoftUIFeatureCard
                        title="Add Transaction"
                        description="Record a new income or expense"
                        icon={Plus}
                        iconColor="text-blue-500"
                        onClick={() => window.location.href = '/budgets/transactions/create'}
                      />
                      
                      <SoftUIFeatureCard
                        title="View Analytics"
                        description="Get insights into your spending"
                        icon={TrendingUp}
                        iconColor="text-purple-500"
                        onClick={() => window.location.href = '/budgets/analytics'}
                      />
                      
                      <SoftUIFeatureCard
                        title="Manage Debts"
                        description="Track loans and repayments"
                        icon={CreditCard}
                        iconColor="text-red-500"
                        onClick={() => window.location.href = '/budgets/debts'}
                      />
                    </div>
                  </SoftUICardBody>
                </SoftUICard>
              </div>
            </SoftUIGrid>
          </SoftUIContainer>
        </SoftUISection>
      </SoftUILayout>

      {/* Floating Action Button */}
      <SoftUIFloatingButton
        icon={Plus}
        variant="primary"
        position="bottom-right"
        tooltip="Create Budget"
        onClick={() => window.location.href = '/budgets/create'}
      />
    </>
  );
}
