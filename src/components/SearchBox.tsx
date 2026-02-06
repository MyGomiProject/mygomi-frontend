import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { DEFAULT_WARD } from '../constants/constants';

interface SearchBoxProps {
  value: string;
  onChange: (val: string) => void;
  onSearch?: () => void;
}

const SearchBox: React.FC<SearchBoxProps> = ({ value, onChange, onSearch }) => {
  const navigate = useNavigate();
  const { user } = useAuth(); // AuthContext에서 로그인 된 유저 정보를 가져옵니다.

  const handleSearch = () => {
    if (!value.trim()) return; // 빈 검색어 방지
    
    if (onSearch) onSearch(); // 부모의 추가 로직(예: 수동 refetch)이 있다면 실행

    // [로직 추가] 유저 주소가 있으면 사용하고, 없으면 기본값(오오쿠보) 사용
    const userWard = user?.address?.ward || DEFAULT_WARD;

    // [이동] 검색어(q)와 주소(ward)를 쿼리 파라미터로 들고 이동합니다.
    // 일본어가 포함되므로 encodeURIComponent를 사용하는 것이 안전합니다.
    navigate(`/integrated-search?q=${encodeURIComponent(value)}&ward=${encodeURIComponent(userWard)}`
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="search-container"> {/* homepage.css의 스타일이 적용됩니다 */}
      <input
        className="search-input"
        type="text"
        placeholder="쓰레기 이름을 입력하세요 (예: 플라스틱 컵)"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button className="search-button" onClick={handleSearch}>
        검색
      </button>
    </div>
  );
};

export default SearchBox;