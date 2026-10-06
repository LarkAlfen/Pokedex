import "./PokemonCard.scss";

export function PokemonCard({ pokemon }) {
  return (
    <article className="pokemon-card">
      <span className="pokemon-card__id">
        #{pokemon.id}
      </span>

      <h2 className="pokemon-card__name">
        {pokemon.name}
      </h2>
    </article>
  );
}