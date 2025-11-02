/// <reference lib="webworker" />

import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import * as XLSX from 'xlsx';
import { Estimate } from '../data/types';

(pdfMake as unknown as { vfs: typeof pdfFonts.pdfMake.vfs }).vfs = pdfFonts.pdfMake.vfs;

declare const self: DedicatedWorkerGlobalScope;

self.onmessage = async (event: MessageEvent) => {
  const { estimate, format } = event.data as { estimate: Estimate; format: 'pdf' | 'xlsx' };
  if (format === 'pdf') {
    const docDefinition = {
      content: [
        { text: estimate.name, style: 'header' },
        { text: `Код: ${estimate.code}` },
        { text: `Заказчик: ${estimate.customer ?? '—'}` },
        { text: `Дата: ${new Date(estimate.updatedAt).toLocaleString('ru-RU')}` },
        { text: ' ' },
        {
          table: {
            headerRows: 1,
            widths: ['*', 'auto', 'auto', 'auto'],
            body: [
              ['Позиция', 'Ед.', 'Кол-во', 'Сумма'],
              ...estimate.lineItems.map((item) => [
                item.name,
                item.unit,
                item.quantity,
                (item.quantity * item.unitPrice).toLocaleString('ru-RU')
              ])
            ]
          }
        },
        { text: ' ' },
        { text: `Подытог: ${estimate.subtotal.toLocaleString('ru-RU')} ₽`, bold: true },
        { text: `Итог: ${estimate.total.toLocaleString('ru-RU')} ₽`, bold: true }
      ],
      styles: {
        header: { fontSize: 18, bold: true }
      }
    };

    const buffer = await new Promise<Uint8Array>((resolve) => {
      pdfMake.createPdf(docDefinition).getBuffer((chunk: any) => {
        if (chunk instanceof Uint8Array) {
          resolve(chunk);
        } else if (chunk instanceof ArrayBuffer) {
          resolve(new Uint8Array(chunk));
        } else {
          resolve(new Uint8Array(chunk));
        }
      });
    });

    self.postMessage(
      {
        type: 'export-complete',
        format,
        payload: buffer.buffer,
        fileName: `${estimate.name}.pdf`
      },
      [buffer.buffer]
    );
    return;
  }

  const worksheet = XLSX.utils.json_to_sheet(
    estimate.lineItems.map((item) => ({
      name: item.name,
      unit: item.unit,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.quantity * item.unitPrice
    }))
  );
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Смета');
  const arrayBuffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
  const buffer = new Uint8Array(arrayBuffer as ArrayBufferLike);
  self.postMessage(
    { type: 'export-complete', format, payload: buffer.buffer, fileName: `${estimate.name}.xlsx` },
    [buffer.buffer]
  );
};
