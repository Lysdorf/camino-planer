import styles from './RoutesList.module.css';
import RouteCard from '../RouteCard/RouteCard';

export default function RoutesList({ routes, selectedRoute, onSelectRoute }) { 
    return (
        <div className={styles.routesGrid}>
            {routes.map((route) => (
                <RouteCard
                    key={route.routeName}
                    routeName={route.routeName}
                    distance={route.distance}
                    difficulty={route.difficulty}
                    days={route.days}
                    image={route.image}
                    isSelected={selectedRoute === route.routeName}
                    onSelect={() => onSelectRoute(route.routeName)}
                />
            ))}
        </div>
    );
}