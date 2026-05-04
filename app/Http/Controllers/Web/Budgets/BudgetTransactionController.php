<?php

namespace App\Http\Controllers\Web\Budgets;

use App\Http\Controllers\Controller;
use App\Models\Budget;
use App\Models\BudgetCategory;
use App\Models\BudgetTransaction;
use App\Models\TransactionTag;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BudgetTransactionController extends Controller
{
    public function index(Request $request, Budget $budget): Response
    {
        $this->authorize('view', $budget);

        $query = $budget->transactions()
            ->with('category')
            ->orderBy('transaction_date', 'desc');

        // Filter by type if provided
        if ($request->has('type')) {
            $query->where('type', $request->get('type'));
        }

        // Filter by category if provided
        if ($request->has('category_id')) {
            $query->where('budget_category_id', $request->get('category_id'));
        }

        // Filter by date range if provided
        if ($request->has('start_date') && $request->has('end_date')) {
            $query->forDateRange($request->get('start_date'), $request->get('end_date'));
        }

        $transactions = $query->paginate(20)->withQueryString();

        return Inertia::render('budgets/transactions/index', [
            'budget' => $budget,
            'transactions' => $transactions,
            'categories' => $budget->categories,
            'filters' => $request->only(['type', 'category_id', 'start_date', 'end_date']),
        ]);
    }

    public function create(Request $request, Budget $budget): Response
    {
        $this->authorize('update', $budget);

        return Inertia::render('budgets/transactions/create', [
            'budget' => $budget,
            'categories' => $budget->categories,
            'tags' => TransactionTag::forUser($request->user()->id)->orderBy('name')->get(['id', 'name', 'color']),
            'type' => $request->get('type', 'expense'),
        ]);
    }

    public function store(Request $request, Budget $budget): RedirectResponse
    {
        $this->authorize('update', $budget);

        $validated = $request->validate([
            'budget_category_id' => 'nullable|exists:budget_categories,id',
            'description' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0.01',
            'type' => 'required|in:income,expense',
            'transaction_date' => 'required|date|before_or_equal:today',
            'notes' => 'nullable|string|max:1000',
            'tag_ids' => 'nullable|array',
            'tag_ids.*' => 'integer|exists:transaction_tags,id',
        ]);

        if ($validated['budget_category_id'] ?? null) {
            $category = BudgetCategory::find($validated['budget_category_id']);
            if ($category->budget_id !== $budget->id || $category->type !== $validated['type']) {
                return back()->withErrors(['budget_category_id' => 'Invalid category selection.']);
            }
        }

        $tagIds = $validated['tag_ids'] ?? [];
        unset($validated['tag_ids']);

        $transaction = $budget->transactions()->create($validated);

        if (! empty($tagIds)) {
            $userTagIds = TransactionTag::forUser($request->user()->id)->whereIn('id', $tagIds)->pluck('id');
            $transaction->tags()->sync($userTagIds);
        }

        return redirect()
            ->route('budgets.transactions.show', [$budget, $transaction])
            ->with('status', 'Transaction added successfully.');
    }

    public function show(Budget $budget, BudgetTransaction $transaction): Response
    {
        $this->authorize('view', $budget);

        if ($transaction->budget_id !== $budget->id) {
            abort(404);
        }

        $transaction->load(['budget', 'category', 'tags']);

        return Inertia::render('budgets/transactions/show', [
            'budget' => $budget,
            'transaction' => $transaction,
        ]);
    }

    public function edit(Request $request, Budget $budget, BudgetTransaction $transaction): Response
    {
        $this->authorize('update', $budget);

        if ($transaction->budget_id !== $budget->id) {
            abort(404);
        }

        $transaction->load('tags');

        return Inertia::render('budgets/transactions/edit', [
            'budget' => $budget,
            'transaction' => $transaction,
            'categories' => $budget->categories,
            'tags' => TransactionTag::forUser($request->user()->id)->orderBy('name')->get(['id', 'name', 'color']),
            'selectedTagIds' => $transaction->tags->pluck('id')->all(),
        ]);
    }

    public function update(Request $request, Budget $budget, BudgetTransaction $transaction): RedirectResponse
    {
        $this->authorize('update', $budget);

        if ($transaction->budget_id !== $budget->id) {
            abort(404);
        }

        $validated = $request->validate([
            'budget_category_id' => 'nullable|exists:budget_categories,id',
            'description' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0.01',
            'type' => 'required|in:income,expense',
            'transaction_date' => 'required|date|before_or_equal:today',
            'notes' => 'nullable|string|max:1000',
            'tag_ids' => 'nullable|array',
            'tag_ids.*' => 'integer|exists:transaction_tags,id',
        ]);

        if ($validated['budget_category_id'] ?? null) {
            $category = BudgetCategory::find($validated['budget_category_id']);
            if ($category->budget_id !== $budget->id || $category->type !== $validated['type']) {
                return back()->withErrors(['budget_category_id' => 'Invalid category selection.']);
            }
        }

        $tagIds = $validated['tag_ids'] ?? [];
        unset($validated['tag_ids']);

        $transaction->update($validated);

        $userTagIds = TransactionTag::forUser($request->user()->id)->whereIn('id', $tagIds)->pluck('id');
        $transaction->tags()->sync($userTagIds);

        return redirect()
            ->route('budgets.transactions.show', [$budget, $transaction])
            ->with('status', 'Transaction updated successfully.');
    }

    public function destroy(Budget $budget, BudgetTransaction $transaction): RedirectResponse
    {
        $this->authorize('update', $budget);

        if ($transaction->budget_id !== $budget->id) {
            abort(404);
        }

        $transaction->delete();

        return redirect()
            ->route('budgets.transactions.index', $budget)
            ->with('status', 'Transaction deleted successfully.');
    }
}
