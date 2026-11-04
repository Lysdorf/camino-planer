
import fs from "node:fs/promises";
import path from "node:path";

const directory = path.join(
  process.cwd(),
  "public",
  "data",
  "routes",
  "camino-frances"
);

const round1 = value => Math.round(value * 10) / 10;

async function convertRoute() {
  const stagesData = JSON.parse(
    await fs.readFile(
      path.join(directory, "stages.json"),
      "utf8"
    )
  );

  const waypointsData = JSON.parse(
    await fs.readFile(
      path.join(directory, "waypoints.geojson"),
      "utf8"
    )
  );

  // Строим глобальные границы исходных этапов.
  let cumulativeKm = 0;

  const stageRanges = stagesData.stages.map(stage => {
    const startKm = cumulativeKm;
    cumulativeKm += stage.distanceKm;

    return {
      index: stage.index,
      startKm,
      endKm: cumulativeKm,
      distance: stage.distanceKm,
      elevationGainMeters: stage.elevationGainMeters || 0,
      elevationLossMeters: stage.elevationLossMeters || 0,
      name: stage.name.en
    };
  });

  const towns = waypointsData.features
    .filter(feature => feature.properties.type === "town")
    .sort(
      (a, b) =>
        a.properties.kmFromStart - b.properties.kmFromStart
    );

  const accommodations = waypointsData.features.filter(
    feature =>
      feature.properties.type === "accommodation" &&
      Number.isFinite(feature.properties.kmFromStart)
  );

  if (towns.length < 2) {
    throw new Error(
      "Недостаточно населённых пунктов для конвертации"
    );
  }

  // Распределяем высоту исходных этапов
  // пропорционально длине пересечения с участком.
  function calculateElevation(fromKm, toKm) {
    let gain = 0;
    let loss = 0;

    for (const stage of stageRanges) {
      const overlapStart = Math.max(fromKm, stage.startKm);
      const overlapEnd = Math.min(toKm, stage.endKm);
      const overlap = Math.max(0, overlapEnd - overlapStart);

      if (overlap === 0) continue;

      const ratio = overlap / stage.distance;

      gain += stage.elevationGainMeters * ratio;
      loss += stage.elevationLossMeters * ratio;
    }

    return {
      elevationGainMeters: round1(gain),
      elevationLossMeters: round1(loss)
    };
  }

  function normalizeTown(feature) {
    const properties = feature.properties;

    return {
        id: feature.id,
        name: properties.name || "Unnamed",
        type: "town",
        distanceFromStart: properties.kmFromStart,
        coordinates: feature.geometry.coordinates,
        tags: properties.tags || []
    };
    }

  const segments = [];

  for (let i = 0; i < towns.length - 1; i++) {
    const from = towns[i];
    const to = towns[i + 1];

    const fromKm = from.properties.kmFromStart;
    const toKm = to.properties.kmFromStart;

    if (
      !Number.isFinite(fromKm) ||
      !Number.isFinite(toKm) ||
      toKm <= fromKm
    ) {
      throw new Error(
        `Некорректный километраж между ${from.properties.name} и ${to.properties.name}`
      );
    }

    const stageIndex = to.properties.stageIndex;
    const sourceStage = stagesData.stages[stageIndex];

    if (!sourceStage) {
      throw new Error(`Не найден исходный этап ${stageIndex}`);
    }

    const distance = round1(toKm - fromKm);
    const elevation = calculateElevation(fromKm, toKm);

    const intermediateStops = accommodations
      .filter(feature => {
        const km = feature.properties.kmFromStart;

        return km > fromKm + 5 && km < toKm - 5;
      })
      .map(feature => ({
        id: feature.id,
        name: feature.properties.name || "Unnamed",
        distanceFromStart: round1(
          feature.properties.kmFromStart - fromKm
        ),
        type: "accommodation",
        subtype: feature.properties.subtype || null,
        coordinates: feature.geometry.coordinates
      }));

    segments.push({
        id: `frances-${from.id}-${to.id}`,

        from: from.properties.name,
        to: to.properties.name,

        fromTown: normalizeTown(from),
        toTown: normalizeTown(to),

        distance,
        startKm: fromKm,
        endKm: toKm,

        startCoordinates: from.geometry.coordinates,
        endCoordinates: to.geometry.coordinates,

        sourceStageIndex: stageIndex,
        sourceStageName: sourceStage.name.en,

        ...elevation,

        intermediateStops
    });
  }

  const totalDistance = round1(
    segments.reduce((sum, segment) => sum + segment.distance, 0)
  );

  const totalElevationGain = round1(
    segments.reduce(
      (sum, segment) => sum + segment.elevationGainMeters,
      0
    )
  );

  const totalElevationLoss = round1(
    segments.reduce(
      (sum, segment) => sum + segment.elevationLossMeters,
      0
    )
  );

  const route = {
    id: "camino-frances",
    name: "Camino Francés",

    source: {
      name: "Open Pilgrimages",
      version: "v1.12.0",
      originalSource: "OpenStreetMap",
      license: "ODbL",
      attribution: "© OpenStreetMap contributors"
    },

    distance: totalDistance,
    elevationGainMeters: totalElevationGain,
    elevationLossMeters: totalElevationLoss,

    stageCount: stagesData.stages.length,
    townCount: towns.length,
    segmentCount: segments.length,

    segments
  };

  const json = JSON.stringify(route, null, 2);

  const publicOutputPath = path.join(
    directory,
    "normalized-route.json"
  );

  await fs.writeFile(publicOutputPath, json, "utf8");

  const appOutputPath = path.join(
    process.cwd(),
    "src",
    "app",
    "data",
    "camino-frances.json"
  );

  await fs.writeFile(appOutputPath, json, "utf8");

  console.log("\n========== КОНВЕРТАЦИЯ ==========\n");
  console.log("Маршрут:", route.name);
  console.log("Населённых пунктов:", route.townCount);
  console.log("Участков:", route.segmentCount);
  console.log("Дистанция:", route.distance, "км");
  console.log("Набор высоты:", route.elevationGainMeters, "м");
  console.log("Сброс высоты:", route.elevationLossMeters, "м");

  console.log("\nПервые 5 участков:");

  console.table(
    segments.slice(0, 5).map(segment => ({
      from: segment.from,
      to: segment.to,
      distance: segment.distance,
      ascent: segment.elevationGainMeters,
      descent: segment.elevationLossMeters
    }))
  );

  console.log("\nСамые сложные участки по набору высоты:");

  console.table(
    [...segments]
      .sort(
        (a, b) =>
          b.elevationGainMeters - a.elevationGainMeters
      )
      .slice(0, 5)
      .map(segment => ({
        from: segment.from,
        to: segment.to,
        distance: segment.distance,
        ascent: segment.elevationGainMeters,
        descent: segment.elevationLossMeters
      }))
  );

  console.log("\nФайлы сохранены:");
  console.log(publicOutputPath);
  console.log(appOutputPath);
  console.log("\n=================================\n");
}

convertRoute().catch(error => {
  console.error("Ошибка конвертации:", error.message);
  process.exitCode = 1;
});
