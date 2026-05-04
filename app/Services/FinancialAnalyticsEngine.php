<?php

namespace App\Services;

use App\Models\Budget;
use App\Models\BudgetTransaction;
use App\Models\FinancialAnalytics;
use App\Models\Notification;
use App\Models\SpendingPattern;
use App\Models\User;
use Carbon\Carbon;

class FinancialAnalyticsEngine
{
    public function generateUserInsights(User $user): array
    {
        $insights = [];
        $currentDate = now();
        
        // Generate spending trend insights
        $insights = array_merge($insights, $this->analyzeSpendingTrends($user, $currentDate));
        
        // Generate budget utilization insights
        $insights = array_merge($insights, $this->analyzeBudgetUtilization($user, $currentDate));
        
        // Generate category breakdown insights
        $insights = array_merge($insights, $this->analyzeCategoryBreakdown($user, $currentDate));
        
        // Generate monthly comparison insights
        $insights = array_merge($insights, $this->analyzeMonthlyComparison($user, $currentDate));
        
        // Generate predictive insights
        $insights = array_merge($insights, $this->generatePredictiveInsights($user, $currentDate));
        
        // Generate anomaly detection insights
        $insights = array_merge($insights, $this->detectAnomalies($user, $currentDate));
        
        // Save insights to database
        foreach ($insights as $insight) {
            $this->saveInsight($user, $insight);
        }
        
        return $insights;
    }

    public function analyzeSpendingTrends(User $user, Carbon $currentDate): array
    {
        $insights = [];
        
        // Get current month spending by category
        $currentMonthStart = $currentDate->copy()->startOfMonth();
        $currentMonthEnd = $currentDate->copy()->endOfMonth();
        
        $currentSpending = BudgetTransaction::whereHas('budget', fn($q) => $q->forUser($user->id))
            ->where('type', 'expense')
            ->whereBetween('transaction_date', [$currentMonthStart, $currentMonthEnd])
            ->with('category')
            ->get()
            ->groupBy('budget_category_id');

        // Get previous month spending for comparison
        $previousMonthStart = $currentDate->copy()->subMonth()->startOfMonth();
        $previousMonthEnd = $currentDate->copy()->subMonth()->endOfMonth();
        
        $previousSpending = BudgetTransaction::whereHas('budget', fn($q) => $q->forUser($user->id))
            ->where('type', 'expense')
            ->whereBetween('transaction_date', [$previousMonthStart, $previousMonthEnd])
            ->with('category')
            ->get()
            ->groupBy('budget_category_id');

        foreach ($currentSpending as $categoryId => $transactions) {
            $currentAmount = $transactions->sum('amount');
            $categoryName = $transactions->first()->category?->name ?? 'Uncategorized';
            
            $previousAmount = $previousSpending->get($categoryId)?->sum('amount') ?? 0;
            
            if ($previousAmount > 0) {
                $percentageChange = (($currentAmount - $previousAmount) / $previousAmount) * 100;
                
                // Generate insight for significant changes
                if (abs($percentageChange) >= 20) {
                    $direction = $percentageChange > 0 ? 'increased' : 'decreased';
                    $severity = abs($percentageChange) >= 50 ? 'critical' : 'warning';
                    
                    $insights[] = [
                        'type' => 'spending_trend',
                        'title' => "Significant {$direction} spending in {$categoryName}",
                        'description' => "Your {$categoryName} spending has {$direction} by " . abs(round($percentageChange, 1)) . "% this month.",
                        'severity' => $severity,
                        'data' => [
                            'category' => $categoryName,
                            'current_amount' => $currentAmount,
                            'previous_amount' => $previousAmount,
                            'percentage_change' => $percentageChange,
                        ],
                        'recommendations' => $this->generateSpendingRecommendations($categoryName, $percentageChange, $currentAmount),
                    ];
                }
            }
        }
        
        return $insights;
    }

