import styles from "./StagesList.module.css";

function getLoadLevel(distance, elevationGain) {
  // Условная нагрузка: 100 метров набора ≈ 1 км дополнительной нагрузки
  const loadScore = distance + elevationGain / 100;

  if (loadScore <= 22) {
    return { label: "Лёгкая", className: styles.loadEasy };
  }

  if (loadScore <= 30) {
    return { label: "Умеренная", className: styles.loadModerate };
  }

  return { label: "Высокая", className: styles.loadHard };
}

export default function StagesList({
  stages,
  progressPercentage,
  completedDistance,
  totalDistance,
  completedStagesCount,
  totalDays,
  completedStages,
  onToggleStage
}) {
  return (
    <div className={styles.stages}>
      <div className={styles.stagesProgress}>
        <div className={styles.progressHeader}>
          <p>Прогресс маршрута</p>
          <p>{progressPercentage}%</p>
        </div>

        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        <p>
          {completedDistance} из {totalDistance} км пройдено
        </p>

        <p>
          Завершено этапов: {completedStagesCount} из {totalDays}
        </p>
      </div>

      <div className={styles.stagesList}>
        {stages.map((stage, index) => {
          const isCompleted = stage.segmentIds.every(id =>
            completedStages.includes(id)
          );

          const elevationGain = Math.round(
            stage.elevationGainMeters ?? 0
          );

          const elevationLoss = Math.round(
            stage.elevationLossMeters ?? 0
          );

          const load = getLoadLevel(stage.distance, elevationGain);

          return (
            <button
              type="button"
              className={`${styles.stageCard} ${
                isCompleted ? styles.completed : ""
              }`}
              key={stage.id}
              onClick={() => onToggleStage(stage.segmentIds)}
              aria-pressed={isCompleted}
            >
              <div className={styles.stageHeader}>
                <p className={styles.stageDay}>Day {index + 1}</p>

                <div className={styles.stageTitle}>
                  <p className={styles.stageDistance}>
                    {stage.distance} km
                  </p>

                  <span
                    className={`${styles.checkbox} ${
                      isCompleted ? styles.checked : ""
                    }`}
                    aria-hidden="true"
                  >
                    {isCompleted && "✓"}
                  </span>
                </div>
              </div>

              <div className={styles.stageLocations}>
                <p>From: {stage.from}</p>
                <p>To: {stage.to}</p>
              </div>

              <div className={styles.stageDetails}>
                <div className={styles.elevationItem}>
                  <span className={styles.detailIcon}>↗</span>
                  <span>Набор</span>
                  <strong>{elevationGain} м</strong>
                </div>

                <div className={styles.elevationItem}>
                  <span className={styles.detailIcon}>↘</span>
                  <span>Сброс</span>
                  <strong>{elevationLoss} м</strong>
                </div>

                <div className={styles.loadItem}>
                  <span>Нагрузка</span>
                  <span className={load.className}>
                    {load.label}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}