import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { itemsApi } from '../api/items';
import { DEFAULT_WARD, DEFAULT_ADDRESS_ID, TOKYO_WARDS_KO } from '../constants/constants';
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

// useMemo 의존성 경고 제거용
const weekdayFormatter = new Intl.DateTimeFormat('ko-KR', { weekday: 'short' });

const IntegratedSearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const addressId = user?.address?.id || DEFAULT_ADDRESS_ID;
  const urlQuery = searchParams.get('q') || '';
  const urlWard = searchParams.get('ward') || DEFAULT_WARD;

  const [query, setQuery] = useState(urlQuery);

  // 지역 선택 시 URL을 업데이트 - 문자열을 직접 받기
  const handleWardChange = (newWard: string) => {
  setSearchParams({ q: urlQuery, ward: newWard });
};

  useEffect(() => {
    setQuery(urlQuery);
  }, [urlQuery]);

  const displayWard = user?.address?.ward || urlWard;

  const { data: searchResults, isLoading: isItemLoading, isError: isItemError } = useQuery({
    queryKey: ['items-search', urlQuery, displayWard, !!user],
    queryFn: () => itemsApi.searchItems(urlQuery, displayWard, !!user),
    staleTime: 1000 * 60 * 5, // 5분동안은 데이터 유지(재요청x)
    refetchOnWindowFocus: false, 
  });

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
    staleTime: 1000 * 60 * 60, // 1시간
    refetchOnWindowFocus: false,
  });

// 🚀 [최적화] 캘린더 데이터를 미리 '이름표(Map)'로 정리
  // 캘린더 데이터를 Map으로 변환 (최적화)
  const eventsByWasteType = useMemo(() => {
    const map = new Map<string, any[]>();
    if (!calendarEvents) return map;

    calendarEvents.forEach((event: any) => {
      const type = event.extendedProps?.wasteType;
      if (type) {
        if (!map.has(type)) map.set(type, []);
        map.get(type)!.push(event);
      }
    });
    return map;
  }, [calendarEvents]); // 캘린더 데이터가 오면 Map을 다시 만듦

  // 2. 최종 결과 계산
  const processedResults = useMemo(() => {
    if (!searchResults || searchResults.length === 0) return [];

    return searchResults.map((item: any) => {
      const mappedItem = {
        ...item,
        nameKo: item.name || item.nameKo || '이름 없음'
      };

      const wasteType = item.wasteType;

      // Map에서 바로 꺼내옴 (고속 조회)
      const matchedEvents = eventsByWasteType.get(wasteType) || [];

      // 요일 추출 (weekdayFormatter는 컴포넌트 밖의 것을 씀)
      const weekdays = Array.from(new Set(
        matchedEvents.map(event => {
          const date = new Date(event.start);
          return weekdayFormatter.format(date);
        })
      )).sort();

      // 미래 일정 필터링
      const futureEvents = matchedEvents.filter(event => {
        const eventDate = new Date(event.start);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate.getTime() >= today.getTime();
      });

      let nextPickupText = '';
      if (futureEvents.length > 0) {
        futureEvents.sort((a: any, b: any) => new Date(a.start).getTime() - new Date(b.start).getTime());
        const nextDate = new Date(futureEvents[0].start);
        nextPickupText = `${nextDate.getMonth() + 1}월 ${nextDate.getDate()}일`;
      }

      return {
        item: mappedItem,
        label: WASTE_TYPE_LABELS[wasteType as keyof typeof WASTE_TYPE_LABELS],
        weekdays,
        nextPickupText
      };
    });
  }, [searchResults, eventsByWasteType, today]);



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
              {!user ? (
                "지역을 선택하고 궁금한 물품을 검색해보세요."
              ) : (
                <>
                  <span className="highlight">{displayWard}</span> 지역의 배출 정보를 알려드립니다.
                </>
              )}
            </p>
          </div>
        </section>

        <section className="search-section">
          <SearchBox 
            value={query} 
            onChange={setQuery} 
            onSearch={handleSearch}
            // 비로그인(!user)일 때만 드롭다운 활성화
            showWardSelector={!user} 
            wards={TOKYO_WARDS_KO}
            selectedWard={urlWard} 
            onWardChange={handleWardChange}
          />
        </section>

        {/* ----------------------------------------------------------------------
            bottom-section: 검색 결과 및 아이템 상세 정보 렌더링
        ----------------------------------------------------------------------- */}
        <section className="bottom-section">
          <div className="bottom-inner search-mode">
            <div className="search-results-container">
              {isItemError ? (
                <ErrorDisplay 
                  title="데이터 로드 실패"
                  message="서버 연결에 실패했습니다."
                  onRetry={() => window.location.reload()}
                />
              ) : isLoading ? (
                <Loading message="분류 정보와 수거 일정을 분석 중..." />
              ) : processedResults.length > 0 ? (
                <div className="results-list-wrapper">
              {/* 검색 결과 요약 헤더 */}
                <div className="search-summary-header">
                  <h2>
                    '<span className="highlight-text">{urlQuery}</span>'에 대한 검색 결과입니다.
                    <span className="search-count">(총 {processedResults.length}건)</span>
                  </h2>
                </div>

                {/* 모든 결과를 카드로 나열 */}
                {processedResults.map((result, index) => (
  <React.Fragment key={index}>
    {/* 1. 결과 카드 */}
    <div className="result-card-item">
      <ItemDetailView 
        item={result.item} 
        weekdays={result.weekdays} 
      />
      {result.nextPickupText && (
        <div className="next-pickup-info-box">
          📅 {result.item.nameKo}의 가장 가까운 수거일은 <strong>{result.nextPickupText}</strong> 입니다!
        </div>
      )}
    </div>

    {/* 💡 2. 점선 분리: 마지막 카드가 아닐 때만 점선을 "따로" 그려줍니다 */}
    {index < processedResults.length - 1 && (
      <div className="card-dashed-line"></div>
    )}
  </React.Fragment>
))}
                </div>
              ) : (
                // 검색 결과가 없는 경우
                urlQuery && <NotFoundSection />
              )}

              {/* 검색어가 없을 때의 초기 안내 */}
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