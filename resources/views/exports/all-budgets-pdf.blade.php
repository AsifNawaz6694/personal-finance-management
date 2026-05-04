<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>All Budgets Summary</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 11px; color: #1f2937; }
        h1 { margin: 0 0 4px; font-size: 22px; }
        h2 { margin: 18px 0 6px; font-size: 14px; color: #4b5563; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; }
        .grid { width: 100%; border-collapse: collapse; }
        .grid th, .grid td { border: 1px solid #e5e7eb; padding: 5px 8px; text-align: left; }
        .grid th { background: #f9fafb; font-weight: 600; }
        .right { text-align: right; }
        .meta { color: #6b7280; margin-bottom: 18px; }
    </style>
</head>
<body>
    <h1>All Budgets — Summary</h1>
    <div class="meta">{{ $budgets->count() }} budgets &middot; Generated {{ now()->format('Y-m-d H:i') }}</div>

    @if ($budgets->count() === 0)
        <p>No budgets recorded.</p>
    @else
        @foreach ($budgets as $budget)
            @php
                $symbol = $budget->currency === 'PKR' ? 'Rs ' : 'SAR ';
                $totalIncome = $budget->transactions->where('type', 'income')->sum('amount');
                $totalExpense = $budget->transactions->where('type', 'expense')->sum('amount');
                $remaining = $totalIncome - $totalExpense;
            @endphp
            <h2>{{ $budget->name }} &middot; {{ $budget->budget_period }} &middot; {{ $budget->currency }}</h2>
            <table class="grid">
                <tr>
                    <td>Target</td><td class="right">{{ $symbol }}{{ number_format($budget->target_amount, 2) }}</td>
                    <td>Income</td><td class="right">{{ $symbol }}{{ number_format($totalIncome, 2) }}</td>
                    <td>Expenses</td><td class="right">{{ $symbol }}{{ number_format($totalExpense, 2) }}</td>
                    <td>Remaining</td><td class="right">{{ $symbol }}{{ number_format($remaining, 2) }}</td>
                </tr>
            </table>
        @endforeach
    @endif
</body>
</html>