    public function analyzeBudgetUtilization(User $user, Carbon $currentDate): array
    {
        $insights = [];
        
        $activeBudgets = Budget::forUser($user->id)
            ->where('budget_year', $currentDate->year)
            ->where('budget_month', $currentDate->month)
            ->active()
            ->get();

        foreach ($activeBudgets as $budget) {
            $utilization = $budget->budget_utilization;
            $remaining = $budget->remaining_balance;
            
            // Check for overspending
            if ($utilization >= 100) {
                $insights[] = [
                    'type' => 'budget_utilization',
                    'title' => "Budget exceeded: {$budget->name}",
                    'description' => "You have exceeded your budget target by " . round($utilization - 100, 1) . "%.",
                    'severity' => 'critical',
                    'data' => [
                        'budget_id' => $budget->id,
                        'budget_name' => $budget->name,
                        'target_amount' => $budget->target_amount,
                        'current_spending' => $budget->total_expenses,
                        'utilization' => $utilization,
                    ],
                    'recommendations' => [
                        'Review and reduce non-essential expenses',
                        'Consider increasing budget allocation if necessary',
                        'Identify areas where spending can be optimized',
                    ],
                ];
            }
            // Check for approaching limits
            elseif ($utilization >= 80) {
                $insights[] = [
                    'type' => 'budget_utilization',
                    'title' => "Budget limit approaching: {$budget->name}",
                    'description' => "You have used " . round($utilization, 1) . "% of your budget. " . round(100 - $utilization, 1) . "% remains.",
                    'severity' => 'warning',
                    'data' => [
                        'budget_id' => $budget->id,
                        'budget_name' => $budget->name,
                        'target_amount' => $budget->target_amount,
                        'current_spending' => $budget->total_expenses,
                        'utilization' => $utilization,
                        'remaining' => $remaining,
                    ],
                    'recommendations' => [
                        'Monitor remaining budget carefully',
                        'Consider postponing non-essential purchases',
                        'Track daily spending to avoid overspending',
                    ],
                ];
            }
        }
        
        return $insights;
    }

    public function analyzeCategoryBreakdown(User $user, Carbon $currentDate): array
    {
        $insights = [];
        
        $monthStart = $currentDate->copy()->startOfMonth();
        $monthEnd = $currentDate->copy()->endOfMonth();
        
        $categorySpending = BudgetTransaction::whereHas('budget', fn($q) => $q->forUser($user->id))
            ->where('type', 'expense')
            ->whereBetween('transaction_date', [$monthStart, $monthEnd])
            ->with('category')
            ->get()
            ->groupBy('budget_category_id')
            ->map(fn($transactions) => [
                'amount' => $transactions->sum('amount'),
                'count' => $transactions->count(),
                'category' => $transactions->first()->category?->name ?? 'Uncategorized',
            ])
            ->sortByDesc('amount');

        $totalSpending = $categorySpending->sum('amount');
        
        if ($totalSpending > 0) {
            foreach ($categorySpending as $categoryId => $data) {
                $percentage = ($data['amount'] / $totalSpending) * 100;
                
                // Flag categories that dominate spending
                if ($percentage >= 40) {
                    $insights[] = [
                        'type' => 'category_breakdown',
                        'title' => "High spending concentration in {$data['category']}",
                        'description' => "{$data['category']} accounts for " . round($percentage, 1) . "% of your total spending this month.",
                        'severity' => $percentage >= 60 ? 'critical' : 'warning',
                        'data' => [
                            'category' => $data['category'],
                            'amount' => $data['amount'],
                            'percentage' => $percentage,
                            'transaction_count' => $data['count'],
                        ],
                        'recommendations' => [
                            "Review {$data['category']} expenses for optimization opportunities",
                            'Consider if this spending level is sustainable',
                            'Look for ways to reduce costs in this category',
                        ],
                    ];
                }
            }
        }
        
        return $insights;
    }

