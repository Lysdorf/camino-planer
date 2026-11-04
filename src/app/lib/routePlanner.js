
const round1 = value => Math.round(value * 10) / 10;

function groupStops(stops) {
  const sortedStops = [...stops]
    .filter(stop => Number.isFinite(stop.distanceFromStart))
    .sort((a, b) => a.distanceFromStart - b.distanceFromStart);

  const groups = [];

  for (const stop of sortedStops) {
    let group = groups[groups.length - 1];

    if (
      !group ||
      stop.distanceFromStart - group.startDistance > 1
    ) {
      group = {
        id: stop.id || `stop-${groups.length + 1}`,
        startDistance: stop.distanceFromStart,
        stops: []
      };

      groups.push(group);
    }

    group.stops.push(stop);
  }

  return groups.map(group => {
    const representative = group.stops[0];

    return {
      id: group.id,
      name: representative.name,
      distance: round1(
        group.stops.reduce(
          (sum, stop) => sum + stop.distanceFromStart,
          0
        ) / group.stops.length
      ),
      accommodations: group.stops.map(stop => ({
        id: stop.id,
        name: stop.name,
        subtype: stop.subtype || null,
        coordinates: stop.coordinates || null
      }))
    };
  });
}

export function splitSegment(segment) {
  const validStops = (segment.intermediateStops || []).filter(stop => {
    const km = stop.distanceFromStart;

    return (
      Number.isFinite(km) &&
      km > 0 &&
      km < segment.distance
    );
  });

  const invalidStops = (segment.intermediateStops || []).filter(stop => {
    const km = stop.distanceFromStart;

    return (
      !Number.isFinite(km) ||
      km <= 0 ||
      km >= segment.distance
    );
  });

  if (invalidStops.length > 0) {
    console.warn(
      `Некорректные точки в сегменте ${segment.from} → ${segment.to}:`,
      invalidStops.map(stop => ({
        name: stop.name,
        distanceFromStart: stop.distanceFromStart,
        segmentDistance: segment.distance
      }))
    );
  }

  const groups = groupStops(validStops);

  const points = [
    {
      id: "start",
      name: segment.from,
      distance: 0,
      town: segment.fromTown || null
    },
    ...groups.map(group => ({
      id: group.id,
      name: group.name,
      distance: group.distance,
      accommodations: group.accommodations
    })),
    {
      id: "end",
      name: segment.to,
      distance: segment.distance,
      town: segment.toTown || null
    }
  ];

  return points.slice(0, -1).map((point, index) => {
    const nextPoint = points[index + 1];

    const distance = round1(
      nextPoint.distance - point.distance
    );

    const ratio = segment.distance > 0
      ? distance / segment.distance
      : 0;

    const elevationGainMeters = round1(
      (segment.elevationGainMeters || 0) * ratio
    );

    const elevationLossMeters = round1(
      (segment.elevationLossMeters || 0) * ratio
    );

    return {
      id: `${segment.id}-${point.id}-${nextPoint.id}`,
      from: point.name,
      to: nextPoint.name,
      distance,
      elevationGainMeters,
      elevationLossMeters,

      fromTown: point.town || null,
      toTown: nextPoint.town || null,

      fromAccommodation: point.accommodations || [],
      toAccommodation: nextPoint.accommodations || []
    };
  });
}

// Оценка физической нагрузки в условных километрах.
function calculateLoad(distance, gain, loss) {
  return distance + gain / 100 + loss / 200;
}


export function generateStages(segments, targetDistance) {
  if (
    !Array.isArray(segments) ||
    segments.length === 0 ||
    !Number.isFinite(targetDistance) ||
    targetDistance <= 0
  ) {
    return [];
  }

  const parts = segments.flatMap(splitSegment);

  if (parts.length === 0) return [];

  const count = parts.length;
  const prefixDistance = [0];
  const prefixLoad = [0];

  for (const part of parts) {
    prefixDistance.push(
      prefixDistance[prefixDistance.length - 1] + part.distance
    );

    prefixLoad.push(
      prefixLoad[prefixLoad.length - 1] +
      calculateLoad(
        part.distance,
        part.elevationGainMeters,
        part.elevationLossMeters
      )
    );
  }

  const totalDistance = prefixDistance[count];
  const totalLoad = prefixLoad[count];

  const estimatedDays = Math.max(
    1,
    Math.round(totalDistance / targetDistance)
  );

  const targetLoad = totalLoad / estimatedDays;

  const boundaries = findBalancedBoundaries(
    parts,
    prefixDistance,
    prefixLoad,
    targetDistance,
    targetLoad
  );

  return buildStages(parts, boundaries, targetDistance);
}


