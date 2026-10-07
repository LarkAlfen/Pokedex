const API_URL = "https://pokeapi.co/api/v2";

const pokemonCache = new Map();
const typeCache = new Map();


export async function getPokemons(
  page = 1,
  limit = 24,
  min = 1,
  max,
  selectedTypes = []
) {
  let pokemonList;

  // Aucun filtre de type
  if (selectedTypes.length === 0) {
    pokemonList = createGenerationList(min, max);
  }

  // Un ou deux types
  else {
    pokemonList = await getPokemonsByTypes(selectedTypes);

    // On filtre ensuite par génération
    pokemonList = pokemonList.filter(
      (pokemon) =>
        pokemon.id >= min &&
        pokemon.id <= max
    );
  }


  // Nombre total APRÈS filtrage
  const total = pokemonList.length;


  // Pagination
  const start = (page - 1) * limit;
  const end = start + limit;

  const paginatedPokemons = pokemonList.slice(
    start,
    end
  );


  // On récupère uniquement les détails
  // des Pokémon visibles
  const pokemons = await Promise.all(
    paginatedPokemons.map((pokemon) =>
      getPokemonDetails(pokemon)
    )
  );


  return {
    pokemons,
    total,
  };
}


async function getPokemonDetails(pokemon) {
  const id = pokemon.id;


  // Cache
  if (pokemonCache.has(id)) {
    return pokemonCache.get(id);
  }


  const [
    pokemonResponse,
    speciesResponse
  ] = await Promise.all([
    fetch(`${API_URL}/pokemon/${id}`),
    fetch(`${API_URL}/pokemon-species/${id}`),
  ]);


  if (
    !pokemonResponse.ok ||
    !speciesResponse.ok
  ) {
    throw new Error(
      `Impossible de récupérer le Pokémon #${id}`
    );
  }


  const pokemonData =
    await pokemonResponse.json();

  const speciesData =
    await speciesResponse.json();


  const frenchName =
    speciesData.names.find(
      (name) =>
        name.language.name === "fr"
    );


  const pokemonDetails = {
    id,

    name: pokemonData.name,

    nameFr:
      frenchName?.name ??
      pokemonData.name,

    image:
      pokemonData.sprites.other[
        "official-artwork"
      ].front_default ??
      pokemonData.sprites.front_default,

    types:
      pokemonData.types.map(
        (type) => type.type.name
      ),
  };


  pokemonCache.set(
    id,
    pokemonDetails
  );


  return pokemonDetails;
}

function createGenerationList(min, max) {
  return Array.from(
    { length: max - min + 1 },
    (_, index) => {
      const id = min + index;

      return {
        id,
        name: null,
      };
    }
  );
}

async function getPokemonsByType(type) {
  // On regarde d'abord dans le cache
  if (typeCache.has(type)) {
    return typeCache.get(type);
  }


  const response = await fetch(
    `${API_URL}/type/${type}`
  );


  if (!response.ok) {
    throw new Error(
      `Impossible de récupérer le type ${type}`
    );
  }


  const data = await response.json();


  const pokemons = data.pokemon.map(
    ({ pokemon }) => {
      const id = Number(
        pokemon.url
          .split("/")
          .filter(Boolean)
          .pop()
      );

      return {
        id,
        name: pokemon.name,
      };
    }
  );


  // On met la liste dans le cache
  typeCache.set(type, pokemons);


  return pokemons;
}

async function getPokemonsByTypes(selectedTypes) {
  const typeLists = await Promise.all(
    selectedTypes.map((type) =>
      getPokemonsByType(type)
    )
  );


  // Un seul type
  if (typeLists.length === 1) {
    return typeLists[0];
  }


  // Deux types
  const [firstType, secondType] = typeLists;


  return firstType.filter((pokemon) =>
    secondType.some(
      (otherPokemon) =>
        otherPokemon.id === pokemon.id
    )
  );
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
