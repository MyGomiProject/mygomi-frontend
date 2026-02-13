import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// 1 - 파일 구조에 맞춰 import 경로 확인
import Header from '../components/Header';
import ParallaxBackground from '../components/ParallaxBackground';
import Map from '../components/Map';
import Loading from '../components/Loading';
import ErrorDisplay from '../components/ErrorDisplay';
import SearchBox from '../components/SearchBox';

// 2 - 커스텀 훅 및 상수 import 
import { useWeeklyCalendar } from '../hooks/useCalendar';
import { useAuth } from '../contexts/AuthContext'; 
import { DEFAULT_ADDRESS_ID } from '../constants/constants';
import './HomePage.css';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    navigate(`/items/search?q=${encodeURIComponent(searchQuery)}`);
  };

  // 1. 날짜 포맷 함수
const formatDate = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 2. 현재 달력 기준 날짜
  const [currentDate, setCurrentDate] = useState(new Date());
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // 이전 달 이동
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };
  // 다음 달 이동
  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };
  // 오늘로 이동
  const handleGoToday = () => {
    setCurrentDate(new Date());
  };

  // 3. 월간 달력 날짜 계산 (42일 그리드)
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const startDay = firstDayOfMonth.getDay(); // 0:일, 1:월...
  const diff = startDay;
  
  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(firstDayOfMonth.getDate() - diff);

  const calendarDaysRange = Array.from({ length: 42 }).map((_, i) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    return {
      date,
      dateStr: formatDate(date),
      isCurrentMonth: date.getMonth() === currentMonth
    };
  });

  // 4. API 호출 
  // 로그인한 유저라면 유저의 addressId를, 아니면 constants.ts의 1619를 사용
  const addressId = user?.id ? (user as any).addressId || DEFAULT_ADDRESS_ID : DEFAULT_ADDRESS_ID;
  // 캘린더 데이터 조회 - year와 month 사용
  const { data: events, isLoading, error } = useWeeklyCalendar({ 
    addressId, 
    year: currentYear, 
    month: currentMonth + 1, // 0-based에서 1-based로 변환
    isLoggedIn: !!user 
  });

  // 5. 쓰레기 라벨 설정
  const wasteTypeLabels: Record<string, { label: string; emoji: string; class: string }> = {
    BURNABLE: { label: '가연성', emoji: '🔥', class: 'burnable' },
    NON_BURNABLE: { label: '불연성', emoji: '🗑️', class: 'non-burnable' },
    PLASTIC: { label: '플라스틱', emoji: '♻️', class: 'plastic' },
    CAN_BOTTLE: { label: '병/캔', emoji: '🍾', class: 'can-bottle' },
    PAPER: { label: '종이', emoji: '📄', class: 'paper' },
  };

  return (
    <div className="home-page">
      <ParallaxBackground />
      <Header />
      <main className="main-content">
        <section className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">복잡한 분리수거, MYGOMI와 함께 쉽게</h1>
            <p className="hero-subtitle">우리 동네 분리수거 요일과 배출 방법을 확인해 보세요.</p>
          </div>
        </section>

        <section className="search-section">
          <SearchBox 
          value={searchQuery} 
          onChange={setSearchQuery} 
          onSearch={handleSearch} // 드디어 클릭 이벤트 연결!
        />
        </section>

        <section className="bottom-section">
          <div className="bottom-inner">
            <div className="panel panel-left">
              <div className="panel-header">
                <div className="panel-header-top">
                  <h2 className="panel-title">{currentYear}년 {currentMonth + 1}월 배출 요일</h2>
                  <div className="calendar-controls">
                    <button onClick={handlePrevMonth}>&lt; 이전달</button>
                    <button onClick={handleGoToday}>오늘</button>
                    <button onClick={handleNextMonth}>다음달 &gt;</button>
                  </div>
                </div>
              </div>
              <div className="panel-placeholder calendar-placeholder">
                <div className="calendar-grid">
                  {/* 요일 헤더: 화살표 뒤에 소괄호 '('를 쓰는 것이 포인트! */}
                  {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
                    <div key={day} className="calendar-weekday-header">
                      {day}
                    </div>
                  ))}

                  {/* 날짜 데이터 렌더링 부분 */}
                  {isLoading ? (
                    <div className="calendar-loading">로딩 중...</div>
                  ) : (
                    calendarDaysRange.map((d, index) => {
                      const dayEvents = Array.isArray(events) ? events.filter(e => e.start === d.dateStr) : [];
                      const isToday = d.dateStr === formatDate(new Date());

                      return (
                        <div 
                          key={index} 
                          className={`calendar-day ${!d.isCurrentMonth ? 'not-current' : ''} ${isToday ? 'is-today' : ''}`}
                        >
                          <span className="day-number">{d.date.getDate()}</span>
                          <div className="waste-list">
                            {dayEvents.map((ev, i) => {
                              const type = ev.extendedProps?.wasteType || '';
                              const info = wasteTypeLabels[type];
                              return info ? (
                                <div key={i} className={`waste-item ${info.class}`}>
                                  <span className="waste-emoji">{info.emoji}</span>
                                  <span className="waste-label-text">{info.label}</span>
                                </div>
                              ) : null;
                            })}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <div className="panel panel-right">
              <div className="panel-header">
                <h2 className="panel-title">근처 나눔 지도</h2>
              </div>
              <div className="panel-placeholder map-placeholder">
                <Map />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;