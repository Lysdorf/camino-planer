import test from "node:test";
import assert from "node:assert/strict";
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

const segments = routeData.segments;

test("Общая дистанция маршрута сохраняется", () => {
  for (const target of [20, 25, 30]) {
    const stages = generateStages(segments, target);

    const total = stages.reduce(
      (sum, stage) => sum + stage.distance,
      0
    );

    assert.ok(
      Math.abs(total - routeData.distance) < 0.2,
      `Неверная дистанция при цели ${target} км: ${total}`
    );
  }
});

test("Все участки используются ровно один раз", () => {
  const parts = segments.flatMap(splitSegment);
  const stages = generateStages(segments, 25);

  const usedIds = stages.flatMap(stage => stage.segmentIds);
  const expectedIds = parts.map(part => part.id);

  assert.equal(usedIds.length, expectedIds.length);
  assert.equal(new Set(usedIds).size, usedIds.length);

  assert.deepEqual(
    [...usedIds].sort(),
    [...expectedIds].sort()
  );
});

test("Соседние дни соединяются без разрывов", () => {
  const stages = generateStages(segments, 25);

  for (let i = 0; i < stages.length - 1; i++) {
    assert.equal(
      stages[i].to,
      stages[i + 1].from,
      `Разрыв между днями ${i + 1} и ${i + 2}`
    );
  }
});

test("Все дневные переходы имеют корректную дистанцию", () => {
  for (const target of [20, 25, 30]) {
    const stages = generateStages(segments, target);

    assert.ok(stages.length > 0);

    for (const stage of stages) {
      assert.ok(stage.distance > 0);
      assert.ok(Number.isFinite(stage.distance));
      assert.ok(stage.segmentIds.length > 0);
    }
  }
});

test("ID участков не меняются при изменении целевой дистанции", () => {
  const ids20 = generateStages(segments, 20)
    .flatMap(stage => stage.segmentIds)
    .sort();

  const ids25 = generateStages(segments, 25)
    .flatMap(stage => stage.segmentIds)
    .sort();

  const ids30 = generateStages(segments, 30)
    .flatMap(stage => stage.segmentIds)
    .sort();

  assert.deepEqual(ids20, ids25);
  assert.deepEqual(ids25, ids30);
});

test("Некорректная целевая дистанция возвращает пустой массив", () => {
  assert.deepEqual(generateStages(segments, 0), []);
  assert.deepEqual(generateStages(segments, -10), []);
  assert.deepEqual(generateStages(segments, NaN), []);
});

test("Набор и сброс высоты сохраняются при разбиении", () => {
  const parts = segments.flatMap(splitSegment);

  const originalGain = segments.reduce(
    (sum, segment) => sum + (segment.elevationGainMeters || 0),
    0
  );

  const originalLoss = segments.reduce(
    (sum, segment) => sum + (segment.elevationLossMeters || 0),
    0
  );

  const splitGain = parts.reduce(
    (sum, part) => sum + part.elevationGainMeters,
    0
  );

  const splitLoss = parts.reduce(
    (sum, part) => sum + part.elevationLossMeters,
    0
  );

  assert.ok(Math.abs(originalGain - splitGain) < 1);
  assert.ok(Math.abs(originalLoss - splitLoss) < 1);
});

test("Дневные этапы содержат показатели высоты и нагрузки", () => {
  const stages = generateStages(segments, 25);

  for (const stage of stages) {
    assert.ok(stage.elevationGainMeters >= 0);
    assert.ok(stage.elevationLossMeters >= 0);
    assert.ok(stage.estimatedLoad > 0);
  }
});

test("Дни не превышают 120% целевой дистанции при цели 20 км", () => {
  const segments = Array.from({ length: 40 }, (_, index) => ({
    id: `test-20-${index}`,
    from: `Point ${index}`,
    to: `Point ${index + 1}`,
    distance: 5
  }));

  const stages = generateStages(segments, 20);

  for (const stage of stages) {
    assert.ok(
      stage.distance <= 24,
      `День ${stage.day}: ${stage.distance} км вместо максимальных 24 км`
    );
  }
});

test("Дни не превышают 120% целевой дистанции при цели 25 км", () => {
  const segments = Array.from({ length: 50 }, (_, index) => ({
    id: `test-25-${index}`,
    from: `Point ${index}`,
    to: `Point ${index + 1}`,
    distance: 5
  }));

  const stages = generateStages(segments, 25);

  for (const stage of stages) {
    assert.ok(
      stage.distance <= 30,
      `День ${stage.day}: ${stage.distance} км вместо максимальных 30 км`
    );
  }
});

test("Дни не превышают 120% целевой дистанции при цели 30 км", () => {
  const segments = Array.from({ length: 60 }, (_, index) => ({
    id: `test-30-${index}`,
    from: `Point ${index}`,
    to: `Point ${index + 1}`,
    distance: 5
  }));

  const stages = generateStages(segments, 30);

  for (const stage of stages) {
    assert.ok(
      stage.distance <= 36,
      `День ${stage.day}: ${stage.distance} км вместо максимальных 36 км`
    );
  }
});