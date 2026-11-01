"use client";

import { useState } from "react";
import { routes, tabs } from "./data/data";
import styles from "./page.module.css";
import Header from "./components/Header/Header";
import RouteOverview from "./components/RouteOverview/RouteOverview";
import Tabs from "./components/Tabs/Tabs";
import StagesList from "./components/StagesList/StagesList";
import RoutesList from "./components/RoutesList/RoutesList";

export default function Home() {
  const [selectedRoute, setSelectedRoute] = useState(routes[0].routeName);
  const [completedStages, setCompletedStages] = useState([]);
  const [activeTab, setActiveTab] = useState("routes");

  function handleSelectRoute(routeName) { 
    setSelectedRoute(routeName);
  }

  function handleToggleStage(stageId) {
    setCompletedStages(currentStages =>
      currentStages.includes(stageId)
        ? currentStages.filter(stage => stage !== stageId)
        : [...currentStages, stageId]
    );
  }

  const selectedRouteData = routes.find(route => route.routeName === selectedRoute);
  const selectedStages = selectedRouteData?.stages ?? [];
  const averageDistance = selectedRouteData && selectedRouteData.days > 0
    ? selectedRouteData.distance / selectedRouteData.days
    : 0;
  const roundedAverageDistance = Math.round(averageDistance * 10) / 10;
  const completedStagesCount = selectedStages.filter(stage =>
    completedStages.includes(stage.id)
  ).length;
  const completedDistance = selectedStages.reduce((accumulator, stage) => {
    return completedStages.includes(stage.id)
      ? accumulator + stage.distance 
      : accumulator
  }, 0);
  const progressPercentage = selectedRouteData?.distance > 0
    ? Math.round(completedDistance / selectedRouteData.distance * 1000) / 10
    : 0;

  return (
    <>
      <Header title="Camino Planner" />
      
      <main className={styles.page}>
        {selectedRouteData ?
          (
            <RouteOverview route={selectedRouteData} averageDistance={roundedAverageDistance} />
          )
          : (
            <p>Choose your route</p>
          )
        }

        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          selectedRoute={selectedRouteData}
        />
        <div className={styles.tabContent}>
          {activeTab === "routes" && (
            <RoutesList
              routes={routes}
              selectedRoute={selectedRoute}
              onSelectRoute={handleSelectRoute}
            />
          )}

          {activeTab === "stages" && (
            selectedRouteData ? (
              <StagesList
                stages={selectedStages}
                progressPercentage={progressPercentage}
                completedDistance={completedDistance}
                totalDistance={selectedRouteData.distance}
                completedStagesCount={completedStagesCount}
                totalDays={selectedRouteData.days}
                completedStages={completedStages}
                onToggleStage={handleToggleStage}
              />
            ) : (
              <p>Выбери маршрут, чтобы увидеть этапы</p>
            )
          )}
        </div>
        
      </main>
    </>
  );
}