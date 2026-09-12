import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "../pages/home/Home";
import Offres from "../pages/offres/Offres";

function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>

                <Route path="/" element={<Home />} />

                <Route path="/offres" element={<Offres />} />

            </Routes>
        </BrowserRouter>
    );
}

export default AppRoutes;