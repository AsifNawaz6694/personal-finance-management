<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ __('Two-factor setup') }}</title>
</head>
<body style="font-family: system-ui, sans-serif; line-height: 1.5; color: #1a1a1a;">
    <p>{{ __('Hello :name,', ['name' => $user->name]) }}</p>
    <p>{{ __('Enter this code in the app to turn on email two-factor authentication:') }}</p>
    <p style="font-size: 1.5rem; letter-spacing: 0.2em; font-weight: 700;">{{ $code }}</p>
    <p style="color: #666; font-size: 0.875rem;">{{ __('This code expires in 15 minutes.') }}</p>
</body>
</html>
