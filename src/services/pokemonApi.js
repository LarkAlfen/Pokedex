
import { normalizeText } from "../utils/normalizeText";
import { getPokemonIdleIds } from "./pokemon3dApi";

const API_URL = "https://pokeapi.co/api/v2";

const pokemonCache = new Map();
const typeCache = new Map();
const nameCache = new Map();
const abilityCache = new Map();

let nameIndexCache = null;

// ========================================
// LISTE DES POKÉMON
// ========================================

export async function getPokemons(
  page = 1,
  limit = 24,
  min = 1,
  max,
  selectedTypes = [],
  search = "",
  only3D = false,
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

  // Recherche par nom
  pokemonList = await filterPokemonsByName(pokemonList, search);

  // Filtre : Pokémon disposant d'une animation 3D Idle
  if (only3D) {
    const pokemonIdleIds = getPokemonIdleIds();

    pokemonList = pokemonList.filter((pokemon) =>
      pokemonIdleIds.has(Number(pokemon.id))
    );
  }

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

// ========================================
// RECHERCHE PAR NOM
// ========================================

async function filterPokemonsByName(pokemonList, search) {
  if (!search.trim()) {
    return pokemonList;
  }

  const nameIndex = await getPokemonNameIndex();

  const normalizedSearch = normalizeText(search);

  const matchingIds = new Set(
    nameIndex
      .filter((pokemon) =>
        pokemon.normalizedName.includes(normalizedSearch)
      )
      .map((pokemon) => pokemon.id),
  );

  return pokemonList.filter((pokemon) =>
    matchingIds.has(pokemon.id)
  );
}

// ========================================
// INDEX DES NOMS FRANÇAIS
// ========================================

async function getPokemonNameIndex() {
  if (nameIndexCache) {
    return nameIndexCache;
  }

  const response = await fetch(
    `${API_URL}/pokemon-species?limit=2000`
  );

  if (!response.ok) {
    throw new Error(
      "Impossible de récupérer l'index des Pokémon"
    );
  }

  const data = await response.json();

  const species = await Promise.all(
    data.results.map(async (pokemon) => {
      const id = Number(
        pokemon.url.split("/").filter(Boolean).pop()
      );

      const response = await fetch(pokemon.url);

      if (!response.ok) {
        return null;
      }

      const speciesData = await response.json();

      const frenchName = speciesData.names.find(
        (name) => name.language.name === "fr"
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
  if (pokemonCache.has(id)) {
    return pokemonCache.get(id).nameFr;
  }

  if (nameCache.has(id)) {
    return nameCache.get(id);
  }

  const response = await fetch(
    `${API_URL}/pokemon-species/${id}`
  );

  if (!response.ok) {
    throw new Error(
      `Impossible de récupérer le nom du Pokémon #${id}`
    );
  }

  const data = await response.json();

  const frenchName = data.names.find(
    (name) => name.language.name === "fr"
  );

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
    throw new Error(
      `Impossible de récupérer le type ${type}`
    );
  }

  const data = await response.json();

  const pokemons = data.pokemon.map(({ pokemon }) => {
    const id = Number(
      pokemon.url.split("/").filter(Boolean).pop()
    );

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
    secondType.some(
      (otherPokemon) => otherPokemon.id === pokemon.id
    ),
  );
}

// ========================================
// TRADUCTION FRANÇAISE DES TALENTS
// ========================================

async function getAbilityFrenchName(ability) {
  const abilityId = Number(
    ability.url.split("/").filter(Boolean).pop()
  );

  // Cache existant
  if (abilityCache.has(abilityId)) {
    return abilityCache.get(abilityId);
  }

  // On mémorise la promesse pour éviter
  // plusieurs requêtes simultanées identiques
  const abilityPromise = (async () => {
    const response = await fetch(ability.url);

    if (!response.ok) {
      throw new Error(
        `Impossible de récupérer le talent ${ability.name}`
      );
    }

    const data = await response.json();

    const frenchName = data.names.find(
      (name) => name.language.name === "fr"
    );

    return frenchName?.name ?? ability.name;
  })();

  abilityCache.set(abilityId, abilityPromise);

  try {
    return await abilityPromise;
  } catch (error) {
    // Une requête échouée pourra être retentée
    abilityCache.delete(abilityId);

    console.error(
      "Erreur lors de la traduction du talent :",
      error
    );

    return ability.name;
  }
}

// ========================================
// DÉTAILS DU POKÉMON
// ========================================

async function getPokemonDetails(pokemon) {
  const id = pokemon.id;

  if (pokemonCache.has(id)) {
    return pokemonCache.get(id);
  }

  const [pokemonResponse, speciesResponse] =
    await Promise.all([
      fetch(`${API_URL}/pokemon/${id}`),
      fetch(`${API_URL}/pokemon-species/${id}`),
    ]);

  if (!pokemonResponse.ok || !speciesResponse.ok) {
    throw new Error(
      `Impossible de récupérer le Pokémon #${id}`
    );
  }

  const pokemonData = await pokemonResponse.json();
  const speciesData = await speciesResponse.json();

  // Nom français
  const frenchName = speciesData.names.find(
    (name) => name.language.name === "fr"
  );

  const nameFr = frenchName?.name ?? pokemonData.name;

  // Description française
  const descriptions = speciesData.flavor_text_entries;

  const frenchDescription = descriptions.find(
    (entry) => entry.language.name === "fr"
  );

  const englishDescription = descriptions.find(
    (entry) => entry.language.name === "en"
  );

  const description = (
    frenchDescription?.flavor_text ||
    englishDescription?.flavor_text ||
    "Aucune description disponible."
  )
    .replace(/[\n\f\r]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Talents traduits en français
  const abilities = await Promise.all(
    pokemonData.abilities.map(async ({ ability, is_hidden }) => {
      const frenchName = await getAbilityFrenchName(ability);

      return {
        name: frenchName,
        isHidden: is_hidden,
      };
    }),
  );

  // Objet complet
  const pokemonDetails = {
    id,

    name: pokemonData.name,

    nameFr,

    description,

    image:
      pokemonData.sprites.other["official-artwork"]
        .front_default ??
      pokemonData.sprites.front_default,

    types: pokemonData.types.map(
      (type) => type.type.name
    ),

    // Taille en mètres
    height: pokemonData.height / 10,

    // Poids en kilogrammes
    weight: pokemonData.weight / 10,

    // Talents en français
    abilities,

      pixelSprite:
    pokemonData.sprites.versions["generation-v"]
      ["black-white"].front_default ??
    pokemonData.sprites.front_default,

  animatedSprite:
    pokemonData.sprites.versions["generation-v"]
      ["black-white"].animated?.front_default ?? null,
  };

  // Cache complet
  pokemonCache.set(id, pokemonDetails);

  // Cache des noms
  nameCache.set(id, nameFr);

  return pokemonDetails;
}