    public function analyzeMonthlyComparison(User $user, Carbon $currentDate): array
    {
        $insights = [];
        
        // Get last 6 months data
        $months = collect(range(0, 5))->map(function($i) use ($currentDate) {
            return $currentDate->copy()->subMonths($i);
        });
        
        $monthlyData = [];
        
        foreach ($months as $date) {
            $monthStart = $date->copy()->startOfMonth();
            $monthEnd = $date->copy()->endOfMonth();
            
            $income = BudgetTransaction::whereHas('budget', fn($q) => $q->forUser($user->id))
                ->where('type', 'income')
                ->whereBetween('transaction_date', [$monthStart, $monthEnd])
                ->sum('amount');
                
            $expenses = BudgetTransaction::whereHas('budget', fn($q) => $q->forUser($user->id))
                ->where('type', 'expense')
                ->whereBetween('transaction_date', [$monthStart, $monthEnd])
                ->sum('amount');
            
            $monthlyData[] = [
                'month' => $date->format('Y-m'),
                'income' => $income,
                'expenses' => $expenses,
                'net' => $income - $expenses,
            ];
        }
        
        // Analyze trends
        if (count($monthlyData) >= 3) {
            $recentMonths = array_slice($monthlyData, 0, 3);
            $olderMonths = array_slice($monthlyData, 3, 3);
            
            $recentAvg = array_sum(array_column($recentMonths, 'expenses')) / count($recentMonths);
            $olderAvg = array_sum(array_column($olderMonths, 'expenses')) / count($olderMonths);
            
            if ($olderAvg > 0) {
                $trend = (($recentAvg - $olderAvg) / $olderAvg) * 100;
                
                if (abs($trend) >= 15) {
                    $direction = $trend > 0 ? 'increasing' : 'decreasing';
                    $severity = abs($trend) >= 30 ? 'critical' : 'warning';
                    
                    $insights[] = [
                        'type' => 'monthly_comparison',
                        'title' => "Spending trend: {$direction} over recent months",
                        'description' => "Your average monthly spending has {$direction} by " . abs(round($trend, 1)) . "% compared to 3 months ago.",
                        'severity' => $severity,
                        'data' => [
                            'trend_percentage' => $trend,
                            'recent_average' => $recentAvg,
                            'older_average' => $olderAvg,
                            'monthly_data' => $monthlyData,
                        ],
                        'recommendations' => $this->generateTrendRecommendations($trend),
                    ];
                }
            }
        }
        
        return $insights;
    }

