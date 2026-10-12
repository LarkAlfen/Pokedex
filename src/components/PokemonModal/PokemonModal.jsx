
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { typeIcons } from "../../data/typeIcons";
import "./PokemonModal.scss";
import { pokemonTypes } from "../../data/pokemonTypes";

export function PokemonModal({ pokemon, onClose }) {
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
                        <span className="pokemon-modal__visual-number">
                            #{String(pokemon.id).padStart(3, "0")}
                        </span>

                        <img
                            src={pokemon.image}
                            alt={pokemon.nameFr}
                        />
                    </div>
                </div>

            </div>
        </div>,
        document.body
    );
}
