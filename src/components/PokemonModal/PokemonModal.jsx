
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import "./PokemonModal.scss";
import { pokemonTypes } from "../../data/pokemonTypes";
import { PokemonModel } from "../PokemonModel/PokemonModel";
import { getPokemon3DModel } from "../../services/pokemon3dApi";

export function PokemonModal({ pokemon, onClose }) {
    const [show3D, setShow3D] = useState(false);
    const [modelUrl, setModelUrl] = useState(null);
    const [loading3D, setLoading3D] = useState(false);
    const [hasIdleAnimation, setHasIdleAnimation] = useState(false);

    useEffect(() => {
        if (!pokemon) return;

        let cancelled = false;

        setShow3D(false);
        setModelUrl(null);
        setLoading3D(true);
        setHasIdleAnimation(false);
        async function loadModel() {
            try {
                const url = await getPokemon3DModel(pokemon.id);

                if (!cancelled) {
                    setModelUrl(url);
                }
            } catch (error) {
                console.error("Erreur modèle 3D :", error);
            } finally {
                if (!cancelled) {
                    setLoading3D(false);
                }
            }
        }

        loadModel();

        return () => {
            cancelled = true;
        };
    }, [pokemon?.id]);



    useEffect(() => {
        if (!pokemon) return;

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [pokemon, onClose]);

    const canShow3D = Boolean(modelUrl && hasIdleAnimation);


    console.log({
        pokemon: pokemon?.nameFr,
        modelUrl,
        hasIdleAnimation,
        canShow3D,
    });
    if (!pokemon) return null;



    return createPortal(
        <div
            className="pokemon-modal__overlay"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >
            <div
                className="pokemon-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="pokemon-modal-title"
            >
                <button
                    className="pokemon-modal__close"
                    onClick={onClose}
                    aria-label="Fermer"
                >
                    ×
                </button>


                <div className="pokemon-modal__content">
                    <div className="pokemon-modal__infos">

                        <div className="pokemon-modal__field">
                            <span className="pokemon-modal__label">Nom</span>
                            <h2 className="pokemon-modal__name" id="pokemon-modal-title">
                                {pokemon.nameFr}
                            </h2>
                        </div>

                        <div className="pokemon-modal__field">
                            <span className="pokemon-modal__label">Type</span>

                            <div className="pokemon-modal__types">
                                {pokemon.types.map((type) => {
                                    const pokemonType = pokemonTypes.find(
                                        (item) => item.value === type
                                    );

                                    return (
                                        <span
                                            key={type}
                                            className={`pokemon-modal__type pokemon-modal__type--${type}`}
                                        >
                                            {pokemonType?.label ?? type}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="pokemon-modal__field">
                            <span className="pokemon-modal__label">Description</span>
                            <p className="pokemon-modal__description">
                                {pokemon.description}
                            </p>
                        </div>

                    </div>



                    <div className="pokemon-modal__visual">
                        <div className="pokemon-modal__viewer">
                            {!show3D && (
                                <img
                                    src={pokemon.image}
                                    alt={pokemon.nameFr}
                                />
                            )}

                            {modelUrl && (
                                <div
                                    className="pokemon-modal__model-container"
                                    style={{
                                        visibility: show3D ? "visible" : "hidden",
                                        position: show3D ? "relative" : "absolute",
                                        width: "100%",
                                        height: "100%",
                                        pointerEvents: show3D ? "auto" : "none",
                                    }}
                                >
                                    <PokemonModel
                                        key={modelUrl}
                                        url={modelUrl}
                                        onIdleCheck={setHasIdleAnimation}
                                    />
                                </div>
                            )}
                        </div>

                        {canShow3D && (
                            <button
                                type="button"
                                className="pokemon-modal__toggle"
                                onClick={() => setShow3D((prev) => !prev)}
                            >
                                {show3D ? "Voir en 2D" : "Voir en 3D"}
                            </button>
                        )}
                    </div>


                </div>

            </div>
        </div>,
        document.body
    );
}
