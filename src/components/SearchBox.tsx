import React from 'react';
import Select from 'react-select';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { DEFAULT_WARD } from '../constants/constants';

interface SearchBoxProps {
  value: string;
  onChange: (val: string) => void;
  onSearch?: () => void;

  showWardSelector?: boolean;
  wards?: string[];
  selectedWard?: string;
 onWardChange?: (val: string) => void;
}

const SearchBox: React.FC<SearchBoxProps> = ({
  value, onChange, onSearch,
  showWardSelector, wards, selectedWard, onWardChange
}) => {
  const navigate = useNavigate();
  const { user } = useAuth(); // AuthContext에서 로그인 된 유저 정보를 가져옵니다.

  // 💡 1. 구 목록을 react-select 형식({ value, label })으로 변환
  const selectOptions = wards?.map(ward => ({ value: ward, label: ward })) || [];

  // 💡 2. 커스텀 스타일 정의 
  const customStyles = {
  control: (base: any) => ({
    ...base,
    border: 'none',
    boxShadow: 'none',
    backgroundColor: 'transparent',
    minHeight: 'auto', // 💡 높이 강제 제거 (CSS wrapper 높이 따름)
    width: '100%',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  }),
  valueContainer: (base: any) => ({
    ...base,
    padding: '0', // 💡 불필요한 패딩 제거 (wrapper 패딩 사용)
    justifyContent: 'center',
    display: 'flex',
  }),
  singleValue: (base: any) => ({
    ...base,
    color: '#00B894',
    fontWeight: '500', 
    fontSize: '1rem', 
    margin: 0,
  }),
  indicatorSeparator: () => ({ display: 'none' }),
  dropdownIndicator: (base: any) => ({
    ...base,
    color: '#B2BEC3',
    padding: '0 0 0 4px', // 화살표 간격 미세 조정
    '&:hover': { color: '#00B894' }
  }),
  menu: (base: any) => ({
    ...base,
    position: 'absolute' as const,
    left: 0,
    right: 'auto',
    borderRadius: '16px',
    boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
    width: '140px',
    minWidth: '140px',
    marginTop: '10px',
    overflow: 'hidden',
  }),
  menuList: (base: any) => ({
    ...base,
    maxHeight: '180px',
    padding: 0,
  }),
  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.isFocused ? '#f0fffb' : 'white',
    color: state.isFocused ? '#00B894' : '#333',
    padding: '10px 16px',
    fontSize: '0.95rem',
    cursor: 'pointer',
  }),
};

  const handleSearch = () => {
    if (!value.trim()) return; // 빈 검색어 방지
    
    if (onSearch) onSearch(); // 부모의 추가 로직(예: 수동 refetch)이 있다면 실행

   // 💡 [핵심 수정 로직]
    // 드롭다운이 켜져있고(showWardSelector) 값이 있다면 그 값을,
    // 아니라면 로그인 유저의 주소(또는 기본값)를 사용합니다.
    let targetWard = DEFAULT_WARD;

    if (showWardSelector && selectedWard) {
      targetWard = selectedWard;
    } else {
      targetWard = user?.address?.ward || DEFAULT_WARD;
    }

    // [이동] 검색어(q)와 주소(ward)를 쿼리 파라미터로 들고 이동합니다.
    // 일본어가 포함되므로 encodeURIComponent를 사용하는 것이 안전합니다.
    navigate(`/integrated-search?q=${encodeURIComponent(value)}&ward=${encodeURIComponent(targetWard)}`
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

return (
    <div className={`search-container ${showWardSelector ? 'with-ward-selector' : ''}`}>
      {showWardSelector && (
        <div className="ward-selector-wrapper">
          <Select
            classNamePrefix="ward-select"
            options={selectOptions}
            styles={customStyles}
            defaultValue={selectOptions.find(o => o.value === selectedWard)}
            onChange={(opt: any) => onWardChange && onWardChange(opt.value)}
            isSearchable={false}
            menuPlacement="bottom"
            menuPortalTarget={null}
            placeholder="지역 선택"
          />
        </div>
      )}
      
      <input
        className="search-input"
        type="text"
        placeholder="쓰레기 이름을 입력하세요"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
      />
      <button className="search-button" onClick={handleSearch}>검색</button>
    </div>
  );
};

export default SearchBox;