'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface LocationPickerProps {
  onLocationSelect: (location: { address: string; lat: number; lng: number }) => void;
  initialLocation?: string;
}

export default function LocationPicker({ onLocationSelect, initialLocation }: LocationPickerProps) {
  const [address, setAddress] = useState(initialLocation || '');
  const [isLoaded, setIsLoaded] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markerInstance = useRef<google.maps.Marker | null>(null);
  const autocompleteInstance = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const initializeMap = async () => {
      const loader = new Loader({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
        version: 'weekly',
        libraries: ['places'],
      });

      try {
        await loader.load();
        setIsLoaded(true);

        if (mapRef.current) {
          // Initialize map
          const map = new google.maps.Map(mapRef.current, {
            center: { lat: 51.5074, lng: -0.1278 }, // London default
            zoom: 13,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
          });

          mapInstance.current = map;

          // Initialize marker
          const marker = new google.maps.Marker({
            map,
            draggable: true,
            position: { lat: 51.5074, lng: -0.1278 },
          });

          markerInstance.current = marker;

          // Handle marker drag
          marker.addListener('dragend', () => {
            const position = marker.getPosition();
            if (position) {
              const geocoder = new google.maps.Geocoder();
              geocoder.geocode({ location: position }, (results, status) => {
                if (status === 'OK' && results?.[0]) {
                  const formattedAddress = results[0].formatted_address;
                  setAddress(formattedAddress);
                  onLocationSelect({
                    address: formattedAddress,
                    lat: position.lat(),
                    lng: position.lng(),
                  });
                }
              });
            }
          });

          // Initialize autocomplete
          if (inputRef.current) {
            const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
              types: ['establishment', 'geocode'],
            });

            autocompleteInstance.current = autocomplete;

            autocomplete.addListener('place_changed', () => {
              const place = autocomplete.getPlace();
              if (place.geometry?.location) {
                const location = place.geometry.location;
                const lat = location.lat();
                const lng = location.lng();

                // Update map and marker
                map.setCenter({ lat, lng });
                marker.setPosition({ lat, lng });

                // Update address
                const formattedAddress = place.formatted_address || place.name || '';
                setAddress(formattedAddress);
                onLocationSelect({
                  address: formattedAddress,
                  lat,
                  lng,
                });
              }
            });
          }
        }
      } catch (error) {
        console.error('Error loading Google Maps:', error);
      }
    };

    initializeMap();
  }, [onLocationSelect]);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value);
  };

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng && markerInstance.current) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();

      markerInstance.current.setPosition({ lat, lng });

      // Reverse geocode to get address
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results?.[0]) {
          const formattedAddress = results[0].formatted_address;
          setAddress(formattedAddress);
          onLocationSelect({
            address: formattedAddress,
            lat,
            lng,
          });
        }
      });
    }
  };

  useEffect(() => {
    if (isLoaded && mapInstance.current) {
      mapInstance.current.addListener('click', handleMapClick);
    }
  }, [isLoaded]);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Event Location *
        </label>
        <input
          ref={inputRef}
          type="text"
          value={address}
          onChange={handleAddressChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="Search for a location or click on the map"
        />
        <p className="text-xs text-gray-500 mt-1">
          Search for an address or click on the map to select a location
        </p>
      </div>

      <div
        ref={mapRef}
        className="w-full h-64 rounded-lg border border-gray-300"
        style={{ minHeight: '256px' }}
      />

      {!isLoaded && (
        <div className="w-full h-64 rounded-lg border border-gray-300 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-500">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
}
