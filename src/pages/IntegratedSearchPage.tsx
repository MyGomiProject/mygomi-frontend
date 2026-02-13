import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { itemsApi } from '../api/items';
import { DEFAULT_WARD, DEFAULT_ADDRESS_ID } from '../constants/constants';
import { fetchCalendar } from '../api/calendar';
import { WASTE_TYPE_LABELS } from '../constants/waste';

import Header from '../components/Header';
import ParallaxBackground from '../components/ParallaxBackground';
import SearchBox from '../components/SearchBox';
import ItemDetailView from '../components/ItemDetailView';
import NotFoundSection from '../components/NotFoundSection';
import Loading from '../components/Loading';
import ErrorDisplay from '../components/ErrorDisplay';

import { useAuth } from '../contexts/AuthContext';

import './HomePage.css';
import './IntegratedSearchPage.css';

const IntegratedSearchPage: React.FC = () => {
  const navigate = useNavigate();
  // 경고 해결: 안 쓰는 setSearchParams 삭제
  const [searchParams] = useSearchParams();

  const { user } = useAuth();
  // 경고 해결: 이제 addressId를 fetchCalendar에서 사용하므로 에러 안 남!
  const addressId = user?.address?.id || DEFAULT_ADDRESS_ID;

  const urlQuery = searchParams.get('q') || '';
  const urlWard = searchParams.get('ward') || DEFAULT_WARD;

  const [query, setQuery] = useState(urlQuery);
  
  useEffect(() => {
    setQuery(urlQuery);
  }, [urlQuery]);

  const displayWard = user?.address?.ward || urlWard;

  const { data: searchResults, isLoading: isItemLoading, isError: isItemError } = useQuery({
    queryKey: ['items-search', urlQuery, displayWard, !!user],
    queryFn: () => itemsApi.searchItems(urlQuery, displayWard, !!user),
    enabled: !!urlQuery,
  });

  // 경고 해결: today를 useMemo 안으로 분리하여 의존성(dependency) 경고 완벽 해결
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // 에러 해결: fetchCalendar에 addressId를 넣어서 인자 3개 맞춰줌 (TS2554 해결)
  const { data: calendarEvents, isLoading: isCalendarLoading } = useQuery({
    queryKey: ['calendar', addressId, today.getFullYear(), today.getMonth() + 1, !!user],
    queryFn: () => fetchCalendar(addressId, today.getFullYear(), today.getMonth() + 1),
    enabled: !!urlQuery,
    staleTime: 1000 * 60 * 60, // 1시간 캐시 유지!
  });

  const combinedData = useMemo(() => {
    if (!searchResults || searchResults.length === 0) return null;

    const targetItem = searchResults[0];
    const wasteType = targetItem.wasteType;

    const events = calendarEvents || [];
    const matchedEvents = events.filter(
      (event) => event.extendedProps?.wasteType === wasteType
    );

    const uniqueWeekdays = Array.from(new Set(
      matchedEvents.map(event => {
        const date = new Date(event.start);
        return new Intl.DateTimeFormat('ko-KR', { weekday: 'short' }).format(date);
      })
    )).sort();

    const futureEvents = matchedEvents.filter(event => {
      const eventDate = new Date(event.start);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate.getTime() >= today.getTime();
    });

    let nextPickupText = '';
    if (futureEvents.length > 0) {
      futureEvents.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
      const nextDate = new Date(futureEvents[0].start);
      nextPickupText = `${nextDate.getMonth() + 1}월 ${nextDate.getDate()}일`;
    }

    return {
      item: targetItem,
      label: WASTE_TYPE_LABELS[wasteType],
      weekdays: uniqueWeekdays,
      nextPickupText: nextPickupText, // 💡 에러 해결: 리턴 객체에 이걸 꼭 넣어줘야 합니다!
    };
  }, [searchResults, calendarEvents, today]);

  const handleSearch = () => {
    if (query.trim()) {
      navigate(`/integrated-search?q=${encodeURIComponent(query)}&ward=${encodeURIComponent(displayWard)}`);
    }
  };

  const isLoading = isItemLoading || (urlQuery && isCalendarLoading);

  return (
    <div className="home-page">
      <ParallaxBackground />
      <Header />

      <main className="main-content">
        <section className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">무엇을 버리고 싶으신가요?</h1>
            <p className="hero-subtitle">
              <span className="highlight">{displayWard}</span> 지역의 배출 정보를 알려드립니다.
              
              {!user && (
                <span style={{ display: 'block', fontSize: '14px', color: '#ff6b6b', marginTop: '8px' }}>
                  ※ 로그인을 하시면 현재 설정된 내 동네의 수거 일정을 바로 확인할 수 있습니다.
                </span>
              )}
            </p>
          </div>
        </section>

        <section className="search-section">
          <SearchBox 
            value={query} 
            onChange={setQuery} 
            onSearch={handleSearch} 
          />
        </section>

        <section className="bottom-section">
          <div className="bottom-inner search-mode">
            <div className="search-results-container">
              {isItemError ? (
                <ErrorDisplay 
                  title="데이터 로드 실패"
                  message="서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요."
                  onRetry={() => window.location.reload()}
                />
              ) : isLoading ? (
                <Loading message="분류 정보와 수거 일정을 분석 중..." />
              ) : combinedData ? (
                <div className="result-wrapper">
                  <ItemDetailView 
                    item={combinedData.item} 
                    weekdays={combinedData.weekdays} 
                  />

                  {combinedData.nextPickupText && (
                    <div style={{ marginTop: '16px', padding: '16px', backgroundColor: '#e3f2fd', borderRadius: '8px', textAlign: 'center', color: '#1565c0', fontWeight: 'bold' }}>
                      이번 달 가장 가까운 수거일은 {combinedData.nextPickupText} 입니다! 🗑️
                    </div>
                  )}
                </div>
              ) : (
                urlQuery && <NotFoundSection />
              )}

              {!urlQuery && (
                <div className="search-info-text">
                  <p>궁금한 쓰레기나 물품 이름을 입력해주세요.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default IntegratedSearchPage;