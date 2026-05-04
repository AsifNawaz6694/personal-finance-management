<?php

namespace App\Http\Controllers\Web\Activity;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Activitylog\Models\Activity;

class ActivityLogController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Activity::query()
            ->with(['causer', 'subject'])
            ->latest();

        if (! $request->user()->can('pfm.security.activity.view')) {
            $query->where('causer_id', $request->user()->id)
                ->where('causer_type', User::class);
        }

        $filter = $request->string('log')->toString();
        if ($filter !== '') {
            $query->where('log_name', $filter);
        }

        $activities = $query->paginate(30)->withQueryString();

        $activities->getCollection()->transform(function (Activity $a) {
            return [
                'id' => $a->id,
                'log_name' => $a->log_name,
                'description' => $a->description,
                'subject_type' => $a->subject_type,
                'subject_id' => $a->subject_id,
                'properties' => $a->properties,
                'created_at' => $a->created_at->toIso8601String(),
                'causer' => $a->causer instanceof User
                    ? ['id' => $a->causer->id, 'name' => $a->causer->name, 'email' => $a->causer->email]
                    : null,
            ];
        });

        return Inertia::render('activity/index', [
            'activities' => $activities,
            'filters' => [
                'log' => $filter,
            ],
            'logNames' => Activity::query()->whereNotNull('log_name')->distinct()->orderBy('log_name')->pluck('log_name')->values()->all(),
            'canViewAll' => $request->user()->can('pfm.security.activity.view'),
        ]);
    }
}
