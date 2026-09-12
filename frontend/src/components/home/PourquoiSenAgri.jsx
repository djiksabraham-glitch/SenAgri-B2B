export default function PourquoiSenAgri() {
    const avantages = [
        {
            icon: "🌾",
            title: "Produits agricoles de qualité",
            description:
                "Découvrez des produits agricoles proposés directement par des vendeurs et producteurs.",
        },
        {
            icon: "🤝",
            title: "Mise en relation B2B",
            description:
                "Acheteurs et vendeurs peuvent facilement se rencontrer et développer leurs activités.",
        },
        {
            icon: "🔒",
            title: "Transactions sécurisées",
            description:
                "Payez vos commandes de manière simple et sécurisée grâce à notre système de paiement.",
        },
    ];

    return (
        <section className="bg-gray-50 py-16">
            <div className="mx-auto max-w-7xl px-6">

                {/* Titre */}
                <div className="mx-auto mb-12 max-w-2xl text-center">

                    <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-green-600">
                        Pourquoi SenAgri ?
                    </p>

                    <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
                        Une plateforme pensée pour le commerce agricole
                    </h2>

                    <p className="mt-4 text-gray-600">
                        SenAgri facilite les échanges entre les acteurs du secteur
                        agricole au Sénégal.
                    </p>

                </div>

                {/* Avantages */}
                <div className="grid gap-8 md:grid-cols-3">

                    {avantages.map((avantage, index) => (
                        <div
                            key={index}
                            className="rounded-2xl bg-white p-8 text-center shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                        >

                            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-3xl">
                                {avantage.icon}
                            </div>

                            <h3 className="mb-3 text-xl font-semibold text-gray-900">
                                {avantage.title}
                            </h3>

                            <p className="leading-7 text-gray-600">
                                {avantage.description}
                            </p>

                        </div>
                    ))}

                </div>

            </div>
        </section>
    );
}