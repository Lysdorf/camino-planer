
import styles from "./BudgetCalculator.module.css";

export default function BudgetCalculator({
  days,
  settings,
  budget,
  onSettingsChange,
  onReset
}) {
  const fields = [
    {
      key: "accommodation",
      label: "Проживание",
      description: "Стоимость одной ночи",
      suffix: "€/ночь"
    },
    {
      key: "food",
      label: "Питание",
      description: "Ежедневный бюджет на еду",
      suffix: "€/день"
    },
    {
      key: "extras",
      label: "Дополнительные расходы",
      description: "Кофе, стирка, мелкие покупки",
      suffix: "€/день"
    },
    {
      key: "reservePercent",
      label: "Резерв",
      description: "Процент от основных расходов",
      suffix: "%"
    }
  ];

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <h2>Бюджет путешествия</h2>
        <p>{days} дней · {budget.nights} ночей</p>
      </div>

        <label className={styles.field}>
            <span className={styles.fieldInfo}>
                <strong>Количество ночей</strong>
                <small>Сколько ночей планируешь провести в пути</small>
            </span>

            <span className={styles.inputWrapper}>
                <input
                type="number"
                min="0"
                step="1"
                value={settings.nights ?? budget.nights}
                onChange={(event) =>
                    onSettingsChange(
                    "nights",
                    Math.max(0, Math.floor(Number(event.target.value)))
                    )
                }
                />
                <span>ночей</span>
            </span>
        </label>

      <div className={styles.fields}>
        {fields.map((field) => (
          <label key={field.key} className={styles.field}>
            <span className={styles.fieldInfo}>
              <strong>{field.label}</strong>
              <small>{field.description}</small>
            </span>

            <span className={styles.inputWrapper}>
              <input
                type="number"
                min="0"
                step="1"
                value={settings[field.key]}
                onChange={(event) =>
                  onSettingsChange(
                    field.key,
                    Math.max(0, Number(event.target.value))
                  )
                }
              />
              <span>{field.suffix}</span>
            </span>
          </label>
        ))}
      </div>

      <div className={styles.summary}>
        <h3>Расчёт бюджета</h3>

        <div className={styles.summaryRow}>
          <span>Проживание</span>
          <strong>{budget.accommodation.toFixed(2)} €</strong>
        </div>

        <div className={styles.summaryRow}>
          <span>Питание</span>
          <strong>{budget.food.toFixed(2)} €</strong>
        </div>

        <div className={styles.summaryRow}>
          <span>Дополнительные расходы</span>
          <strong>{budget.extras.toFixed(2)} €</strong>
        </div>

        <div className={styles.summaryRow}>
          <span>Резерв</span>
          <strong>{budget.reserve.toFixed(2)} €</strong>
        </div>

        <div className={styles.total}>
          <span>Общий бюджет</span>
          <strong>{budget.total.toFixed(2)} €</strong>
        </div>

        <div className={styles.additional}>
          <span>В среднем за день</span>
          <strong>{budget.perDay.toFixed(2)} €</strong>

          <span>На километр</span>
          <strong>{budget.perKm.toFixed(2)} €</strong>
        </div>
      </div>

        <button type="button" onClick={onReset}>
            Сбросить настройки
        </button>

      <p className={styles.note}>
        Расчёт предварительный. Транспорт и снаряжение не включены.
      </p>
    </section>
  );
}
