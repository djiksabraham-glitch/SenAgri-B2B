import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logout as apiLogout } from "../services/authService";
import { FaSignOutAlt, FaTimes } from "react-icons/fa";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

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

    // Fonction de déconnexion technique
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

    // Déclencher la demande de déconnexion avec confirmation
    const confirmLogout = () => {
        setShowLogoutModal(true);
    };

    const handleConfirmLogout = async () => {
        try {
            setIsLoggingOut(true);
            await logoutUser();
            setShowLogoutModal(false);
            navigate("/");
        } catch (err) {
            console.error("Erreur lors de la déconnexion", err);
            setShowLogoutModal(false);
        } finally {
            setIsLoggingOut(false);
        }
    };

    const handleCancelLogout = () => {
        if (!isLoggingOut) {
            setShowLogoutModal(false);
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
        confirmLogout,
        updateUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}

            {/* Modal Global de Confirmation de Déconnexion */}
            {showLogoutModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-7 text-center border border-gray-100 relative">
                        <button
                            type="button"
                            onClick={handleCancelLogout}
                            disabled={isLoggingOut}
                            className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <FaTimes />
                        </button>

                        <div className="w-16 h-16 rounded-full bg-red-50 text-[#c0392b] flex items-center justify-center text-2xl mx-auto mb-4 border border-red-100 shadow-sm">
                            <FaSignOutAlt />
                        </div>

                        <h3 className="text-lg font-black text-gray-900 tracking-tight">
                            Confirmer la déconnexion
                        </h3>

                        <p className="text-xs text-gray-500 mt-2 mb-6 leading-relaxed">
                            Voulez-vous vraiment vous déconnecter de votre compte{" "}
                            {user?.nom ? (
                                <strong className="text-gray-800">« {user.nom} »</strong>
                            ) : (
                                "SenAgri"
                            )}{" "}
                            ?
                        </p>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={handleCancelLogout}
                                disabled={isLoggingOut}
                                className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                            >
                                Annuler
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmLogout}
                                disabled={isLoggingOut}
                                className="flex-1 py-3 px-4 bg-[#c0392b] hover:bg-red-700 text-white font-extrabold rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                            >
                                {isLoggingOut ? (
                                    <>
                                        <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent"></div>
                                        Déconnexion...
                                    </>
                                ) : (
                                    "Oui, me déconnecter"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthContext.Provider>
    );
}
