
import { useEffect, useRef, useState } from "react";
import "@google/model-viewer";
import "./PokemonModel.scss";

export function PokemonModel({ url, onIdleCheck }) {
  const modelRef = useRef(null);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const viewer = modelRef.current;
    if (!viewer) return;

    const handleLoad = () => {
      const animations = viewer.availableAnimations || [];

      const idleAnimation = animations.find((name) =>
        /idle|wait|breath|stand/i.test(name)
      );

      onIdleCheck?.(Boolean(idleAnimation));

      if (idleAnimation) {
        viewer.animationName = idleAnimation;
        viewer.play();
      }
    };

    const handleError = () => {
      onIdleCheck?.(false);
    };

    viewer.addEventListener("load", handleLoad);
    viewer.addEventListener("error", handleError);

    if (viewer.loaded) {
      handleLoad();
    }

    return () => {
      viewer.removeEventListener("load", handleLoad);
      viewer.removeEventListener("error", handleError);
    };
  }, [url, onIdleCheck]);

  const rotateModel = (direction) => {
    setRotation((previous) => previous + direction * 45);
  };

  const handleWheel = (event) => {
    const viewer = modelRef.current;
    if (!viewer) return;

    const orbit = viewer.getCameraOrbit();

    const zoomFactor = event.deltaY > 0 ? 1.1 : 0.9;

    const newRadius = Math.max(
      0.5,
      Math.min(orbit.radius * zoomFactor, 20)
    );

    viewer.cameraOrbit =
      `${orbit.theta}rad ${orbit.phi}rad ${newRadius}m`;
  };

  return (
    <div className="pokemon-model" onWheel={handleWheel}>
      <model-viewer
        ref={modelRef}
        src={url}
        alt="Modèle 3D du Pokémon"
        camera-controls
        disable-pan
        disable-tap
        camera-orbit={`${rotation}deg 75deg 120%`}
        camera-target="auto auto auto"
        interaction-prompt="none"
        shadow-intensity="0.5"
        interpolation-decay="100"
      />

      <div className="pokemon-model__controls">
        <button
          type="button"
          className="pokemon-model__rotate"
          aria-label="Tourner à droite"
          onClick={() => rotateModel(1)}
        >
          <span aria-hidden="true">↻</span>
        </button>
        <button
          type="button"
          className="pokemon-model__rotate"
          aria-label="Tourner à gauche"
          onClick={() => rotateModel(-1)}
        >
          <span aria-hidden="true">↺</span>
        </button>


      </div>
    </div>
  );
}
