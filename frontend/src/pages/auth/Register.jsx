import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../../services/authService";
import { useAuth } from "../../hooks/useAuth";
import Navbar from "../../components/home/Navbar";
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaLock, FaStore, FaShoppingBag, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";

export default function Register() {
    const navigate = useNavigate();
    const { loginUser } = useAuth();

    const [formData, setFormData] = useState({
        nom: "",
        email: "",
        telephone: "",
        adresse: "",
        role: "acheteur", // default role
        password: "",
        password_confirmation: "",
    });

    const [loading, setLoading] = useState(false);
    const [erreurGenerale, setErreurGenerale] = useState("");
    const [erreursChamps, setErreursChamps] = useState({});
    const [succesMsg, setSuccesMsg] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        
        // Clear field error on edit
        if (erreursChamps[name]) {
            setErreursChamps((prev) => ({ ...prev, [name]: null }));
        }
    };

    const handleRoleSelect = (selectedRole) => {
        setFormData((prev) => ({ ...prev, role: selectedRole }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErreurGenerale("");
        setErreursChamps({});
        setSuccesMsg("");

        // Basic client-side validation
        if (formData.password !== formData.password_confirmation) {
            setErreursChamps({ password_confirmation: ["Les mots de passe ne correspondent pas."] });
            setLoading(false);
            return;
        }

        try {
            const data = await register(formData);

            console.log("Inscription réussie :", data);

            // Mettre à jour le contexte d'authentification
            loginUser(data.user, data.token);

            setSuccesMsg("Votre compte a été créé avec succès ! Redirection vers votre espace...");

            const targetPath = (data.user?.role === "vendeur" || data.user?.role === "producteur") ? "/vendeur" : "/acheteur";

            setTimeout(() => {
                navigate(targetPath);
            }, 1000);
        } catch (err) {
            console.error("Erreur inscription :", err);

            if (err.response && err.response.status === 422) {
                // Laravel validation errors format: { errors: { email: ["..."], ... } }
                setErreursChamps(err.response.data.errors || {});
                setErreurGenerale("Veuillez corriger les erreurs indiquées ci-dessous.");
            } else if (err.response && err.response.data?.message) {
                setErreurGenerale(err.response.data.message);
            } else {
                setErreurGenerale("Une erreur est survenue lors de l'inscription. Vérifiez votre connexion au serveur backend.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
            <Navbar />

            <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
                <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-10 my-6 transition-all duration-300">
                    
                    {/* Header Card */}
                    <div className="text-center mb-8">
                        <span className="inline-block px-3 py-1 bg-green-100 text-green-700 font-semibold text-xs rounded-full uppercase tracking-wider mb-2">
                            Rejoignez SenAgri
                        </span>
                        <h1 className="text-3xl font-extrabold text-gray-900">
                            Créer un compte
                        </h1>
                        <p className="mt-2 text-sm text-gray-600">
                            Accédez au réseau de producteurs et d'acheteurs agricoles au Sénégal.
                        </p>
                    </div>

                    {/* Notification d'erreur générale */}
                    {erreurGenerale && (
                        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl flex items-start gap-3">
                            <FaExclamationTriangle className="text-red-500 text-xl flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-bold text-red-800">Erreur d'inscription</h4>
                                <p className="text-xs text-red-700 mt-1">{erreurGenerale}</p>
                            </div>
                        </div>
                    )}

                    {/* Notification de succès */}
                    {succesMsg && (
                        <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-r-xl flex items-center gap-3">
                            <FaCheckCircle className="text-green-600 text-xl flex-shrink-0" />
                            <p className="text-sm font-semibold text-green-800">{succesMsg}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        {/* Choix du rôle */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                Vous êtes ? <span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => handleRoleSelect("acheteur")}
                                    className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center transition-all ${
                                        formData.role === "acheteur"
                                            ? "border-green-600 bg-green-50/50 text-green-800 shadow-sm"
                                            : "border-gray-200 hover:border-gray-300 text-gray-600"
                                    }`}
                                >
                                    <FaShoppingBag className={`text-2xl mb-2 ${formData.role === "acheteur" ? "text-green-600" : "text-gray-400"}`} />
                                    <span className="font-bold text-sm">Acheteur</span>
                                    <span className="text-xs text-gray-500 text-center mt-1">Je souhaite acheter</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleRoleSelect("vendeur")}
                                    className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center transition-all ${
                                        formData.role === "vendeur"
                                            ? "border-green-600 bg-green-50/50 text-green-800 shadow-sm"
                                            : "border-gray-200 hover:border-gray-300 text-gray-600"
                                    }`}
                                >
                                    <FaStore className={`text-2xl mb-2 ${formData.role === "vendeur" ? "text-green-600" : "text-gray-400"}`} />
                                    <span className="font-bold text-sm">Vendeur</span>
                                    <span className="text-xs text-gray-500 text-center mt-1">Je souhaite vendre</span>
                                </button>
                            </div>
                            {erreursChamps.role && (
                                <p className="text-xs text-red-500 mt-1 font-medium">{erreursChamps.role[0]}</p>
                            )}
                        </div>

                        {/* Nom complet */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Nom complet <span className="text-red-500">*</span>
                            </label>
                            <div className="relative rounded-xl shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                    <FaUser />
                                </div>
                                <input
                                    type="text"
                                    name="nom"
                                    required
                                    value={formData.nom}
                                    onChange={handleChange}
                                    placeholder="Ex: Babacar Ndiaye"
                                    className={`block w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none transition-colors ${
                                        erreursChamps.nom ? "border-red-400 focus:border-red-500 bg-red-50/20" : "border-gray-200 focus:border-green-600 focus:ring-1 focus:ring-green-600"
                                    }`}
                                />
                            </div>
                            {erreursChamps.nom && (
                                <p className="text-xs text-red-500 mt-1 font-medium">{erreursChamps.nom[0]}</p>
                            )}
                        </div>

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
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="exemple@domaine.com"
                                    className={`block w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none transition-colors ${
                                        erreursChamps.email ? "border-red-400 focus:border-red-500 bg-red-50/20" : "border-gray-200 focus:border-green-600 focus:ring-1 focus:ring-green-600"
                                    }`}
                                />
                            </div>
                            {erreursChamps.email && (
                                <p className="text-xs text-red-500 mt-1 font-medium">{erreursChamps.email[0]}</p>
                            )}
                        </div>

                        {/* Téléphone & Adresse */}
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Téléphone <span className="text-red-500">*</span>
                                </label>
                                <div className="relative rounded-xl shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                        <FaPhone />
                                    </div>
                                    <input
                                        type="tel"
                                        name="telephone"
                                        required
                                        value={formData.telephone}
                                        onChange={handleChange}
                                        placeholder="77 123 45 67"
                                        className={`block w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none transition-colors ${
                                            erreursChamps.telephone ? "border-red-400 focus:border-red-500 bg-red-50/20" : "border-gray-200 focus:border-green-600 focus:ring-1 focus:ring-green-600"
                                        }`}
                                    />
                                </div>
                                {erreursChamps.telephone && (
                                    <p className="text-xs text-red-500 mt-1 font-medium">{erreursChamps.telephone[0]}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Adresse / Région <span className="text-red-500">*</span>
                                </label>
                                <div className="relative rounded-xl shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                        <FaMapMarkerAlt />
                                    </div>
                                    <input
                                        type="text"
                                        name="adresse"
                                        required
                                        value={formData.adresse}
                                        onChange={handleChange}
                                        placeholder="Dakar, Thiès..."
                                        className={`block w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none transition-colors ${
                                            erreursChamps.adresse ? "border-red-400 focus:border-red-500 bg-red-50/20" : "border-gray-200 focus:border-green-600 focus:ring-1 focus:ring-green-600"
                                        }`}
                                    />
                                </div>
                                {erreursChamps.adresse && (
                                    <p className="text-xs text-red-500 mt-1 font-medium">{erreursChamps.adresse[0]}</p>
                                )}
                            </div>
                        </div>

                        {/* Mot de passe & Confirmation */}
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Mot de passe <span className="text-red-500">*</span>
                                </label>
                                <div className="relative rounded-xl shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                        <FaLock />
                                    </div>
                                    <input
                                        type="password"
                                        name="password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        className={`block w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none transition-colors ${
                                            erreursChamps.password ? "border-red-400 focus:border-red-500 bg-red-50/20" : "border-gray-200 focus:border-green-600 focus:ring-1 focus:ring-green-600"
                                        }`}
                                    />
                                </div>
                                {erreursChamps.password && (
                                    <p className="text-xs text-red-500 mt-1 font-medium">{erreursChamps.password[0]}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Confirmer le mot de passe <span className="text-red-500">*</span>
                                </label>
                                <div className="relative rounded-xl shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                        <FaLock />
                                    </div>
                                    <input
                                        type="password"
                                        name="password_confirmation"
                                        required
                                        value={formData.password_confirmation}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        className={`block w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none transition-colors ${
                                            erreursChamps.password_confirmation ? "border-red-400 focus:border-red-500 bg-red-50/20" : "border-gray-200 focus:border-green-600 focus:ring-1 focus:ring-green-600"
                                        }`}
                                    />
                                </div>
                                {erreursChamps.password_confirmation && (
                                    <p className="text-xs text-red-500 mt-1 font-medium">{erreursChamps.password_confirmation[0]}</p>
                                )}
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
                                    Création du compte en cours...
                                </>
                            ) : (
                                "S'inscrire gratuitement"
                            )}
                        </button>
                    </form>

                    {/* Lien vers la page de connexion */}
                    <p className="mt-8 text-center text-sm text-gray-600">
                        Vous avez déjà un compte ?{" "}
                        <Link to="/login" className="font-bold text-green-700 hover:text-green-800 hover:underline">
                            Se connecter
                        </Link>
                    </p>
                </div>
            </main>
        </div>
    );
}
