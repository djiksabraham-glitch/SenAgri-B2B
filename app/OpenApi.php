<?php

namespace App;

use OpenApi\Attributes as OA;

#[OA\Info(
    version: "1.0.0",
    title: "API SenAgri B2B",
    description: "Documentation officielle de l'API SenAgri B2B"
)]

#[OA\Server(
    url: "http://127.0.0.1:8000/api",
    description: "Serveur local"
)]

class OpenApi
{
}