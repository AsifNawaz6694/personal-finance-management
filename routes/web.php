<?php

/*
|--------------------------------------------------------------------------
| Web routes
|--------------------------------------------------------------------------
|
| Split by concern under routes/web/ so auth, settings, and feature areas
| stay easy to navigate as the app grows.
|
*/

require __DIR__.'/web/public.php';
require __DIR__.'/web/invitations-public.php';
require __DIR__.'/web/onboarding.php';
require __DIR__.'/web/activation.php';
require __DIR__.'/web/dashboard.php';
require __DIR__.'/web/users.php';
require __DIR__.'/web/invitations.php';
require __DIR__.'/web/activity.php';
require __DIR__.'/web/roles.php';
require __DIR__.'/web/budgets.php';
require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
