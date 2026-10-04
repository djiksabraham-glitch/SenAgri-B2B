<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use App\Http\Middleware\AdminMiddleware;
use App\Http\Middleware\VendeurMiddleware;
use App\Http\Middleware\AcheteurMiddleware;

use Illuminate\Http\Exceptions\ThrottleRequestsException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Active le Rate Limiting global sur toutes les routes de l'API (60 req/min par défaut)
        $middleware->throttleApi();

        $middleware->alias([

            'admin' => AdminMiddleware::class,

            'vendeur' => VendeurMiddleware::class,

            'acheteur' => AcheteurMiddleware::class,

        ]);

        // Exclure les fichiers statiques du storage de la vérification CSRF
        $middleware->validateCsrfTokens(except: [
            'storage/*',
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (\Illuminate\Auth\AuthenticationException $e, \Illuminate\Http\Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return response()->json([
                    'message' => 'Non authentifié.'
                ], 401);
            }
        });

        // Gestion uniforme du statut HTTP 429 (Too Many Requests)
        $exceptions->render(function (ThrottleRequestsException $e, \Illuminate\Http\Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                $retryAfter = $e->getHeaders()['Retry-After'] ?? 60;
                return response()->json([
                    'message' => 'Trop de requêtes. Veuillez ralentir et réessayer plus tard.',
                    'retry_after' => (int) $retryAfter,
                ], 429, $e->getHeaders());
            }
        });
    })->create();
