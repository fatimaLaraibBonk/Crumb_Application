import { Link } from "react-router-dom";
import NavBar from "../components/NavBar";
import { getUser } from "../session";

export default function Home() {
  const user = getUser();
  const name = user?.username || user?.email?.split("@")[0] || "there";

  return (
    <div
      className="min-h-screen w-full"
      style={{ backgroundColor: "#e8e5dd", fontFamily: "Comfortaa, sans-serif" }}
    >
      <NavBar />
      <main className="max-w-3xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-bold mb-8" style={{ color: "#0c0a08" }}>
          Hello, {name}
        </h1>
        <Link
          to="/recipes"
          className="inline-block px-6 py-3 font-bold border-2 transition-all duration-100 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0_#0c0a08] active:translate-x-0 active:translate-y-0 active:shadow-none"
          style={{
            backgroundColor: "#dcbc98",
            color: "#2a3723",
            borderColor: "#0c0a08",
          }}
        >
          Find recipes
        </Link>
      </main>
    </div>
  );
}
