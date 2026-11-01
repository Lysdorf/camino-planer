import styles from './Header.module.css';

export default function Header({ title }) { 
    return (
        <header className={styles.header}>
            <div className={styles.headerContent}>
                <div className={styles.brand}>
                <div className={styles.logo}>
                    <span>♨</span>
                </div>

                <div className={styles.brandText}>
                    <h1>{title}</h1>
                    <p>Buen Camino • Маршрут и Бюджет</p>
                </div>
                </div>

                <div className={styles.headerActions}>
                <button className={styles.printButton}>
                    Печать / PDF
                </button>

                <button className={styles.exportButton}>
                    Экспорт плана
                </button>
                </div>
            </div>
        </header>
    );
}