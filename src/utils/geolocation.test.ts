import { describe, expect, it } from 'vitest';
import { geolocationErrorMessage, zoomForAccuracy } from './geolocation';

describe('zoomForAccuracy', () => {
  it('zooms in for a tight GPS fix', () => {
    expect(zoomForAccuracy(15)).toBe(16);
    expect(zoomForAccuracy(80)).toBe(15);
  });

  it('zooms out when accuracy is poor', () => {
    expect(zoomForAccuracy(800)).toBe(14);
    expect(zoomForAccuracy(5000)).toBe(10);
  });
});

describe('geolocationErrorMessage', () => {
  it('explains permission denial', () => {
    expect(geolocationErrorMessage({ code: 1 })).toMatch(/permission denied/i);
  });

  it('explains timeout', () => {
    expect(geolocationErrorMessage({ code: 3 })).toMatch(/timed out/i);
  });
});
