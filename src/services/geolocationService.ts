import { Coordinates, Hospital, Ambulance } from '../types';
import { calculateDistanceKm } from './mapService';
import { KARNATAKA_DISTRICTS, KarnatakaDistrictInfo } from './karnatakaData';

export interface GeolocationResult {
  coords: Coordinates;
  accuracyMeters: number;
  address: string;
  district: string;
  taluk?: string;
  isInsideKarnataka: boolean;
}

/**
 * Checks if a coordinate pair falls within Karnataka's geographical boundaries
 */
export function isCoordinateInsideKarnataka(coord: Coordinates): boolean {
  // Approximate Karnataka bounding polygon
  const minLat = 11.5;
  const maxLat = 18.6;
  const minLng = 74.0;
  const maxLng = 78.6;

  return (
    coord.lat >= minLat &&
    coord.lat <= maxLat &&
    coord.lng >= minLng &&
    coord.lng <= maxLng
  );
}

/**
 * Finds the closest Karnataka district based on geo-distance
 */
export function findNearestKarnatakaDistrict(coord: Coordinates): KarnatakaDistrictInfo {
  let closest = KARNATAKA_DISTRICTS[0];
  let minDistance = calculateDistanceKm(coord, closest.center);

  for (const district of KARNATAKA_DISTRICTS) {
    const dist = calculateDistanceKm(coord, district.center);
    if (dist < minDistance) {
      minDistance = dist;
      closest = district;
    }
  }

  return closest;
}

/**
 * Reverse geocodes coordinates to street and district name
 * Uses OpenStreetMap Nominatim with local Karnataka fallback
 */
export async function reverseGeocodeLocation(coord: Coordinates): Promise<{
  address: string;
  district: string;
  taluk?: string;
  state: string;
}> {
  const closestDistrict = findNearestKarnatakaDistrict(coord);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coord.lat}&lon=${coord.lng}&zoom=16&addressdetails=1`;
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'MediRoute-AI-Karnataka-CAD/2.4',
      },
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};

      const road = addr.road || addr.suburb || addr.neighbourhood || addr.residential || '';
      const taluk = addr.county || addr.subdistrict || closestDistrict.taluks[0];
      const city = addr.city || addr.town || addr.village || closestDistrict.headquarters;
      const district = addr.state_district || closestDistrict.name;
      const state = addr.state || 'Karnataka';

      const parts = [road, city, taluk, district, state].filter(Boolean);
      const formattedAddress = parts.length > 0 ? parts.join(', ') : data.display_name;

      return {
        address: formattedAddress,
        district: district.replace(/district/i, '').trim(),
        taluk,
        state,
      };
    }
  } catch (err) {
    console.warn('Nominatim reverse geocode timed out or failed, using local Karnataka GIS dictionary', err);
  }

  // Local fallback
  return {
    address: `Near ${closestDistrict.headquarters}, ${closestDistrict.taluks[0]} Taluk, ${closestDistrict.name}, Karnataka`,
    district: closestDistrict.name,
    taluk: closestDistrict.taluks[0],
    state: 'Karnataka',
  };
}

/**
 * Fetches user's current live GPS position via Browser Geolocation API
 */
export async function requestUserLiveLocation(): Promise<GeolocationResult> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords: Coordinates = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };

        const inKarnataka = isCoordinateInsideKarnataka(coords);
        const geoInfo = await reverseGeocodeLocation(coords);

        resolve({
          coords,
          accuracyMeters: Math.round(pos.coords.accuracy),
          address: geoInfo.address,
          district: geoInfo.district,
          taluk: geoInfo.taluk,
          isInsideKarnataka: inKarnataka,
        });
      },
      (err) => {
        let msg = 'Could not access live GPS location.';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Location permission was denied. Please allow location access in your browser.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = 'GPS location is currently unavailable.';
        } else if (err.code === err.TIMEOUT) {
          msg = 'Location request timed out.';
        }
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 15000,
      }
    );
  });
}
