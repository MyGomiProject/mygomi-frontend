import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { reportsApi } from '../api/reports';

interface Props {
  itemName: string; // 어떤 품목에서 신고가 들어왔는지 확인하기 위함
  onClose: () => void;
}

export default function ReportInfoModal({ itemName, onClose }: Props) {
  // 폼 상태 관리
  const [formData, setFormData] = useState({
    reason: 'WRONG_INFO', // 신고 사유는 백엔드에서 enum으로 처리
    title: `[정보오류] ${itemName} 배출 정보 수정 요청`, // 기본 제목 세팅
    content: '',
    emailReply: false,
    reporterEmail: '',
  });
  
  // 첨부파일 상태 관리
  const [file, setFile] = useState<File | null>(null);

  // API 전송 뮤테이션
  const submitMutation = useMutation({
    mutationFn: () => reportsApi.createInfoReport(formData, file || undefined),
    onSuccess: () => {
      alert('소중한 제보가 접수되었습니다. 감사합니다.');
      onClose(); // 성공 시 모달 닫기
    },
    onError: (error) => {
      alert('신고 접수 중 문제가 발생했습니다. 다시 시도해주세요.');
      console.error(error);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      // 10MB 용량 제한 체크 (백엔드 스펙)
      if (selectedFile.size > 10 * 1024 * 1024) {
        alert('파일 크기는 10MB를 초과할 수 없습니다.');
        e.target.value = '';
        return;
      }
      setFile(selectedFile);
    }
  };

  return (
    <div className="modal-overlay" style={overlayStyle}>
      <div className="modal-content" style={contentStyle}>
        <h2>🚨 잘못된 정보 신고</h2>
        <p>'{itemName}'의 배출 정보 중 틀린 부분을 알려주세요.</p>
        
        <form onSubmit={(e) => { e.preventDefault(); submitMutation.mutate(); }}>
          <div style={inputGroupStyle}>
            <input
              type="text"
              placeholder="제목을 입력하세요"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              style={inputStyle}
            />
          </div>

          <div style={inputGroupStyle}>
            <textarea
              placeholder="어떤 부분이 잘못되었는지 상세히 적어주세요."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              required
              rows={5}
              style={inputStyle}
            />
          </div>

          <div style={inputGroupStyle}>
            <label>증빙 자료 (선택, 최대 10MB)</label>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileChange}
              style={inputStyle}
            />
            {file && <small>{file.name} 첨부됨</small>}
          </div>

          <div style={inputGroupStyle}>
            <label>
              <input
                type="checkbox"
                checked={formData.emailReply}
                onChange={(e) => setFormData({ ...formData, emailReply: e.target.checked })}
              />
              처리 결과를 이메일로 받기
            </label>
          </div>

          {formData.emailReply && (
            <div style={inputGroupStyle}>
              <input
                type="email"
                placeholder="답변 받을 이메일 주소"
                value={formData.reporterEmail}
                onChange={(e) => setFormData({ ...formData, reporterEmail: e.target.value })}
                required={formData.emailReply}
                style={inputStyle}
              />
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button type="button" onClick={onClose} style={cancelButtonStyle}>취소</button>
            <button type="submit" disabled={submitMutation.isPending} style={submitButtonStyle}>
              {submitMutation.isPending ? '제출 중...' : '제보하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 간단한 인라인 스타일 (프로젝트의 CSS나 Tailwind로 교체하시면 됩니다)
const overlayStyle: React.CSSProperties = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const contentStyle: React.CSSProperties = { backgroundColor: '#fff', padding: '20px', borderRadius: '8px', width: '400px', maxWidth: '90%' };
const inputGroupStyle: React.CSSProperties = { marginBottom: '15px', display: 'flex', flexDirection: 'column', gap: '5px' };
const inputStyle: React.CSSProperties = { padding: '8px', border: '1px solid #ccc', borderRadius: '4px', width: '100%', boxSizing: 'border-box' };
const cancelButtonStyle: React.CSSProperties = { flex: 1, padding: '10px', backgroundColor: '#eee', border: 'none', borderRadius: '4px', cursor: 'pointer' };
const submitButtonStyle: React.CSSProperties = { flex: 1, padding: '10px', backgroundColor: '#ff4d4f', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' };