<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Batasi percobaan login per kombinasi email dan IP (PRD §23).
        RateLimiter::for('login', function (Request $request) {
            $key = Str::transliterate(Str::lower($request->string('email')->toString())).'|'.$request->ip();

            return Limit::perMinute(5)->by($key);
        });
    }
}
