<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthService
{
    /**
     * Inscription d'un utilisateur
     */
    public function register(array $data): array
    {
        $user = User::create([
            'nom' => $data['nom'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'telephone' => $data['telephone'],
            'adresse' => $data['adresse'],
            'role' => $data['role'],
            'cgu_acceptees_le' => now(),
        ]);

        $token = $user->createToken('SenAgrii')->plainTextToken;

        return [
            'user' => $user,
            'token' => $token,
        ];
    }

    /**
     * Connexion
     */
    public function login(array $data): array
    {
        $user = User::where('email', $data['email'])->first();

        if (!$user || !Hash::check($data['password'], $user->password)) {

            throw ValidationException::withMessages([
                'email' => ['Email ou mot de passe incorrect.'],
            ]);
        }

        $token = $user->createToken('SenAgrii')->plainTextToken;

        return [
            'user' => $user,
            'token' => $token,
        ];
    }

    /**
     * Déconnexion
     */
    public function logout(User $user): void
    {
        $user->currentAccessToken()->delete();
    }
}