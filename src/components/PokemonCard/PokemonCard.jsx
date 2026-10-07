import "./PokemonCard.scss";
import { typeIcons } from "../../data/typeIcons";

export function PokemonCard({ pokemon }) {
    return (
        <article className="pokemon-card">

            <span className="pokemon-card__id">
                #{pokemon.id.toString().padStart(3, "0")}
            </span>

            <img
                className="pokemon-card__image"
                src={pokemon.image}
                alt={pokemon.nameFr}
            />

            <h2 className="pokemon-card__name">
                {pokemon.nameFr}
            </h2>

            <div className="pokemon-card__types">
                {pokemon.types.map((type) => (
                    <img
                        key={type}
                        className="pokemon-card__type"
                        src={typeIcons[type]}
                        alt={`Type ${type}`}
                        title={type}
                    />
                ))}
            </div>

        </article>
    );
}