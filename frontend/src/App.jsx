import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import CrumbAuth from "./components/CrumbAuth";
import Home from "./pages/Home";
import Recipes from "./pages/Recipes";
import { getUser } from "./session";

// Logged-out users get sent to the login screen.
function RequireAuth({ children }) {
  return getUser() ? children : <Navigate to="/" replace />;
}

// Logged-in users skip the login screen.
function PublicOnly({ children }) {
  return getUser() ? <Navigate to="/home" replace /> : children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicOnly><CrumbAuth /></PublicOnly>} />
        <Route path="/home" element={<RequireAuth><Home /></RequireAuth>} />
        <Route path="/recipes" element={<RequireAuth><Recipes /></RequireAuth>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
