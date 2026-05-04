<?php

namespace App\Http\Controllers\Web\Budgets;

use App\Http\Controllers\Controller;
use App\Models\Budget;
use App\Models\BudgetShare;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BudgetShareController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $received = BudgetShare::where('user_id', $user->id)
            ->with(['budget', 'sharedBy:id,name,email'])
            ->orderBy('created_at', 'desc')
            ->get();

        $sent = BudgetShare::where('shared_by', $user->id)
            ->with(['budget', 'user:id,name,email'])
            ->orderBy('created_at', 'desc')
            ->get();

        $myBudgets = Budget::forUser($user->id)
            ->orderBy('budget_year', 'desc')
            ->orderBy('budget_month', 'desc')
            ->get(['id', 'name', 'currency', 'budget_year', 'budget_month']);

        return Inertia::render('budgets/shares/index', [
            'received' => $received,
            'sent' => $sent,
            'myBudgets' => $myBudgets,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'budget_id' => 'required|exists:budgets,id',
            'email' => 'required|email|exists:users,email',
            'permission' => 'required|in:view,edit',
            'message' => 'nullable|string|max:500',
            'expires_at' => 'nullable|date|after:today',
        ]);

        $budget = $request->user()->budgets()->findOrFail($validated['budget_id']);

        $recipient = User::where('email', $validated['email'])->firstOrFail();

        if ($recipient->id === $request->user()->id) {
            return back()->withErrors(['email' => 'You cannot share a budget with yourself.']);
        }

        $existing = BudgetShare::where('budget_id', $budget->id)
            ->where('user_id', $recipient->id)
            ->first();

        if ($existing) {
            $existing->update([
                'shared_by' => $request->user()->id,
                'permission' => $validated['permission'],
                'message' => $validated['message'] ?? null,
                'expires_at' => $validated['expires_at'] ?? null,
                'status' => 'pending',
                'accepted_at' => null,
            ]);

            return redirect()->route('budgets.shares.index')
                ->with('status', 'Share invitation refreshed.');
        }

        BudgetShare::create([
            'budget_id' => $budget->id,
            'user_id' => $recipient->id,
            'shared_by' => $request->user()->id,
            'permission' => $validated['permission'],
            'message' => $validated['message'] ?? null,
            'expires_at' => $validated['expires_at'] ?? null,
            'status' => 'pending',
        ]);

        return redirect()->route('budgets.shares.index')
            ->with('status', 'Share invitation sent.');
    }

    public function accept(Request $request, BudgetShare $budgetShare): RedirectResponse
    {
        abort_unless($budgetShare->user_id === $request->user()->id, 403);

        $budgetShare->accept();

        return back()->with('status', 'Budget share accepted.');
    }

    public function decline(Request $request, BudgetShare $budgetShare): RedirectResponse
    {
        abort_unless($budgetShare->user_id === $request->user()->id, 403);

        $budgetShare->decline();

        return back()->with('status', 'Budget share declined.');
    }

    public function destroy(Request $request, BudgetShare $budgetShare): RedirectResponse
    {
        $isOwner = $budgetShare->shared_by === $request->user()->id;
        $isRecipient = $budgetShare->user_id === $request->user()->id;
        abort_unless($isOwner || $isRecipient, 403);

        $budgetShare->delete();

        return back()->with('status', 'Budget share removed.');
    }
}
