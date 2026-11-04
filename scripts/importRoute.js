
import fs from "node:fs/promises";
import path from "node:path";

const ROUTE_ID = process.argv[2] || "camino-frances";
const VERSION = "v1.12.0";

const BASE_URL =
  `https://raw.githubusercontent.com/walktalkmeditate/open-pilgrimages/${VERSION}/routes/${ROUTE_ID}`;

const FILES = [
  "route.geojson",
  "stages.json",
  "waypoints.geojson"
];

async function downloadFile(filename) {
  const url = `${BASE_URL}/${filename}`;

  console.log(`Загружаем ${filename}...`);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Ошибка загрузки ${filename}: HTTP ${response.status}`
    );
  }

  return response.json();
}

async function importRoute() {
  try {
    console.log(`\nИмпортируем маршрут: ${ROUTE_ID}`);
    console.log(`Источник: Open Pilgrimages ${VERSION}\n`);

    const results = await Promise.all(
      FILES.map(filename => downloadFile(filename))
    );

    const [routeData, stagesData, waypointsData] = results;

    // Проверяем структуру файлов
    if (
      !Array.isArray(stagesData.stages) ||
      stagesData.routeId !== ROUTE_ID
    ) {
      throw new Error("Некорректная структура stages.json");
    }

    if (
      waypointsData.type !== "FeatureCollection" ||
      !Array.isArray(waypointsData.features)
    ) {
      throw new Error("Некорректная структура waypoints.geojson");
    }

    if (!routeData.type) {
      throw new Error("Некорректная структура route.geojson");
    }

    if (stagesData.stageCount !== stagesData.stages.length) {
      throw new Error("Количество этапов не совпадает с stageCount");
    }

    // Создаём папку для маршрута
    const outputDirectory = path.join(
      process.cwd(),
      "public",
      "data",
      "routes",
      ROUTE_ID
    );

    await fs.mkdir(outputDirectory, { recursive: true });

    // Сохраняем исходные данные
    for (let i = 0; i < FILES.length; i++) {
      const filename = FILES[i];

      const outputPath = path.join(
        outputDirectory,
        filename
      );

      await fs.writeFile(
        outputPath,
        JSON.stringify(results[i], null, 2),
        "utf8"
      );

      console.log(`Сохранён: ${filename}`);
    }

    // Считаем общую дистанцию
    const totalDistance = stagesData.stages.reduce(
      (sum, stage) => sum + stage.distanceKm,
      0
    );

    // Формируем отчёт об источнике
    const metadata = {
      routeId: ROUTE_ID,
      source: "Open Pilgrimages",
      sourceVersion: VERSION,
      originalSource: "OpenStreetMap",
      license: "ODbL",
      attribution: "© OpenStreetMap contributors",
      importedAt: new Date().toISOString(),
      stageCount: stagesData.stages.length,
      waypointCount: waypointsData.features.length,
      distanceKm: Math.round(totalDistance * 10) / 10
    };

    await fs.writeFile(
      path.join(outputDirectory, "metadata.json"),
      JSON.stringify(metadata, null, 2),
      "utf8"
    );

    console.log("\n========== ОТЧЁТ ==========");
    console.log("Маршрут:", ROUTE_ID);
    console.log("Этапов:", metadata.stageCount);
    console.log("Объектов:", metadata.waypointCount);
    console.log("Дистанция:", metadata.distanceKm, "км");
    console.log("Папка:", outputDirectory);
    console.log("===========================\n");

  } catch (error) {
    console.error("\nОшибка импорта:", error.message);
    process.exitCode = 1;
  }
}

importRoute();
