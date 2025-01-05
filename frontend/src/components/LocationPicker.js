import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { FaSearch } from 'react-icons/fa';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const defaultCenter = {
  lat: 23.8103,
  lng: 90.4125
};

function MapEvents({ onLocationSelect }) {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
        );
        const data = await response.json();
        onLocationSelect({
          address: data.display_name,
          coordinates: { lat, lng }
        });
      } catch (error) {
        console.error('Error fetching address:', error);
      }
    },
  });
  return null;
}

const LocationPicker = ({ onLocationSelect }) => {
  const [marker, setMarker] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [map, setMap] = useState(null);

  const handleSearch = async () => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          searchQuery
        )}&format=json&limit=1`
      );
      const data = await response.json();
      
      if (data.length > 0) {
        const { lat, lon: lng } = data[0];
        const newLocation = { lat: parseFloat(lat), lng: parseFloat(lng) };
        setMarker(newLocation);
        map.setView(newLocation, 13);
        
        onLocationSelect({
          address: data[0].display_name,
          coordinates: newLocation
        });
      }
    } catch (error) {
      console.error('Error searching location:', error);
    }
  };

  return (
    <div className="location-picker">
      <div className="search-box">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for a location..."
          className="location-search-input"
        />
        <button onClick={handleSearch} className="search-button">
          <FaSearch />
        </button>
      </div>
      
      <MapContainer
        center={defaultCenter}
        zoom={13}
        style={{ height: '400px', width: '100%' }}
        whenCreated={setMap}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {marker && <Marker position={marker} />}
        <MapEvents onLocationSelect={(location) => {
          setMarker(location.coordinates);
          onLocationSelect(location);
        }} />
      </MapContainer>
    </div>
  );
};

export default LocationPicker;
