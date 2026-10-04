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
        $this->configureRateLimiting();
    }

    /**
     * Configuration des limiteurs de débit (Rate Limiting) de l'application.
     */
    protected function configureRateLimiting(): void
    {
        // 1. Limiteur global de l'API : 60 requêtes par minute par utilisateur ou IP
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)
                ->by($request->user()?->id ?: $request->ip())
                ->response(function (Request $request, array $headers) {
                    return response()->json([
                        'message' => 'Trop de requêtes. Veuillez ralentir et réessayer plus tard.',
                        'retry_after' => (int) ($headers['Retry-After'] ?? 60),
                    ], 429, $headers);
                });
        });

        // 2. Limiteur de connexion (Anti Brute-Force) : 5 tentatives par minute par email + IP
        RateLimiter::for('login', function (Request $request) {
            $email = (string) $request->input('email');
            $key = Str::transliterate(Str::lower($email) . '|' . $request->ip());

            return Limit::perMinute(5)
                ->by($key)
                ->response(function (Request $request, array $headers) {
                    return response()->json([
                        'message' => 'Trop de tentatives de connexion. Veuillez réessayer dans quelques instants.',
                        'retry_after' => (int) ($headers['Retry-After'] ?? 60),
                    ], 429, $headers);
                });
        });

        // 3. Limiteur d'inscription : 5 inscriptions par minute par IP
        RateLimiter::for('register', function (Request $request) {
            return Limit::perMinute(5)
                ->by($request->ip())
                ->response(function (Request $request, array $headers) {
                    return response()->json([
                        'message' => 'Trop de tentatives d\'inscription. Veuillez réessayer plus tard.',
                        'retry_after' => (int) ($headers['Retry-After'] ?? 60),
                    ], 429, $headers);
                });
        });

        // 4. Limiteur pour mot de passe oublié : 3 demandes par minute par email + IP
        RateLimiter::for('forgot-password', function (Request $request) {
            $email = (string) $request->input('email');
            $key = Str::transliterate(Str::lower($email) . '|' . $request->ip());

            return Limit::perMinute(3)
                ->by($key)
                ->response(function (Request $request, array $headers) {
                    return response()->json([
                        'message' => 'Trop de demandes de réinitialisation. Veuillez patienter avant de réessayer.',
                        'retry_after' => (int) ($headers['Retry-After'] ?? 60),
                    ], 429, $headers);
                });
        });

        // 5. Limiteur pour les paiements : 6 requêtes par minute par utilisateur ou IP
        $paymentLimiter = function (Request $request) {
            return Limit::perMinute(6)
                ->by($request->user()?->id ?: $request->ip())
                ->response(function (Request $request, array $headers) {
                    return response()->json([
                        'message' => 'Trop de tentatives de paiement. Veuillez patienter avant de réessayer.',
                        'retry_after' => (int) ($headers['Retry-After'] ?? 60),
                    ], 429, $headers);
                });
        };
        RateLimiter::for('paiement', $paymentLimiter);
        RateLimiter::for('payment', $paymentLimiter);

        // 6. Limiteur pour la messagerie : 20 messages par minute par utilisateur ou IP
        RateLimiter::for('messages', function (Request $request) {
            return Limit::perMinute(20)
                ->by($request->user()?->id ?: $request->ip())
                ->response(function (Request $request, array $headers) {
                    return response()->json([
                        'message' => 'Envoi de messages trop fréquent. Veuillez patienter quelques secondes.',
                        'retry_after' => (int) ($headers['Retry-After'] ?? 60),
                    ], 429, $headers);
                });
        });
    }
}
