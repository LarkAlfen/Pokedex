import { normalizeText } from "../utils/normalizeText";

const API_URL = "https://pokeapi.co/api/v2";

const pokemonCache = new Map();
const typeCache = new Map();
const nameCache = new Map();
let nameIndexCache = null;

export async function getPokemons(
  page = 1,
  limit = 24,
  min = 1,
  max,
  selectedTypes = [],
  search = "",
) {
  let pokemonList;

  // Génération
  if (selectedTypes.length === 0) {
    pokemonList = createGenerationList(min, max);
  } else {
    pokemonList = await getPokemonsByTypes(selectedTypes);

    pokemonList = pokemonList.filter(
      (pokemon) => pokemon.id >= min && pokemon.id <= max,
    );
  }

  // Recherche
  pokemonList = await filterPokemonsByName(pokemonList, search);

  // Pagination
  const total = pokemonList.length;

  const start = (page - 1) * limit;

  const end = start + limit;

  const paginatedPokemons = pokemonList.slice(start, end);

  // Détails uniquement des Pokémon affichés
  const pokemons = await Promise.all(
    paginatedPokemons.map((pokemon) => getPokemonDetails(pokemon)),
  );

  return {
    pokemons,
    total,
  };
}

async function filterPokemonsByName(pokemonList, search) {
  if (!search.trim()) {
    return pokemonList;
  }

  const nameIndex = await getPokemonNameIndex();

  const normalizedSearch = normalizeText(search);

  const matchingIds = new Set(
    nameIndex
      .filter((pokemon) => pokemon.normalizedName.includes(normalizedSearch))
      .map((pokemon) => pokemon.id),
  );

  return pokemonList.filter((pokemon) => matchingIds.has(pokemon.id));
}

async function getPokemonNameIndex() {
  if (nameIndexCache) {
    return nameIndexCache;
  }

  const response = await fetch(`${API_URL}/pokemon-species?limit=2000`);

  if (!response.ok) {
    throw new Error("Impossible de récupérer l'index des Pokémon");
  }

  const data = await response.json();

  const species = await Promise.all(
    data.results.map(async (pokemon) => {
      const id = Number(pokemon.url.split("/").filter(Boolean).pop());

      const response = await fetch(pokemon.url);

      if (!response.ok) {
        return null;
      }

      const speciesData = await response.json();

      const frenchName = speciesData.names.find(
        (name) => name.language.name === "fr",
      );

      const nameFr = frenchName?.name ?? pokemon.name;

      return {
        id,
        name: pokemon.name,
        nameFr,
        normalizedName: normalizeText(nameFr),
      };
    }),
  );

  nameIndexCache = species.filter(Boolean);

  return nameIndexCache;
}

// ========================================
// CRÉATION LISTE GÉNÉRATION
// ========================================

function createGenerationList(min, max) {
  return Array.from(
    {
      length: max - min + 1,
    },
    (_, index) => ({
      id: min + index,
    }),
  );
}

// ========================================
// NOM FRANÇAIS
// ========================================

async function getPokemonFrenchName(id) {
  // Déjà présent dans les détails
  if (pokemonCache.has(id)) {
    return pokemonCache.get(id).nameFr;
  }

  // Déjà présent dans le cache des noms
  if (nameCache.has(id)) {
    return nameCache.get(id);
  }

  const response = await fetch(`${API_URL}/pokemon-species/${id}`);

  if (!response.ok) {
    throw new Error(`Impossible de récupérer le nom du Pokémon #${id}`);
  }

  const data = await response.json();

  const frenchName = data.names.find((name) => name.language.name === "fr");

  const name = frenchName?.name ?? data.name;

  nameCache.set(id, name);

  return name;
}

// ========================================
// POKÉMON PAR TYPE
// ========================================

async function getPokemonsByType(type) {
  if (typeCache.has(type)) {
    return typeCache.get(type);
  }

  const response = await fetch(`${API_URL}/type/${type}`);

  if (!response.ok) {
    throw new Error(`Impossible de récupérer le type ${type}`);
  }

  const data = await response.json();

  const pokemons = data.pokemon.map(({ pokemon }) => {
    const id = Number(pokemon.url.split("/").filter(Boolean).pop());

    return {
      id,
      name: pokemon.name,
    };
  });

  typeCache.set(type, pokemons);

  return pokemons;
}

// ========================================
// DOUBLE TYPE
// ========================================

async function getPokemonsByTypes(selectedTypes) {
  const typeLists = await Promise.all(
    selectedTypes.map((type) => getPokemonsByType(type)),
  );

  if (typeLists.length === 1) {
    return typeLists[0];
  }

  const [firstType, secondType] = typeLists;

  return firstType.filter((pokemon) =>
    secondType.some((otherPokemon) => otherPokemon.id === pokemon.id),
  );
}

// ========================================
// DÉTAILS DU POKÉMON
// ========================================

async function getPokemonDetails(pokemon) {
  const id = pokemon.id;

  if (pokemonCache.has(id)) {
    return pokemonCache.get(id);
  }

  const [pokemonResponse, speciesResponse] = await Promise.all([
    fetch(`${API_URL}/pokemon/${id}`),

    fetch(`${API_URL}/pokemon-species/${id}`),
  ]);

  if (!pokemonResponse.ok || !speciesResponse.ok) {
    throw new Error(`Impossible de récupérer le Pokémon #${id}`);
  }

  const pokemonData = await pokemonResponse.json();

  const speciesData = await speciesResponse.json();

  const frenchName = speciesData.names.find(
    (name) => name.language.name === "fr",
  );

  const nameFr = frenchName?.name ?? pokemonData.name;

  const frenchDescription = speciesData.flavor_text_entries.find(
    (entry) => entry.language.name === "fr",
  );

  const description = frenchDescription
    ? frenchDescription.flavor_text.replace(/[\n\f\r]/g, " ")
    : "Aucune description disponible.";

  const pokemonDetails = {
    id,

    name: pokemonData.name,

    nameFr,

    description,

    image:
      pokemonData.sprites.other["official-artwork"].front_default ??
      pokemonData.sprites.front_default,

    types: pokemonData.types.map((type) => type.type.name),
  };

  // Cache complet
  pokemonCache.set(id, pokemonDetails);

  // On profite également du résultat
  // pour remplir le cache des noms
  nameCache.set(id, nameFr);

  return pokemonDetails;
}
