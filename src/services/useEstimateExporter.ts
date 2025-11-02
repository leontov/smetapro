import { useEffect, useRef } from 'react';
import { Estimate } from '../data/types';

interface ExportMessage {
  type: 'export-complete';
  format: 'pdf' | 'xlsx';
  payload: ArrayBufferLike;
  fileName: string;
}

type Resolver = {
  resolve: () => void;
  reject: (error: Error) => void;
};

export const useEstimateExporter = () => {
  const workerRef = useRef<Worker | null>(null);
  const resolverRef = useRef<Resolver | null>(null);

  useEffect(() => {
    const worker = new Worker(new URL('../workers/exportWorker.ts', import.meta.url), {
      type: 'module'
    });
    workerRef.current = worker;
    worker.onmessage = (event: MessageEvent<ExportMessage>) => {
      const message = event.data;
      if (message.type === 'export-complete') {
        const payloadArray = new Uint8Array(message.payload as ArrayBuffer);
        const blob = new Blob([payloadArray], {
          type:
            message.format === 'pdf'
              ? 'application/pdf'
              : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = message.fileName;
        anchor.click();
        URL.revokeObjectURL(url);
        resolverRef.current?.resolve();
        resolverRef.current = null;
      }
    };
    worker.onerror = (error) => {
      resolverRef.current?.reject(error instanceof Error ? error : new Error('Export worker error'));
      resolverRef.current = null;
    };
    return () => {
      worker.terminate();
    };
  }, []);

  const exportEstimate = (estimate: Estimate, format: 'pdf' | 'xlsx') =>
    new Promise<void>((resolve, reject) => {
      if (!workerRef.current) {
        reject(new Error('Экспорт недоступен'));
        return;
      }
      resolverRef.current = { resolve, reject };
      workerRef.current.postMessage({ estimate, format });
    });

  return { exportEstimate };
};
