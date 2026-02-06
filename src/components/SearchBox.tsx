import React from 'react';

interface SearchBoxProps {
  value: string;
  onChange: (val: string) => void;
  onSearch?: () => void;
}

const SearchBox: React.FC<SearchBoxProps> = ({ value, onChange, onSearch }) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch();
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
      <button className="search-button" onClick={onSearch}>
        검색
      </button>
    </div>
  );
};

export default SearchBox;