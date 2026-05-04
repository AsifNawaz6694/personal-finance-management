<?php

namespace App\Http\Controllers\Web\Budgets;

use App\Http\Controllers\Controller;
use App\Models\Budget;
use App\Models\FinancialAnalytics;
use App\Models\Notification;
use App\Models\SpendingPattern;
use App\Services\FinancialAnalyticsEngine;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AnalyticsController extends Controller
{
    protected $analyticsEngine;

    public function __construct(FinancialAnalyticsEngine $analyticsEngine)
    {
        $this->analyticsEngine = $analyticsEngine;
    }

    public function index(Request $request): Response
    {
        $user = $request->user();
        
        // Generate fresh insights
        $this->analyticsEngine->generateUserInsights($user);
        $this->analyticsEngine->generateNotifications($user);
        
        // Get insights with filtering
        $query = FinancialAnalytics::forUser($user->id)
            ->with(['budget', 'user'])
            ->orderBy('created_at', 'desc');

        // Filter by type if provided and not 'all'
        if ($request->has('type') && $request->get('type') !== 'all') {
            $query->where('type', $request->get('type'));
        }

        // Filter by severity if provided and not 'all'
        if ($request->has('severity') && $request->get('severity') !== 'all') {
            $query->where('severity', $request->get('severity'));
        }

        // Filter by status if provided and not 'all'
        if ($request->has('status') && $request->get('status') !== 'all') {
            $query->where('status', $request->get('status'));
        }

        $insights = $query->paginate(20)->withQueryString();

        // Get spending patterns for analysis
        $spendingPatterns = SpendingPattern::forUser($user->id)
            ->with('category')
            ->orderBy('period_start', 'desc')
            ->limit(50)
            ->get();

        return Inertia::render('budgets/analytics/index', [
            'insights' => $insights,
            'spendingPatterns' => $spendingPatterns,
            'filters' => $request->only(['type', 'severity', 'status']),
        ]);
    }

    public function show(FinancialAnalytics $analytics): Response
    {
        $this->authorize('view', $analytics);

        $analytics->load(['budget', 'user']);

        return Inertia::render('budgets/analytics/show', [
            'analytics' => $analytics,
        ]);
    }

    public function acknowledge(FinancialAnalytics $analytics): RedirectResponse
    {
        $this->authorize('update', $analytics);

        $analytics->acknowledge();

        return back()->with('status', 'Insight acknowledged.');
    }

    public function dismiss(FinancialAnalytics $analytics): RedirectResponse
    {
        $this->authorize('update', $analytics);

        $analytics->dismiss();

        return back()->with('status', 'Insight dismissed.');
    }

    public function spendingAnalysis(Request $request): Response
    {
        $user = $request->user();
        
        $periodType = $request->get('period_type', 'monthly');
        $months = (int) $request->get('months', 6);
        
        $patterns = SpendingPattern::forUser($user->id)
            ->byPeriodType($periodType)
            ->with('category')
            ->orderBy('period_start', 'desc')
            ->limit($months * 10) // Approximate limit
            ->get();

        // Group patterns by category for trend analysis
        $categoryTrends = $patterns->groupBy('category_name')
            ->map(function ($categoryPatterns) {
                return [
                    'category' => $categoryPatterns->first()->category_name,
                    'patterns' => $categoryPatterns->sortBy('period_start')->values(),
                    'current_amount' => $categoryPatterns->first()->total_spent,
                    'trend_percentage' => $categoryPatterns->first()->trend_percentage,
                    'is_anomalous' => $categoryPatterns->some(fn($p) => $p->is_anomalous),
                ];
            });

        return Inertia::render('budgets/analytics/spending-analysis', [
            'categoryTrends' => $categoryTrends,
            'periodType' => $periodType,
            'months' => $months,
        ]);
    }

    public function monthlyComparison(Request $request): Response
    {
        $user = $request->user();
        
        $months = (int) $request->get('months', 6);
        
        $monthlyData = [];
        
        for ($i = 0; $i < $months; $i++) {
            $date = now()->subMonths($i);
            $monthStart = $date->copy()->startOfMonth();
            $monthEnd = $date->copy()->endOfMonth();
            
            $income = \App\Models\BudgetTransaction::whereHas('budget', fn($q) => $q->forUser($user->id))
                ->where('type', 'income')
                ->whereBetween('transaction_date', [$monthStart, $monthEnd])
                ->sum('amount');
                
            $expenses = \App\Models\BudgetTransaction::whereHas('budget', fn($q) => $q->forUser($user->id))
                ->where('type', 'expense')
                ->whereBetween('transaction_date', [$monthStart, $monthEnd])
                ->sum('amount');
            
            // Category breakdown for this month
            $categoryBreakdown = \App\Models\BudgetTransaction::whereHas('budget', fn($q) => $q->forUser($user->id))
                ->where('type', 'expense')
                ->whereBetween('transaction_date', [$monthStart, $monthEnd])
                ->with('category')
                ->get()
                ->groupBy('budget_category_id')
                ->map(fn($transactions) => [
                    'category' => $transactions->first()->category?->name ?? 'Uncategorized',
                    'amount' => $transactions->sum('amount'),
                    'count' => $transactions->count(),
                ])
                ->sortByDesc('amount');
            
            $monthlyData[] = [
                'month' => $date->format('Y-m'),
                'month_name' => $date->format('F Y'),
                'income' => $income,
                'expenses' => $expenses,
                'net' => $income - $expenses,
                'savings_rate' => $income > 0 ? (($income - $expenses) / $income) * 100 : 0,
                'category_breakdown' => $categoryBreakdown->values(),
            ];
        }

        return Inertia::render('budgets/analytics/monthly-comparison', [
            'monthlyData' => array_reverse($monthlyData),
            'months' => $months,
        ]);
    }

    public function predictions(Request $request): Response
    {
        $user = $request->user();
        
        $currentDate = now();
        $currentBudgets = \App\Models\Budget::forUser($user->id)
            ->where('budget_year', $currentDate->year)
            ->where('budget_month', $currentDate->month)
            ->active()
            ->with(['recurringTransactions' => fn($q) => $q->active()])
            ->get();

        $predictions = [];
        
        foreach ($currentBudgets as $budget) {
            // Current state
            $currentIncome = $budget->total_income;
            $currentExpenses = $budget->total_expenses;
            
            // Predict remaining month
            $remainingIncome = $currentIncome;
            $remainingExpenses = $currentExpenses;
            
            // Add upcoming recurring transactions
            foreach ($budget->recurringTransactions as $recurring) {
                if ($recurring->next_process_at && 
                    $recurring->next_process_at->greaterThan($currentDate) &&
                    $recurring->next_process_at->lessThanOrEqualTo($currentDate->copy()->endOfMonth())) {
                    
                    if ($recurring->type === 'income') {
                        $remainingIncome += $recurring->amount;
                    } else {
                        $remainingExpenses += $recurring->amount;
                    }
                }
            }
            
            // Calculate predictions based on historical patterns
            $dailySpendingRate = $currentExpenses / max($currentDate->day, 1);
            $daysRemaining = $currentDate->copy()->endOfMonth()->day - $currentDate->day;
            $predictedAdditionalExpenses = $dailySpendingRate * $daysRemaining;
            
            $totalPredictedIncome = $currentIncome + ($remainingIncome - $currentIncome);
            $totalPredictedExpenses = $currentExpenses + $predictedAdditionalExpenses;
            $predictedBalance = $totalPredictedIncome - $totalPredictedExpenses;
            
            $predictions[] = [
                'budget' => $budget,
                'current_income' => $currentIncome,
                'current_expenses' => $currentExpenses,
                'predicted_income' => $totalPredictedIncome,
                'predicted_expenses' => $totalPredictedExpenses,
                'predicted_balance' => $predictedBalance,
                'confidence_level' => $this->calculatePredictionConfidence($budget, $currentDate),
                'risk_level' => $this->calculateRiskLevel($predictedBalance, $totalPredictedIncome),
            ];
        }

        return Inertia::render('budgets/analytics/predictions', [
            'predictions' => $predictions,
            'analysisDate' => $currentDate,
        ]);
    }

    public function notifications(Request $request): Response
    {
        $user = $request->user();
        
        $query = Notification::forUser($user->id)
            ->with(['budget', 'related'])
            ->orderBy('created_at', 'desc');

        // Filter by type if provided
        if ($request->has('type')) {
            $query->where('type', $request->get('type'));
        }

        // Filter by status if provided
        if ($request->has('status')) {
            $query->where('status', $request->get('status'));
        }

        // Filter by priority if provided
        if ($request->has('priority')) {
            $query->where('priority', $request->get('priority'));
        }

        $notifications = $query->paginate(20)->withQueryString();

        // Get unread count
        $unreadCount = Notification::forUser($user->id)->unread()->count();

        return Inertia::render('budgets/analytics/notifications', [
            'notifications' => $notifications,
            'unreadCount' => $unreadCount,
            'filters' => $request->only(['type', 'status', 'priority']),
        ]);
    }

    public function markNotificationAsRead(Notification $notification): RedirectResponse
    {
        $this->authorize('update', $notification);

        $notification->markAsRead();

        return back()->with('status', 'Notification marked as read.');
    }

    public function dismissNotification(Notification $notification): RedirectResponse
    {
        $this->authorize('update', $notification);

        $notification->dismiss();

        return back()->with('status', 'Notification dismissed.');
    }

    public function markAllAsRead(Request $request): RedirectResponse
    {
        $user = $request->user();
        
        Notification::forUser($user->id)
            ->unread()
            ->get()
            ->each->markAsRead();

        return back()->with('status', 'All notifications marked as read.');
    }

    private function calculatePredictionConfidence(Budget $budget, Carbon $currentDate): string
    {
        $daysInMonth = $currentDate->daysInMonth;
        $daysPassed = $currentDate->day;
        
        // Higher confidence later in the month with more data
        if ($daysPassed >= 25) {
            return 'high';
        } elseif ($daysPassed >= 15) {
            return 'medium';
        } else {
            return 'low';
        }
    }

    private function calculateRiskLevel(float $predictedBalance, float $predictedIncome): string
    {
        if ($predictedBalance < 0) {
            return 'critical';
        } elseif ($predictedBalance < ($predictedIncome * 0.1)) {
            return 'high';
        } elseif ($predictedBalance < ($predictedIncome * 0.2)) {
            return 'medium';
        } else {
            return 'low';
        }
    }
}
