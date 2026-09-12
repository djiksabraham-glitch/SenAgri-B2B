import { createContext, useState, useEffect } from "react";
import { logout as apiLogout } from "../services/authService";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Initialisation à partir du localStorage
        const savedToken = localStorage.getItem("token");
        const savedUser = localStorage.getItem("user");

        if (savedToken) {
            setToken(savedToken);
        }

        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (e) {
                console.error("Erreur de lecture de l'utilisateur du localStorage", e);
                localStorage.removeItem("user");
            }
        }

        setLoading(false);
    }, []);

    // Fonction de connexion pour mettre à jour le contexte et le localStorage
    const loginUser = (userData, tokenData) => {
        setUser(userData);
        setToken(tokenData);
        if (userData) {
            localStorage.setItem("user", JSON.stringify(userData));
        }
        if (tokenData) {
            localStorage.setItem("token", tokenData);
        }
    };

    // Fonction de déconnexion
    const logoutUser = async () => {
        try {
            if (token) {
                await apiLogout();
            }
        } catch (e) {
            console.warn("Erreur lors de la déconnexion sur le serveur", e);
        } finally {
            setUser(null);
            setToken(null);
            localStorage.removeItem("user");
            localStorage.removeItem("token");
        }
    };

    // Mettre à jour les infos utilisateur dans le contexte et le localStorage
    const updateUser = (newUserData) => {
        setUser((prev) => {
            const updated = { ...prev, ...newUserData };
            localStorage.setItem("user", JSON.stringify(updated));
            return updated;
        });
    };

    const value = {
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        isVendeur: user?.role === "vendeur" || user?.role === "producteur",
        isAcheteur: user?.role === "acheteur",
        isAdmin: user?.role === "admin",
        loginUser,
        logoutUser,
        updateUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
