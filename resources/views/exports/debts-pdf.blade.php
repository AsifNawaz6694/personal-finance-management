<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Debts Summary</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 12px; color: #1f2937; }
        h1 { margin: 0 0 4px; font-size: 22px; }
        h2 { margin: 18px 0 6px; font-size: 14px; color: #4b5563; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; }
        .grid { width: 100%; border-collapse: collapse; }
        .grid th, .grid td { border: 1px solid #e5e7eb; padding: 6px 8px; text-align: left; }
        .grid th { background: #f9fafb; font-weight: 600; }
        .right { text-align: right; }
        .meta { color: #6b7280; margin-bottom: 18px; }
    </style>
</head>
<body>
    <h1>Debt Portfolio</h1>
    <div class="meta">{{ $debts->count() }} debts &middot; Generated {{ now()->format('Y-m-d H:i') }}</div>

    @if ($debts->count() === 0)
        <p>No debts recorded.</p>
    @else
        @foreach ($debts as $debt)
            <h2>{{ $debt->name }} <small style="color:#6b7280;">({{ ucfirst(str_replace('_', ' ', $debt->type)) }})</small></h2>
            <table class="grid">
                <tr><td>Lender</td><td>{{ $debt->lender ?? '—' }}</td></tr>
                <tr><td>Principal</td><td class="right">Rs {{ number_format($debt->principal_amount, 2) }}</td></tr>
                <tr><td>Current balance</td><td class="right">Rs {{ number_format($debt->current_balance, 2) }}</td></tr>
                <tr><td>Interest rate</td><td>{{ number_format($debt->interest_rate, 2) }}% ({{ $debt->interest_type }})</td></tr>
                <tr><td>Monthly payment</td><td class="right">{{ $debt->monthly_payment ? 'Rs '.number_format($debt->monthly_payment, 2) : '—' }}</td></tr>
                <tr><td>Status</td><td>{{ str_replace('_', ' ', ucfirst($debt->status)) }}</td></tr>
            </table>

            @if ($debt->repayments->count())
                <table class="grid" style="margin-top: 6px;">
                    <thead><tr><th>Date</th><th class="right">Amount</th><th class="right">Principal</th><th class="right">Interest</th></tr></thead>
                    <tbody>
                    @foreach ($debt->repayments as $r)
                        <tr>
                            <td>{{ \Illuminate\Support\Carbon::parse($r->payment_date)->format('Y-m-d') }}</td>
                            <td class="right">Rs {{ number_format($r->amount, 2) }}</td>
                            <td class="right">Rs {{ number_format($r->principal_amount, 2) }}</td>
                            <td class="right">Rs {{ number_format($r->interest_amount, 2) }}</td>
                        </tr>
                    @endforeach
                    </tbody>
                </table>
            @endif
        @endforeach
    @endif
</body>
</html>
