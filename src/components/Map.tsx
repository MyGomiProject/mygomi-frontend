import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Map.css';

// Leaflet 기본 아이콘 설정 (React Leaflet에서 필요)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface MapProps {
  center?: [number, number];
  zoom?: number;
  markers?: Array<{
    id: string;
    position: [number, number];
    title: string;
    description?: string;
  }>;
}

const Map: React.FC<MapProps> = ({ 
  center = [35.6762, 139.6503], // 도쿄 기본 위치
  zoom = 13,
  markers = []
}) => {
  // 기본 마커 데이터 (예시)
  const defaultMarkers = markers.length > 0 ? markers : [
    {
      id: '1',
      position: [35.6762, 139.6503] as [number, number],
      title: '나눔 물품 1',
      description: '전자레인지 나눔합니다',
    },
    {
      id: '2',
      position: [35.6800, 139.6500] as [number, number],
      title: '나눔 물품 2',
      description: '책장 나눔합니다',
    },
    {
      id: '3',
      position: [35.6720, 139.6520] as [number, number],
      title: '나눔 물품 3',
      description: '자전거 나눔합니다',
    },
  ];

  return (
    <div className="map-container">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className="leaflet-map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {defaultMarkers.map((marker) => (
          <Marker key={marker.id} position={marker.position}>
            <Popup>
              <div className="map-popup">
                <h3 className="map-popup-title">{marker.title}</h3>
                {marker.description && (
                  <p className="map-popup-description">{marker.description}</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default Map;

