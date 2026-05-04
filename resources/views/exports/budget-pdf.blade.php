<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Budget Summary — {{ $budget->name }}</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 12px; color: #1f2937; }
        h1 { margin: 0 0 4px; font-size: 22px; }
        h2 { margin: 24px 0 8px; font-size: 14px; color: #4b5563; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; }
        .meta { color: #6b7280; margin-bottom: 18px; }
        .grid { width: 100%; border-collapse: collapse; }
        .grid th, .grid td { border: 1px solid #e5e7eb; padding: 6px 8px; text-align: left; }
        .grid th { background: #f9fafb; font-weight: 600; }
        .right { text-align: right; }
        .totals td { font-weight: 600; background: #f3f4f6; }
        .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 10px; background: #eef2ff; color: #4338ca; }
    </style>
</head>
<body>
    @php
        $symbol = $budget->currency === 'PKR' ? 'Rs ' : 'SAR ';
        $totalIncome = $transactions->where('type', 'income')->sum('amount');
        $totalExpense = $transactions->where('type', 'expense')->sum('amount');
        $remaining = $totalIncome - $totalExpense;
    @endphp

    <h1>{{ $budget->name }}</h1>
    <div class="meta">
        {{ $budget->budget_period }} &middot; <span class="badge">{{ ucfirst($budget->type === 'custom' ? $budget->custom_type : $budget->type) }}</span> &middot; Currency: {{ $budget->currency }}
        @if ($budget->description) <br>{{ $budget->description }} @endif
    </div>

    <h2>Summary</h2>
    <table class="grid">
        <tr><td>Target amount</td><td class="right">{{ $symbol }}{{ number_format($budget->target_amount, 2) }}</td></tr>
        <tr><td>Total income</td><td class="right">{{ $symbol }}{{ number_format($totalIncome, 2) }}</td></tr>
        <tr><td>Total expenses</td><td class="right">{{ $symbol }}{{ number_format($totalExpense, 2) }}</td></tr>
        <tr class="totals"><td>Remaining balance</td><td class="right">{{ $symbol }}{{ number_format($remaining, 2) }}</td></tr>
    </table>

    @if ($budget->categories->count())
        <h2>Categories</h2>
        <table class="grid">
            <thead><tr><th>Name</th><th>Type</th><th class="right">Allocated</th></tr></thead>
            <tbody>
            @foreach ($budget->categories as $cat)
                <tr>
                    <td>{{ $cat->name }}</td>
                    <td>{{ ucfirst($cat->type) }}</td>
                    <td class="right">{{ $symbol }}{{ number_format($cat->allocated_amount, 2) }}</td>
                </tr>
            @endforeach
            </tbody>
        </table>
    @endif

    <h2>Transactions ({{ $transactions->count() }})</h2>
    @if ($transactions->count() === 0)
        <p style="color: #6b7280;">No transactions recorded for this budget.</p>
    @else
        <table class="grid">
            <thead><tr><th>Date</th><th>Description</th><th>Category</th><th>Type</th><th class="right">Amount</th></tr></thead>
            <tbody>
            @foreach ($transactions as $t)
                <tr>
                    <td>{{ \Illuminate\Support\Carbon::parse($t->transaction_date)->format('Y-m-d') }}</td>
                    <td>{{ $t->description }}</td>
                    <td>{{ $t->category?->name ?? 'Uncategorized' }}</td>
                    <td>{{ ucfirst($t->type) }}</td>
                    <td class="right">{{ $symbol }}{{ number_format($t->amount, 2) }}</td>
                </tr>
            @endforeach
            </tbody>
        </table>
    @endif
</body>
</html>
