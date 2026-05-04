<?php

namespace App\Http\Controllers\Web\Budgets;

use App\Http\Controllers\Controller;
use App\Models\Budget;
use App\Models\RecurringTransaction;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;
use Inertia\Inertia;
use Inertia\Response;

class RecurringTransactionController extends Controller
{
    public function overview(Request $request): Response
    {
        $user = $request->user();

        $query = RecurringTransaction::query()
            ->whereHas('budget', fn ($q) => $q->forUser($user->id))
            ->with(['budget:id,name,currency', 'category:id,name,type'])
            ->orderBy('next_process_at', 'asc');

        if ($request->filled('interval') && $request->get('interval') !== 'all') {
            $query->where('interval', $request->get('interval'));
        }
        if ($request->filled('status') && $request->get('status') !== 'all') {
            $query->where('status', $request->get('status'));
        }

        $recurringTransactions = $query->paginate(20)->withQueryString();

        $monthlyExpenseTotal = RecurringTransaction::query()
            ->whereHas('budget', fn ($q) => $q->forUser($user->id))
            ->where('status', 'active')
            ->where('interval', 'monthly')
            ->where('type', 'expense')
            ->sum('amount');

        $monthlyIncomeTotal = RecurringTransaction::query()
            ->whereHas('budget', fn ($q) => $q->forUser($user->id))
            ->where('status', 'active')
            ->where('interval', 'monthly')
            ->where('type', 'income')
            ->sum('amount');

        return Inertia::render('budgets/recurring-transactions/index', [
            'recurringTransactions' => $recurringTransactions,
            'totals' => [
                'monthly_expense' => $monthlyExpenseTotal,
                'monthly_income' => $monthlyIncomeTotal,
                'active_count' => RecurringTransaction::query()
                    ->whereHas('budget', fn ($q) => $q->forUser($user->id))
                    ->where('status', 'active')
                    ->count(),
            ],
            'filters' => $request->only(['interval', 'status']),
        ]);
    }

    public function index(Request $request, Budget $budget): Response
    {
        $this->authorize('view', $budget);

        $query = $budget->recurringTransactions()
            ->orderBy('created_at', 'desc');

        // Filter by status if provided
        if ($request->has('status')) {
            $query->where('status', $request->get('status'));
        }

        // Filter by interval if provided
        if ($request->has('interval')) {
            $query->where('interval', $request->get('interval'));
        }

        $recurringTransactions = $query->paginate(15)->withQueryString();

        return Inertia::render('budgets/recurring-transactions/index', [
            'budget' => $budget,
            'recurringTransactions' => $recurringTransactions,
            'filters' => $request->only(['status', 'interval']),
        ]);
    }

    public function create(Request $request, Budget $budget): Response
    {
        $this->authorize('update', $budget);

        return Inertia::render('budgets/recurring-transactions/create', [
            'budget' => $budget,
            'categories' => $budget->categories,
        ]);
    }

