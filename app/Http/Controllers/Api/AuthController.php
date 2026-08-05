<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class AuthController extends Controller
{
    public function __construct(
        private readonly AuthService $authService
    ) {}

    #[OA\Post(
    path: "/register",
    operationId: "registerUser",
    tags: ["Authentification"],
    summary: "Créer un compte utilisateur",
    description: "Permet de créer un nouveau compte utilisateur.",

    requestBody: new OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ["nom","email","password","password_confirmation","telephone","adresse","role"],
            properties: [
                new OA\Property(property: "nom", type: "string", example: "Abraham Torero"),
                new OA\Property(property: "email", type: "string", example: "abraham@gmail.com"),
                new OA\Property(property: "password", type: "string", example: "password"),
                new OA\Property(property: "password_confirmation", type: "string", example: "password"),
                new OA\Property(property: "telephone", type: "string", example: "771234567"),
                new OA\Property(property: "adresse", type: "string", example: "Dakar"),
                new OA\Property(property: "role", type: "string", example: "vendeur")
            ]
        )
    ),

        responses: [
            new OA\Response(
                response: 201,
                description: "Utilisateur créé avec succès"
            ),
            new OA\Response(
                response: 422,
                description: "Erreur de validation"
            )
        ]
    )]

    public function register(RegisterRequest $request): JsonResponse
    {
        $result = $this->authService->register(
            $request->validated()
        );

        return response()->json([
            'message' => 'Compte créé avec succès.',
            'token' => $result['token'],
            'user' => new UserResource($result['user']),
        ], 201);
    }


        #[OA\Post(
        path: "/login",
        summary: "Connexion utilisateur",
        tags: ["Authentification"],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["email", "password"],
                properties: [
                    new OA\Property(property: "email", type: "string", example: "abraham@gmail.com"),
                    new OA\Property(property: "password", type: "string", example: "password")
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: "Connexion réussie"
            )
        ]
    )]

    public function login(LoginRequest $request): JsonResponse
    {
        $result = $this->authService->login(
            $request->validated()
        );

        return response()->json([
            'message' => 'Connexion réussie.',
            'token' => $result['token'],
            'user' => new UserResource($result['user']),
        ]);
    }


    #[OA\Post(
    path: "/logout",
    operationId: "logoutUser",
    tags: ["Authentification"],
    summary: "Déconnexion",

        security: [
            ["sanctum" => []]
        ],

        responses: [
            new OA\Response(
                response: 200,
                description: "Déconnexion réussie"
            )
        ]
    )]
    
    public function logout(Request $request): JsonResponse
    {
        $this->authService->logout($request->user());

        return response()->json([
            'message' => 'Déconnexion réussie.'
        ]);
    }
}