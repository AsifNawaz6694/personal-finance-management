<?php

namespace App\Http\Controllers\Web\Roles;

use App\Http\Controllers\Controller;
use App\Support\PermissionCatalog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('pfm.security.roles.view');

        $roles = Role::query()
            ->with('permissions')
            ->withCount('users')
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('roles/index', [
            'roles' => $roles,
            'permissionGroups' => PermissionCatalog::groupedNames(),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('pfm.security.roles.sync');

        return Inertia::render('roles/create', [
            'permissionGroups' => PermissionCatalog::all(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('pfm.security.roles.sync');

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:roles,name',
            'description' => 'nullable|string|max:500',
            'permissions' => 'array',
            'permissions.*' => 'string|exists:permissions,name',
        ]);

        $role = Role::create([
            'name' => $validated['name'],
            'guard_name' => 'web',
        ]);

        if (!empty($validated['permissions'])) {
            $role->syncPermissions($validated['permissions']);
        }

        return redirect()
            ->route('roles.index')
            ->with('status', 'Role created successfully.');
    }

    public function show(Role $role): Response
    {
        $this->authorize('pfm.security.roles.view');

        $role->load(['permissions', 'users' => fn($query) => $query->select('id', 'name', 'email')]);

        return Inertia::render('roles/show', [
            'role' => $role,
            'permissionGroups' => PermissionCatalog::all(),
        ]);
    }

    public function edit(Role $role): Response
    {
        $this->authorize('pfm.security.roles.sync');

        $role->load('permissions');

        return Inertia::render('roles/edit', [
            'role' => $role,
            'permissionGroups' => PermissionCatalog::all(),
        ]);
    }

    public function update(Request $request, Role $role): RedirectResponse
    {
        $this->authorize('pfm.security.roles.sync');

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:roles,name,' . $role->id,
            'description' => 'nullable|string|max:500',
            'permissions' => 'array',
            'permissions.*' => 'string|exists:permissions,name',
        ]);

        $role->update(['name' => $validated['name']]);

        if (isset($validated['permissions'])) {
            $role->syncPermissions($validated['permissions']);
        }

        return redirect()
            ->route('roles.index')
            ->with('status', 'Role updated successfully.');
    }

    public function destroy(Role $role): RedirectResponse
    {
        $this->authorize('pfm.security.roles.sync');

        if ($role->name === 'super-admin') {
            return back()
                ->withErrors(['name' => 'Cannot delete the super-admin role.']);
        }

        if ($role->users()->count() > 0) {
            return back()
                ->withErrors(['name' => 'Cannot delete a role that is assigned to users.']);
        }

        $role->delete();

        return redirect()
            ->route('roles.index')
            ->with('status', 'Role deleted successfully.');
    }
}
