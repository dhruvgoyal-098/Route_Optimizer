import React from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const RouteMap = ({ route, deliveries, startLocation, endLocation, onMarkerClick }) => {
  const defaultCenter = [40.7128, -74.0060];

  // ✅ SAFE: Check if deliveries exist and filter out null/undefined
  const safeDeliveries = (deliveries || []).filter(d => d !== null && d !== undefined);

  const getRoutePath = () => {
    // Check route waypoints
    if (route?.waypoints && route.waypoints.length > 0) {
      return route.waypoints
        .filter(w => w && w.lat !== undefined && w.lng !== undefined)
        .map(w => [w.lat, w.lng]);
    }

    // Check deliveries
    if (safeDeliveries && safeDeliveries.length > 0) {
      const points = [
        [startLocation?.lat || defaultCenter[0], startLocation?.lng || defaultCenter[1]],
        ...safeDeliveries
          .filter(d => d?.address?.coordinates?.lat && d?.address?.coordinates?.lng)
          .map(d => [d.address.coordinates.lat, d.address.coordinates.lng]),
        [endLocation?.lat || defaultCenter[0], endLocation?.lng || defaultCenter[1]],
      ];
      return points.filter(p => p[0] !== 0 && p[1] !== 0);
    }

    return [defaultCenter];
  };

  const routePath = getRoutePath();

  const getMarkerColor = (status) => {
    switch (status) {
      case 'delivered': return '#10b981';
      case 'in-transit': return '#3b82f6';
      case 'pending': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getMarkerIcon = (status) => {
    const color = getMarkerColor(status);
    const html = `
      <div style="
        background-color: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 12px;
      ">
        ${status === 'delivered' ? '✓' : status === 'in-transit' ? '▶' : '●'}
      </div>
    `;
    return L.divIcon({
      html: html,
      className: 'custom-marker',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  };

  return (
    <MapContainer
      center={routePath[0] || defaultCenter}
      zoom={13}
      style={{ height: '100%', width: '100%', borderRadius: '8px' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {/* Start Location */}
      {startLocation && startLocation.lat && startLocation.lng && (
        <Marker
          position={[startLocation.lat, startLocation.lng]}
          icon={L.divIcon({
            html: '<div style="background-color: #10b981; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>',
            className: 'start-marker',
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          })}
        >
          <Popup>Start Location</Popup>
        </Marker>
      )}

      {/* Route Path */}
      {routePath.length > 1 && (
        <Polyline
          positions={routePath}
          color="#3b82f6"
          weight={4}
          opacity={0.8}
          smoothFactor={1}
        />
      )}

      {/* ✅ SAFE: Delivery Points with null checks */}
      {safeDeliveries.map((delivery, index) => {
        // Skip if delivery or address is null
        if (!delivery || !delivery.address) {
          console.warn('⚠️ Skipping delivery with missing address:', delivery);
          return null;
        }
        
        const coords = delivery.address?.coordinates || delivery;
        if (!coords || !coords.lat || !coords.lng) {
          console.warn('⚠️ Skipping delivery with missing coordinates:', delivery);
          return null;
        }
        
        return (
          <Marker
            key={delivery._id || index}
            position={[coords.lat, coords.lng]}
            icon={getMarkerIcon(delivery.status)}
            eventHandlers={{
              click: () => onMarkerClick?.(delivery),
            }}
          >
            <Popup>
              <div className="popup-content">
                <h4>{delivery.customerName || 'Customer'}</h4>
                <p>{delivery.address?.street || ''}</p>
                <p>Status: <span style={{ color: getMarkerColor(delivery.status) }}>
                  {delivery.status || 'pending'}
                </span></p>
                {delivery.estimatedArrival && (
                  <p>ETA: {new Date(delivery.estimatedArrival).toLocaleTimeString()}</p>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}

      {/* End Location */}
      {endLocation && endLocation.lat && endLocation.lng && (
        <Marker
          position={[endLocation.lat, endLocation.lng]}
          icon={L.divIcon({
            html: '<div style="background-color: #ef4444; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>',
            className: 'end-marker',
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          })}
        >
          <Popup>End Location</Popup>
        </Marker>
      )}
    </MapContainer>
  );
};

export default RouteMap;