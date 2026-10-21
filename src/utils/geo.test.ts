import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateHaversineDistanceMeters,
  isWithinGeofence,
  formatDistance,
} from './geo';

test('Haversine distance returns 0 when coordinates are identical', () => {
  const dist = calculateHaversineDistanceMeters(-7.15664, 112.65551, -7.15664, 112.65551);
  assert.equal(dist, 0);
});

test('Haversine distance calculates reasonable distance for nearby points', () => {
  // Point A: Factory Gate (-7.15664, 112.65551)
  // Point B: Factory Kiln Line 2 (-7.15700, 112.65590) ~ 59 meters
  const dist = calculateHaversineDistanceMeters(-7.15664, 112.65551, -7.15700, 112.65590);
  assert.ok(dist > 50 && dist < 70, `Expected around 60m, got ${dist}`);
});

test('isWithinGeofence accurately validates inside factory radius', () => {
  // Inside 300m radius
  const resultInside = isWithinGeofence(
    -7.15670, 112.65560,
    -7.15664, 112.65551,
    300
  );
  assert.equal(resultInside.isInside, true);
  assert.ok(resultInside.distanceMeters < 300);

  // Outside 300m radius (e.g. 5 km away at home)
  const resultOutside = isWithinGeofence(
    -7.19000, 112.65551,
    -7.15664, 112.65551,
    300
  );
  assert.equal(resultOutside.isInside, false);
  assert.ok(resultOutside.distanceMeters > 3000);
});

test('formatDistance properly formats meters and kilometers', () => {
  assert.equal(formatDistance(45.2), '45 m');
  assert.equal(formatDistance(1250), '1.25 km');
});
