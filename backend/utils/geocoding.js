const axios = require('axios');

async function getCoordinates(address) {
  try {
    console.log('Attempting to geocode address:', address);

    const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
      params: {
        q: address,
        format: 'json',
        limit: 1
      },
      headers: {
        'User-Agent': 'EPostOffice/1.0' // Required by OpenStreetMap
      },
      timeout: 5000 // 5 second timeout
    });

    console.log('Nominatim API Response:', response.data);

    if (response.data && response.data.length > 0) {
      const location = response.data[0];
      return {
        latitude: parseFloat(location.lat),
        longitude: parseFloat(location.lon),
        displayName: location.display_name
      };
    }

    // If no results, try with less detailed address
    const fallbackAddress = getFallbackAddress(address);
    if (fallbackAddress) {
      console.log('Retrying with less detailed address:', fallbackAddress);
      return await getCoordinates(fallbackAddress);
    }

    throw new Error('Could not geocode address');
  } catch (error) {
    console.error('Geocoding error:', error.message || error);
    return null;
  }
}

function getFallbackAddress(address) {
  const parts = address.split(',');
  if (parts.length > 1) {
    return parts.slice(1).join(',').trim();
  }
  return null;
}

module.exports = { getCoordinates };
