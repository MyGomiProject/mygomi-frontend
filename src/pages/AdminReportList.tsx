import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportsApi } from '../api/reports';

export default function AdminReportList() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    type: '',
    status: 'PENDING',
    page: 0,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-reports', filters],
    queryFn: () => reportsApi.getAdminReports({
      type: filters.type || undefined,
      status: filters.status || undefined,
      page: filters.page,
      size: 10,
    }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, note }: { id: number; status: string; note: string }) =>
      reportsApi.updateAdminReportStatus(id, status, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
    },
  });

  const handleStatusChange = (id: number, newStatus: string) => {
    const note = prompt('처리 메모를 남겨주세요 (선택사항)');
    if (note !== null) {
      updateStatusMutation.mutate({ id, status: newStatus, note });
    }
  };

  if (isLoading) return <div>데이터를 불러오는 중...</div>;

  return (
    <div className="admin-dashboard">
      <h1>신고/제보 관리</h1>
      
      {/* 필터 영역 */}
      <div className="filter-bar">
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 0 })}
        >
          <option value="">전체 상태</option>
          <option value="PENDING">대기중</option>
          <option value="IN_REVIEW">검토중</option>
          <option value="RESOLVED">처리완료</option>
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

      {/* 목록 테이블 */}
      <table className="report-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>타입</th>
            <th>사유</th>
            <th>제목</th>
            <th>신고자</th>
            <th>상태</th>
            <th>액션</th>
          </tr>
        </thead>
        <tbody>
          {data?.content.map((report) => (
            <tr key={report.id}>
              <td>{report.id}</td>
              <td>{report.typeName}</td>
              <td>{report.reasonName}</td>
              <td>{report.title}</td>
              <td>{report.reporterEmail || report.reporterId}</td>
              <td>{report.statusName}</td>
              <td>
                {report.status === 'PENDING' && (
                  <button onClick={() => handleStatusChange(report.id, 'IN_REVIEW')}>검토 시작</button>
                )}
                {(report.status === 'PENDING' || report.status === 'IN_REVIEW') && (
                  <>
                    <button onClick={() => handleStatusChange(report.id, 'RESOLVED')}>처리 완료</button>
                    <button onClick={() => handleStatusChange(report.id, 'DISMISSED')}>반려</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 페이지네이션 UI 추가 (생략) */}
    </div>
  );
}