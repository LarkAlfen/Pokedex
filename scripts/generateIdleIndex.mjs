
import { mkdir, writeFile } from "node:fs/promises";

const API_URL = "https://pokemon-3d-api.onrender.com/v1/pokemon";

const IDLE_REGEX = /idle|wait|breath|stand/i;

async function getAnimations(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const buffer = await response.arrayBuffer();
  const view = new DataView(buffer);

  if (view.getUint32(0, true) !== 0x46546c67) {
    throw new Error("Fichier GLB invalide");
  }

  const jsonLength = view.getUint32(12, true);
  const jsonType = view.getUint32(16, true);

  if (jsonType !== 0x4e4f534a) {
    throw new Error("Bloc JSON introuvable");
  }

  const jsonBytes = new Uint8Array(buffer, 20, jsonLength);

  const json = JSON.parse(
    new TextDecoder().decode(jsonBytes)
  );

  return (json.animations || []).map(
    (animation) => animation.name || ""
  );
}

async function hasIdleAnimation(url) {
  const animations = await getAnimations(url);

  return animations.some((name) =>
    IDLE_REGEX.test(name)
  );
}

async function generateIdleIndex() {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Impossible de récupérer la liste des Pokémon");
  }

  const data = await response.json();
  const pokemons = data.pokemon || data;

  const idleIds = [];
  const errors = [];

  for (const pokemon of pokemons) {
    const regularForm = pokemon.forms?.find(
      (form) => form.formName === "regular"
    );

    if (!regularForm?.model) continue;

    try {
      const hasIdle = await hasIdleAnimation(regularForm.model);

      if (hasIdle) {
        idleIds.push(Number(pokemon.id));
      }

      console.log(
        `#${pokemon.id} : ${hasIdle ? "Idle trouvée" : "Pas d'Idle"}`
      );
    } catch (error) {
      errors.push({
        id: pokemon.id,
        message: error.message,
      });

      console.warn(
        `#${pokemon.id} : erreur d'analyse - ${error.message}`
      );
    }
  }

  await mkdir("src/data", { recursive: true });

  await writeFile(
    "src/data/pokemonIdleIds.json",
    JSON.stringify(idleIds, null, 2)
  );

  console.log(`Pokémon avec Idle : ${idleIds.length}`);
  console.log(`Erreurs d'analyse : ${errors.length}`);

  if (errors.length) {
    await writeFile(
      "src/data/pokemonIdleErrors.json",
      JSON.stringify(errors, null, 2)
    );
  }
}

generateIdleIndex().catch(console.error);
