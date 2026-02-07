/* src/pages/IntegratedSearchPage.tsx */
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom'; // 1. URL 파라미터를 읽기 위한 훅
import { useQuery } from '@tanstack/react-query';
import { itemsApi } from '../api/items';
import { useDebounce } from '../hooks/useDebounce';
import SearchBox from '../components/SearchBox';
import ItemDetailView from '../components/ItemDetailView'; // 이미지 중앙 카드 역할
import NotFoundSection from '../components/NotFoundSection'; // 이미지 하단 제보 섹션
import { DEFAULT_WARD } from '../constants/constants'; // '大久保' 등이 정의된 상수 파일

const IntegratedSearchPage: React.FC = () => {
  // 2. URL의 ?q=...&ward=... 부분을 가져옵니다.
  const [searchParams, setSearchParams] = useSearchParams();
  const urlQuery = searchParams.get('q') || '';
  const urlWard = searchParams.get('ward') || DEFAULT_WARD;

  // 내부 검색창 상태 관리를 위해 URL의 q값을 초기값으로 설정합니다.
  const [query, setQuery] = useState(urlQuery);
  const debouncedQuery = useDebounce(query, 300); //

  // 3. URL 파라미터가 변경되면(예: 헤더에서 재검색) 내부 입력창 상태도 동기화합니다.
  useEffect(() => {
    setQuery(urlQuery);
  }, [urlQuery]);

  const { data: searchResults, isLoading, isFetched, refetch } = useQuery({
    queryKey: ['items-search', debouncedQuery, urlWard],
    queryFn: () => itemsApi.searchItems(debouncedQuery, urlWard),
    enabled: debouncedQuery.length > 0,
  });

  // 버튼 클릭 시 수동으로 다시 조회(refetch)하거나 UI 피드백을 줄 수 있습니다.
  const handleManualSearch = () => {
    if (query.trim()) {
      setSearchParams({ q: query, ward: urlWard });
    }
  };

  // 검색 결과가 1개 이상일 때, 가장 첫 번째 아이템을 보여줍니다.
  const topResult = searchResults && searchResults.length > 0 ? searchResults[0] : null;

  return (
    <div className="search-container" style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>복잡한 분리수거, MYGOMI와 함께 쉽게</h1>
        {/* 현재 어떤 지역을 기준으로 검색 중인지 보여주면 더 친절합니다. */}
        <p style={{ color: '#666' }}>
          현재 <strong>{urlWard}</strong> 지역 정보를 확인 중입니다.
        </p>
        <SearchBox value={query} onChange={setQuery} onSearch={handleManualSearch} />
      </header>

      <main className="results-area">
        {isLoading && <div className="loading">분류 정보를 찾는 중...</div>}

        {topResult ? (
          <ItemDetailView item={topResult} />
        ) : (
          debouncedQuery && isFetched && <NotFoundSection />
        )}
      </main>
    </div>
  );
};

export default IntegratedSearchPage;