const API_URL = "https://pokeapi.co/api/v2";

/**
 * Récupère la liste de tous les Pokémon
 */
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
    throw new Error(
      "Impossible de récupérer les Pokémon"
    );
  }

  const data = await response.json();

  const pokemons = await Promise.all(
    data.results.map(async (pokemon) => {
      const id = Number(
        pokemon.url.split("/").filter(Boolean).pop()
      );

      const speciesResponse = await fetch(
        `${API_URL}/pokemon-species/${id}`
      );

      const species = await speciesResponse.json();

      const frenchName = species.names.find(
        (name) => name.language.name === "fr"
      );

      return {
        id,
        name: pokemon.name,
        nameFr: frenchName?.name ?? pokemon.name,
        url: pokemon.url,
      };
    })
  );

  return {
    pokemons,
    total: generationCount,
  };
}

/**
 * Récupère les détails d'un Pokémon
 */
export async function getPokemon(id) {
  const response = await fetch(`${API_URL}/pokemon/${id}`);

  if (!response.ok) {
    throw new Error(`Impossible de récupérer le Pokémon ${id}`);
  }

  const pokemon = await response.json();

  return {
    id: pokemon.id,
    name: pokemon.name,

    image:
      pokemon.sprites.other["official-artwork"].front_default ??
      pokemon.sprites.front_default,

    types: pokemon.types.map((type) => type.type.name),

    height: pokemon.height,
    weight: pokemon.weight,

    stats: pokemon.stats.map((stat) => ({
      name: stat.stat.name,
      value: stat.base_stat,
    })),
  };
}
