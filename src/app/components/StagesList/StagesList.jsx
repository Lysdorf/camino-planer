
import styles from "./StagesList.module.css";

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
          const isCompleted = completedStages.includes(stage.id);

          return (
            <div
              className={`${styles.stageCard} ${
                isCompleted ? styles.completed : ""
              }`}
              key={stage.id}
            >
              <div className={styles.stageHeader}>
                <p className={styles.stageDay}>Day {index + 1}</p>

                <div className={styles.stageTitle}>
                  <p className={styles.stageDistance}>
                    {stage.distance} km
                  </p>

                  <label>
                    <input
                      type="checkbox"
                      checked={isCompleted}
                      onChange={() => onToggleStage(stage.id)}
                    />
                  </label>
                </div>
              </div>

              <p>From: {stage.from}</p>
              <p>To: {stage.to}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
