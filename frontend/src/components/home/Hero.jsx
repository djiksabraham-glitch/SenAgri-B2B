import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import heroImage from "../../assets/images/hero-agriculture.jpg";

export default function Hero() {
  return (
    <section className="bg-linear-to-r from-green-50 to-green-100">
      <div className="max-w-7xl mx-auto px-6 py-20">

        <div className="grid lg:grid-cols-2 gap-12 items-center">

          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">
              🌱 Plateforme agricole B2B
            </span>

            <h1 className="text-6xl font-bold text-gray-900 mt-6 leading-tight">
              Achetez et vendez vos produits agricoles
              <span className="text-green-600"> en toute confiance.</span>
            </h1>

            <p className="text-gray-600 mt-6 text-lg leading-8">
              SenAgri connecte producteurs, commerçants et entreprises afin de
              simplifier les échanges agricoles partout au Sénégal.
            </p>

            <div className="flex gap-4 mt-8">
              <Link
                to="/offres"
                className="bg-green-600 text-white px-7 py-4 rounded-xl hover:bg-green-700 transition"
              >
                Découvrir les offres
              </Link>

              <Link
                to="/register"
                className="border border-green-600 text-green-600 px-7 py-4 rounded-xl hover:bg-green-600 hover:text-white transition"
              >
                Commencer
              </Link>
            </div>

            <div className="flex gap-10 mt-14">
              <div>
                <h2 className="text-3xl font-bold text-green-700">500+</h2>
                <p className="text-gray-600">Offres</p>
              </div>

              <div>
                <h2 className="text-3xl font-bold text-green-700">120+</h2>
                <p className="text-gray-600">Producteurs</p>
              </div>

              <div>
                <h2 className="text-3xl font-bold text-green-700">1000+</h2>
                <p className="text-gray-600">Acheteurs</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
          >
            <img
              src={heroImage}
              alt="Agriculture"
              className="rounded-3xl shadow-2xl"
            />
          </motion.div>

        </div>

      </div>
    </section>
  );
}