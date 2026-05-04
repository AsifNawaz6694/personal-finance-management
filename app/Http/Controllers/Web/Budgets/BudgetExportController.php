<?php

namespace App\Http\Controllers\Web\Budgets;

use App\Http\Controllers\Controller;
use App\Models\Budget;
use App\Services\BudgetExportService;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class BudgetExportController extends Controller
{
    protected $exportService;

    public function __construct(BudgetExportService $exportService)
    {
        $this->exportService = $exportService;
    }

    public function exportAllToExcel(Request $request): BinaryFileResponse
    {
        return $this->exportService->exportAllBudgetsToExcel($request->user()->id);
    }

    public function exportAllToPDF(Request $request): \Illuminate\Http\Response
    {
        return $this->exportService->exportAllBudgetsToPDF($request->user()->id);
    }

    public function exportBudgetToExcel(Request $request, Budget $budget): BinaryFileResponse
    {
        $this->authorize('view', $budget);

        return $this->exportService->exportBudgetToExcel($budget);
    }

    public function exportBudgetToPDF(Request $request, Budget $budget): \Illuminate\Http\Response
    {
        $this->authorize('view', $budget);

        return $this->exportService->exportBudgetToPDF($budget);
    }
}
