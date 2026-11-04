
import fs from "node:fs/promises";

import {
  generateStages,
  splitSegment
} from "../src/app/lib/routePlanner.js";
const routeData = JSON.parse(
  await fs.readFile(
    "src/app/data/camino-frances.json",
    "utf8"
  )
);

function round1(value) {
  return Math.round(value * 10) / 10;
}

function inspectPlan(targetDistance) {
  const stages = generateStages(
    routeData.segments,
    targetDistance
  );

  const allParts = routeData.segments.flatMap(splitSegment);

    const partsById = new Map(
    allParts.map(part => [part.id, part])
    );

    console.log("\nПРОВЕРКА КОНЕЧНЫХ ТОЧЕК:\n");

    console.table(
    stages.map(stage => {
        const lastPart = partsById.get(
        stage.segmentIds[stage.segmentIds.length - 1]
        );

        return {
        day: stage.day,
        destination: stage.to,
        distance: stage.distance,
        hasAccommodation:
            (lastPart?.toAccommodation || []).length > 0,
        accommodationCount:
            (lastPart?.toAccommodation || []).length,
        isTown: Boolean(lastPart?.toTown),
        townName: lastPart?.toTown?.name || null,
        townTags: lastPart?.toTown?.tags?.join(", ") || null
        };
    })
    );

  const loads = stages.map(stage => stage.estimatedLoad);

  const averageLoad = loads.reduce(
    (sum, load) => sum + load,
    0
  ) / loads.length;

  const heavyDays = stages.filter(
    stage => stage.estimatedLoad > averageLoad * 1.15
  );

  const lightDays = stages.filter(
    stage => stage.estimatedLoad < averageLoad * 0.85
  );

  let consecutiveHeavyDays = 0;

  for (let i = 0; i < stages.length - 1; i++) {
    if (
      stages[i].estimatedLoad > averageLoad * 1.15 &&
      stages[i + 1].estimatedLoad > averageLoad * 1.15
    ) {
      consecutiveHeavyDays++;
    }
  }

  const totalDistance = stages.reduce(
    (sum, stage) => sum + stage.distance,
    0
  );

  const distances = stages.map(stage => stage.distance);

  console.log(`\n========== ЦЕЛЬ ${targetDistance} КМ ==========\n`);

  console.log("Всего дней:", stages.length);
  console.log("Общая дистанция:", round1(totalDistance), "км");
  console.log("Средняя дистанция:", round1(totalDistance / stages.length), "км");
  console.log("Средняя нагрузка:", round1(averageLoad));

  console.log(
    "Самый короткий день:",
    Math.min(...distances),
    "км"
  );

  console.log(
    "Самый длинный день:",
    Math.max(...distances),
    "км"
  );

  console.log("Дней с высокой нагрузкой:", heavyDays.length);
  console.log("Дней с низкой нагрузкой:", lightDays.length);
  console.log("Пар тяжёлых дней подряд:", consecutiveHeavyDays);

  console.log("\nДЕТАЛИ ПО ДНЯМ:\n");

  console.table(
    stages.map(stage => ({
      day: stage.day,
      from: stage.from,
      to: stage.to,
      km: stage.distance,
      gain: stage.elevationGainMeters,
      loss: stage.elevationLossMeters,
      load: stage.estimatedLoad,
      loadDifference: round1(
        stage.estimatedLoad - averageLoad
      ),
      overload: stage.estimatedLoad > averageLoad * 1.15
    }))
  );

  console.log("\n========================================\n");
}

for (const target of [20, 25, 30]) {
  inspectPlan(target);
}
