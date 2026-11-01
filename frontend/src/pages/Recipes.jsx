import { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import RecipeCard from "../components/RecipeCard";
import { getRecipes } from "../api/recipes";
import { extractErrorMessage } from "../api/client";

export default function Recipes() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = (force = false) => {
    let cancelled = false;
    setLoading(true);
    setError("");
    getRecipes({ force })
      .then((list) => {
        if (!cancelled) setRecipes(list);
      })
      .catch((err) => {
        if (!cancelled) setError(extractErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  };

  useEffect(() => load(), []);

  return (
    <div
      className="min-h-screen w-full"
      style={{ backgroundColor: "#e8e5dd", fontFamily: "Comfortaa, sans-serif" }}
    >
      <NavBar />
      <main className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-8" style={{ color: "#0c0a08" }}>
          Gluten-free recipes
        </h1>

        {loading && (
          <p className="font-bold" style={{ color: "#0c0a08" }}>
            Loading recipes…
          </p>
        )}

        {!loading && error && (
          <div>
            <p
              className="text-sm font-bold mb-4 border-2 px-3 py-2 inline-block"
              style={{ color: "#7a2b1f", borderColor: "#7a2b1f" }}
            >
              {error}
            </p>
            <div>
              <button
                type="button"
                onClick={() => load(true)}
                className="px-5 py-2 font-bold border-2 transition-all duration-100 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0_#0c0a08]"
                style={{
                  backgroundColor: "#dcbc98",
                  color: "#2a3723",
                  borderColor: "#0c0a08",
                }}
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {!loading && !error && recipes.length === 0 && (
          <p style={{ color: "#0c0a08" }}>No recipes found.</p>
        )}

        {!loading && !error && recipes.length > 0 && (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {recipes.map((r) => (
              <RecipeCard key={r.id} recipe={r} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
