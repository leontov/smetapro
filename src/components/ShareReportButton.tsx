import React from 'react';
import { useMutation } from '@tanstack/react-query';
import { exportReport } from '../services/reportingService';

const base64ToBlob = (base64: string, mime: string) => {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i += 1) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mime });
};

export const ShareReportButton: React.FC = () => {
  const mutation = useMutation({
    mutationFn: exportReport,
    onSuccess: async (file) => {
      const blob = base64ToBlob(file.data, file.mime);
      const shareFile = new File([blob], file.filename, { type: file.mime });
      if (navigator.share && navigator.canShare?.({ files: [shareFile] })) {
        await navigator.share({ files: [shareFile], title: 'Smetapro Отчет' });
      } else {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = file.filename;
        link.click();
        URL.revokeObjectURL(url);
      }
    }
  });

  return (
    <button
      type="button"
      onClick={() => mutation.mutate({ format: 'pdf' })}
      style={{
        marginTop: 24,
        width: '100%',
        padding: '12px 16px',
        background: '#38bdf8',
        color: '#0f172a',
        border: 'none',
        borderRadius: 999,
        fontWeight: 600,
        cursor: 'pointer'
      }}
    >
      {mutation.isPending ? 'Готовим…' : 'Поделиться отчетом'}
    </button>
  );
};
