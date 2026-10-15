
import { generations } from "../../data/generations";
import { pokemonTypes } from "../../data/pokemonTypes";
import { typeIcons } from "../../data/typeIcons";

import "./Filters.scss";

export function Filters({
  generation,
  onGenerationChange,
  selectedTypes,
  onTypeChange,
  onRemoveType,
  search,
  onSearchChange,
  only3D,
  onOnly3DChange,
}) {
  const hasActiveFilters =
    search.trim() !== "" ||
    selectedTypes.length > 0 ||
    only3D;

  const resetFilters = () => {
    onSearchChange("");
    selectedTypes.forEach((type) => onRemoveType(type));
    onOnly3DChange(false);
    onGenerationChange("all");
  };

  return (
    <section className="filters">
      <div className="filters__header">
        <div className="filters__heading">
          <span className="filters__heading-icon">☷</span>
          <h2>Filtres Pokémon</h2>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            className="filters__reset"
            onClick={resetFilters}
          >
            Réinitialiser
          </button>
        )}
      </div>

      <div className="filters__search-wrapper">
        <svg
          className="filters__search-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m16 16 5 5" />
        </svg>

        <input
          type="search"
          className="filters__search"
          placeholder="Rechercher un Pokémon..."
          aria-label="Rechercher un Pokémon"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="filters__controls">
        <div className="filters__field">
          <label htmlFor="generation-filter">
            Génération
          </label>

          <select
            id="generation-filter"
            className="filters__select"
            value={generation}
            onChange={(e) =>
              onGenerationChange(e.target.value)
            }
          >
            {generations.map((gen) => (
              <option key={gen.value} value={gen.value}>
                {gen.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filters__field">
          <label htmlFor="type-filter">
            Type
          </label>

          <select
            id="type-filter"
            className="filters__select"
            value=""
            onChange={(e) => onTypeChange(e.target.value)}
            disabled={selectedTypes.length >= 2}
          >
            <option value="">
              {selectedTypes.length >= 2
                ? "2 types sélectionnés"
                : "Ajouter un type"}
            </option>

            {pokemonTypes
              .filter(
                (type) =>
                  !selectedTypes.includes(type.value)
              )
              .map((type) => (
                <option
                  key={type.value}
                  value={type.value}
                >
                  {type.label}
                </option>
              ))}
          </select>
        </div>

        <label className="filters__3d">
          <div className="filters__3d-content">
            <span className="filters__3d-title">
              Avec animation 3D
            </span>
          </div>

          <input
            type="checkbox"
            checked={only3D}
            onChange={(e) =>
              onOnly3DChange(e.target.checked)
            }
          />

          <span className="filters__switch" aria-hidden="true" />
        </label>
      </div>

      {selectedTypes.length > 0 && (
        <div className="filters__active">
          <span className="filters__active-label">
            Types sélectionnés
          </span>

          <div className="filters__tags">
            {selectedTypes.map((type) => {
              const typeData = pokemonTypes.find(
                (item) => item.value === type
              );

              return (
                <div key={type} className="filters__tag">
                  <img
                    src={typeIcons[type]}
                    alt=""
                    className="filters__tag-icon"
                  />

                  <span>{typeData?.label}</span>

                  <button
                    type="button"
                    className="filters__tag-remove"
                    onClick={() => onRemoveType(type)}
                    aria-label={`Retirer ${typeData?.label}`}
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
