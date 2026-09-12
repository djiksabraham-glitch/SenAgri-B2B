import {
  FaSeedling,
  FaAppleAlt,
  FaCarrot,
  FaLeaf,
  FaTractor,
  FaShoppingBasket,
} from "react-icons/fa";

const categories = [
  {
    id: 1,
    name: "Céréales",
    icon: <FaSeedling />,
    color: "bg-green-100 text-green-700",
  },
  {
    id: 2,
    name: "Fruits",
    icon: <FaAppleAlt />,
    color: "bg-orange-100 text-orange-600",
  },
  {
    id: 3,
    name: "Légumes",
    icon: <FaCarrot />,
    color: "bg-red-100 text-red-600",
  },
  {
    id: 4,
    name: "Produits Bio",
    icon: <FaLeaf />,
    color: "bg-emerald-100 text-emerald-700",
  },
  {
    id: 5,
    name: "Matériel",
    icon: <FaTractor />,
    color: "bg-yellow-100 text-yellow-700",
  },
  {
    id: 6,
    name: "Autres",
    icon: <FaShoppingBasket />,
    color: "bg-blue-100 text-blue-700",
  },
];

export default function Categories() {
  return (
    <section className="py-20 bg-white">

      <div className="max-w-7xl mx-auto px-6">

        <div className="text-center mb-12">

          <h2 className="text-4xl font-bold text-gray-900">
            Explorer par catégorie
          </h2>

          <p className="text-gray-500 mt-3">
            Retrouvez rapidement les produits agricoles qui vous intéressent.
          </p>

        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">

          {categories.map((category) => (

            <div
              key={category.id}
              className="rounded-2xl border bg-white p-6 shadow-sm hover:shadow-xl hover:-translate-y-2 transition duration-300 cursor-pointer"
            >

              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl ${category.color}`}
              >
                {category.icon}
              </div>

              <h3 className="mt-5 text-lg font-semibold">
                {category.name}
              </h3>

            </div>

          ))}

        </div>

      </div>

    </section>
  );
}