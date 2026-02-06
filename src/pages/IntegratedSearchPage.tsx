/* src/pages/IntegratedSearchPage.tsx */
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { itemsApi } from '../api/items';
import { useDebounce } from '../hooks/useDebounce';
import SearchBox from '../components/SearchBox';
import ItemDetailView from '../components/ItemDetailView'; // 이미지 중앙 카드 역할
import NotFoundSection from '../components/NotFoundSection'; // 이미지 하단 제보 섹션

const IntegratedSearchPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300); //

  // 현재는 MVP 단계라 '大田区(오타구)'로 고정되어 있지만, 
  // 나중에 유저의 실제 대표 주소 정보에서 가져오도록 확장해야 합니다.
  const userWard = '大田区'; 

  const { data: searchResults, isLoading, isFetched, refetch } = useQuery({
    queryKey: ['items-search', debouncedQuery, userWard],
    queryFn: () => itemsApi.searchItems(debouncedQuery, userWard),
    enabled: debouncedQuery.length > 0,
  });

  // 버튼 클릭 시 수동으로 다시 조회(refetch)하거나 UI 피드백을 줄 수 있습니다.
  const handleManualSearch = () => {
    if (query.length > 0) refetch();
  };

  

  // 검색 결과가 1개 이상일 때, 가장 첫 번째 아이템을 보여줍니다.
  const topResult = searchResults && searchResults.length > 0 ? searchResults[0] : null;

  return (
    <div className="search-container" style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      {/* 1. 헤더 및 검색창 섹션 */}
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>복잡한 분리수거, MYGOMI와 함께 쉽게</h1>
        <p style={{ color: '#666' }}>쓰레기 종류를 입력해 보세요 (예: 플라스틱 컵, 건전지, 스티로폼)</p>
        <SearchBox value={query} onChange={setQuery} onSearch={handleManualSearch} />
      </header>

      {/* 2. 결과 표시 영역 */}
      <main className="results-area">
        {isLoading && <div className="loading">분류 정보를 찾는 중...</div>}

        {/* 결과가 있을 때 (REQ-03, REQ-04 구현부) */}
        {topResult ? (
          <ItemDetailView item={topResult} />
        ) : (
          // 검색은 했지만 결과가 없는 경우 (isFetched는 쿼리가 한 번이라도 실행되었음을 의미)
          debouncedQuery && isFetched && <NotFoundSection />
        )}
      </main>
    </div>


  );
};

export default IntegratedSearchPage;