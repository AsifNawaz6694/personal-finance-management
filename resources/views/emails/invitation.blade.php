<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ __('Invitation') }}</title>
</head>
<body style="font-family: system-ui, sans-serif; line-height: 1.6; color: #1e293b;">
    <p>{{ __('Hello,') }}</p>
    <p>{{ __(':name invited you to join :app.', ['name' => $invitation->inviter->name, 'app' => config('app.name')]) }}</p>
    <p>
        <a href="{{ $acceptUrl }}" style="display:inline-block;padding:12px 24px;background:linear-gradient(135deg,#6366f1,#22d3ee);color:#0f172a;text-decoration:none;border-radius:12px;font-weight:600;">
            {{ __('Accept invitation') }}
        </a>
    </p>
    <p style="color:#64748b;font-size:14px;">{{ __('This link expires on :date.', ['date' => $invitation->expires_at->toDayDateTimeString()]) }}</p>
</body>
</html>
