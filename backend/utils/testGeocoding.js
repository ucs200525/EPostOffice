const { getCoordinates } = require('./geocoding');

async function testGeocoding() {
  const testAddresses = [
    'Sathyanarayana Puram, Vijayawada, Andhra Pradesh, 520011, India',
    '1600 Amphitheatre Parkway, Mountain View, CA, 94043, USA',
    '10 Downing Street, London, SW1A 2AA, UK'
  ];

  for (const address of testAddresses) {
    console.log(`Testing geocoding for address: ${address}`);
    const coordinates = await getCoordinates(address);
    console.log('Geocoding result:', coordinates);
  }
}

testGeocoding();
