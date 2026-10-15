
const API_URL = "https://pokemon-3d-api.onrender.com/v1/pokemon";

let pokemon3DCache = null;
let pokemon3DPromise = null;

export async function getPokemon3DData() {
  if (pokemon3DCache) {
    return pokemon3DCache;
  }

  if (!pokemon3DPromise) {
    pokemon3DPromise = fetch(API_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Impossible de récupérer les modèles 3D");
        }

        return response.json();
      })
      .then((data) => {
        pokemon3DCache = data.pokemon || data;
        return pokemon3DCache;
      })
      .catch((error) => {
        pokemon3DPromise = null;
        throw error;
      });
  }

  
  return pokemon3DPromise;
}

import pokemonIdleIds from "../data/pokemonIdleIds.json";

const idleIdsSet = new Set(pokemonIdleIds.map(Number));

export function getPokemonIdleIds() {
  return idleIdsSet;
}

export async function getPokemon3DModel(id, form = "regular") {
  const pokemons = await getPokemon3DData();

  const pokemon = pokemons.find(
    (item) => item.id === Number(id)
  );

  if (!pokemon) {
    return null;
  }

  const selectedForm = pokemon.forms.find(
    (item) => item.formName === form
  );

  return selectedForm?.model ?? null;
}


export async function getPokemon3DIds() {
  const pokemons = await getPokemon3DData();

  return new Set(
    pokemons
      .filter((pokemon) =>
        pokemon.forms?.some(
          (form) => form.formName === "regular" && form.model
        )
      )
      .map((pokemon) => Number(pokemon.id))
  );
}