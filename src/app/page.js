"use client";

import { useState, useSyncExternalStore } from "react";
import { routes } from "./data/routes";
import { tabs } from "./data/tabs";

import {
  getProgressSnapshot,
  getServerSnapshot,
  subscribe,
  saveCompletedStages,
  saveSelectedRoute,
  getSelectedRouteSnapshot,
  subscribeSelectedRoute
} from "./lib/caminoStore";
import { generateStages, splitSegment } from "./lib/routePlanner";

import styles from "./page.module.css";
import Header from "./components/Header/Header";
import RouteOverview from "./components/RouteOverview/RouteOverview";
import Tabs from "./components/Tabs/Tabs";
import StagesList from "./components/StagesList/StagesList";
import RoutesList from "./components/RoutesList/RoutesList";
import DistanceSelector from "./components/DistanceSelector/DistanceSelector";

export default function Home() {
  const [activeTab, setActiveTab] = useState("routes");
  const [targetDistance, setTargetDistance] = useState(25);
  const savedStages = useSyncExternalStore(
    subscribe,
    getProgressSnapshot,
    getServerSnapshot
  );
  const savedRoute = useSyncExternalStore(
    subscribeSelectedRoute,
    getSelectedRouteSnapshot,
    getServerSnapshot
  );
  const selectedRoute = savedRoute || routes[0].routeName;
  
  const completedStages = Array.isArray(savedStages?.[selectedRoute])
    ? savedStages[selectedRoute]
    : [];

  function handleSelectRoute(routeName) { 
    saveSelectedRoute(routeName);
  }

  function handleToggleStage(segmentIds) {
    let updatedStages = [...completedStages];

    const allCompleted = segmentIds.every(id =>
      updatedStages.includes(id)
    );

    if (allCompleted) {
      updatedStages = updatedStages.filter(
        id => !segmentIds.includes(id)
      );
    } else {
      for (const id of segmentIds) {
        if (!updatedStages.includes(id)) {
          updatedStages.push(id);
        }
      }
    }

    saveCompletedStages(updatedStages, selectedRoute);
  }

  const selectedRouteData = routes.find(route => route.routeName === selectedRoute);
  const selectedSegments = selectedRouteData?.segments ?? [];
  const progressSegments = selectedSegments.flatMap(segment => {
    return splitSegment(segment);
  });
  const generatedStages = generateStages(
    selectedSegments,
    targetDistance
  );
  const averageDistance = generatedStages.length > 0
    ? generatedStages.reduce((sum, stage) => sum + stage.distance, 0)
      / generatedStages.length
    : 0;

  const roundedAverageDistance = Math.round(averageDistance * 10) / 10;
  const completedStagesCount = generatedStages.filter(stage =>
    stage.segmentIds.every(id => completedStages.includes(id))
  ).length;

  const completedDistance = Math.round(
    progressSegments.reduce((total, segment) => {
      return completedStages.includes(segment.id)
        ? total + segment.distance
        : total;
    }, 0) * 10
  ) / 10;
  const progressPercentage = selectedRouteData?.distance > 0
    ? Math.round(completedDistance / selectedRouteData.distance * 1000) / 10
    : 0;

  return (
    <>
      <Header title="Camino Planner" />
      
      <main className={styles.page}>
        {selectedRouteData ?
          (<>
            <RouteOverview 
              route={selectedRouteData} 
              averageDistance={roundedAverageDistance} 
              totalDays={generatedStages.length}
            />
            <DistanceSelector
              targetDistance={targetDistance}
              onDistanceChange={setTargetDistance}
            />
          </>
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
          totalDays={generatedStages.length}
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
                stages={generatedStages}
                progressPercentage={progressPercentage}
                completedDistance={completedDistance}
                totalDistance={selectedRouteData.distance}
                completedStagesCount={completedStagesCount}
                totalDays={generatedStages.length}
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