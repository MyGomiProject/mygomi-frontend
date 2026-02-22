import React, { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { sharePostApi } from '../api/sharePost';
import { addressApi } from '../api/address';
import { useAuth } from '../contexts/AuthContext';
import './Map.css';

const DEFAULT_CENTER: [number, number] = [35.6762, 139.6503]; // 도쿄 기본 위치

// 게시글 마커용 아이콘
const createCustomIcon = () => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="custom-marker-container">
        <svg width="48" height="56" viewBox="0 0 48 56" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- 그림자 -->
          <ellipse cx="24" cy="52" rx="12" ry="4" fill="rgba(0, 0, 0, 0.15)"/>
          <!-- 마커 핀 (둥근 모서리) -->
          <path d="M24 4C13.5 4 5 12.5 5 23C5 34 24 54 24 54C24 54 43 34 43 23C43 12.5 34.5 4 24 4Z" fill="#66bb6a" stroke="#4caf50" stroke-width="1.5"/>
          <!-- 하이라이트 -->
          <ellipse cx="24" cy="22" rx="10" ry="10" fill="#ffffff" opacity="0.25"/>
          <!-- 중심 원 (귀여운 얼굴 느낌) -->
          <circle cx="24" cy="22" r="7" fill="#ffffff"/>
          <circle cx="21" cy="20" r="1.5" fill="#66bb6a"/>
          <circle cx="27" cy="20" r="1.5" fill="#66bb6a"/>
          <path d="M21 24 Q24 26 27 24" stroke="#66bb6a" stroke-width="1.5" stroke-linecap="round" fill="none"/>
        </svg>
      </div>
    `,
    iconSize: [48, 56],
    iconAnchor: [24, 56],
    popupAnchor: [0, -56],
  });
};

// 본인 위치 마커용 아이콘 (파란색으로 구분)
const createUserLocationIcon = () => {
  return L.divIcon({
    className: 'user-location-marker',
    html: `
      <div class="user-location-marker-container">
        <svg width="40" height="47" viewBox="0 0 40 47" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 2C11.2 2 4 9.2 4 18C4 29 20 45 20 45C20 45 36 29 36 18C36 9.2 28.8 2 20 2Z" fill="#2196f3" stroke="#1976d2" stroke-width="1.5"/>
          <circle cx="20" cy="18" r="8" fill="white" opacity="0.9"/>
          <circle cx="20" cy="18" r="4" fill="#2196f3"/>
        </svg>
      </div>
    `,
    iconSize: [40, 47],
    iconAnchor: [20, 47],
    popupAnchor: [0, -47],
  });
};

interface MapMarker {
  id: string;
  position: [number, number];
  title: string;
  description?: string;
  imageUrl?: string;
  imageUrls?: string[];
  category?: string;
  status?: 'OPEN' | 'RESERVED' | 'COMPLETED' | 'DELETED';
  author?: string;
  location?: string;
  createdAt?: string;
  userId?: number; // 본인 게시글 확인용
}

interface MapProps {
  center?: [number, number];
  zoom?: number;
  markers?: MapMarker[];
  onMarkerClick?: (marker: MapMarker) => void;
}

// 지도가 완전히 렌더링되도록 하는 컴포넌트
const MapResizer = () => {
  const map = useMap();

  useEffect(() => {
    const timers = [
      setTimeout(() => map.invalidateSize(), 100),
      setTimeout(() => map.invalidateSize(), 300),
      setTimeout(() => map.invalidateSize(), 500),
    ];
    const handleResize = () => map.invalidateSize();
    window.addEventListener('resize', handleResize);
    const container = map.getContainer().parentElement;
    let resizeObserver: ResizeObserver | null = null;
    if (container && window.ResizeObserver) {
      resizeObserver = new ResizeObserver(() => map.invalidateSize());
      resizeObserver.observe(container);
    }
    return () => {
      timers.forEach(timer => clearTimeout(timer));
      window.removeEventListener('resize', handleResize);
      resizeObserver?.disconnect();
    };
  }, [map]);
  return null;
};

// 지도 중심을 사용자 위치(또는 prop)로 맞추는 컴포넌트
const MapCenterUpdater: React.FC<{
  center: [number, number];
  zoom: number;
}> = ({ center, zoom }) => {
  const map = useMap();
  const lat = center[0];
  const lng = center[1];
  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom, lat, lng]);
  return null;
};

const Map: React.FC<MapProps> = ({
  center: propCenter,
  zoom = 13,
  markers = [],
  onMarkerClick,
}) => {
  const { token, user } = useAuth();

  // 로그인 시 대표 주소 조회 (지도 중심·본인 위치 마커용)
  const { data: addresses } = useQuery({
    queryKey: ['user-addresses'],
    queryFn: () => addressApi.getAddresses(),
    enabled: !!token,
  });

  // 지도 초기 중심: prop > 대표 주소 좌표 > 도쿄
  const userCenter = useMemo((): [number, number] => {
    if (propCenter && propCenter[0] && propCenter[1]) return propCenter;
    const list = Array.isArray(addresses) ? addresses : [];
    const primary = list.find((a) => a.isPrimary) ?? list[0];
    if (primary?.lat != null && primary?.lng != null && primary.lat !== 0 && primary.lng !== 0) {
      return [primary.lat, primary.lng];
    }
    return DEFAULT_CENTER;
  }, [propCenter, addresses]);

  // 본인 위치 마커용 좌표 (대표 주소에 유효한 lat/lng 있을 때만)
  const userPosition = useMemo((): [number, number] | null => {
    const list = Array.isArray(addresses) ? addresses : [];
    const primary = list.find((a) => a.isPrimary) ?? list[0];
    if (primary?.lat != null && primary?.lng != null && primary.lat !== 0 && primary.lng !== 0) {
      return [primary.lat, primary.lng];
    }
    return null;
  }, [addresses]);

  // 5km 이내 주변 게시글 조회
  const { data: nearbyPostsData } = useQuery({
    queryKey: ['nearby-posts-map'],
    queryFn: () => sharePostApi.getNearbyPosts({ page: 0, size: 50 }),
  });

  // API 데이터를 마커 형식으로 변환
  const apiMarkers: MapMarker[] = (() => {
    if (!nearbyPostsData || !nearbyPostsData.data) {
      return [];
    }
    
    // data가 배열인지 확인
    const postsArray = Array.isArray(nearbyPostsData.data) 
      ? nearbyPostsData.data 
      : [];
    
    return postsArray
      .filter((post) => {
        // 본인 게시글은 지도 마커에서 제외
        if (user?.id != null && post.userId != null && post.userId === user.id) {
          return false;
        }
        // 상태 필터링: COMPLETED(나눔 완료)와 DELETED(삭제됨)는 제외, OPEN(나눔 대기)과 RESERVED(예약됨)는 표시
        if (post.status === 'COMPLETED' || post.status === 'DELETED') {
          return false;
        }
        // 좌표가 있는 것만 표시
        return post.lat && post.lng;
      })
      .map((post) => {
        // 지역 정보 구성 (ward + town)
        let locationStr = '';
        if (post.ward) {
          locationStr = post.ward;
          if (post.town) {
            locationStr += ` ${post.town}`;
          }
        } else if (post.location) {
          locationStr = post.location;
        }

        return {
          id: String(post.id),
          position: [post.lat, post.lng] as [number, number],
          title: post.title,
          description: post.description || post.content || '',
          imageUrl: post.thumbnailUrl || post.imageUrls?.[0],
          imageUrls: post.imageUrls || (post.thumbnailUrl ? [post.thumbnailUrl] : []),
          category: post.category,
          status: post.status,
          author: post.author || '익명',
          location: locationStr,
          createdAt: post.createdAt,
          userId: post.userId, // 본인 게시글 확인용
        };
      });
  })();

  // markers prop이 있으면 우선 사용, 없으면 API 데이터만 사용 (더미 없음)
  const defaultMarkers: MapMarker[] = markers.length > 0 ? markers : apiMarkers;

  return (
    <div className="map-container">
      <MapContainer
        center={userCenter}
        zoom={zoom}
        scrollWheelZoom={true}
        className="leaflet-map"
      >
        <MapResizer />
        <MapCenterUpdater center={userCenter} zoom={zoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {userPosition != null && (
          <Marker position={userPosition} icon={createUserLocationIcon()}>
            <Popup>내 위치</Popup>
          </Marker>
        )}
        {defaultMarkers.map((marker) => (
          <Marker key={marker.id} position={marker.position} icon={createCustomIcon()}>
            <Popup>
              <div className="map-popup">
                {marker.imageUrl && (
                  <div className="map-popup-image">
                    <img src={marker.imageUrl} alt={marker.title} />
                  </div>
                )}
                <h3 className="map-popup-title">{marker.title}</h3>
                {onMarkerClick && (
                  <button 
                    className="map-popup-detail-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkerClick(marker);
                    }}
                  >
                    자세히 보기
                  </button>
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

