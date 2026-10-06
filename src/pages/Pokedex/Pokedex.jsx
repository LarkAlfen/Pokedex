import { useEffect, useState } from "react";
import { getPokemons } from "../../services/pokemonApi";

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
                const data = await getPokemons(page, LIMIT);

                setPokemons(data.pokemons);
                setTotal(data.total);
            } catch (error) {
                console.error(error);
            }
        }

        loadPokemons();
    }, [page]);

    const totalPages = Math.ceil(total / LIMIT);


    return (
        <main className="container">

            <Filters
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