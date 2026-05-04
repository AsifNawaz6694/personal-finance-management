<?php

namespace App\Http\Controllers\Web\Budgets;

use App\Http\Controllers\Controller;
use App\Models\TransactionTag;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;
use Inertia\Inertia;
use Inertia\Response;

class TransactionTagController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        
        $tags = TransactionTag::forUser($user->id)
            ->withCount('transactions')
            ->orderBy('name')
            ->get();

        return Inertia::render('budgets/tags/index', [
            'tags' => $tags,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:transaction_tags,name,NULL,id,user_id,' . $request->user()->id,
            'color' => 'nullable|string|max:7',
            'description' => 'nullable|string|max:500',
        ]);

        $tag = $request->user()->transactionTags()->create($validated);

        return redirect()->back()
            ->with('success', 'Tag created successfully.');
    }

    public function update(Request $request, TransactionTag $tag): RedirectResponse
    {
        $this->authorize('update', $tag);

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:transaction_tags,name,' . $tag->id . ',id,user_id,' . $request->user()->id,
            'color' => 'nullable|string|max:7',
            'description' => 'nullable|string|max:500',
        ]);

        $tag->update($validated);

        return redirect()->back()
            ->with('success', 'Tag updated successfully.');
    }

    public function destroy(TransactionTag $tag): RedirectResponse
    {
        $this->authorize('delete', $tag);

        $tag->delete();

        return redirect()->back()
            ->with('success', 'Tag deleted successfully.');
    }
}
