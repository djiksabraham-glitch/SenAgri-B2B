import Navbar from "../../components/home/Navbar";
import Hero from "../../components/home/Hero";
import Categories from "../../components/home/Categories";
import DernieresOffres from "../../components/offres/DernieresOffres";
import PourquoiSenAgri from "../../components/home/PourquoiSenAgri";
import Footer from "../../components/home/Footer";

export default function Home() {

    return (

        <>

            <Navbar />

            <Hero />

            <Categories />

            <DernieresOffres />

            <PourquoiSenAgri />

            <Footer />

        </>

    );

}