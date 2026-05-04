<?php

namespace App\Support;

use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Database\Eloquent\Model;

final class ActivityLogger
{
    /**
     * @param  array<string, mixed>  $properties
     */
    public static function log(
        string $description,
        ?Model $subject = null,
        array $properties = [],
        ?Authenticatable $causer = null,
        string $logName = 'application',
    ): void {
        $causer ??= auth()->user();

        $activity = activity()->useLog($logName);

        if ($causer instanceof Model) {
            $activity->causedBy($causer);
        }

        if ($subject !== null) {
            $activity->performedOn($subject);
        }

        $activity->withProperties(array_merge([
            'ip' => request()?->ip(),
            'user_agent' => request()?->userAgent(),
        ], $properties))->log($description);
    }
}
