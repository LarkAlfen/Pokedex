
const url =
  "https://raw.githubusercontent.com/Pokemon-3D-api/assets/main/models/opt/regular/1.glb";

async function getAnimations(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const buffer = await response.arrayBuffer();
  const view = new DataView(buffer);

  // Vérification de la signature GLB
  if (view.getUint32(0, true) !== 0x46546c67) {
    throw new Error("Fichier GLB invalide");
  }

  // Le premier bloc du GLB contient le JSON
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

async function test() {
  try {
    const animations = await getAnimations(url);

    console.log("Animations de Bulbizarre :", animations);

    const hasIdle = animations.some((name) =>
      /idle|wait|breath|stand/i.test(name)
    );

    console.log("Idle détectée :", hasIdle);
  } catch (error) {
    console.error("Erreur :", error);
  }
}

test();
