import React, { useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { reportsApi } from '../api/reports';
import './ReportInfoModal.css';

interface Props {
  itemName: string;
  onClose: () => void;
}

export default function ReportInfoModal({ itemName, onClose }: Props) {
  const [formData, setFormData] = useState({
    reason: 'WRONG_INFO',
    title: `[정보오류] ${itemName} 배출 정보 수정 요청`,
    content: '',
    emailReply: false,
    reporterEmail: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const submitMutation = useMutation({
    mutationFn: () => reportsApi.createInfoReport(formData, file || undefined),
    onSuccess: () => {
      alert('소중한 제보가 접수되었습니다. 감사합니다.');
      onClose();
    },
    onError: (error) => {
      alert('신고 접수 중 문제가 발생했습니다. 다시 시도해주세요.');
      console.error(error);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 10 * 1024 * 1024) {
        alert('파일 크기는 10MB를 초과할 수 없습니다.');
        e.target.value = '';
        return;
      }
      setFile(selectedFile);
    }
  };

  return (
    <div className="report-info-modal-overlay" onClick={onClose}>
      <div className="report-info-modal" onClick={(e) => e.stopPropagation()}>
        <div className="report-info-modal-header">
          <h2 className="report-info-modal-title">
            <span aria-hidden>📋</span>
            잘못된 정보 제보
          </h2>
          <button
            type="button"
            className="report-info-modal-close"
            onClick={onClose}
            aria-label="닫기"
          >
            ×
          </button>
        </div>

        <div className="report-info-modal-body">
          <p className="report-info-modal-desc">
            &apos;{itemName}&apos;의 배출 정보 중 틀린 부분을 알려주시면 검토 후 반영하겠습니다.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitMutation.mutate();
            }}
          >
            <div className="report-info-form-group">
              <label htmlFor="report-info-title">제목</label>
              <input
                id="report-info-title"
                type="text"
                className="report-info-input"
                placeholder="제목을 입력하세요"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="report-info-form-group">
              <label htmlFor="report-info-content">상세 내용</label>
              <textarea
                id="report-info-content"
                className="report-info-textarea"
                placeholder="어떤 부분이 잘못되었는지 상세히 적어주세요."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                required
              />
            </div>

            <div className="report-info-form-group">
              <label>증빙 자료 (선택)</label>
              <div className="report-info-file-wrap">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="report-info-file-input-hidden"
                  aria-label="증빙 자료 파일 선택"
                />
                <button
                  type="button"
                  className="report-info-file-btn"
                  onClick={() => fileInputRef.current?.click()}
                >
                  파일 선택
                </button>
                <span className="report-info-file-name">
                  {file ? file.name : '선택된 파일 없음'}
                </span>
              </div>
              <span className="report-info-file-hint">최대 10MB (이미지, PDF)</span>
            </div>

            <div className="report-info-form-group">
              <label className="report-info-checkbox-wrap">
                <input
                  type="checkbox"
                  checked={formData.emailReply}
                  onChange={(e) =>
                    setFormData({ ...formData, emailReply: e.target.checked })
                  }
                />
                처리 결과를 이메일로 받기
              </label>
            </div>

            {formData.emailReply && (
              <div className="report-info-form-group">
                <label htmlFor="report-info-email">답변 받을 이메일</label>
                <input
                  id="report-info-email"
                  type="email"
                  className="report-info-input"
                  placeholder="example@email.com"
                  value={formData.reporterEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, reporterEmail: e.target.value })
                  }
                  required={formData.emailReply}
                />
              </div>
            )}

            <div className="report-info-modal-footer">
              <button
                type="button"
                className="report-info-btn-cancel"
                onClick={onClose}
              >
                취소
              </button>
              <button
                type="submit"
                className="report-info-btn-submit"
                disabled={submitMutation.isPending}
              >
                {submitMutation.isPending ? '제출 중...' : '제보하기'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
