const API_URL = "https://pokeapi.co/api/v2";

const pokemonCache = new Map();

export async function getPokemons(
  page = 1,
  limit = 24,
  min = 1,
  max
) {
  const generationCount = max - min + 1;

  const offset =
    min - 1 + (page - 1) * limit;

  const remainingPokemons =
    generationCount - (page - 1) * limit;

  const currentLimit = Math.min(
    limit,
    remainingPokemons
  );

  const response = await fetch(
    `${API_URL}/pokemon?limit=${currentLimit}&offset=${offset}`
  );

  if (!response.ok) {
    throw new Error("Impossible de récupérer les Pokémon");
  }

  const data = await response.json();

  const pokemons = await Promise.all(
    data.results.map((pokemon) => getPokemon(pokemon))
  );

  return {
    pokemons,
    total: generationCount,
  };
}


async function getPokemon(pokemon) {
  const id = Number(
    pokemon.url.split("/").filter(Boolean).pop()
  );

  // Le Pokémon existe déjà dans le cache
  if (pokemonCache.has(id)) {
    return pokemonCache.get(id);
  }

  // Sinon on appelle PokéAPI
  const [pokemonResponse, speciesResponse] =
    await Promise.all([
      fetch(`${API_URL}/pokemon/${id}`),
      fetch(`${API_URL}/pokemon-species/${id}`),
    ]);

  if (!pokemonResponse.ok || !speciesResponse.ok) {
    throw new Error(
      `Impossible de récupérer les informations de ${pokemon.name}`
    );
  }

  const pokemonData = await pokemonResponse.json();
  const speciesData = await speciesResponse.json();

  const frenchName = speciesData.names.find(
    (name) => name.language.name === "fr"
  );

  const pokemonDetails = {
    id,

    name: pokemon.name,

    nameFr:
      frenchName?.name ?? pokemon.name,

    image:
      pokemonData.sprites.other["official-artwork"]
        .front_default ??
      pokemonData.sprites.front_default,

    types: pokemonData.types.map(
      (type) => type.type.name
    ),
  };

  // On sauvegarde le résultat
  pokemonCache.set(id, pokemonDetails);

  return pokemonDetails;
}
