"use client";

import { useState, useEffect, useMemo, useSyncExternalStore } from "react";
import { routes } from "./data/routes";
import { tabs } from "./data/tabs";

import {
  getProgressSnapshot,
  getServerSnapshot,
  subscribe,
  saveCompletedStages,
  saveSelectedRoute,
  getSelectedRouteSnapshot,
  subscribeSelectedRoute,
  getBudgetSnapshot,
  getBudgetServerSnapshot,
  saveBudgetSettings,
  subscribeBudget,
  resetBudgetSettings
} from "./lib/caminoStore";
import { generateStages, splitSegment } from "./lib/routePlanner";

import styles from "./page.module.css";
import Header from "./components/Header/Header";
import RouteOverview from "./components/RouteOverview/RouteOverview";
import Tabs from "./components/Tabs/Tabs";
import StagesList from "./components/StagesList/StagesList";
import RoutesList from "./components/RoutesList/RoutesList";
import DistanceSelector from "./components/DistanceSelector/DistanceSelector";
import BudgetCalculator from "./components/BudgetCalculator/BudgetCalculator";
import Backpack from "./components/Backpack/Backpack";

const EMPTY_SEGMENTS = [];

export default function Home() {
  const [activeTab, setActiveTab] = useState("routes");
  const [targetDistance, setTargetDistance] = useState(25);
  const [calculationDistance, setCalculationDistance] = useState(25);
  const budgetSettings = useSyncExternalStore(
    subscribeBudget,
    getBudgetSnapshot,
    getBudgetServerSnapshot
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setCalculationDistance(targetDistance);
    }, 180);

    return () => clearTimeout(timer);
  }, [targetDistance]);
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

  function handleBudgetChange(key, value) {
    saveBudgetSettings({
      ...budgetSettings,
      [key]: value
    });
  }

  const selectedRouteData = routes.find(route => route.routeName === selectedRoute);
  const selectedSegments = selectedRouteData?.segments ?? EMPTY_SEGMENTS;
  const progressSegments = useMemo(() => {
    return selectedSegments.flatMap(segment => splitSegment(segment));
  }, [selectedSegments]);

  const generatedStages = useMemo(() => {
    return generateStages(selectedSegments, calculationDistance);
  }, [selectedSegments, calculationDistance]);
  const averageDistance = useMemo(() => {
    return generatedStages.length > 0
      ? generatedStages.reduce((sum, stage) => sum + stage.distance, 0)
        / generatedStages.length
      : 0;
  }, [generatedStages]);

  const roundedAverageDistance = Math.round(averageDistance * 10) / 10;

  const budget = useMemo(() => {
    const days = generatedStages.length;

    const nights = budgetSettings.nights ??
      Math.max(0, days - 1);

    const accommodation = budgetSettings.accommodation * nights;
    const food = budgetSettings.food * days;
    const extras = budgetSettings.extras * days;

    const subtotal = accommodation + food + extras;
    const reserve = subtotal * budgetSettings.reservePercent / 100;
    const total = subtotal + reserve;

    return {
      nights,
      accommodation,
      food,
      extras,
      reserve,
      total,
      perDay: days > 0 ? total / days : 0,
      perKm: selectedRouteData?.distance > 0
        ? total / selectedRouteData.distance
        : 0
    };
  }, [budgetSettings, generatedStages.length, selectedRouteData]);

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
              totalBudget={budget.total}
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

          {activeTab === "budget" && (
            <BudgetCalculator
              days={generatedStages.length}
              settings={budgetSettings}
              budget={budget}
              onSettingsChange={handleBudgetChange}
              onReset={resetBudgetSettings}
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

          {activeTab === "backpack" && (
            <Backpack />
          )}
        </div>
        
      </main>
    </>
  );
}