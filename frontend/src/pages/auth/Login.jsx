import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../../services/authService";
import { useAuth } from "../../hooks/useAuth";
import Navbar from "../../components/home/Navbar";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaExclamationTriangle, FaCheckCircle, FaLeaf } from "react-icons/fa";

import monImage from "../../assets/images/connexion.jpg";
const IMAGE_ILUSTRATION = monImage;

export default function Login() {
    const navigate = useNavigate();
    const { loginUser } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [erreur, setErreur] = useState("");
    const [succesMsg, setSuccesMsg] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErreur("");
        setSuccesMsg("");

        try {
            const data = await login(email, password);

            console.log("Connexion réussie :", data);

            // Mettre à jour le contexte global d'authentification
            loginUser(data.user, data.token);

            setSuccesMsg("Connexion réussie ! Redirection vers votre espace...");

            let targetPath = "/acheteur";
            if (data.user?.role === "admin") {
                targetPath = "/admin";
            } else if (data.user?.role === "vendeur" || data.user?.role === "producteur") {
                targetPath = "/vendeur";
            }

            setTimeout(() => {
                navigate(targetPath);
            }, 1000);
        } catch (err) {
            console.error("Erreur de connexion :", err);

            if (err.response && err.response.status === 401) {
                setErreur("Identifiants incorrects. Veuillez vérifier votre email et mot de passe.");
            } else if (err.response && err.response.status === 422) {
                const errors = err.response.data.errors;
                const msg = errors ? Object.values(errors).flat().join(" ") : "Champs invalides.";
                setErreur(msg);
            } else if (err.response && err.response.data?.message) {
                setErreur(err.response.data.message);
            } else {
                setErreur("Impossible de se connecter au serveur. Assurez-vous que le backend Laravel est démarré.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
            <Navbar />

            <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
                <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 grid grid-cols-1 lg:grid-cols-2 my-4">
                    
                    {/* ================= SECTION GAUCHE : IMAGE ================= */}
                    <div className="relative hidden lg:block bg-green-950 overflow-hidden">
                        <img
                            src={IMAGE_ILUSTRATION}
                            alt="Agriculture SenAgri"
                            className="absolute inset-0 h-full w-full object-cover opacity-80 hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-green-950 via-green-900/40 to-transparent"></div>
                        
                        <div className="relative z-10 h-full flex flex-col justify-between p-10 text-white">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl">
                                    <FaLeaf className="text-2xl text-green-300" />
                                </div>
                                <span className="text-2xl font-bold tracking-tight">SenAgri</span>
                            </div>

                            <div className="space-y-4">
                                <span className="inline-block px-3 py-1 bg-green-500/30 backdrop-blur-md border border-green-400/30 rounded-full text-xs font-semibold uppercase tracking-wider text-green-200">
                                    B2B Agricole
                                </span>
                                <h2 className="text-3xl font-extrabold leading-tight">
                                    Connectez-vous au marché agricole sénégalais.
                                </h2>
                                <p className="text-green-100 text-sm leading-relaxed opacity-90">
                                    Vendez et achetez directement des produits agricoles de qualité auprès de nos producteurs locaux.
                                </p>
                            </div>

                            <p className="text-xs text-green-200/70">
                                © SenAgri - La plateforme B2B de référence au Sénégal.
                            </p>
                        </div>
                    </div>

                    {/* ================= SECTION DROITE : FORMULAIRE DE CONNEXION ================= */}
                    <div className="p-8 sm:p-12 flex flex-col justify-center">
                        
                        <div className="mb-8 text-center lg:text-left">
                            <span className="inline-block px-3 py-1 bg-green-100 text-green-700 font-semibold text-xs rounded-full uppercase tracking-wider mb-2">
                                Espace Membre
                            </span>
                            <h1 className="text-3xl font-extrabold text-gray-900">
                                Connexion
                            </h1>
                            <p className="mt-2 text-sm text-gray-600">
                                Entrez vos identifiants pour accéder à votre compte.
                            </p>
                        </div>

                        {/* Alerte d'erreur */}
                        {erreur && (
                            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl flex items-start gap-3">
                                <FaExclamationTriangle className="text-red-500 text-lg flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-red-700 font-medium">{erreur}</p>
                            </div>
                        )}

                        {/* Alerte de succès */}
                        {succesMsg && (
                            <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-r-xl flex items-center gap-3">
                                <FaCheckCircle className="text-green-600 text-lg flex-shrink-0" />
                                <p className="text-sm font-semibold text-green-800">{succesMsg}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            
                            {/* Email */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Adresse Email <span className="text-red-500">*</span>
                                </label>
                                <div className="relative rounded-xl shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                        <FaEnvelope />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="votre.email@exemple.com"
                                        className="block w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Mot de passe */}
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Mot de passe <span className="text-red-500">*</span>
                                    </label>
                                </div>
                                <div className="relative rounded-xl shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                        <FaLock />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="block w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 transition-colors"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </div>

                            {/* Bouton de soumission */}
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-3.5 px-4 bg-green-600 hover:bg-green-700 text-white font-bold text-base rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center ${
                                    loading ? "opacity-75 cursor-not-allowed" : ""
                                }`}
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                                        Connexion en cours...
                                    </>
                                ) : (
                                    "Se connecter"
                                )}
                            </button>
                        </form>

                        {/* Inscription */}
                        <p className="mt-8 text-center text-sm text-gray-600">
                            Vous n'avez pas encore de compte ?{" "}
                            <Link to="/register" className="font-bold text-green-700 hover:text-green-800 hover:underline">
                                Créer un compte
                            </Link>
                        </p>
                    </div>

                </div>
            </main>
        </div>
    );
}
