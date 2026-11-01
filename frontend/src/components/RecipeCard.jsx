export default function RecipeCard({ recipe }) {
  return (
    <article
      className="bg-white border-2 flex flex-col shadow-none transition-all duration-100 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_#0c0a08]"
      style={{ borderColor: "#0c0a08" }}
    >
      {recipe.image ? (
        <img
          src={recipe.image}
          alt={recipe.title}
          loading="lazy"
          className="w-full aspect-[4/3] object-cover border-b-2"
          style={{ borderColor: "#0c0a08" }}
        />
      ) : (
        <div
          className="w-full aspect-[4/3] border-b-2"
          style={{ borderColor: "#0c0a08", backgroundColor: "#e8e5dd" }}
        />
      )}
      <div className="p-4">
        <h2 className="font-bold leading-snug" style={{ color: "#0c0a08" }}>
          {recipe.title}
        </h2>
      </div>
    </article>
  );
}
