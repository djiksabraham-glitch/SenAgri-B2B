<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VendeurMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user()) {

            return response()->json([
                'message' => 'Non authentifié.'
            ],401);

        }

        if ($request->user()->role !== 'vendeur') {

            return response()->json([
                'message' => 'Accès réservé aux vendeurs.'
            ],403);

        }

        return $next($request);
    }
}