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
}) {
  return (
    <div className="filters">

      <div className="filters__controls">
        <select
          className="filters__select"
          value={generation}
          onChange={(e) =>
            onGenerationChange(e.target.value)
          }
        >
          {generations.map((gen) => (
            <option
              key={gen.value}
              value={gen.value}
            >
              {gen.label}
            </option>
          ))}
        </select>


        <select
          className="filters__select"
          value=""
          onChange={(e) =>
            onTypeChange(e.target.value)
          }
          disabled={selectedTypes.length >= 2}
        >
          <option value="">
            Ajouter un type
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


      <div className="filters__active">
        {selectedTypes.map((type) => {
          const typeData = pokemonTypes.find(
            (item) => item.value === type
          );

          return (
            <div
              key={type}
              className="filters__tag"
            >
              <img
                src={typeIcons[type]}
                alt=""
                className="filters__tag-icon"
              />

              <span>
                {typeData?.label}
              </span>

              <button
                type="button"
                className="filters__tag-remove"
                onClick={() => onRemoveType(type)}
                aria-label={`Retirer le filtre ${typeData?.label}`}
              >
                ×
              </button>
            </div>
          );
        })}
      </div>

    </div>
  );
}