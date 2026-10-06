import "./PokemonCard.scss";

export function PokemonCard({ name }) {
  return (
    <article className="pokemon-card">
      <h2 className="pokemon-card__name">
        {name}
      </h2>
    </article>
  );
}