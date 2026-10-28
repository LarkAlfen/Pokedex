
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { pokemonTypes } from "../../data/pokemonTypes";
import { PokemonModel } from "../PokemonModel/PokemonModel";
import { getPokemon3DModel } from "../../services/pokemon3dApi";

import "./PokemonModal.scss";

export function PokemonModal({ pokemon, onClose, onPrevious, onNext }) {
    const [show3D, setShow3D] = useState(false);
    const [modelUrl, setModelUrl] = useState(null);
    const [loading3D, setLoading3D] = useState(false);
    const [hasIdleAnimation, setHasIdleAnimation] = useState(false);
    const audioRef = useRef(null);
    const touchStartRef = useRef(null);

    const handleTouchStart = (event) => {
        if (event.touches.length !== 1) return;
        touchStartRef.current = {
            x: event.touches[0].clientX,
            y: event.touches[0].clientY,
        };
    };

    const handleTouchEnd = (event) => {
        const start = touchStartRef.current;
        touchStartRef.current = null;
        if (!start || event.changedTouches.length !== 1) return;

        const dx = event.changedTouches[0].clientX - start.x;
        const dy = event.changedTouches[0].clientY - start.y;

        // Ignore les petits mouvements et le défilement vertical.
        if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) return;

        if (dx < 0) onNext?.();
        else onPrevious?.();
    };

    const playCry = () => {
        if (!pokemon?.cries?.latest) return;

        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }

        const audio = new Audio(pokemon.cries.latest);
        audioRef.current = audio;
        audio.play().catch(console.error);
    };

    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, [pokemon?.id]);


    // Chargement du modèle 3D
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

    // Fermeture avec Escape et blocage du scroll
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

    if (!pokemon) return null;

    return createPortal(
        <div
            className="pokemon-modal__overlay"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
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
                    type="button"
                    className="pokemon-modal__nav pokemon-modal__nav--previous"
                    onClick={onPrevious}
                    disabled={!onPrevious}
                    aria-label="Pokémon précédent"
                >
                    ‹
                </button>
                <button
                    type="button"
                    className="pokemon-modal__close"
                    onClick={onClose}
                    aria-label="Fermer"
                >
                    ×
                </button>

                <div className="pokemon-modal__content">
                    <div className="pokemon-modal__infos">
                        <div className="pokemon-modal__field pokemon-modal__field--identity">
                            <span className="pokemon-modal__number">
                                #{String(pokemon.id).padStart(4, "0")}
                            </span>

                            <h2
                                className="pokemon-modal__name"
                                id="pokemon-modal-title"
                            >
                                {pokemon.nameFr}
                            </h2>

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


                        <div className="pokemon-modal__field pokemon-modal__field--description">
                            <div className="pokemon-modal__description-heading">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                >
                                    <rect x="4" y="3" width="16" height="18" rx="2" />
                                    <path d="M8 8h8M8 12h8M8 16h5" />
                                </svg>

                                <span className="pokemon-modal__label">
                                    Description
                                </span>
                            </div>

                            <p className="pokemon-modal__description">
                                {pokemon.description}
                            </p>
                        </div>

                        <div className="pokemon-modal__stats">
                            <div className="pokemon-modal__stat">
                                <div className="pokemon-modal__stat-heading">
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        aria-hidden="true"
                                    >
                                        <path d="M8 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3" />
                                        <path d="M16 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3" />
                                        <path d="M12 3v18M9 6l3-3 3 3M9 18l3 3 3-3" />
                                    </svg>
                                    <span>Taille</span>
                                </div>

                                <strong>
                                    {pokemon.height != null
                                        ? `${pokemon.height.toLocaleString("fr-FR")} m`
                                        : "—"}
                                </strong>
                            </div>

                            <div className="pokemon-modal__stat">
                                <div className="pokemon-modal__stat-heading">
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        aria-hidden="true"
                                    >
                                        <path d="M12 3v4" />
                                        <path d="M8 7h8" />
                                        <path d="M7 7h10l3 13H4L7 7Z" />
                                        <path d="M9 13a3 3 0 0 1 6 0" />
                                    </svg>
                                    <span>Poids</span>
                                </div>

                                <strong>
                                    {pokemon.weight != null
                                        ? `${pokemon.weight.toLocaleString("fr-FR")} kg`
                                        : "—"}
                                </strong>
                            </div>

                            <div className="pokemon-modal__stat">
                                <div className="pokemon-modal__stat-heading">
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        aria-hidden="true"
                                    >
                                        <path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z" />
                                    </svg>
                                    <span>Talent</span>
                                </div>

                                <strong>
                                    {pokemon.abilities?.find(
                                        (ability) => !ability.isHidden
                                    )?.name ?? "—"}
                                </strong>
                            </div>
                        </div>

                    </div>

                    {/* VISUEL */}
                    <div className="pokemon-modal__visual">
                        <div className="pokemon-modal__viewer">
                            {!show3D && (
                                <button
                                    type="button"
                                    className="pokemon-modal__sprite-button"
                                    onClick={playCry}
                                    disabled={!pokemon.cries?.latest}
                                    aria-label={`Écouter le cri de ${pokemon.nameFr}`}
                                >
                                    <img
                                        src={pokemon.animatedSprite ?? pokemon.pixelSprite ?? pokemon.image}
                                        alt=""
                                        className={
                                            pokemon.animatedSprite || pokemon.pixelSprite
                                                ? "pokemon-modal__sprite"
                                                : ""
                                        }
                                    />
                                </button>
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
                <button
                    type="button"
                    className="pokemon-modal__nav pokemon-modal__nav--next"
                    onClick={onNext}
                    disabled={!onNext}
                    aria-label="Pokémon suivant"
                >
                    ›
                </button>
            </div>
        </div>,
        document.body
    );
}
