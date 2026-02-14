import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { sharePostApi } from '../api/sharePost';
import './Map.css';

// 커스텀 마커 아이콘 생성 함수
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

const Map: React.FC<MapProps> = ({ 
  center = [35.6762, 139.6503], // 도쿄 기본 위치
  zoom = 14,
  markers = [],
  onMarkerClick
}) => {
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
      .filter((post) => post.status === 'OPEN' && post.lat && post.lng) // OPEN 상태이고 좌표가 있는 것만
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

  // markers prop이 있으면 우선 사용, 없으면 API 데이터 사용, 둘 다 없으면 기본 마커 사용
  const defaultMarkers: MapMarker[] = markers.length > 0 ? markers : apiMarkers.length > 0 ? apiMarkers : [
    {
      id: '1',
      position: [35.6762, 139.6503] as [number, number],
      title: '전자레인지 나눔합니다',
      description: '사용 잘하는 전자레인지입니다. 깨끗하게 사용했어요.',
      imageUrl: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=200&h=200&fit=crop',
      imageUrls: [
        'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=600&h=600&fit=crop',
      ],
      category: 'ELECTRONICS',
      status: 'OPEN',
      author: '지윤',
      location: '신주쿠구',
      createdAt: '2024-01-29',
    },
    {
      id: '2',
      position: [35.6800, 139.6500] as [number, number],
      title: '책장 나눔합니다',
      description: '작은 책장 나눔합니다. 상태 양호합니다.',
      imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200&h=200&fit=crop',
      imageUrls: [
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=600&fit=crop',
      ],
      category: 'FURNITURE',
      status: 'RESERVED',
      author: '신규구',
      location: '시부야구',
      createdAt: '2024-01-28',
    },
    {
      id: '3',
      position: [35.6720, 139.6520] as [number, number],
      title: '자전거 나눔합니다',
      description: '자전거 나눔합니다. 잘 타고 다녔어요.',
      imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop',
      imageUrls: [
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop',
      ],
      category: 'ETC',
      status: 'COMPLETED',
      author: '지험',
      location: '미나토구',
      createdAt: '2024-01-27',
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
        <MapResizer />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
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

