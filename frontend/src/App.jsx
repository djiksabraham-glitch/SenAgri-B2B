import { Routes, Route } from "react-router-dom";
import Home from "./pages/home/Home";
import Offres from "./pages/offres/Offres";
import OffreDetails from "./pages/offres/OffreDetails";
import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import ConditionsGenerales from "./pages/legal/ConditionsGenerales";
import PolitiqueConfidentialite from "./pages/legal/PolitiqueConfidentialite";

import ProtectedRoute from "./components/auth/ProtectedRoute";
import GuestOnlyRoute from "./components/auth/GuestOnlyRoute";
import VendeurDashboard from "./pages/vendeur/VendeurDashboard";
import CreerOffre from "./pages/vendeur/CreerOffre";
import ModifierOffre from "./pages/vendeur/ModifierOffre";
import AcheteurDashboard from "./pages/acheteur/AcheteurDashboard";
import Messagerie from "./pages/messagerie/Messagerie";
import Profil from "./pages/profil/Profil";
import AdminDashboard from "./pages/admin/AdminDashboard";

function App() {
  return (
    <Routes>
      {/* Routes réservées uniquement aux visiteurs non connectés */}
      <Route element={<GuestOnlyRoute />}>
        <Route path="/" element={<Home />} />
        <Route path="/offres" element={<Offres />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
      </Route>

      {/* Pages légales — accessibles à tous */}
      <Route path="/conditions-generales" element={<ConditionsGenerales />} />
      <Route path="/politique-confidentialite" element={<PolitiqueConfidentialite />} />

      {/* Détail d'une offre */}
      <Route path="/offres/:id" element={<OffreDetails />} />

      {/* Profil pour tout utilisateur connecté */}
      <Route element={<ProtectedRoute allowedRoles={["vendeur", "producteur", "acheteur", "admin"]} />}>
        <Route path="/profil" element={<Profil />} />
      </Route>

      {/* Messagerie réservée uniquement aux vendeurs et acheteurs */}
      <Route element={<ProtectedRoute allowedRoles={["vendeur", "producteur", "acheteur"]} />}>
        <Route path="/messages" element={<Messagerie />} />
      </Route>

      {/* Espace Protégé Administrateur */}
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>

      {/* Espace Protégé Vendeur / Producteur */}
      <Route element={<ProtectedRoute allowedRoles={["vendeur", "producteur"]} />}>
        <Route path="/vendeur" element={<VendeurDashboard />} />
        <Route path="/vendeur/offres/creer" element={<CreerOffre />} />
        <Route path="/vendeur/offres/:id/modifier" element={<ModifierOffre />} />
      </Route>

      {/* Espace Protégé Acheteur / Client */}
      <Route element={<ProtectedRoute allowedRoles={["acheteur"]} />}>
        <Route path="/acheteur" element={<AcheteurDashboard />} />
      </Route>
    </Routes>
  );
}

export default App;