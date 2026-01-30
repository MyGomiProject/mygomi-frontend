import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import './App.css'; // 추가적인 CSS 커스텀이 필요할 z경우
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SharingPage from './pages/SharingPage';

const dayEmojiMap: Record<number, string> = {
  2: "💪",
  4: "💪",
};

function App() {
  return (
    // 1. 좌우 여백 100px (px-24 정도가 약 100px입니다)
    <div className="min-h-screen bg-gray-50 py-12 px-[100px]">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-black text-gray-800 tracking-tight">
            WORKOUT <span className="text-blue-600">TRACKER</span>
          </h1>
          <p className="text-gray-500 font-medium">나와의 약속을 지키는 시간</p>
        </header>
        
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-200">
          <FullCalendar
            plugins={[dayGridPlugin]}
            initialView="dayGridMonth"
            locale="ko"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: ''
            }}
            // 요일 헤더 디자인: 배경색과 텍스트 색상 변경
            dayHeaderContent={(arg) => {
              const labels = ['일', '월', '화', '수', '목', '금', '토'];
              const isWeekend = arg.date.getDay() === 0 || arg.date.getDay() === 6;
              return (
                <div className={`py-4 text-sm font-bold ${isWeekend ? 'text-red-400' : 'text-gray-500'}`}>
                  {labels[arg.date.getDay()]}
                </div>
              );
            }}
            // 2 & 3. 날짜 칸 커스텀 (숫자 왼쪽 상단 배치 + 이모지)
            dayCellContent={(arg) => {
              const day = arg.date.getDay();
              const emoji = dayEmojiMap[day];

              return (
                <div className="w-full h-full p-2">
                  <div className="flex items-center gap-1 font-semibold text-gray-700">
                    {/* 이모지 + 숫자 순서 */}
                    {emoji && <span className="text-base leading-none">{emoji}</span>}
                    <span className="text-sm leading-none">{arg.dayNumberText.replace('일', '')}</span>
                  </div>
                </div>
              );
            }}
            height="700px"
          />
        </div>
      </div>

      {/* FullCalendar 내부 스타일링을 위한 인라인 CSS */}
      <style>{`
        .fc-theme-standard td, .fc-theme-standard th { border: 1px solid #f1f5f9 !important; }
        .fc-col-header { background-color: #f8fafc; }
        .fc-daygrid-day-top { display: block !important; } /* 기본 상단 정렬 활성화 */
        .fc-day-today { background-color: #f0f7ff !important; }
        .fc-button-primary { background-color: #2563eb !important; border: none !important; border-radius: 8px !important; font-weight: 600 !important; }
        .fc-toolbar-title { font-size: 1.25rem !important; font-weight: 800 !important; color: #1e293b; }
      `}</style>
    </div>
  );
}






function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/sharing" element={<SharingPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;