import { useEffect, useState } from "react";
import { getPokemons } from "../../services/pokemonApi";
import { generations } from "../../data/generations";
import { Filters } from "../../components/Filters/Filters";
import { PokemonCard } from "../../components/PokemonCard/PokemonCard";
import "./Pokedex.scss"
import { Pagination } from "../../components/Pagination/Pagination";
import { useDebounce } from "../../hooks/useDebounce";
import { PokemonModal } from "../../components/PokemonModal/PokemonModal";
import { getPokemon3DData } from "../../services/pokemon3dApi";
const LIMIT = 40;

export function Pokedex() {
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [pokemons, setPokemons] = useState([]);
    const [generation, setGeneration] = useState("all");
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 300);
    const [selectedPokemon, setSelectedPokemon] = useState(null);
    const [only3D, setOnly3D] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadPokemons() {
            setLoading(true);

            try {
                const selectedGeneration = generations.find(
                    (gen) => gen.value === generation
                );

                const data = await getPokemons(
                    page,
                    LIMIT,
                    selectedGeneration.min,
                    selectedGeneration.max,
                    selectedTypes,
                    debouncedSearch,
                    only3D
                );

                setPokemons(data.pokemons);
                setTotal(data.total);

            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }

        loadPokemons();

    }, [page, generation, selectedTypes, debouncedSearch, only3D]);

    function handleTypeChange(type) {
        if (!type) return;

        setSelectedTypes((currentTypes) => {
            if (currentTypes.includes(type)) {
                return currentTypes;
            }

            if (currentTypes.length >= 2) {
                return currentTypes;
            }

            return [...currentTypes, type];
        });

        setPage(1);
    }

    function handleRemoveType(typeToRemove) {
        setSelectedTypes((currentTypes) =>
            currentTypes.filter(
                (type) => type !== typeToRemove
            )
        );

        setPage(1);
    }

    const totalPages = Math.ceil(total / LIMIT);

    function handleGenerationChange(value) {
        setGeneration(value);
        setPage(1);
    }

    function handleSearchChange(value) {
        setSearch(value);
        setPage(1);
    }

    return (
        <main className="container">

            <Filters
                generation={generation}
                onGenerationChange={handleGenerationChange}
                selectedTypes={selectedTypes}
                onTypeChange={handleTypeChange}
                onRemoveType={handleRemoveType}
                search={search}
                onSearchChange={handleSearchChange}
                only3D={only3D}
                onOnly3DChange={(checked) => {
                    setOnly3D(checked);
                    setPage(1);
                }}
            />
            {loading ? (
                <div className="pokedex__loading">
                    Chargement des Pokémon...
                </div>
            ) : total === 0 ? (
                <div className="pokedex__empty">
                    <span className="pokedex__empty-icon" aria-hidden="true">
                        ◌
                    </span>

                    <h2>Aucun Pokémon trouvé</h2>

                    <p>
                        Aucun Pokémon ne correspond à vos critères de recherche.
                        Essayez de modifier vos filtres ou votre recherche.
                    </p>
                </div>
            ) : (
                <>
                    <div className="pokemon-grid">
                        {pokemons.map((pokemon) => (
                            <PokemonCard
                                key={pokemon.id}
                                pokemon={pokemon}
                                onClick={() => setSelectedPokemon(pokemon)}
                            />
                        ))}
                    </div>

                    <Pagination
                        page={page}
                        totalPages={totalPages}
                        onPageChange={setPage}
                    />
                </>
            )}
            <PokemonModal
                pokemon={selectedPokemon}
                onClose={() => setSelectedPokemon(null)}
            />
        </main>
    );
}