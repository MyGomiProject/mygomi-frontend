import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportsApi } from '../api/reports';
import './AdminReportList.css'; // ✨ 방금 만든 CSS 파일 임포트

export default function AdminReportList() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  // 필터 상태 관리
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    page: 0,
  });

  // 신고 목록 데이터 페칭
  const { data, isLoading } = useQuery({
    queryKey: ['admin-reports', filters],
    queryFn: () => reportsApi.getAdminReports({
      type: filters.type || undefined,
      status: filters.status || undefined,
      page: filters.page,
      size: 10,
    }),
  });

  // 상태 변경 API 호출 (백엔드의 softDelete 트리거)
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, note }: { id: number; status: string; note: string }) =>
      reportsApi.updateAdminReportStatus(id, status, note),
    onSuccess: () => {
      // 신고 목록 최신화 + 나눔 게시판 캐시 날리기 (숨김 즉시 반영)
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
      queryClient.invalidateQueries({ queryKey: ['share-posts'] });
      queryClient.invalidateQueries({ queryKey: ['nearby-posts'] });
      
    },
  });

  // 빠른 조치 핸들러 (메모 입력 없이 원클릭)
  const handleQuickAction = (id: number, newStatus: 'RESOLVED' | 'DISMISSED') => {
    const isDelete = newStatus === 'RESOLVED';
    const confirmMsg = isDelete 
      ? '이 게시글을 삭제하고 신고 처리를 완료하시겠습니까?' 
      : '신고를 반려(이상없음) 처리하시겠습니까?';
      
    if (window.confirm(confirmMsg)) {
      updateStatusMutation.mutate({ 
        id, 
        status: newStatus, 
        note: isDelete ? '관리자 확인 후 삭제 조치' : '특이사항 없음 (반려)' 
      });
    }
  };

  // 상태에 따른 CSS 클래스 매핑
  const getStatusClass = (status: string) => {
    switch(status) {
      case 'PENDING': return 'status-pending';
      case 'IN_REVIEW': return 'status-in-review';
      case 'RESOLVED': return 'status-resolved';
      case 'DISMISSED': return 'status-dismissed';
      default: return '';
    }
  };

  if (isLoading) return <div style={{ padding: '100px', textAlign: 'center' }}>데이터를 불러오는 중...</div>;

  return (
    <div className="admin-dashboard">
      <h1>신고/제보 관리</h1>
      
      {/* 1. 필터 영역 */}
      <div className="filter-bar">
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 0 })}
        >
          <option value="">전체 상태</option>
          <option value="PENDING">대기중</option>
          <option value="IN_REVIEW">검토중</option>
          <option value="RESOLVED">처리완료(삭제됨)</option>
          <option value="DISMISSED">반려</option>
        </select>
        
        <select
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value, page: 0 })}
        >
          <option value="">전체 타입</option>
          <option value="SHARE_POST">게시글 신고</option>
          <option value="INFO">정보 오류 제보</option>
        </select>
      </div>

      {/* 2. 테이블 영역 */}
      <div className="report-table-container">
        <table className="report-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>타입</th>
              <th>사유</th>
              <th>제목</th>
              <th>상태</th>
              <th>액션</th>
            </tr>
          </thead>
          <tbody>
            {data?.content && data.content.length > 0 ? (
              data.content.map((report: any) => (
                <tr key={report.id}>
                  <td>{report.id}</td>
                  <td><strong>{report.typeName}</strong></td>
                  <td>{report.reasonName}</td>
                  <td>{report.title}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(report.status)}`}>
                      {report.statusName}
                    </span>
                  </td>
                  <td style={{ display: 'flex', gap: '8px' }}>
                    
                    {/* 상세보기 버튼 */}
                    {report.type === 'SHARE_POST' ? (
                      <button 
                        className="btn-detail"
                        onClick={() => navigate('/sharing', { state: { openPostId: String(report.targetPostId) } })}
                      >
                        상세보기
                      </button>
                    ) : (
                      <button 
                        className="btn-detail"
                        onClick={() => alert(`[제보 내용]\n${report.content}`)}
                      >
                        내용확인
                      </button>
                    )}

                    {/* 빠른 조치 버튼 (대기중이거나 검토중일 때만 보임) */}
                    {(report.status === 'PENDING' || report.status === 'IN_REVIEW') && (
                      <>
                        <button 
                          className="btn-delete"
                          onClick={() => handleQuickAction(report.id, 'RESOLVED')}
                        >
                          게시글 삭제
                        </button>
                        <button onClick={() => handleQuickAction(report.id, 'DISMISSED')}>
                          반려
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>
                  해당하는 신고 내역이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}