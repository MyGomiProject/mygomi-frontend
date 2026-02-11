import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

// [기존 유지] API 및 상수
import { itemsApi } from '../api/items';
import { DEFAULT_WARD, DEFAULT_ADDRESS_ID } from '../constants/constants';

// [추가] Step 2에서 만든 Calendar API 및 상수
import { fetchCalendar } from '../api/calendar'; 
import { WASTE_TYPE_LABELS } from '../constants/waste'; 

// [기존 유지] 디자인 컴포넌트
import Header from '../components/Header';
import ParallaxBackground from '../components/ParallaxBackground';
import SearchBox from '../components/SearchBox';
import ItemDetailView from '../components/ItemDetailView'; 
import NotFoundSection from '../components/NotFoundSection';
import Loading from '../components/Loading'; 
import ErrorDisplay from '../components/ErrorDisplay'; // 에러 처리를 위해 필요

// [기존 유지] 스타일
import './HomePage.css'; 
import './IntegratedSearchPage.css'; 

// [추가] 날짜 포맷 헬퍼 (YYYY-MM-DD)
const formatDate = (date: Date) => date.toISOString().split('T')[0];

const IntegratedSearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // [추가] 임시 유저 주소 ID (로그인 구현 전이므로 고정값 사용)
  // 추후 AuthContext에서 user.addressId로 교체해야 합니다.
  const CURRENT_ADDRESS_ID = DEFAULT_ADDRESS_ID;

  // URL 파라미터 가져오기
  const urlQuery = searchParams.get('q') || '';
  const urlWard = searchParams.get('ward') || DEFAULT_WARD;

  const [query, setQuery] = useState(urlQuery);
  
  // URL 동기화
  useEffect(() => {
    setQuery(urlQuery);
  }, [urlQuery]);

  // --------------------------------------------------------------------------
  // 1. 아이템 검색 (기존 로직 유지 + 에러 상태 추가)
  // --------------------------------------------------------------------------
  const { 
    data: searchResults, 
    isLoading: isItemLoading,
    isError: isItemError 
  } = useQuery({
    queryKey: ['items-search'],
    queryFn: () => itemsApi.searchItems(urlQuery),
    enabled: !!urlQuery, 
    staleTime: 1000 * 60 * 5, // 5분 캐시
  });

  // --------------------------------------------------------------------------
  // 2. [추가] 달력 일정 조회 (병렬 처리)
  // --------------------------------------------------------------------------
  // 오늘부터 30일 뒤까지의 일정을 미리 가져옵니다.
  const today = new Date();
  const nextMonth = new Date();
  nextMonth.setDate(today.getDate() + 30);

  const { 
    data: calendarEvents,
    isLoading: isCalendarLoading
  } = useQuery({
    queryKey: ['calendar', CURRENT_ADDRESS_ID],
    queryFn: () => fetchCalendar(
      CURRENT_ADDRESS_ID, 
      today.getFullYear(),
      today.getMonth() + 1
    ),
    enabled: !!urlQuery, // 검색어가 있을 때만 실행
    staleTime: 1000 * 60 * 60, // 1시간 캐시
  });

  // --------------------------------------------------------------------------
  // 3. [추가] 데이터 결합 로직 (Matching Logic)
  // --------------------------------------------------------------------------
  const combinedData = useMemo(() => {
    // 검색 결과가 없으면 병합할 필요 없음
    if (!searchResults || searchResults.length === 0) return null;

    const targetItem = searchResults[0]; // 가장 정확도 높은 첫 번째 아이템
    const wasteType = targetItem.wasteType; // 예: 'BURNABLE'

    // [핵심] Item의 wasteType과 Calendar의 extendedProps.wasteType이 일치하는지 확인
    // Step 2에서 타입을 엄격하게 맞췄기 때문에 안전하게 비교 가능
    const matchedEvents = calendarEvents?.filter(
      (event) => event.extendedProps?.wasteType === wasteType
    ) || [];

    // [UI용] 요일 추출 (중복 제거) -> 예: ["화", "금"]
    const uniqueWeekdays = Array.from(new Set(
      matchedEvents.map(event => {
        const date = new Date(event.start);
        return new Intl.DateTimeFormat('ko-KR', { weekday: 'short' }).format(date);
      })
    )).sort(); // 필요 시 요일 순서 정렬 로직 추가 가능

    return {
      item: targetItem,
      label: WASTE_TYPE_LABELS[wasteType], // 한글 라벨 (가연성, 이모지 등)
      events: matchedEvents,
      weekdays: uniqueWeekdays, 
    };
  }, [searchResults, calendarEvents]);

  // --------------------------------------------------------------------------
  // 핸들러 & 렌더링
  // --------------------------------------------------------------------------
  const handleSearch = () => {
    if (query.trim()) {
      navigate(`/integrated-search?q=${encodeURIComponent(query)}&ward=${encodeURIComponent(urlWard)}`);
    }
  };

  // 두 쿼리 중 하나라도 로딩 중이면 로딩 표시
  const isLoading = isItemLoading || (urlQuery && isCalendarLoading);

  return (
    <div className="home-page">
      <ParallaxBackground />
      <Header />

      <main className="main-content">
        <section className="hero-section">
          <div className="hero-content">
            {/* [변경] 문구를 검색 결과 맥락에 맞게 수정 */}
            <h1 className="hero-title">무엇을 버리고 싶으신가요?</h1>
            <p className="hero-subtitle">
              <span className="highlight">{urlWard}</span> 지역의 배출 정보를 알려드립니다.
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
          {/* search-mode 클래스는 CSS에서 Grid를 풀고 Block으로 만들기 위해 유지 */}
          <div className="bottom-inner search-mode">
            
            <div className="search-results-container">
              {isItemError ? (
                // ★ 에러 발생 시 여기만 에러 컴포넌트로 변경됨
                <ErrorDisplay 
                  title="데이터 로드 실패"
                  message="서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요."
                  onRetry={() => window.location.reload()}
                />
              ) : isLoading ? (
                <Loading message="분류 정보와 수거 일정을 분석 중..." />
              ) : combinedData ? (
                // [변경] ItemDetailView 단독 사용 -> 결과 래퍼(Wrapper)로 감싸서 일정 카드 추가
                <div className="result-wrapper">
                  
                  {/* 1. 아이템 상세 정보 */}
                  <ItemDetailView item={combinedData.item} />

                  {/* 2. [추가] 배출 요일 정보 카드 */}
                  <div className="schedule-info-card">
                    <div className="schedule-header">
                      <span className="schedule-icon">📅</span>
                      <h3>우리 동네 배출 안내</h3>
                    </div>
                    
                    <div className="schedule-content">
                      <p className="waste-definition">
                        <strong>{combinedData.item.nameKo}</strong>은(는)&nbsp;
                        <span className={`waste-tag ${combinedData.item.wasteType.toLowerCase()}`}>
                          {combinedData.label?.emoji} {combinedData.label?.ko}
                        </span>입니다.
                      </p>

                      {combinedData.events.length > 0 ? (
                        <div className="schedule-details">
                          <p className="schedule-days-text">
                            {urlWard}에서는 매주&nbsp;
                            <span className="highlight-days">
                              {combinedData.weekdays.join(', ')}요일
                            </span>에 수거합니다.
                          </p>
                          <p className="schedule-next">
                            다음 수거일: <strong>{combinedData.events[0].start}</strong>
                          </p>
                        </div>
                      ) : (
                        <div className="schedule-empty">
                          <p>⚠️ 예정된 수거 일정이 없습니다.</p>
                          <small>달력 데이터가 아직 업데이트되지 않았을 수 있습니다.</small>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              ) : (
                // 검색어는 있는데 결과가 없을 때
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