/* src/pages/IntegratedSearchPage.tsx */
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { itemsApi } from '../api/items';
import { useDebounce } from '../hooks/useDebounce';

// ★ constants에서 가져온 기본값
import { DEFAULT_WARD } from '../constants/constants'; 

// 디자인 컴포넌트들
import Header from '../components/Header';
import ParallaxBackground from '../components/ParallaxBackground';
import SearchBox from '../components/SearchBox';
import ItemDetailView from '../components/ItemDetailView'; 
import NotFoundSection from '../components/NotFoundSection';
import Loading from '../components/Loading'; 

// 스타일
import './HomePage.css'; 
import './IntegratedSearchPage.css'; 

const IntegratedSearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // URL에서 파라미터 가져오기 (없으면 DEFAULT_WARD 사용)
  const urlQuery = searchParams.get('q') || '';
  const urlWard = searchParams.get('ward') || DEFAULT_WARD;

  // 내부 검색창 상태
  const [query, setQuery] = useState(urlQuery);
  const debouncedQuery = useDebounce(query, 300);

  // URL이 바뀌면(헤더 검색 등) 내부 상태 동기화
  useEffect(() => {
    setQuery(urlQuery);
  }, [urlQuery]);

  // React Query로 데이터 가져오기
  const { data: searchResults, isLoading, isFetched } = useQuery({
    queryKey: ['items-search', debouncedQuery, urlWard],
    queryFn: () => itemsApi.searchItems(debouncedQuery, urlWard),
    enabled: debouncedQuery.length > 0,
  });

  // 검색 핸들러 (이 페이지 안에서 다시 검색할 때)
  const handleSearch = () => {
    if (query.trim()) {
      navigate(`/integrated-search?q=${encodeURIComponent(query)}&ward=${encodeURIComponent(urlWard)}`);
    }
  };

  const topResult = searchResults && searchResults.length > 0 ? searchResults[0] : null;

  return (
    <div className="home-page">
      {/* 1. 배경과 헤더를 HomePage와 똑같이 배치 */}
      <ParallaxBackground />
      <Header />

      <main className="main-content">
        {/* 2. Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">무엇을 버리고 싶으신가요?</h1>
            <p className="hero-subtitle">
              현재 <span className="highlight">{urlWard}</span> 지역의 분리수거 정보를 찾고 있습니다.
            </p>
          </div>
        </section>

        {/* 3. 검색창 섹션 */}
        <section className="search-section">
          <SearchBox 
            value={query} 
            onChange={setQuery} 
            onSearch={handleSearch} 
          />
        </section>

        {/* 4. 결과 섹션 */}
        <section className="bottom-section">
          <div className="bottom-inner search-mode">
            
            <div className="search-results-container">
              {isLoading ? (
                <Loading message="분류 정보를 찾는 중..." />
              ) : topResult ? (
                // 결과가 있을 때 카드 뷰
                <ItemDetailView item={topResult} />
              ) : (
                // 결과가 없을 때
                debouncedQuery && isFetched && <NotFoundSection />
              )}
              
              {/* 검색어가 없을 때 안내 문구 */}
              {!debouncedQuery && (
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