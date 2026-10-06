import { useEffect, useState } from "react";
import { getPokemons } from "../../services/pokemonApi";
import "./Pokedex.scss";
import { PokemonCard } from "../../components/PokemonCard/PokemonCard";
import { Filters } from "../../components/Filters/Filters";
import { generations } from "../../data/generations";
export function Pokedex() {
    const [pokemons, setPokemons] = useState([]);
    const [generation, setGeneration] = useState("all");

    useEffect(() => {
        async function loadPokemons() {
            const data = await getPokemons();
            setPokemons(data);
        }

        loadPokemons();
    }, []);

    const filteredPokemons = pokemons.filter((pokemon) => {
        if (generation === "all") {
            return true;
        }

        const { min, max } = generations[generation];

        return pokemon.id >= min && pokemon.id <= max;
    });

    return (
        <main className="container">
            <Filters
                generation={generation}
                onGenerationChange={setGeneration}
            />
            <div className="pokemon-grid">
                {filteredPokemons.map((pokemon) => (
                    <PokemonCard
                        key={pokemon.name}
                        name={pokemon.name}
                    />
                ))}
            </div>
        </main>
    );
}