    public function generatePredictiveInsights(User $user, Carbon $currentDate): array
    {
        $insights = [];
        
        // Predict end-of-month balance
        $activeBudgets = Budget::forUser($user->id)
            ->where('budget_year', $currentDate->year)
            ->where('budget_month', $currentDate->month)
            ->active()
            ->get();

        $totalPredictedIncome = 0;
        $totalPredictedExpenses = 0;
        
        foreach ($activeBudgets as $budget) {
            // Current income and expenses
            $totalPredictedIncome += $budget->total_income;
            $totalPredictedExpenses += $budget->total_expenses;
            
            // Add recurring transactions that haven't been processed yet
            $recurringTransactions = $budget->recurringTransactions()
                ->active()
                ->where('next_process_at', '<=', $currentDate->copy()->endOfMonth())
                ->where('next_process_at', '>', $currentDate)
                ->get();
            
            foreach ($recurringTransactions as $recurring) {
                if ($recurring->type === 'income') {
                    $totalPredictedIncome += $recurring->amount;
                } else {
                    $totalPredictedExpenses += $recurring->amount;
                }
            }
        }
        
        $predictedBalance = $totalPredictedIncome - $totalPredictedExpenses;
        
        // Generate prediction insights
        if ($predictedBalance < 0) {
            $insights[] = [
                'type' => 'prediction',
                'title' => 'Predicted budget shortfall',
                'description' => "Based on current spending patterns, you're projected to have a shortfall of " . $user->formatCurrency(abs($predictedBalance)) . " by month end.",
                'severity' => 'critical',
                'data' => [
                    'predicted_income' => $totalPredictedIncome,
                    'predicted_expenses' => $totalPredictedExpenses,
                    'predicted_balance' => $predictedBalance,
                    'prediction_date' => $currentDate->copy()->endOfMonth()->toDateString(),
                ],
                'recommendations' => [
                    'Reduce discretionary spending immediately',
                    'Look for ways to increase income this month',
                    'Consider postponing non-essential purchases',
                    'Review recurring expenses for potential savings',
                ],
            ];
        } elseif ($predictedBalance < ($totalPredictedIncome * 0.1)) {
            $insights[] = [
                'type' => 'prediction',
                'title' => 'Low projected savings',
                'description' => "You're projected to save only " . $user->formatCurrency($predictedBalance) . " this month, which is less than 10% of your income.",
                'severity' => 'warning',
                'data' => [
                    'predicted_income' => $totalPredictedIncome,
                    'predicted_expenses' => $totalPredictedExpenses,
                    'predicted_balance' => $predictedBalance,
                    'savings_rate' => $totalPredictedIncome > 0 ? ($predictedBalance / $totalPredictedIncome) * 100 : 0,
                ],
                'recommendations' => [
                    'Aim to save at least 10-20% of your income',
                    'Identify areas where expenses can be reduced',
                    'Look for additional income opportunities',
                ],
            ];
        }
        
        return $insights;
    }

    public function detectAnomalies(User $user, Carbon $currentDate): array
    {
        $insights = [];
        
        // Get recent transactions
        $recentDate = $currentDate->copy()->subDays(7);
        $recentTransactions = BudgetTransaction::whereHas('budget', fn($q) => $q->forUser($user->id))
            ->where('transaction_date', '>=', $recentDate)
            ->where('type', 'expense')
            ->orderBy('amount', 'desc')
            ->get();

        foreach ($recentTransactions as $transaction) {
            // Check for unusually large transactions
            $categoryAvg = BudgetTransaction::whereHas('budget', fn($q) => $q->forUser($user->id))
                ->where('type', 'expense')
                ->where('budget_category_id', $transaction->budget_category_id)
                ->where('transaction_date', '>=', $currentDate->copy()->subMonths(3))
                ->avg('amount');

            if ($categoryAvg && $transaction->amount > ($categoryAvg * 3)) {
                $insights[] = [
                    'type' => 'anomaly',
                    'title' => 'Unusually large transaction detected',
                    'description' => "A transaction of " . $user->formatCurrency($transaction->amount) . " in " . ($transaction->category?->name ?? 'Uncategorized') . " is significantly higher than your average of " . $user->formatCurrency($categoryAvg) . ".",
                    'severity' => 'warning',
                    'data' => [
                        'transaction_id' => $transaction->id,
                        'transaction_amount' => $transaction->amount,
                        'category_average' => $categoryAvg,
                        'category' => $transaction->category?->name ?? 'Uncategorized',
                        'multiplier' => $transaction->amount / $categoryAvg,
                    ],
                    'recommendations' => [
                        'Verify if this transaction is legitimate',
                        'Consider if this expense was planned',
                        'Review if similar expenses are expected in the future',
                    ],
                ];
            }
        }
        
        return $insights;
    }

    private function generateSpendingRecommendations(string $category, float $percentageChange, float $currentAmount): array
    {
        $recommendations = [];
        
        if ($percentageChange > 0) {
            $recommendations[] = "Review recent {$category} expenses for necessity";
            $recommendations[] = "Look for ways to reduce {$category} costs";
            $recommendations[] = "Consider setting a lower budget limit for {$category}";
            
            if ($category === 'food') {
                $recommendations[] = "Try meal planning to reduce food expenses";
                $recommendations[] = "Consider cooking at home more often";
            } elseif ($category === 'transport') {
                $recommendations[] = "Look into carpooling or public transportation options";
                $recommendations[] = "Consider combining trips to reduce fuel costs";
            }
        } else {
            $recommendations[] = "Great job reducing {$category} expenses!";
            $recommendations[] = "Consider allocating savings to other financial goals";
        }
        
        return $recommendations;
    }

