import styles from "./DistanceSelector.module.css";

export default function DistanceSelector({
  targetDistance,
  onDistanceChange
}) {
  return (
    <div className={styles.selector}>
      <label htmlFor="targetDistance">
        Желаемая дистанция в день
      </label>

      <div className={styles.controls}>
        <input
          id="targetDistance"
          type="range"
          min="10"
          max="50"
          step="1"
          value={targetDistance}
          onChange={(event) => onDistanceChange(Number(event.target.value))}
        />

        <span>{targetDistance} км</span>
      </div>
    </div>
  );
}