    public function store(Request $request, Budget $budget): RedirectResponse
    {
        $this->authorize('update', $budget);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'budget_category_id' => 'nullable|exists:budget_categories,id',
            'amount' => 'required|numeric|min:0.01',
            'type' => 'required|in:income,expense',
            'interval' => 'required|in:weekly,monthly,yearly',
            'day_of_month' => 'required_if:interval,monthly|integer|min:1|max:31',
            'day_of_week' => 'required_if:interval,weekly|string|in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
            'month_of_year' => 'required_if:interval,yearly|integer|min:1|max:12',
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'nullable|date|after:start_date',
        ]);

        // Validate that the category belongs to this budget and matches the transaction type
        if ($validated['budget_category_id']) {
            $category = $budget->categories()->find($validated['budget_category_id']);
            if (!$category || $category->type !== $validated['type']) {
                return back()->withErrors(['budget_category_id' => 'Invalid category selection.']);
            }
        }

        // Set next process date based on interval
        $nextProcessDate = match ($validated['interval']) {
            'weekly' => $this->getNextWeeklyDate($validated['day_of_week'], $validated['start_date']),
            'monthly' => $this->getNextMonthlyDate($validated['day_of_month'], $validated['start_date']),
            'yearly' => $this->getNextYearlyDate($validated['month_of_year'], $validated['day_of_month'] ?? 1, $validated['start_date']),
            default => null,
        };

        $recurringTransaction = $budget->recurringTransactions()->create([
            ...$validated,
            'next_process_at' => $nextProcessDate,
        ]);

        return redirect()
            ->route('budgets.recurring-transactions.show', [$budget, $recurringTransaction])
            ->with('status', 'Recurring transaction created successfully.');
    }

    public function show(Budget $budget, RecurringTransaction $recurringTransaction): Response
    {
        $this->authorize('view', $budget);

        if ($recurringTransaction->budget_id !== $budget->id) {
            abort(404);
        }

        $recurringTransaction->load(['budget', 'category']);

        return Inertia::render('budgets/recurring-transactions/show', [
            'budget' => $budget,
            'recurringTransaction' => $recurringTransaction,
        ]);
    }

    public function edit(Request $request, Budget $budget, RecurringTransaction $recurringTransaction): Response
    {
        $this->authorize('update', $budget);

        if ($recurringTransaction->budget_id !== $budget->id) {
            abort(404);
        }

        return Inertia::render('budgets/recurring-transactions/edit', [
            'budget' => $budget,
            'recurringTransaction' => $recurringTransaction,
            'categories' => $budget->categories,
        ]);
    }

    public function update(Request $request, Budget $budget, RecurringTransaction $recurringTransaction): RedirectResponse
    {
        $this->authorize('update', $budget);

        if ($recurringTransaction->budget_id !== $budget->id) {
            abort(404);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'budget_category_id' => 'nullable|exists:budget_categories,id',
            'amount' => 'required|numeric|min:0.01',
            'status' => 'required|in:active,paused,completed,cancelled',
            'end_date' => 'nullable|date|after:start_date',
        ]);

        // Validate that the category belongs to this budget and matches the transaction type
        if ($validated['budget_category_id']) {
            $category = $budget->categories()->find($validated['budget_category_id']);
            if (!$category || $category->type !== $recurringTransaction->type) {
                return back()->withErrors(['budget_category_id' => 'Invalid category selection.']);
            }
        }

        $recurringTransaction->update($validated);

        return redirect()
            ->route('budgets.recurring-transactions.show', [$budget, $recurringTransaction])
            ->with('status', 'Recurring transaction updated successfully.');
    }

    public function destroy(Budget $budget, RecurringTransaction $recurringTransaction): RedirectResponse
    {
        $this->authorize('update', $budget);

        if ($recurringTransaction->budget_id !== $budget->id) {
            abort(404);
        }

        $recurringTransaction->delete();

        return redirect()
            ->route('budgets.recurring-transactions.index', $budget)
            ->with('status', 'Recurring transaction deleted successfully.');
    }

    public function process(Budget $budget, RecurringTransaction $recurringTransaction): RedirectResponse
    {
        $this->authorize('update', $budget);

        if ($recurringTransaction->budget_id !== $budget->id) {
            abort(404);
        }

        if ($recurringTransaction->status !== 'active') {
            return back()->withErrors(['status' => 'Cannot process a non-active recurring transaction.']);
        }

        // Generate the transaction
        $transaction = $recurringTransaction->generateTransaction();
        $transaction->save();

        // Mark as processed
        $recurringTransaction->markAsProcessed();

        return redirect()
            ->route('budgets.transactions.show', [$budget, $transaction])
            ->with('status', 'Transaction generated successfully.');
    }

    private function getNextWeeklyDate($dayOfWeek, $startDate): string
    {
        $date = new \Carbon\Carbon($startDate);
        while ($date->format('l') !== ucfirst($dayOfWeek)) {
            $date->addDay();
        }
        return $date->toDateString();
    }

    private function getNextMonthlyDate($dayOfMonth, $startDate): string
    {
        $date = new \Carbon\Carbon($startDate);
        $daysInMonth = $date->daysInMonth;
        $targetDay = min($dayOfMonth, $daysInMonth);
        
        if ($date->day > $targetDay) {
            $date->addMonth();
        }
        
        return $date->day($targetDay)->toDateString();
    }

    private function getNextYearlyDate($month, $day, $startDate): string
    {
        $date = new \Carbon\Carbon($startDate);
        $targetDay = min($day, 28); // Use 28 to avoid invalid dates
        
        if ($date->month > $month || ($date->month === $month && $date->day > $targetDay)) {
            $date->addYear();
        }
        
        return $date->month($month)->day($targetDay)->toDateString();
    }
}
