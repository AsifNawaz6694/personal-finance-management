<?php

namespace App\Http\Controllers\Web\Budgets;

use App\Http\Controllers\Controller;
use App\Models\Debt;
use App\Models\DebtRepayment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;
use Inertia\Inertia;
use Inertia\Response;

class DebtController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        
        $query = Debt::forUser($user->id)
            ->with('repayments')
            ->orderBy('created_at', 'desc');

        // Filter by status if provided
        if ($request->has('status')) {
            $query->where('status', $request->get('status'));
        }

        // Filter by type if provided
        if ($request->has('type')) {
            $query->where('type', $request->get('type'));
        }

        $debts = $query->paginate(15)->withQueryString();

        // Calculate overall statistics
        $totalDebt = $user->debts()->sum('current_balance');
        $totalMonthlyPayments = $user->debts()->sum('monthly_payment');
        $activeDebts = $user->debts()->active()->count();
        $overdueDebts = $user->debts()->active()->overdue()->count();

        return Inertia::render('budgets/debts/index', [
            'debts' => $debts,
            'statistics' => [
                'totalDebt' => $totalDebt,
                'totalMonthlyPayments' => $totalMonthlyPayments,
                'activeDebts' => $activeDebts,
                'overdueDebts' => $overdueDebts,
            ],
            'filters' => $request->only(['status', 'type']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('budgets/debts/create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'type' => 'required|in:loan,credit_card,mortgage,personal,other',
            'principal_amount' => 'required|numeric|min:0.01',
            'interest_rate' => 'required|numeric|min:0|max:100',
            'interest_type' => 'required|in:simple,compound',
            'current_balance' => 'required|numeric|min:0',
            'monthly_payment' => 'nullable|numeric|min:0.01',
            'start_date' => 'required|date|before_or_equal:today',
            'due_date' => 'nullable|date|after:start_date',
            'lender' => 'nullable|string|max:255',
            'account_number' => 'nullable|string|max:255',
        ]);

        $debt = $request->user()->debts()->create($validated);

        return redirect()
            ->route('budgets.debts.show', $debt)
            ->with('status', 'Debt created successfully.');
    }

    public function show(Debt $debt): Response
    {
        $this->authorize('view', $debt);
        
        $debt->load(['repayments' => fn($query) => $query->orderBy('payment_date', 'desc')]);

        // Calculate next few scheduled payments
        $scheduledPayments = [];
        if ($debt->monthly_payment && $debt->status === 'active') {
            $nextPaymentDate = $debt->next_payment_date;
            for ($i = 0; $i < 6; $i++) {
                if ($nextPaymentDate && (!$debt->due_date || $nextPaymentDate->lessThanOrEqualTo($debt->due_date))) {
                    $scheduledPayments[] = [
                        'date' => $nextPaymentDate->copy(),
                        'amount' => $debt->monthly_payment,
                        'status' => 'scheduled',
                    ];
                    $nextPaymentDate = $nextPaymentDate->copy()->addMonth();
                } else {
                    break;
                }
            }
        }

        return Inertia::render('budgets/debts/show', [
            'debt' => $debt,
            'scheduledPayments' => $scheduledPayments,
        ]);
    }

    public function edit(Debt $debt): Response
    {
        $this->authorize('update', $debt);
        
        return Inertia::render('budgets/debts/edit', [
            'debt' => $debt,
        ]);
    }

    public function update(Request $request, Debt $debt): RedirectResponse
    {
        $this->authorize('update', $debt);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'type' => 'required|in:loan,credit_card,mortgage,personal,other',
            'current_balance' => 'required|numeric|min:0',
            'monthly_payment' => 'nullable|numeric|min:0.01',
            'status' => 'required|in:active,paid_off,defaulted,restructured',
            'due_date' => 'nullable|date|after:start_date',
            'lender' => 'nullable|string|max:255',
            'account_number' => 'nullable|string|max:255',
        ]);

        $debt->update($validated);

        return redirect()
            ->route('budgets.debts.show', $debt)
            ->with('status', 'Debt updated successfully.');
    }

    public function destroy(Debt $debt): RedirectResponse
    {
        $this->authorize('delete', $debt);

        $debt->delete();

        return redirect()
            ->route('budgets.debts.index')
            ->with('status', 'Debt deleted successfully.');
    }

    public function recordPayment(Request $request, Debt $debt): RedirectResponse
    {
        $this->authorize('update', $debt);

        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'payment_date' => 'required|date|before_or_equal:today',
            'notes' => 'nullable|string|max:1000',
        ]);

        // Calculate principal and interest portions
        $monthlyRate = $debt->interest_rate / 12 / 100;
        $interestAmount = min($debt->current_balance * $monthlyRate, $validated['amount']);
        $principalAmount = $validated['amount'] - $interestAmount;

        $repayment = $debt->repayments()->create([
            'amount' => $validated['amount'],
            'principal_amount' => $principalAmount,
            'interest_amount' => $interestAmount,
            'payment_date' => $validated['payment_date'],
            'status' => 'paid',
            'notes' => $validated['notes'],
        ]);

        // Update debt balance
        $newBalance = $debt->current_balance - $principalAmount;
        $debt->update([
            'current_balance' => max(0, $newBalance),
        ]);

        // Mark as paid off if balance is zero
        if ($newBalance <= 0) {
            $debt->update(['status' => 'paid_off']);
        }

        return redirect()
            ->route('budgets.debts.show', $debt)
            ->with('status', 'Payment recorded successfully.');
    }

    public function exportExcel(Request $request): \Symfony\Component\HttpFoundation\BinaryFileResponse
    {
        $user = $request->user();
        $exportService = new \App\Services\BudgetExportService();
        
        return $exportService->exportDebtsToExcel($user->id);
    }

    public function exportPDF(Request $request): \Illuminate\Http\Response
    {
        $user = $request->user();
        $exportService = new \App\Services\BudgetExportService();
        
        return $exportService->exportDebtsToPDF($user->id);
    }
}
