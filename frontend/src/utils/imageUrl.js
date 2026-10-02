/**
 * Utilitaire centralisé pour résoudre les URLs d'images.
 *
 * En Docker, `php artisan serve` ne peut pas servir les fichiers statiques
 * via le symlink public/storage (403). On passe donc par la route API
 * /api/storage/{path} qui lit directement depuis storage/app/public.
 *
 * En local XAMPP, l'APP_URL est http://127.0.0.1:8000 et le symlink fonctionne.
 */

const getApiOrigin = () => {
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "");
    }
    if (typeof window !== "undefined") {
        return `http://${window.location.hostname}:8000`;
    }
    return "http://localhost:8000";
};

/**
 * Convertit une valeur image (objet ou string) en URL absolue valide.
 * @param {string|object|null} img
 * @param {string} [fallbackText="SenAgri"]
 * @returns {string}
 */
export function getImageUrl(img, fallbackText = "SenAgri") {
    const placeholder = `https://placehold.co/600x400?text=${encodeURIComponent(fallbackText)}`;

    if (!img) return placeholder;

    // Si objet ImageProduit ({ id, chemin_fichier, url, ... })
    if (typeof img === "object") {
        if (img.url && typeof img.url === "string") {
            return resolveUrl(img.url);
        }
        if (img.chemin_fichier && typeof img.chemin_fichier === "string") {
            return resolveUrl(img.chemin_fichier);
        }
    }

    if (typeof img === "string") {
        return resolveUrl(img);
    }

    return placeholder;
}

/**
 * Résout une URL ou un chemin relatif vers une URL absolue accessible.
 * @param {string} url
 * @returns {string}
 */
function resolveUrl(url) {
    if (!url || typeof url !== "string") return `https://placehold.co/600x400?text=SenAgri`;

    const origin = getApiOrigin();

    // Déjà une URL absolue
    if (url.startsWith("http://") || url.startsWith("https://")) {
        // Remplacer l'hôte distant ou 127.0.0.1 par l'origine courante si port 8000
        const normalized = url.replace(/^https?:\/\/(127\.0\.0\.1|localhost)(:8000)?/, origin);
        return normalized;
    }

    // Chemin relatif (ex: "offres/xyz.jpg" ou "/storage/offres/xyz.jpg" ou "storage/offres/xyz.jpg")
    let clean = url.replace(/^\//, "").replace(/^public\//, "");
    if (!clean.startsWith("storage/")) {
        clean = `storage/${clean}`;
    }

    return `${origin}/${clean}`;
}

