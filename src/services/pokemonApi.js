const API_URL = "https://pokeapi.co/api/v2";

export async function getPokemons() {
  const response = await fetch(`${API_URL}/pokemon?limit=2000`);

  if (!response.ok) {
    throw new Error("Erreur lors de la récupération des Pokémon");
  }

  const data = await response.json();

  const pokemonDetails = await Promise.all(
    data.results.map(async (pokemon) => {
      const response = await fetch(pokemon.url);

      if (!response.ok) {
        throw new Error(
          `Erreur lors de la récupération de ${pokemon.name}`
        );
      }

      const details = await response.json();

      return {
        id: details.id,
        name: details.name,
        image: details.sprites.front_default,
        types: details.types.map((type) => type.type.name),
        height: details.height,
        weight: details.weight,
        stats: details.stats,
      };
    })
  );

  return pokemonDetails;
}