import styles from "./RouteCard.module.css";

export default function RouteCard({
    routeName,
    distance,
    difficulty,
    days,
    image,
    isSelected,
    onSelect
    }) {
        return (
            <div
            className={`${styles.routeCard} ${isSelected ? styles.selected : ""}`}
            onClick={onSelect}
            >
            <div
                className={styles.routeImage}
                style={{ backgroundImage: `url(${image})` }}
            >
                <span>Camino de Santiago</span>
            </div>

            <div className={styles.routeCardContent}>
                <h2>{routeName}</h2>

                <p>{distance} km</p>

                <div className={styles.routeDetails}>
                <span>{days} дней</span>
                <span>{difficulty}</span>
                </div>

                <div className={styles.routeSelect}>
                {isSelected ? "Выбран ✓" : "Выбрать маршрут"}
                </div>
            </div>
            </div>
        );
}