import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluatePunctuality,
  calculateWorkHours,
  formatIndonesianDate,
  getStatusBadge,
} from './attendanceLogic';

test('evaluatePunctuality marks clock-in before or at shift start as ON_TIME', () => {
  // Shift starts at 07:00
  // Employee arrives at 06:50 -> ON_TIME
  assert.equal(evaluatePunctuality('06:50', '07:00'), 'ON_TIME');
  // Employee arrives at 07:00 -> ON_TIME
  assert.equal(evaluatePunctuality('07:00', '07:00'), 'ON_TIME');
  // Arrives at 07:04 (within 5 min grace) -> ON_TIME
  assert.equal(evaluatePunctuality('07:04', '07:00', 5), 'ON_TIME');
});

test('evaluatePunctuality marks clock-in past grace period as LATE', () => {
  // Shift starts at 07:00
  // Employee arrives at 07:15 -> LATE
  assert.equal(evaluatePunctuality('07:15', '07:00', 5), 'LATE');
  // Employee arrives at 08:00 -> LATE
  assert.equal(evaluatePunctuality('08:00', '07:00', 5), 'LATE');
});

test('calculateWorkHours computes normal day shift correctly', () => {
  // 07:00 to 15:30 = 8.5 hours
  const hours = calculateWorkHours('07:00:00', '15:30:00', false);
  assert.equal(hours, 8.5);
});

test('calculateWorkHours handles overnight Shift 3 crossing midnight', () => {
  // 23:00 to 07:00 next morning = 8.0 hours
  const hours = calculateWorkHours('23:00:00', '07:00:00', true);
  assert.equal(hours, 8);
});

test('formatIndonesianDate formats string into localized Indonesian date', () => {
  const formatted = formatIndonesianDate('2026-10-21');
  assert.ok(formatted.includes('21 Okt 2026'));
  assert.ok(formatted.includes('Rab'));
});

test('getStatusBadge assigns green to on-time, yellow to late, red to absent', () => {
  assert.equal(getStatusBadge('ON_TIME').colorName, 'green');
  assert.equal(getStatusBadge('LATE').colorName, 'yellow');
  assert.equal(getStatusBadge('ABSENT').colorName, 'red');
});
