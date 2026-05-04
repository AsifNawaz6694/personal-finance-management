<?php

it('redirects the home URL to the login screen', function () {
    $response = $this->get('/');

    $response->assertRedirect(route('login', absolute: false));
});
