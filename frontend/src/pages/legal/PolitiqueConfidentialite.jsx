import { Link } from "react-router-dom";
import Navbar from "../../components/home/Navbar";
import Footer from "../../components/home/Footer";

export default function PolitiqueConfidentialite() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 p-8 sm:p-12">

                    {/* Header */}
                    <div className="text-center mb-10">
                        <span className="inline-block px-3 py-1 bg-green-100 text-green-700 font-semibold text-xs rounded-full uppercase tracking-wider mb-3">
                            Protection des Données
                        </span>
                        <h1 className="text-3xl font-extrabold text-gray-900">
                            Politique de Confidentialité
                        </h1>
                        <p className="mt-2 text-sm text-gray-500">
                            Dernière mise à jour : Octobre 2026
                        </p>
                    </div>

                    {/* Bandeau légal */}
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-8">
                        <p className="text-sm text-green-800 font-medium leading-relaxed">
                            🔐 Cette politique est établie conformément à la <strong>Loi n° 2008-12 du 25 janvier 2008</strong> portant
                            sur la protection des données à caractère personnel en République du Sénégal et aux recommandations
                            de la <strong>Commission des Données Personnelles (CDP)</strong>.
                        </p>
                    </div>

                    <div className="prose prose-green max-w-none text-gray-700 space-y-8">

                        {/* Section 1 */}
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-2">
                                1. Responsable du traitement
                            </h2>
                            <p className="mt-3 leading-relaxed">
                                Le responsable du traitement des données personnelles est <strong>SenAgri</strong>,
                                plateforme B2B de commerce agricole au Sénégal.
                            </p>
                            <ul className="list-none space-y-1 mt-2">
                                <li>📧 Contact DPO : <strong>dpo@senagri.sn</strong></li>
                                <li>📍 Siège : <strong>Dakar, Sénégal</strong></li>
                            </ul>
                        </section>

                        {/* Section 2 */}
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-2">
                                2. Données collectées
                            </h2>
                            <p className="mt-3 leading-relaxed">
                                Dans le cadre de l'utilisation de la plateforme SenAgri, nous collectons les données suivantes :
                            </p>

                            <div className="mt-4 space-y-4">
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="font-bold text-gray-800 text-sm mb-2">🔹 Données d'identification</h3>
                                    <ul className="list-disc pl-5 space-y-1 text-sm">
                                        <li>Nom et prénom</li>
                                        <li>Adresse email</li>
                                        <li>Numéro de téléphone</li>
                                        <li>Adresse / Région / Localisation</li>
                                        <li>Photo de profil (facultative)</li>
                                    </ul>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="font-bold text-gray-800 text-sm mb-2">🔹 Données de compte</h3>
                                    <ul className="list-disc pl-5 space-y-1 text-sm">
                                        <li>Identifiant de compte</li>
                                        <li>Rôle (acheteur / vendeur)</li>
                                        <li>Date d'inscription</li>
                                        <li>Date d'acceptation des CGU</li>
                                    </ul>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="font-bold text-gray-800 text-sm mb-2">🔹 Données transactionnelles</h3>
                                    <ul className="list-disc pl-5 space-y-1 text-sm">
                                        <li>Historique des commandes</li>
                                        <li>Offres publiées (pour les vendeurs)</li>
                                        <li>Messages échangés entre utilisateurs</li>
                                        <li>Informations de paiement</li>
                                    </ul>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="font-bold text-gray-800 text-sm mb-2">🔹 Données techniques</h3>
                                    <ul className="list-disc pl-5 space-y-1 text-sm">
                                        <li>Adresse IP</li>
                                        <li>Type de navigateur</li>
                                        <li>Journaux d'activité (audit logs)</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* Section 3 */}
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-2">
                                3. Finalités du traitement
                            </h2>
                            <p className="mt-3 leading-relaxed">
                                Les données personnelles sont collectées et traitées pour les finalités suivantes :
                            </p>
                            <ul className="list-disc pl-6 space-y-2 mt-2">
                                <li><strong>Gestion des comptes utilisateurs</strong> : création, authentification, gestion du profil</li>
                                <li><strong>Mise en relation B2B</strong> : faciliter les échanges entre producteurs et acheteurs</li>
                                <li><strong>Traitement des commandes</strong> : suivi, facturation, livraison</li>
                                <li><strong>Messagerie</strong> : permettre la communication entre utilisateurs</li>
                                <li><strong>Paiements</strong> : traitement sécurisé des transactions</li>
                                <li><strong>Sécurité</strong> : prévention de la fraude, journaux d'audit</li>
                                <li><strong>Amélioration du service</strong> : statistiques et analyses d'usage</li>
                            </ul>
                        </section>

                        {/* Section 4 */}
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-2">
                                4. Base légale du traitement
                            </h2>
                            <p className="mt-3 leading-relaxed">
                                Conformément à la <strong>Loi n° 2008-12 du 25 janvier 2008</strong>, le traitement
                                de vos données personnelles repose sur :
                            </p>
                            <ul className="list-disc pl-6 space-y-1 mt-2">
                                <li><strong>Votre consentement</strong> : donné lors de l'inscription et l'acceptation des CGU</li>
                                <li><strong>L'exécution du contrat</strong> : nécessaire à la fourniture des services de la plateforme</li>
                                <li><strong>L'intérêt légitime</strong> : sécurité de la plateforme et prévention de la fraude</li>
                                <li><strong>Obligations légales</strong> : conservation des données de facturation</li>
                            </ul>
                        </section>

                        {/* Section 5 */}
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-2">
                                5. Durée de conservation
                            </h2>
                            <p className="mt-3 leading-relaxed">
                                Les données personnelles sont conservées pendant la durée nécessaire aux finalités
                                pour lesquelles elles ont été collectées :
                            </p>
                            <ul className="list-disc pl-6 space-y-1 mt-2">
                                <li><strong>Données de compte</strong> : pendant toute la durée d'utilisation du compte, puis 12 mois après la suppression</li>
                                <li><strong>Données transactionnelles</strong> : 5 ans (obligations comptables et fiscales)</li>
                                <li><strong>Journaux d'audit</strong> : 1 an</li>
                                <li><strong>Messages</strong> : pendant la durée du compte</li>
                            </ul>
                        </section>

                        {/* Section 6 */}
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-2">
                                6. Vos Droits
                            </h2>
                            <p className="mt-3 leading-relaxed">
                                Conformément à la <strong>Loi n° 2008-12</strong> et aux recommandations de la
                                <strong> Commission des Données Personnelles (CDP)</strong> du Sénégal, vous disposez des droits suivants :
                            </p>

                            <div className="mt-4 grid sm:grid-cols-2 gap-3">
                                {[
                                    { icon: "📋", title: "Droit d'accès", desc: "Obtenir une copie de vos données personnelles" },
                                    { icon: "✏️", title: "Droit de rectification", desc: "Modifier vos informations depuis votre profil" },
                                    { icon: "🗑️", title: "Droit de suppression", desc: "Demander la suppression de votre compte et données" },
                                    { icon: "⏸️", title: "Droit d'opposition", desc: "Vous opposer au traitement de vos données" },
                                    { icon: "📦", title: "Droit à la portabilité", desc: "Recevoir vos données dans un format structuré" },
                                    { icon: "🔒", title: "Droit à la limitation", desc: "Limiter le traitement de vos données" },
                                ].map((droit, index) => (
                                    <div key={index} className="bg-green-50/50 border border-green-100 rounded-lg p-3">
                                        <p className="font-bold text-sm text-gray-800">
                                            {droit.icon} {droit.title}
                                        </p>
                                        <p className="text-xs text-gray-600 mt-1">{droit.desc}</p>
                                    </div>
                                ))}
                            </div>

                            <p className="mt-4 leading-relaxed">
                                Pour exercer ces droits, vous pouvez :
                            </p>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>Modifier vos informations directement depuis votre <Link to="/profil" className="text-green-700 font-semibold hover:underline">page de profil</Link></li>
                                <li>Supprimer votre compte depuis les paramètres de votre profil</li>
                                <li>Nous contacter par email à <strong>dpo@senagri.sn</strong></li>
                                <li>Saisir la <strong>Commission des Données Personnelles (CDP)</strong> en cas de litige</li>
                            </ul>
                        </section>

                        {/* Section 7 */}
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-2">
                                7. Sécurité des données
                            </h2>
                            <p className="mt-3 leading-relaxed">
                                SenAgri met en œuvre des mesures techniques et organisationnelles appropriées
                                pour garantir la sécurité de vos données personnelles :
                            </p>
                            <ul className="list-disc pl-6 space-y-1 mt-2">
                                <li>Chiffrement des mots de passe (hashing sécurisé)</li>
                                <li>Authentification par token (Laravel Sanctum)</li>
                                <li>Limitation du débit (rate limiting) sur les endpoints sensibles</li>
                                <li>Journalisation des actions sensibles (audit logs)</li>
                                <li>Accès restreint aux données selon le rôle utilisateur</li>
                            </ul>
                        </section>

                        {/* Section 8 */}
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-2">
                                8. Partage des données
                            </h2>
                            <p className="mt-3 leading-relaxed">
                                Vos données personnelles ne sont <strong>jamais vendues</strong> à des tiers.
                                Elles peuvent être partagées uniquement dans les cas suivants :
                            </p>
                            <ul className="list-disc pl-6 space-y-1 mt-2">
                                <li><strong>Entre utilisateurs</strong> : informations nécessaires à la transaction (nom, contact, pour les parties concernées)</li>
                                <li><strong>Prestataires de paiement</strong> : pour le traitement sécurisé des transactions</li>
                                <li><strong>Autorités compétentes</strong> : en cas de réquisition judiciaire</li>
                            </ul>
                        </section>

                        {/* Section 9 */}
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-2">
                                9. Commission des Données Personnelles (CDP)
                            </h2>
                            <p className="mt-3 leading-relaxed">
                                Si vous estimez que le traitement de vos données personnelles constitue une violation
                                de vos droits, vous pouvez introduire une réclamation auprès de la
                                <strong> Commission des Données Personnelles (CDP)</strong> du Sénégal :
                            </p>
                            <div className="bg-gray-50 rounded-lg p-4 mt-3">
                                <p className="font-bold text-sm text-gray-800">Commission des Données Personnelles (CDP)</p>
                                <p className="text-sm text-gray-600 mt-1">Autorité de protection des données du Sénégal</p>
                                <p className="text-sm text-gray-600">🌐 www.cdp.sn</p>
                            </div>
                        </section>

                        {/* Section 10 */}
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-2">
                                10. Contact
                            </h2>
                            <p className="mt-3 leading-relaxed">
                                Pour toute question relative à cette politique de confidentialité ou pour exercer
                                vos droits, contactez-nous :
                            </p>
                            <ul className="list-none space-y-1 mt-2">
                                <li>📧 DPO : <strong>dpo@senagri.sn</strong></li>
                                <li>📧 Support : <strong>contact@senagri.sn</strong></li>
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
                            to="/conditions-generales"
                            className="text-sm font-semibold text-green-700 hover:text-green-800 hover:underline"
                        >
                            Conditions Générales d'Utilisation →
                        </Link>
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
}
