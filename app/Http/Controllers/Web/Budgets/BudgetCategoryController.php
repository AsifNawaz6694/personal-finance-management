<?php

namespace App\Http\Controllers\Web\Budgets;

use App\Http\Controllers\Controller;
use App\Models\Budget;
use App\Models\BudgetCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;
use Inertia\Inertia;
use Inertia\Response;

class BudgetCategoryController extends Controller
{
    public function index(Budget $budget): Response
    {
        $this->authorize('view', $budget);

        $categories = $budget->categories()
            ->with('transactions')
            ->orderBy('type')
            ->orderBy('name')
            ->get();

        return Inertia::render('budgets/categories/index', [
            'budget' => $budget,
            'categories' => $categories,
        ]);
    }

    public function create(Request $request, Budget $budget): Response
    {
        $this->authorize('update', $budget);

        return Inertia::render('budgets/categories/create', [
            'budget' => $budget,
            'type' => $request->get('type', 'expense'),
        ]);
    }

    public function store(Request $request, Budget $budget): RedirectResponse
    {
        $this->authorize('update', $budget);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'allocated_amount' => 'required|numeric|min:0',
            'type' => 'required|in:income,expense',
            'color' => 'nullable|string|max:7', // hex color
        ]);

        $category = $budget->categories()->create($validated);

        return redirect()
            ->route('budgets.categories.show', [$budget, $category])
            ->with('status', 'Category created successfully.');
    }

    public function show(Budget $budget, BudgetCategory $category): Response
    {
        $this->authorize('view', $budget);

        if ($category->budget_id !== $budget->id) {
            abort(404);
        }

        $category->load(['budget', 'transactions' => fn($query) => $query->orderBy('transaction_date', 'desc')]);

        return Inertia::render('budgets/categories/show', [
            'budget' => $budget,
            'category' => $category,
        ]);
    }

    public function edit(Request $request, Budget $budget, BudgetCategory $category): Response
    {
        $this->authorize('update', $budget);

        if ($category->budget_id !== $budget->id) {
            abort(404);
        }

        return Inertia::render('budgets/categories/edit', [
            'budget' => $budget,
            'category' => $category,
        ]);
    }

    public function update(Request $request, Budget $budget, BudgetCategory $category): RedirectResponse
    {
        $this->authorize('update', $budget);

        if ($category->budget_id !== $budget->id) {
            abort(404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'allocated_amount' => 'required|numeric|min:0',
            'color' => 'nullable|string|max:7', // hex color
        ]);

        $category->update($validated);

        return redirect()
            ->route('budgets.categories.show', [$budget, $category])
            ->with('status', 'Category updated successfully.');
    }

    public function destroy(Budget $budget, BudgetCategory $category): RedirectResponse
    {
        $this->authorize('update', $budget);

        if ($category->budget_id !== $budget->id) {
            abort(404);
        }

        // Check if category has transactions
        if ($category->transactions()->count() > 0) {
            return back()->withErrors([
                'name' => 'Cannot delete category that has transactions. Please delete or reassign the transactions first.'
            ]);
        }

        $category->delete();

        return redirect()
            ->route('budgets.categories.index', $budget)
            ->with('status', 'Category deleted successfully.');
    }
}
