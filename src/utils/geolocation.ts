export type GpsFix = {
  latitude: number;
  longitude: number;
  accuracy: number;
  heading: number | null;
  timestamp: number;
};

export function zoomForAccuracy(accuracy: number): number {
  if (accuracy <= 40) return 16;
  if (accuracy <= 150) return 15;
  if (accuracy <= 500) return 14;
  if (accuracy <= 2000) return 12;
  return 10;
}

export function geolocationErrorMessage(err: { code: number; message?: string }): string {
  if (typeof window !== 'undefined' && !window.isSecureContext) {
    return 'Location needs HTTPS (or localhost). Open the app from a secure origin and try again.';
  }

  switch (err.code) {
    case 1:
      return 'Location permission denied. Allow location access in your browser, then tap Locate again.';
    case 2:
      return 'GPS is unavailable. Check that location services are on, then try again.';
    case 3:
      return 'Location request timed out. Move near a window or try again outdoors.';
    default:
      return err.message || 'Unable to retrieve your current location.';
  }
}

export function coordsToFix(coords: GeolocationCoordinates, timestamp: number): GpsFix {
  return {
    latitude: coords.latitude,
    longitude: coords.longitude,
    accuracy: coords.accuracy || 50,
    heading: typeof coords.heading === 'number' && Number.isFinite(coords.heading) ? coords.heading : null,
    timestamp,
  };
}

function getCurrentPosition(options: PositionOptions): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject({ code: 2, message: 'Geolocation is not supported by your browser.' });
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
}

/**
 * Google Maps-style locate: show a fast network/cached fix, then refine with GPS.
 */
export async function locateLikeMaps(onProgress?: (fix: GpsFix) => void): Promise<GpsFix> {
  if (typeof window !== 'undefined' && !window.isSecureContext) {
    throw { code: 1, message: 'Insecure origin' };
  }
  if (!navigator.geolocation) {
    throw { code: 2, message: 'Geolocation is not supported by your browser.' };
  }

  let latest: GpsFix | null = null;

  try {
    const coarse = await getCurrentPosition({
      enableHighAccuracy: false,
      timeout: 8000,
      maximumAge: 30_000,
    });
    latest = coordsToFix(coarse.coords, coarse.timestamp);
    onProgress?.(latest);
  } catch {
    // Fine GPS still runs even if the coarse fix fails.
  }

  try {
    const fine = await getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 20_000,
      maximumAge: 0,
    });
    latest = coordsToFix(fine.coords, fine.timestamp);
    onProgress?.(latest);
  } catch (fineError) {
    if (latest) return latest;
    throw fineError;
  }

  if (!latest) {
    throw { code: 2, message: 'Location information is unavailable.' };
  }

  return latest;
}
