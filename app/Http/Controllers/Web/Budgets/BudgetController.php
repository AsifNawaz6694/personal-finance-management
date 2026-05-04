<?php

namespace App\Http\Controllers\Web\Budgets;

use App\Http\Controllers\Controller;
use App\Models\Budget;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;
use Inertia\Inertia;
use Inertia\Response;

class BudgetController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        
        $query = Budget::forUser($user->id)
            ->with(['categories', 'transactions'])
            ->orderBy('budget_year', 'desc')
            ->orderBy('budget_month', 'desc');

        // Filter by year if provided and not 'all'
        if ($request->has('year') && $request->get('year') !== 'all') {
            $query->forYear($request->get('year'));
        }

        // Filter by month if provided and not 'all'
        if ($request->has('month') && $request->get('month') !== 'all') {
            $query->forMonth($request->get('month'));
        }

        // Filter by currency if provided and not 'all'
        if ($request->has('currency') && $request->get('currency') !== 'all') {
            $query->forCurrency($request->get('currency'));
        }

        $budgets = $query->paginate(10)->withQueryString();

        // Get available years for filter
        $availableYears = Budget::forUser($user->id)
            ->distinct('budget_year')
            ->orderBy('budget_year', 'desc')
            ->pluck('budget_year');

        return Inertia::render('budgets/index', [
            'budgets' => $budgets,
            'availableYears' => $availableYears,
            'filters' => $request->only(['year', 'month', 'currency']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('budgets/create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'type' => 'required|in:personal,household,travel,custom',
            'custom_type' => 'required_if:type,custom|string|max:255',
            'target_amount' => 'required|numeric|min:0',
            'currency' => 'required|in:PKR,SAR',
            'budget_year' => 'required|integer|min:2020|max:2030',
            'budget_month' => 'required|integer|min:1|max:12',
        ]);

        $budget = $request->user()->budgets()->create($validated);

        return redirect()
            ->route('budgets.show', $budget)
            ->with('status', 'Budget created successfully.');
    }

    public function show(Budget $budget): Response
    {
        $this->authorize('view', $budget);
        
        $budget->load([
            'categories',
            'transactions' => fn($query) => $query->orderBy('transaction_date', 'desc'),
        ]);

        return Inertia::render('budgets/show', [
            'budget' => $budget,
        ]);
    }

    public function edit(Budget $budget): Response
    {
        $this->authorize('update', $budget);
        
        return Inertia::render('budgets/edit', [
            'budget' => $budget,
        ]);
    }

    public function update(Request $request, Budget $budget): RedirectResponse
    {
        $this->authorize('update', $budget);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'type' => 'required|in:personal,household,travel,custom',
            'custom_type' => 'required_if:type,custom|string|max:255',
            'target_amount' => 'required|numeric|min:0',
            'status' => 'required|in:active,completed,archived',
        ]);

        $budget->update($validated);

        return redirect()
            ->route('budgets.show', $budget)
            ->with('status', 'Budget updated successfully.');
    }

    public function destroy(Budget $budget): RedirectResponse
    {
        $this->authorize('delete', $budget);

        $budget->delete();

        return redirect()
            ->route('budgets.index')
            ->with('status', 'Budget deleted successfully.');
    }

    public function dashboard(Request $request): Response
    {
        $user = $request->user();

        $currentYear = now()->year;
        $currentMonth = now()->month;

        $currentBudgets = Budget::forUser($user->id)
            ->active()
            ->forYear($currentYear)
            ->forMonth($currentMonth)
            ->with(['categories', 'transactions'])
            ->get();

        $totalTargetAmount = $currentBudgets->sum('target_amount');
        $totalIncome = $currentBudgets->sum(fn ($b) => $b->total_income);
        $totalExpenses = $currentBudgets->sum(fn ($b) => $b->total_expenses);
        $totalRemaining = $totalIncome - $totalExpenses;

        $recentTransactions = \App\Models\BudgetTransaction::query()
            ->whereHas('budget', fn ($q) => $q->forUser($user->id))
            ->with(['budget', 'category'])
            ->orderBy('transaction_date', 'desc')
            ->limit(10)
            ->get();

        // ── 6-month income/expense trend ──────────────────────────────
        $monthlyTrend = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $start = $date->copy()->startOfMonth();
            $end = $date->copy()->endOfMonth();

            $income = (float) \App\Models\BudgetTransaction::query()
                ->whereHas('budget', fn ($q) => $q->forUser($user->id))
                ->where('type', 'income')
                ->whereBetween('transaction_date', [$start, $end])
                ->sum('amount');

            $expenses = (float) \App\Models\BudgetTransaction::query()
                ->whereHas('budget', fn ($q) => $q->forUser($user->id))
                ->where('type', 'expense')
                ->whereBetween('transaction_date', [$start, $end])
                ->sum('amount');

            $monthlyTrend[] = [
                'label' => $date->format('M'),
                'month' => $date->format('Y-m'),
                'income' => round($income, 2),
                'expenses' => round($expenses, 2),
                'net' => round($income - $expenses, 2),
            ];
        }

        // ── Top expense categories this month ─────────────────────────
        $categoryBreakdown = \App\Models\BudgetTransaction::query()
            ->whereHas('budget', fn ($q) => $q->forUser($user->id))
            ->where('type', 'expense')
            ->whereBetween('transaction_date', [
                now()->startOfMonth(),
                now()->endOfMonth(),
            ])
            ->with('category')
            ->get()
            ->groupBy('budget_category_id')
            ->map(fn ($group) => [
                'name' => $group->first()->category?->name ?? 'Uncategorized',
                'value' => round((float) $group->sum('amount'), 2),
                'count' => $group->count(),
            ])
            ->sortByDesc('value')
            ->take(6)
            ->values();

        return Inertia::render('budgets/dashboard', [
            'currentBudgets' => $currentBudgets,
            'statistics' => [
                'totalTargetAmount' => $totalTargetAmount,
                'totalIncome' => $totalIncome,
                'totalExpenses' => $totalExpenses,
                'totalRemaining' => $totalRemaining,
                'budgetCount' => $currentBudgets->count(),
                'savingsRate' => $totalIncome > 0 ? round((($totalIncome - $totalExpenses) / $totalIncome) * 100, 1) : 0,
            ],
            'monthlyTrend' => $monthlyTrend,
            'categoryBreakdown' => $categoryBreakdown,
            'recentTransactions' => $recentTransactions,
            'currentPeriod' => [
                'year' => $currentYear,
                'month' => $currentMonth,
                'monthName' => date('F', mktime(0, 0, 0, $currentMonth, 1)),
            ],
        ]);
    }
}
