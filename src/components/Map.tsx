import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { sharePostApi, SharePostResponse } from '../api/sharePost';
import { addressApi } from '../api/address';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Map.css';

// 커스텀 마커 아이콘 생성 함수 (게시글용 - 초록색)
const createCustomIcon = () => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="custom-marker-container">
        <svg width="32" height="37" viewBox="0 0 48 56" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    iconSize: [32, 37],
    iconAnchor: [16, 37],
    popupAnchor: [0, -37],
  });
};

// 본인 위치 마커 아이콘 생성 함수 (파란색)
const createUserLocationIcon = () => {
  return L.divIcon({
    className: 'user-location-marker',
    html: `
      <div class="user-location-marker-container">
        <svg width="32" height="37" viewBox="0 0 48 56" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- 그림자 -->
          <ellipse cx="24" cy="52" rx="12" ry="4" fill="rgba(0, 0, 0, 0.15)"/>
          <!-- 마커 핀 (파란색) -->
          <path d="M24 4C13.5 4 5 12.5 5 23C5 34 24 54 24 54C24 54 43 34 43 23C43 12.5 34.5 4 24 4Z" fill="#2196F3" stroke="#1976D2" stroke-width="1.5"/>
          <!-- 하이라이트 -->
          <ellipse cx="24" cy="22" rx="10" ry="10" fill="#ffffff" opacity="0.25"/>
          <!-- 중심 원 -->
          <circle cx="24" cy="22" r="7" fill="#ffffff"/>
          <!-- 위치 아이콘 -->
          <circle cx="24" cy="22" r="4" fill="#2196F3"/>
        </svg>
      </div>
    `,
    iconSize: [32, 37],
    iconAnchor: [16, 37],
    popupAnchor: [0, -37],
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
    // 지도가 준비되면 크기 재계산 (여러 번 호출하여 확실하게)
    const timers = [
      setTimeout(() => map.invalidateSize(), 100),
      setTimeout(() => map.invalidateSize(), 300),
      setTimeout(() => map.invalidateSize(), 500),
    ];
    
    // 윈도우 리사이즈 시에도 크기 재계산
    const handleResize = () => {
      map.invalidateSize();
    };
    window.addEventListener('resize', handleResize);
    
    // ResizeObserver를 사용하여 부모 컨테이너 크기 변경 감지
    const container = map.getContainer().parentElement;
    let resizeObserver: ResizeObserver | null = null;
    
    if (container && window.ResizeObserver) {
      resizeObserver = new ResizeObserver(() => {
        map.invalidateSize();
      });
      resizeObserver.observe(container);
    }
    
    return () => {
      timers.forEach(timer => clearTimeout(timer));
      window.removeEventListener('resize', handleResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [map]);

  return null;
};

// 지도 중심을 업데이트하는 컴포넌트
const MapCenterUpdater: React.FC<{ center: [number, number]; isInitialLoad?: boolean }> = ({ center, isInitialLoad }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center && center[0] && center[1] && !isNaN(center[0]) && !isNaN(center[1])) {
      // 초기 로드일 때는 부드러운 애니메이션 없이 즉시 이동
      if (isInitialLoad) {
        map.setView(center, map.getZoom(), { animate: false });
      } else {
        // 이후 업데이트는 부드러운 애니메이션으로 이동
        map.setView(center, map.getZoom());
      }
    }
  }, [center, map, isInitialLoad]);

  return null;
};

