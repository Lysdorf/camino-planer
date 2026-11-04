
import fs from "node:fs/promises";
import path from "node:path";

const directory = path.join(
  process.cwd(),
  "public",
  "data",
  "routes",
  "camino-frances"
);

async function inspectRoute() {
  const stagesData = JSON.parse(
    await fs.readFile(path.join(directory, "stages.json"), "utf8")
  );

  const waypointsData = JSON.parse(
    await fs.readFile(path.join(directory, "waypoints.geojson"), "utf8")
  );

  const stages = stagesData.stages;
  const features = waypointsData.features;

  console.log("\n========== ЭТАПЫ ==========\n");

  let cumulativeDistance = 0;

  for (const stage of stages) {
    const startKm = cumulativeDistance;
    cumulativeDistance += stage.distanceKm;

    const stagePoints = features.filter(
      feature => feature.properties.stageIndex === stage.index
    );

    const distances = stagePoints
      .map(feature => feature.properties.kmFromStart)
      .filter(Number.isFinite);

    console.log({
      index: stage.index,
      name: stage.name.en,
      distance: stage.distanceKm,
      startKm: Number(startKm.toFixed(1)),
      endKm: Number(cumulativeDistance.toFixed(1)),
      waypointCount: stagePoints.length,
      minWaypointKm: distances.length
        ? Math.min(...distances)
        : null,
      maxWaypointKm: distances.length
        ? Math.max(...distances)
        : null
    });
  }

  console.log("\n========== ТИПЫ ТОЧЕК ==========\n");

  const types = {};

  for (const feature of features) {
    const type = feature.properties.type || "unknown";

    if (!types[type]) {
      types[type] = [];
    }

    types[type].push(feature);
  }

  for (const [type, points] of Object.entries(types)) {
    console.log(`\n${type}: ${points.length} объектов`);

    console.log(
      points.slice(0, 3).map(feature => ({
        id: feature.id,
        name: feature.properties.name,
        type: feature.properties.type,
        subtype: feature.properties.subtype,
        stageIndex: feature.properties.stageIndex,
        kmFromStart: feature.properties.kmFromStart,
        coordinates: feature.geometry.coordinates
      }))
    );
  }

  console.log("\n========== НАСЕЛЁННЫЕ ПУНКТЫ ==========\n");

    const towns = features
    .filter(feature => feature.properties.type === "town")
    .sort((a, b) => a.properties.kmFromStart - b.properties.kmFromStart);

    console.log("Всего населённых пунктов:", towns.length);

    for (const town of towns) {
    const properties = town.properties;

    console.log({
        name: properties.name,
        stageIndex: properties.stageIndex,
        kmFromStart: properties.kmFromStart
    });
    }

    console.log("\n========== ЖИЛЬЁ ==========\n");

    const accommodations = features
    .filter(feature => feature.properties.type === "accommodation")
    .sort(
        (a, b) =>
        a.properties.kmFromStart - b.properties.kmFromStart
    );

    console.log("\n========== ЖИЛЬЁ НА ДЛИННЫХ УЧАСТКАХ ==========\n");

  for (let i = 0; i < towns.length - 1; i++) {
    const from = towns[i];
    const to = towns[i + 1];

    const startKm = from.properties.kmFromStart;
    const endKm = to.properties.kmFromStart;
    const distance = endKm - startKm;

    if (distance < 25) continue;

    const candidates = accommodations.filter(feature => {
      const km = feature.properties.kmFromStart;

      return km > startKm + 5 && km < endKm - 5;
    });

    // Группируем объекты жилья, расположенные рядом.
    const groups = [];

    for (const candidate of candidates) {
      const km = candidate.properties.kmFromStart;
      let group = groups.find(
        item => Math.abs(item.km - km) <= 1
      );

      if (!group) {
        group = {
          km,
          relativeKm: Number((km - startKm).toFixed(1)),
          names: []
        };

        groups.push(group);
      }

      if (
        candidate.properties.name &&
        group.names.length < 3
      ) {
        group.names.push(candidate.properties.name);
      }
    }

    console.dir({
        from: from.properties.name,
        to: to.properties.name,
        distance: Number(distance.toFixed(1)),
        accommodationGroups: groups.length,
        candidates: groups
    }, { depth: null });
  }

    console.log("Всего объектов жилья:", accommodations.length);

    console.table(
    accommodations.slice(0, 20).map(feature => ({
        id: feature.id,
        name: feature.properties.name,
        stageIndex: feature.properties.stageIndex,
        kmFromStart: feature.properties.kmFromStart,
        subtype: feature.properties.subtype
    }))
    );
  console.log("\n========== ИТОГИ ==========\n");
  console.log("Этапов:", stages.length);
  console.log("Точек:", features.length);
  console.log("Суммарная дистанция:", cumulativeDistance.toFixed(1), "км");
  console.log("Типы точек:", Object.keys(types));
}

inspectRoute().catch(error => {
  console.error("Ошибка анализа:", error);
  process.exitCode = 1;
});
