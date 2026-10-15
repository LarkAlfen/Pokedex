
import { useEffect, useRef } from "react";
import "@google/model-viewer";
import "./PokemonModel.scss";

export function PokemonModel({ url, onIdleCheck }) {
  const modelRef = useRef(null);

  useEffect(() => {
    const viewer = modelRef.current;
    if (!viewer) return;

    // const handleLoad = () => {
    //   const animations = viewer.availableAnimations || [];

    //   const idleAnimation = animations.find((name) =>
    //     /idle|wait|breath|stand/i.test(name)
    //   );

    //   if (idleAnimation) {
    //     viewer.animationName = idleAnimation;
    //     viewer.play();
    //   }
    // };


    const handleLoad = () => {
      const animations = viewer.availableAnimations || [];

      const idleAnimation = animations.find((name) =>
        /idle|wait|breath|stand/i.test(name)
      );

      console.log("Idle détectée :", idleAnimation);

      onIdleCheck?.(Boolean(idleAnimation));

      if (idleAnimation) {
        viewer.animationName = idleAnimation;
        viewer.play();
      }
    };



    viewer.addEventListener("load", handleLoad);

    return () => {
      viewer.removeEventListener("load", handleLoad);
    };
  }, [url]);

  return (
    <div className="pokemon-model">
      <model-viewer
        ref={modelRef}
        src={url}
        alt="Modèle 3D du Pokémon"
        camera-controls
        camera-orbit="0deg 75deg 120%"
        camera-target="auto auto auto"
        interaction-prompt="none"
        shadow-intensity="0.5"
        style={{
          width: "100%",
          height: "100%",
          background: "transparent",
        }}
      />
    </div>
  );
}
