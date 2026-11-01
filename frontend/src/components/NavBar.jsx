import { Link, useNavigate } from "react-router-dom";
import { clearUser } from "../session";

export default function NavBar() {
  const navigate = useNavigate();

  const logout = () => {
    clearUser();
    navigate("/");
  };

  return (
    <header
      className="w-full px-6 py-4 flex items-center justify-between"
      style={{ backgroundColor: "#2a3723", color: "#b9bba8" }}
    >
      <Link
        to="/home"
        className="text-2xl"
        style={{ fontFamily: "'Matcha Mint', cursive", color: "#b9bba8" }}
      >
        Crumb
      </Link>
      <button type="button" onClick={logout} className="text-sm font-bold underline">
        Log out
      </button>
    </header>
  );
}
