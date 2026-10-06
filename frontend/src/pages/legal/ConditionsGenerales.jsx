import { Link } from "react-router-dom";
import Navbar from "../../components/home/Navbar";
import Footer from "../../components/home/Footer";

export default function ConditionsGenerales() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 p-8 sm:p-12">

                    {/* Header */}
                    <div className="text-center mb-10">
                        <span className="inline-block px-3 py-1 bg-green-100 text-green-700 font-semibold text-xs rounded-full uppercase tracking-wider mb-3">
                            Document Légal
                        </span>
                        <h1 className="text-3xl font-extrabold text-gray-900">
                            Conditions Générales d'Utilisation
                        </h1>
                        <p className="mt-2 text-sm text-gray-500">
                            Dernière mise à jour : Octobre 2026
                        </p>
                    </div>

                    <div className="prose prose-green max-w-none text-gray-700 space-y-8">

                        {/* Article 1 */}
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-2">
                                Article 1 — Objet
                            </h2>
                            <p className="mt-3 leading-relaxed">
                                Les présentes Conditions Générales d'Utilisation (ci-après « CGU ») ont pour objet de définir
                                les conditions d'accès et d'utilisation de la plateforme <strong>SenAgri</strong>,
                                accessible à l'adresse <em>www.senagri.sn</em>.
                            </p>
                            <p className="leading-relaxed">
                                SenAgri est une plateforme numérique B2B (Business-to-Business) destinée à faciliter la mise
                                en relation entre producteurs agricoles, grossistes et acheteurs au Sénégal.
                            </p>
                        </section>

                        {/* Article 2 */}
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-2">
                                Article 2 — Acceptation des CGU
                            </h2>
                            <p className="mt-3 leading-relaxed">
                                L'inscription sur la plateforme SenAgri implique l'acceptation pleine et entière des présentes CGU.
                                Tout utilisateur qui n'accepte pas les CGU ne peut pas utiliser les services proposés.
                            </p>
                            <p className="leading-relaxed">
                                SenAgri se réserve le droit de modifier les présentes CGU à tout moment.
                                Les utilisateurs seront informés de toute modification substantielle par notification
                                sur la plateforme ou par email.
                            </p>
                        </section>

                        {/* Article 3 */}
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-2">
                                Article 3 — Inscription et Compte Utilisateur
                            </h2>
                            <p className="mt-3 leading-relaxed">
                                Pour utiliser les services de SenAgri, l'utilisateur doit créer un compte en fournissant
                                des informations exactes et complètes, notamment :
                            </p>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>Nom et prénom</li>
                                <li>Adresse email valide</li>
                                <li>Numéro de téléphone</li>
                                <li>Adresse / Région</li>
                                <li>Rôle (acheteur ou vendeur)</li>
                            </ul>
                            <p className="leading-relaxed">
                                L'utilisateur est responsable de la confidentialité de ses identifiants de connexion
                                et de toute activité réalisée depuis son compte.
                            </p>
                        </section>

                        {/* Article 4 */}
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-2">
                                Article 4 — Services Proposés
                            </h2>
                            <p className="mt-3 leading-relaxed">
                                SenAgri propose les services suivants :
                            </p>
                            <ul className="list-disc pl-6 space-y-1">
                                <li><strong>Pour les vendeurs / producteurs :</strong> Publication d'offres de produits agricoles, gestion des commandes reçues, messagerie avec les acheteurs.</li>
                                <li><strong>Pour les acheteurs :</strong> Consultation du catalogue de produits, passation de commandes, suivi des commandes, messagerie avec les vendeurs.</li>
                                <li><strong>Pour tous :</strong> Gestion du profil utilisateur, notifications, système de paiement intégré.</li>
                            </ul>
                        </section>

                        {/* Article 5 */}
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-2">
                                Article 5 — Obligations des Utilisateurs
                            </h2>
                            <p className="mt-3 leading-relaxed">
                                Les utilisateurs s'engagent à :
                            </p>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>Fournir des informations exactes et à jour</li>
                                <li>Ne pas publier de contenu illicite, trompeur ou frauduleux</li>
                                <li>Respecter les autres utilisateurs dans leurs échanges</li>
                                <li>Ne pas tenter de contourner les mesures de sécurité de la plateforme</li>
                                <li>Respecter la législation sénégalaise en vigueur</li>
                            </ul>
                        </section>

                        {/* Article 6 */}
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-2">
                                Article 6 — Responsabilité
                            </h2>
                            <p className="mt-3 leading-relaxed">
                                SenAgri agit en tant qu'intermédiaire et ne saurait être tenu responsable :
                            </p>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>De la qualité, de la conformité ou de la livraison des produits vendus par les vendeurs</li>
                                <li>Des transactions effectuées entre acheteurs et vendeurs</li>
                                <li>Des pertes ou dommages indirects liés à l'utilisation de la plateforme</li>
                            </ul>
                        </section>

                        {/* Article 7 */}
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-2">
                                Article 7 — Protection des Données Personnelles
                            </h2>
                            <p className="mt-3 leading-relaxed">
                                Conformément à la <strong>Loi n° 2008-12 du 25 janvier 2008</strong> sur la protection
                                des données à caractère personnel au Sénégal, SenAgri s'engage à protéger les données
                                personnelles de ses utilisateurs.
                            </p>
                            <p className="leading-relaxed">
                                Pour plus de détails, veuillez consulter notre{" "}
                                <Link to="/politique-confidentialite" className="text-green-700 font-semibold hover:underline">
                                    Politique de Confidentialité
                                </Link>.
                            </p>
                        </section>

                        {/* Article 8 */}
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-2">
                                Article 8 — Propriété Intellectuelle
                            </h2>
                            <p className="mt-3 leading-relaxed">
                                L'ensemble des éléments constituant la plateforme SenAgri (logo, textes, graphismes,
                                images, logiciels) sont protégés par les lois relatives à la propriété intellectuelle.
                                Toute reproduction ou utilisation non autorisée est strictement interdite.
                            </p>
                        </section>

                        {/* Article 9 */}
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-2">
                                Article 9 — Suspension et Résiliation
                            </h2>
                            <p className="mt-3 leading-relaxed">
                                SenAgri se réserve le droit de suspendre ou de résilier le compte d'un utilisateur
                                en cas de violation des présentes CGU, sans préavis ni indemnité.
                            </p>
                            <p className="leading-relaxed">
                                L'utilisateur peut demander la suppression de son compte à tout moment depuis
                                les paramètres de son profil ou en contactant le support.
                            </p>
                        </section>

                        {/* Article 10 */}
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-2">
                                Article 10 — Droit Applicable et Juridiction
                            </h2>
                            <p className="mt-3 leading-relaxed">
                                Les présentes CGU sont soumises au droit sénégalais. Tout litige relatif à
                                l'interprétation ou à l'exécution des présentes CGU sera soumis aux juridictions
                                compétentes de Dakar, Sénégal.
                            </p>
                        </section>

                        {/* Article 11 */}
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-2">
                                Article 11 — Contact
                            </h2>
                            <p className="mt-3 leading-relaxed">
                                Pour toute question relative aux présentes CGU, vous pouvez nous contacter :
                            </p>
                            <ul className="list-none space-y-1 mt-2">
                                <li>📧 Email : <strong>contact@senagri.sn</strong></li>
                                <li>📞 Téléphone : <strong>+221 77 000 00 00</strong></li>
                                <li>📍 Adresse : <strong>Dakar, Sénégal</strong></li>
                            </ul>
                        </section>

                    </div>

                    {/* Back link */}
                    <div className="mt-10 pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <Link
                            to="/register"
                            className="text-sm font-semibold text-green-700 hover:text-green-800 hover:underline"
                        >
                            ← Retour à l'inscription
                        </Link>
                        <Link
                            to="/politique-confidentialite"
                            className="text-sm font-semibold text-green-700 hover:text-green-800 hover:underline"
                        >
                            Politique de Confidentialité →
                        </Link>
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
}
