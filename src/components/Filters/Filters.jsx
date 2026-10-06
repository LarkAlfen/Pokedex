import "./Filters.scss";
import { generations } from "../../data/generations";

export function Filters({ generation, onGenerationChange }) {
  return (
    <div className="filters">
      <select
        className="filters__select"
        value={generation}
        onChange={(e) => onGenerationChange(e.target.value)}
      >
        {generations.map((generation) => (
          <option
            key={generation.value}
            value={generation.value}
          >
            {generation.label}
          </option>
        ))}
      </select>
    </div>
  );
}