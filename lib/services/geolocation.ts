import mapboxgl from 'mapbox-gl';

export async function getCurrentLocation(): Promise<[number, number]> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve([position.coords.longitude, position.coords.latitude]);
      },
      (error) => {
        reject(new Error(`Failed to get location: ${error.message}`));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
}

export async function getAddressFromCoordinates(
  coordinates: [number, number]
): Promise<{ address: string; postalCode: string }> {
  try {
    const [lng, lat] = coordinates;
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.features || data.features.length === 0) {
      throw new Error('No address found for the given coordinates');
    }

    const feature = data.features[0];
    const address = feature.place_name;
    const postalCode = feature.context?.find((c: any) => c.id.startsWith('postcode'))?.text || '';

    return { address, postalCode };
  } catch (error) {
    console.error('Error getting address:', error);
    return { address: 'Unknown Address', postalCode: '' };
  }
}

// Add a new function to check if geolocation is supported
export function isGeolocationSupported(): boolean {
  return 'geolocation' in navigator;
}

