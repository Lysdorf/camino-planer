import styles from "./RouteOverview.module.css";

export default function RouteOverview({ route, averageDistance, totalDays, totalBudget }) { 
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
                    <strong>{totalDays} дней</strong>
                </div>

                <div className={styles.overviewItem}>
                    <span>Средняя дистанция</span>
                    <strong>{averageDistance} км/день</strong>
                </div>

                <div className={styles.overviewItem}>
                    <span>Общий бюджет</span>
                    <strong className={styles.overviewBudget}>
                        {Math.round(totalBudget).toLocaleString("de-DE")} €
                    </strong>
                </div>
            </div>
        </div>
    );
}