const Map: React.FC<MapProps> = ({ 
  center: propCenter,
  zoom = 13,
  markers = [],
  onMarkerClick
}) => {
  const { user } = useAuth();

  // 사용자 대표 주소 조회
  const { data: addresses } = useQuery({
    queryKey: ['user-addresses'],
    queryFn: () => addressApi.getAddresses(),
    enabled: !!user, // 로그인한 사용자만 조회
  });

  // 대표 주소에서 좌표 추출
  const userCenter = useMemo(() => {
    if (propCenter) {
      return propCenter; // props로 전달된 center가 있으면 우선 사용
    }

    if (addresses && addresses.length > 0) {
      const primaryAddress = addresses.find(addr => addr.isPrimary);
      if (primaryAddress && primaryAddress.lat && primaryAddress.lng && 
          primaryAddress.lat !== 0 && primaryAddress.lng !== 0) {
        return [primaryAddress.lat, primaryAddress.lng] as [number, number];
      }
    }

    // 기본값: 도쿄 중심 (주소가 로드되지 않았을 때만 사용)
    return [35.6762, 139.6503] as [number, number];
  }, [propCenter, addresses]);

  // 주소가 로드되었는지 확인 (초기 로드 여부 판단)
  const isAddressLoaded = addresses !== undefined;
  const hasValidCenter = userCenter[0] !== 35.6762 || userCenter[1] !== 139.6503 || propCenter !== undefined;

  // 5km 이내 주변 게시글 조회
  const { data: nearbyPostsData } = useQuery({
    queryKey: ['nearby-posts-map'],
    queryFn: () => sharePostApi.getNearbyPosts({ page: 0, size: 50 }),
  });

  // API 데이터를 마커 형식으로 변환
  const apiMarkers: MapMarker[] = (() => {
    // props로 전달된 markers가 있으면 우선 사용
    if (markers.length > 0) {
      return markers;
    }

    if (!nearbyPostsData || !nearbyPostsData.data) {
      return [];
    }
    
    // data가 배열인지 확인
    const postsArray = Array.isArray(nearbyPostsData.data) 
      ? nearbyPostsData.data 
      : [];
    
    return postsArray
      .filter((post: SharePostResponse) => {
        // 상태 필터링: COMPLETED(나눔 완료)와 DELETED(삭제됨)는 제외, OPEN(나눔 대기)과 RESERVED(예약됨)는 표시
        if (post.status === 'COMPLETED' || post.status === 'DELETED') {
          return false;
        }
        // 좌표가 있는 것만 표시
        return post.lat && post.lng;
      })
      .map((post: SharePostResponse) => {
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

        // 이미지 URL 처리 (상대 경로인 경우 절대 경로로 변환)
        const getImageUrl = (url: string | undefined): string => {
          if (!url) return '';
          if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
          }
          const baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';
          return `${baseURL}${url.startsWith('/') ? url : `/${url}`}`;
        };

        return {
          id: String(post.id),
          position: [post.lat, post.lng] as [number, number],
          title: post.title,
          description: post.description || post.content || '',
          imageUrl: getImageUrl(post.thumbnailUrl || post.imageUrls?.[0]),
          imageUrls: post.imageUrls?.map(getImageUrl) || (post.thumbnailUrl ? [getImageUrl(post.thumbnailUrl)] : []),
          category: post.category,
          status: post.status,
          author: post.author || '익명',
          location: locationStr,
          createdAt: post.createdAt,
          userId: post.userId, // 본인 게시글 확인용
        };
      });
  })();

  // 표시할 마커 결정 (API 데이터 우선, 없으면 props로 전달된 markers)
  const displayMarkers = apiMarkers.length > 0 ? apiMarkers : markers;

  return (
    <div className="map-container">
      <MapContainer
        center={userCenter}
        zoom={zoom}
        scrollWheelZoom={true}
        className="leaflet-map"
      >
        <MapResizer />
        <MapCenterUpdater center={userCenter} isInitialLoad={isAddressLoaded && hasValidCenter} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* 본인 위치 마커 */}
        {!propCenter && addresses && addresses.length > 0 && 
          addresses.find(addr => addr.isPrimary && addr.lat && addr.lng) && (
          <Marker position={userCenter} icon={createUserLocationIcon()}>
            <Popup>
              <div className="map-popup">
                <h3 className="map-popup-title">📍 내 위치</h3>
                <p style={{ margin: '0.5rem 0', fontSize: '0.9rem', color: '#666' }}>
                  대표 주소 위치
                </p>
              </div>
            </Popup>
          </Marker>
        )}
        {/* 게시글 마커들 */}
        {displayMarkers.map((marker) => (
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

