import React, { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { reportsApi, PostReportRequest } from '../api/reports';
import './ReportPostModal.css';

interface Props {
  postId: number;
  postTitle: string;
  onClose: () => void;
}

export default function ReportPostModal({ postId, postTitle, onClose }: Props) {
  const [formData, setFormData] = useState<PostReportRequest>({
    reason: '',
    title: '',
    content: '',
    emailReply: false,
    reporterEmail: '',
  });

  // 1. Swagger 명세에 따라 백엔드에서 사유 목록 실시간 조회
  const { data: reasonsData } = useQuery({
    queryKey: ['report-reasons'],
    queryFn: reportsApi.getReasons,
  });

  // 2. 백엔드 응답(List<Object> 또는 Map)을 select 태그에 맞게 안전하게 변환
// 2. 프론트엔드에서 신고 사유 Enum 하드코딩 매핑 (400 Bad Request 에러 해결)
  const parsedReasons = useMemo(() => [
    { value: 'FAKE_POST', label: '허위 게시글' },
    { value: 'SPAM', label: '스팸 / 광고' },
    { value: 'INAPPROPRIATE', label: '부적절한 내용' },
    { value: 'OFFENSIVE', label: '욕설 및 비방' },
    { value: 'COPYRIGHT', label: '저작권 침해' },
    { value: 'PRIVACY', label: '개인정보 노출' },
    { value: 'OTHER', label: '기타' }
  ], []);

  // 3. 신고 제출 API 호출
  const submitMutation = useMutation({
    mutationFn: () => {
      // 서버로 보내기 전 데이터 정제 (이메일 체크 안 했으면 빈 문자열 대신 null 전송)
      const payload = {
        ...formData,
        reporterEmail: formData.emailReply ? formData.reporterEmail : undefined,
      };
      return reportsApi.createPostReport(postId, payload);
    },
    onSuccess: () => {
      alert('신고가 접수되었습니다.');
      onClose();
    },
    onError: (error) => {
      console.error('신고 에러:', error);
      alert('신고 접수 중 문제가 발생했습니다.');
    },
  });

  return (
    <div className="report-modal-overlay" onClick={onClose}>
      <div className="report-modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>🚨 게시글 신고</h2>
        <p className="report-target-text">
          신고 대상: <strong>{postTitle}</strong>
        </p>

        <form onSubmit={(e) => { e.preventDefault(); submitMutation.mutate(); }}>
          
          <div className="report-input-group">
            <select
              className="report-input"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              required
            >
              <option value="">신고 사유를 선택해주세요</option>
              {parsedReasons.map((r, idx) => (
                <option key={idx} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div className="report-input-group">
            <input
              type="text"
              className="report-input"
              placeholder="신고 제목을 입력하세요"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="report-input-group">
            <textarea
              className="report-input"
              placeholder="상세 신고 사유를 적어주세요. (허위 매물, 스팸, 욕설 등)"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              required
              rows={4}
            />
          </div>

          <div className="report-input-group">
            <label className="report-checkbox-label">
              <input
                type="checkbox"
                checked={formData.emailReply}
                onChange={(e) => setFormData({ ...formData, emailReply: e.target.checked })}
              />
              처리 결과를 이메일로 받기
            </label>
          </div>

          {formData.emailReply && (
            <div className="report-input-group">
              <input
                type="email"
                className="report-input"
                placeholder="답변 받을 이메일 주소"
                value={formData.reporterEmail}
                onChange={(e) => setFormData({ ...formData, reporterEmail: e.target.value })}
                required={formData.emailReply}
              />
            </div>
          )}

          <div className="report-button-group">
            <button type="button" className="report-btn-cancel" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="report-btn-submit" disabled={submitMutation.isPending}>
              {submitMutation.isPending ? '제출 중...' : '신고하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}