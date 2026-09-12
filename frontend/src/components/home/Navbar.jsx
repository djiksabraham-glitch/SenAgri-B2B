import { Link, useNavigate } from "react-router-dom";
import { FaLeaf, FaUser, FaSignOutAlt, FaPlusCircle, FaBox, FaShoppingBag, FaComments, FaUserShield } from "react-icons/fa";
import { useAuth } from "../../hooks/useAuth";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isVendeur, isAdmin, logoutUser } = useAuth();

  const handleLogout = async () => {
    await logoutUser();
    navigate("/");
  };

  const homeLink = isAuthenticated
    ? isAdmin ? "/admin" : isVendeur ? "/vendeur" : "/acheteur"
    : "/";

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link to={homeLink} className="flex items-center gap-2 group">
          <FaLeaf className="text-green-600 text-3xl group-hover:scale-110 transition-transform duration-300" />
          <span className="text-2xl font-bold text-green-800 tracking-tight">
            SenAgri
          </span>
        </Link>

        {/* Menu principal */}
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-700">
          {!isAuthenticated ? (
            <>
              <Link to="/" className="hover:text-green-600 transition-colors">
                Accueil
              </Link>

              <Link to="/offres" className="hover:text-green-600 transition-colors">
                Offres
              </Link>
            </>
          ) : (
            <>
              {isAdmin ? (
                <Link
                  to="/admin"
                  className="flex items-center gap-1.5 hover:text-emerald-700 transition-colors text-emerald-800 font-bold"
                >
                  <FaUserShield className="text-emerald-600 text-sm" />
                  Administration
                </Link>
              ) : (
                <>
                  <Link
                    to={isVendeur ? "/vendeur" : "/acheteur"}
                    className="flex items-center gap-1.5 hover:text-green-600 transition-colors text-green-700 font-bold"
                  >
                    <FaBox className="text-sm" />
                    Mon Espace {isVendeur ? "Vendeur" : "Acheteur"}
                  </Link>

                  <Link
                    to="/messages"
                    className="flex items-center gap-1.5 hover:text-green-600 transition-colors text-gray-700 font-bold"
                  >
                    <FaComments className="text-green-600 text-sm" />
                    Messagerie
                  </Link>
                </>
              )}

              {isVendeur && (
                <Link
                  to="/vendeur/offres/creer"
                  className="flex items-center gap-1.5 text-green-700 hover:text-green-800 transition-colors font-bold"
                >
                  <FaPlusCircle className="text-green-600" />
                  Publier une offre
                </Link>
              )}
            </>
          )}
        </div>

        {/* Espace Utilisateur / Authentification */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              
              {/* Profil & Rôle (Cliquable vers /profil) */}
              <Link
                to="/profil"
                className="flex items-center gap-2.5 bg-green-50 hover:bg-green-100/80 px-3.5 py-1.5 rounded-full border border-green-100 transition-all cursor-pointer group"
                title="Mon Profil & Paramètres"
              >
                <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-sm shadow-sm overflow-hidden flex-shrink-0">
                  {user?.photo_url || user?.photo?.url ? (
                    <img
                      src={user.photo_url || user.photo.url}
                      alt={user.nom}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : user?.nom ? (
                    user.nom.charAt(0).toUpperCase()
                  ) : (
                    <FaUser className="text-xs" />
                  )}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-gray-800 leading-tight group-hover:text-green-800">
                    {user?.nom || "Utilisateur"}
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-green-700">
                    {user?.role || "Membre"}
                  </span>
                </div>
              </Link>

              {/* Bouton Déconnexion */}
              <button
                onClick={handleLogout}
                title="Déconnexion"
                className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-red-600 px-3 py-2 rounded-xl hover:bg-red-50 transition-all duration-200"
              >
                <FaSignOutAlt className="text-sm" />
                <span className="hidden sm:inline">Déconnexion</span>
              </button>

            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="text-green-700 font-bold text-sm hover:text-green-900 px-3 py-2 rounded-lg transition"
              >
                Connexion
              </Link>

              <Link
                to="/register"
                className="bg-green-600 text-white font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-green-700 transition shadow-sm hover:shadow"
              >
                S'inscrire
              </Link>
            </>
          )}
        </div>

      </div>
    </nav>
  );
}