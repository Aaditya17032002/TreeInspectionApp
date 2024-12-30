export async function getCurrentLocation(): Promise<{ coordinates: [number, number] }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({ coordinates: [position.coords.longitude, position.coords.latitude] });
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
  { coordinates }: { coordinates: [number, number] }
): Promise<{ address: string; postalCode: string }> {
  try {
    const [lng, lat] = coordinates;
    // Rest of the function remains the same
    //Example of rest of the function.  Replace with your actual implementation.
    const response = await fetch(`https://geocode.maps.co/reverse?lat=${lat}&lon=${lng}`);
    const data = await response.json();
    return { address: data.address, postalCode: data.postcode };
  } catch (error) {
    console.error('Error getting address:', error);
    return { address: 'Unknown Address', postalCode: '' };
  }
}

