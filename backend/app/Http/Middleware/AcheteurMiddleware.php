<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AcheteurMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user()) {

            return response()->json([
                'message' => 'Non authentifié.'
            ],401);

        }

        if ($request->user()->role !== 'acheteur') {

            return response()->json([
                'message' => 'Accès réservé aux acheteurs.'
            ],403);

        }

        return $next($request);
    }
}