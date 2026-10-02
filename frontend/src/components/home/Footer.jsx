import { Link } from "react-router-dom";

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-white">

            <div className="mx-auto max-w-7xl px-6 py-12">

                <div className="grid gap-10 md:grid-cols-4">

                    {/* Présentation */}
                    <div className="md:col-span-2">

                        <h2 className="text-2xl font-bold">
                            Sen<span className="text-green-500">Agri</span>
                        </h2>

                        <p className="mt-4 max-w-md leading-7 text-gray-400">
                            SenAgri est une plateforme B2B qui facilite la mise
                            en relation entre acheteurs et vendeurs de produits
                            agricoles au Sénégal.
                        </p>

                    </div>

                    {/* Navigation */}
                    <div>

                        <h3 className="mb-4 font-semibold">
                            Navigation
                        </h3>

                        <ul className="space-y-3 text-gray-400">

                            <li>
                                <Link
                                    to="/"
                                    className="transition hover:text-white"
                                >
                                    Accueil
                                </Link>
                            </li>

                            <li>
                                <Link
                                    to="/offres"
                                    className="transition hover:text-white"
                                >
                                    Offres
                                </Link>
                            </li>

                            <li>
                                <Link
                                    to="/login"
                                    className="transition hover:text-white"
                                >
                                    Connexion
                                </Link>
                            </li>

                            <li>
                                <Link
                                    to="/register"
                                    className="transition hover:text-white"
                                >
                                    Inscription
                                </Link>
                            </li>

                        </ul>

                    </div>

                    {/* Contact */}
                    <div>

                        <h3 className="mb-4 font-semibold">
                            Contact
                        </h3>

                        <ul className="space-y-3 text-gray-400">

                            <li>
                                📍 Dakar, Sénégal
                            </li>

                            <li>
                                📞 +221 77 000 00 00
                            </li>

                            <li>
                                ✉️ contact@senagri.com
                            </li>

                        </ul>

                    </div>

                </div>

                {/* Ligne */}
                <div className="mt-10 border-t border-gray-800 pt-6">

                    <div className="flex flex-col justify-between gap-3 text-sm text-gray-500 md:flex-row">

                        <p>
                            © {new Date().getFullYear()} SenAgri. Tous droits réservés.
                        </p>

                        <p>
                            Plateforme agricole B2B du Sénégal
                        </p>

                    </div>

                </div>

            </div>

        </footer>
    );
}