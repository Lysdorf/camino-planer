import styles from "./RouteOverview.module.css";

export default function RouteOverview({ route, averageDistance }) { 
    return (
        <div className={styles.selectedRouteInfo}>
            <div className={styles.routeDescription}>
                <span className={styles.routeBadge}>
                    ✦ Персональный маршрут
                </span>

                <h2>{route.routeName}</h2>

                <p>
                    {route.description} · {route.start} → Сантьяго
                </p>
            </div>

            <div className={styles.routeOverview}>
                <div className={styles.overviewItem}>
                    <span>Дистанция</span>
                    <strong>{route.distance} км</strong>
                </div>

                <div className={styles.overviewItem}>
                    <span>В пути</span>
                    <strong>{route.days} дней</strong>
                </div>

                <div className={styles.overviewItem}>
                    <span>Средняя дистанция</span>
                    <strong>{averageDistance} км/день</strong>
                </div>

                <div className={styles.overviewItem}>
                    <span>Общий бюджет</span>
                    <strong className={styles.overviewBudget}>1 345 €</strong>
                </div>
            </div>
        </div>
    );
}