function findBalancedBoundaries(
  parts,
  prefixDistance,
  prefixLoad,
  targetDistance,
  targetLoad
) {
  const count = parts.length;
  const maxDistance = targetDistance * 1.2;

  const BEAM_WIDTH = 60;
  const TOWN_PENALTY = 0.35;
  const NO_LODGING_PENALTY = 1.5;
  const DAY_COUNT_PENALTY = 0.75;

  const totalDistance = prefixDistance[count];

  const targetDays = Math.max(
    1,
    Math.round(totalDistance / targetDistance)
  );

  // Нагрузка, после которой день считается тяжёлым.
  const HEAVY_LOAD_LIMIT = targetLoad * 1.15;

  const states = Array.from(
    { length: count + 1 },
    () => new Map()
  );

  states[0].set(0, [{
    cost: 0,
    lastLoad: 0,
    previous: null,
    start: 0,
    end: 0,
    days: 0,
    previousWasHeavy: false,
    twoDaysAgoWasHeavy: false
  }]);

  for (let end = 1; end <= count; end++) {
    for (let start = 0; start < end; start++) {
      const distance = round1(
        prefixDistance[end] - prefixDistance[start]
      );

      const load =
        prefixLoad[end] - prefixLoad[start];

      const singlePart = end - start === 1;

      const unavoidableLongPart =
        singlePart && distance > maxDistance;

      if (
        distance > maxDistance &&
        !unavoidableLongPart
      ) {
        continue;
      }

      const loadDeviation =
        (load - targetLoad) / targetLoad;

      const distanceDeviation =
        (distance - targetDistance) / targetDistance;

      const dayCost =
        loadDeviation ** 2 +
        0.5 * distanceDeviation ** 2;

      const currentPart = parts[end - 1];

      const hasAccommodation =
        currentPart.toAccommodation.length > 0;

      const hasTown =
        Boolean(currentPart.toTown);

      const endpointPenalty = hasAccommodation
        ? 0
        : hasTown
          ? TOWN_PENALTY
          : NO_LODGING_PENALTY;

      const currentIsHeavy = load > HEAVY_LOAD_LIMIT;

      for (const [previousDays, previousStates] of states[start]) {
        for (const previousState of previousStates) {
          const previousOverload = Math.max(
            0,
            (previousState.lastLoad - targetLoad) / targetLoad
          );

          const currentOverload = Math.max(
            0,
            (load - targetLoad) / targetLoad
          );

          // Штраф за два тяжёлых дня подряд.
          const previousWasHeavy = previousState.previousWasHeavy;
          const twoDaysAgoWasHeavy = previousState.twoDaysAgoWasHeavy;

          const recoveryPenalty =
            previousOverload * currentOverload * 5;

          const consecutiveHeavyPenalty =
            currentIsHeavy && previousWasHeavy
              ? 5 + (twoDaysAgoWasHeavy ? 10 : 0)
              : 0;

          // Первый день желательно сделать мягче.
          const firstDayPenalty = previousDays === 0
            ? Math.max(
                0,
                (load - targetLoad * 1.1) / targetLoad
              ) ** 2 * 10
            : 0;

          // После тяжёлого дня предпочтительнее восстановление.
          const recoveryDayPenalty = 0;

          const days = previousDays + 1;

          const candidate = {
            cost:
              previousState.cost +
              dayCost +
              recoveryPenalty +
              consecutiveHeavyPenalty +
              endpointPenalty +
              firstDayPenalty +
              recoveryDayPenalty,

            lastLoad: load,
            previous: previousState,
            start,
            end,
            days,

            previousWasHeavy: currentIsHeavy,
            twoDaysAgoWasHeavy:
              previousState.previousWasHeavy
          };

          if (!states[end].has(days)) {
            states[end].set(days, []);
          }

          states[end].get(days).push(candidate);
        }
      }
    }

    // Оставляем лучшие варианты для каждого количества дней.
    for (const [days, candidates] of states[end]) {
      candidates.sort((a, b) => a.cost - b.cost);

      states[end].set(
        days,
        candidates.slice(0, BEAM_WIDTH)
      );
    }
  }

  let bestState = null;
  let bestCost = Infinity;

  for (const [days, candidates] of states[count]) {
    const dayCountDeviation = days - targetDays;

    const dayCountPenalty =
      dayCountDeviation ** 2 * DAY_COUNT_PENALTY;

    for (const candidate of candidates) {
      const totalCost =
        candidate.cost + dayCountPenalty;

      if (totalCost < bestCost) {
        bestCost = totalCost;
        bestState = candidate;
      }
    }
  }

  if (!bestState) {
    throw new Error(
      "Не удалось составить маршрут с ограничением 120%. Проверь длину отдельных участков."
    );
  }

  const boundaries = [count];
  let current = bestState;

  while (current.previous) {
    boundaries.push(current.start);
    current = current.previous;
  }

  return boundaries.reverse();
}



function buildStages(parts, boundaries, targetDistance) {
  const stages = [];

  for (let i = 0; i < boundaries.length - 1; i++) {
    const dayParts = parts.slice(
      boundaries[i],
      boundaries[i + 1]
    );

    if (dayParts.length === 0) continue;

    const distance = dayParts.reduce(
      (sum, part) => sum + part.distance,
      0
    );

    const distanceLimit = round1(
      targetDistance * 1.2
    );

    const elevationGainMeters = dayParts.reduce(
      (sum, part) => sum + part.elevationGainMeters,
      0
    );

    const elevationLossMeters = dayParts.reduce(
      (sum, part) => sum + part.elevationLossMeters,
      0
    );

    stages.push({
      id: `day-${stages.length + 1}`,
      day: stages.length + 1,
      from: dayParts[0].from,
      to: dayParts[dayParts.length - 1].to,
      distance: round1(distance),
      elevationGainMeters: round1(elevationGainMeters),
      elevationLossMeters: round1(elevationLossMeters),
      estimatedLoad: round1(
        calculateLoad(
          distance,
          elevationGainMeters,
          elevationLossMeters
        )
      ),
      segmentIds: dayParts.map(part => part.id),
      distanceLimit: round1(targetDistance * 1.2),
      exceedsDistanceLimit: round1(distance) > round1(targetDistance * 1.2)
    });
  }

  return stages;
}
