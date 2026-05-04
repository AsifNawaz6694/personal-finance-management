<?php

namespace App\Http\Controllers\Web\Roles;

use App\Http\Controllers\Controller;
use App\Support\PermissionCatalog;
use Illuminate\Http\Request;
use Illuminate\View\View;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class PermissionController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('pfm.security.roles.view');

        $permissions = Permission::query()
            ->with('roles')
            ->withCount('roles')
            ->orderBy('name')
            ->paginate(20)
            ->withQueryString();

        $groupedPermissions = collect(PermissionCatalog::all())
            ->groupBy('group')
            ->map(function ($group) {
                return $group->mapWithKeys(function ($permission) {
                    $model = Permission::where('name', $permission['name'])->first();
                    return [$permission['name'] => [
                        'description' => $permission['description'],
                        'group' => $permission['group'],
                        'roles_count' => $model?->roles_count ?? 0,
                        'roles' => $model?->roles->pluck('name') ?? collect(),
                    ]];
                });
            });

        return Inertia::render('permissions/index', [
            'permissions' => $permissions,
            'groupedPermissions' => $groupedPermissions,
            'roles' => Role::query()->orderBy('name')->pluck('name'),
        ]);
    }

    public function show(Permission $permission): Response
    {
        $this->authorize('pfm.security.roles.view');

        $permission->load('roles');

        $permissionInfo = collect(PermissionCatalog::all())
            ->firstWhere('name', $permission->name);

        $users = $permission->roles()
            ->with('users')
            ->get()
            ->flatMap(fn($role) => $role->users)
            ->unique('id')
            ->map(fn($user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->roles->pluck('name'),
            ]);

        return Inertia::render('permissions/show', [
            'permission' => [
                'id' => $permission->id,
                'name' => $permission->name,
                'description' => $permissionInfo['description'] ?? '',
                'group' => $permissionInfo['group'] ?? 'Other',
                'roles' => $permission->roles,
                'users' => $users,
            ],
        ]);
    }
}