    private function generateTrendRecommendations(float $trend): array
    {
        $recommendations = [];
        
        if ($trend > 0) {
            $recommendations[] = "Identify the main drivers of increased spending";
            $recommendations[] = "Review subscription services for unused or redundant items";
            $recommendations[] = "Set stricter spending limits for problem categories";
            $recommendations[] = "Implement a daily spending tracking routine";
        } else {
            $recommendations[] = "Maintain your current spending habits";
            $recommendations[] = "Consider allocating extra savings to investments";
            $recommendations[] = "Review if reduced spending is sustainable";
        }
        
        return $recommendations;
    }

    private function saveInsight(User $user, array $insight): void
    {
        FinancialAnalytics::create([
            'user_id' => $user->id,
            'budget_id' => $insight['data']['budget_id'] ?? null,
            'type' => $insight['type'],
            'title' => $insight['title'],
            'description' => $insight['description'],
            'data' => $insight['data'],
            'severity' => $insight['severity'],
            'status' => 'active',
            'analysis_date' => now(),
            'period_start' => now()->startOfMonth(),
            'period_end' => now()->endOfMonth(),
            'recommendations' => $insight['recommendations'] ?? [],
        ]);
    }

    public function generateNotifications(User $user): array
    {
        $notifications = [];
        $currentDate = now();
        
        // Check for upcoming recurring payments
        $upcomingPayments = \App\Models\RecurringTransaction::forUser($user->id)
            ->active()
            ->where('next_process_at', '<=', $currentDate->copy()->addDays(3))
            ->where('next_process_at', '>', $currentDate)
            ->get();

        foreach ($upcomingPayments as $payment) {
            $notifications[] = [
                'type' => 'upcoming_recurring_payment',
                'title' => 'Upcoming recurring payment',
                'message' => "A recurring payment of " . $payment->budget->formatCurrency($payment->amount) . " for {$payment->title} is due on " . $payment->next_process_at->format('M j, Y'),
                'priority' => $payment->type === 'expense' ? 'medium' : 'low',
                'related_id' => $payment->id,
                'related_type' => \App\Models\RecurringTransaction::class,
                'budget_id' => $payment->budget_id,
                'scheduled_at' => $payment->next_process_at->copy()->subDays(1),
            ];
        }
        
        // Check for overspending alerts
        $activeBudgets = Budget::forUser($user->id)
            ->where('budget_year', $currentDate->year)
            ->where('budget_month', $currentDate->month)
            ->active()
            ->get();

        foreach ($activeBudgets as $budget) {
            if ($budget->budget_utilization >= 90) {
                $notifications[] = [
                    'type' => 'overspending_alert',
                    'title' => 'Budget limit exceeded',
                    'message' => "You have exceeded your budget for {$budget->name} by " . round($budget->budget_utilization - 100, 1) . "%",
                    'priority' => 'high',
                    'budget_id' => $budget->id,
                    'scheduled_at' => now(),
                ];
            } elseif ($budget->budget_utilization >= 75) {
                $notifications[] = [
                    'type' => 'budget_limit_warning',
                    'title' => 'Budget limit approaching',
                    'message' => "You have used " . round($budget->budget_utilization, 1) . "% of your budget for {$budget->name}",
                    'priority' => 'medium',
                    'budget_id' => $budget->id,
                    'scheduled_at' => now(),
                ];
            }
        }
        
        // Save notifications
        foreach ($notifications as $notification) {
            Notification::create(array_merge([
                'user_id' => $user->id,
            ], $notification));
        }
        
        return $notifications;
    }
}
