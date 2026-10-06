import { useEffect, useState } from "react";
import { getPokemons } from "../../services/pokemonApi";
import { generations } from "../../data/generations";
import { Filters } from "../../components/Filters/Filters";
import { PokemonCard } from "../../components/PokemonCard/PokemonCard";
import "./Pokedex.scss"
import { Pagination } from "../../components/Pagination/Pagination";

const LIMIT = 24;

export function Pokedex() {
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [pokemons, setPokemons] = useState([]);
    const [generation, setGeneration] = useState("all");

    useEffect(() => {
        async function loadPokemons() {
            try {
                const selectedGeneration =
                    generations.find(
                        (gen) => gen.value === generation
                    );

                const data = await getPokemons(
                    page,
                    LIMIT,
                    selectedGeneration.min,
                    selectedGeneration.max
                );

                setPokemons(data.pokemons);
                setTotal(data.total);

            } catch (error) {
                console.error(error);
            }
        }

        loadPokemons();
    }, [page, generation]);



    const totalPages = Math.ceil(total / LIMIT);

    function handleGenerationChange(value) {
        setGeneration(value);
        setPage(1);
    }

    return (
        <main className="container">

            <Filters
                generation={generation}
                onGenerationChange={handleGenerationChange}
            />

            <div className="pokemon-grid">
                {pokemons.map((pokemon) => (
                    <PokemonCard
                        key={pokemon.id}
                        pokemon={pokemon}
                    />
                ))}
            </div>
            <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
            />
        </main>
    );
}