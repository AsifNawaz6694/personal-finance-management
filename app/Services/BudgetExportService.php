<?php

namespace App\Services;

use App\Models\Budget;
use App\Models\BudgetTransaction;
use App\Models\Debt;
use Maatwebsite\Excel\Facades\Excel;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithTitle;
use Barryvdh\DomPDF\Facade\Pdf;

class BudgetExportService
{
    public function exportBudgetToExcel(Budget $budget): \Symfony\Component\HttpFoundation\BinaryFileResponse
    {
        $transactions = $budget->transactions()
            ->with('category')
            ->orderBy('transaction_date', 'desc')
            ->get();

        return Excel::download(new BudgetTransactionsExport($budget, $transactions), "budget-{$budget->id}-transactions.xlsx");
    }

    public function exportBudgetToPDF(Budget $budget): \Illuminate\Http\Response
    {
        $budget->load(['categories', 'transactions.category']);
        
        $pdf = Pdf::loadView('exports.budget-pdf', [
            'budget' => $budget,
            'transactions' => $budget->transactions->sortByDesc('transaction_date'),
        ]);

        return $pdf->download("budget-{$budget->id}-summary.pdf");
    }

    public function exportAllBudgetsToExcel($userId): \Symfony\Component\HttpFoundation\BinaryFileResponse
    {
        $budgets = Budget::where('user_id', $userId)
            ->with(['transactions.category', 'categories'])
            ->get();

        return Excel::download(new AllBudgetsExport($budgets), "all-budgets-summary.xlsx");
    }

    public function exportDebtsToExcel($userId): \Symfony\Component\HttpFoundation\BinaryFileResponse
    {
        $debts = Debt::where('user_id', $userId)
            ->with('repayments')
            ->get();

        return Excel::download(new DebtsExport($debts), "debts-summary.xlsx");
    }

    public function exportDebtsToPDF($userId): \Illuminate\Http\Response
    {
        $debts = Debt::where('user_id', $userId)
            ->with('repayments')
            ->get();

        $pdf = Pdf::loadView('exports.debts-pdf', [
            'debts' => $debts,
        ]);

        return $pdf->download("debts-summary.pdf");
    }

    public function exportAllBudgetsToPDF($userId): \Illuminate\Http\Response
    {
        $budgets = Budget::where('user_id', $userId)
            ->with(['transactions.category', 'categories'])
            ->orderBy('budget_year', 'desc')
            ->orderBy('budget_month', 'desc')
            ->get();

        $pdf = Pdf::loadView('exports.all-budgets-pdf', [
            'budgets' => $budgets,
        ]);

        return $pdf->download('all-budgets-summary.pdf');
    }
}

class BudgetTransactionsExport implements FromCollection, WithHeadings, WithMapping, WithTitle
{
    protected $budget;
    protected $transactions;

    public function __construct(Budget $budget, $transactions)
    {
        $this->budget = $budget;
        $this->transactions = $transactions;
    }

    public function collection()
    {
        return $this->transactions;
    }

    public function headings(): array
    {
        return [
            'Date',
            'Description',
            'Category',
            'Type',
            'Amount',
            'Currency',
        ];
    }

    public function map($transaction): array
    {
        return [
            $transaction->transaction_date,
            $transaction->description,
            $transaction->category?->name ?? 'Uncategorized',
            ucfirst($transaction->type),
            $transaction->amount,
            $this->budget->currency,
        ];
    }

    public function title(): string
    {
        return "Budget Transactions - {$this->budget->name}";
    }
}

class AllBudgetsExport implements FromCollection, WithHeadings, WithMapping, WithTitle
{
    protected $budgets;

    public function __construct($budgets)
    {
        $this->budgets = $budgets;
    }

    public function collection()
    {
        $transactions = collect();
        
        foreach ($this->budgets as $budget) {
            foreach ($budget->transactions as $transaction) {
                $transactions->push([
                    'budget_name' => $budget->name,
                    'budget_period' => $budget->budget_period,
                    'budget_currency' => $budget->currency,
                    'transaction' => $transaction,
                ]);
            }
        }

        return $transactions;
    }

    public function headings(): array
    {
        return [
            'Budget Name',
            'Budget Period',
            'Date',
            'Description',
            'Category',
            'Type',
            'Amount',
            'Currency',
        ];
    }

    public function map($item): array
    {
        $transaction = $item['transaction'];
        
        return [
            $item['budget_name'],
            $item['budget_period'],
            $transaction->transaction_date,
            $transaction->description,
            $transaction->category?->name ?? 'Uncategorized',
            ucfirst($transaction->type),
            $transaction->amount,
            $item['budget_currency'],
        ];
    }

    public function title(): string
    {
        return "All Budgets Summary";
    }
}

class DebtsExport implements FromCollection, WithHeadings, WithMapping, WithTitle
{
    protected $debts;

    public function __construct($debts)
    {
        $this->debts = $debts;
    }

    public function collection()
    {
        return $this->debts;
    }

    public function headings(): array
    {
        return [
            'Debt Name',
            'Type',
            'Lender',
            'Principal Amount',
            'Current Balance',
            'Interest Rate',
            'Monthly Payment',
            'Status',
            'Start Date',
            'Due Date',
            'Total Paid',
            'Progress %',
        ];
    }

    public function map($debt): array
    {
        return [
            $debt->name,
            ucfirst($debt->type),
            $debt->lender ?? 'N/A',
            $debt->principal_amount,
            $debt->current_balance,
            $debt->interest_rate . '%',
            $debt->monthly_payment ?? 0,
            ucfirst($debt->status),
            $debt->start_date,
            $debt->due_date ?? 'N/A',
            $debt->total_paid,
            round($debt->progress_percentage, 2) . '%',
        ];
    }

    public function title(): string
    {
        return "Debts Summary";
    }
}
