import styles from "./Tabs.module.css";

export default function Tabs({
  tabs,
  activeTab,
  onTabChange,
  selectedRoute,
  totalDays
}) {
  return (
    <div className={styles.tabsSticky}>
      <nav className={styles.tabs}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tab} ${
              activeTab === tab.id ? styles.activeTab : ""
            }`}
            onClick={() => onTabChange(tab.id)}
          >
            <span className={styles.tabIcon}>{tab.icon}</span>
            <span>{tab.number}. {tab.label}</span>

            {tab.id === "stages" && selectedRoute && (
              <span className={styles.tabCount}>
                ({totalDays})
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}