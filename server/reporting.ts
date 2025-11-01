import PDFDocument from 'pdfkit';
import * as XLSX from 'xlsx';
import type { ReportSchedule } from './types';
import { buildInsights } from './insights';

export const generatePdfReport = async () => {
  const doc = new PDFDocument();
  const chunks: Buffer[] = [];
  const insights = buildInsights();

  doc.fontSize(18).text('Smetapro Insights отчет', { align: 'center' });
  doc.moveDown();
  insights.kpis.forEach((kpi) => {
    doc.fontSize(14).text(`${kpi.title}: ${kpi.value.toLocaleString('ru-RU')} (${kpi.delta}%)`);
  });

  doc.end();

  return await new Promise<Buffer>((resolve, reject) => {
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });
};

export const generateXlsxReport = async () => {
  const insights = buildInsights();
  const worksheetData = [
    ['Показатель', 'Значение', 'Δ%'],
    ...insights.kpis.map((kpi) => [kpi.title, kpi.value, kpi.delta])
  ];
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'KPI');
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  return buffer as Buffer;
};

export const exportReportFile = async (format: 'pdf' | 'xlsx') => {
  if (format === 'pdf') {
    const pdf = await generatePdfReport();
    return { filename: 'insights.pdf', mime: 'application/pdf', data: pdf };
  }
  const xlsx = await generateXlsxReport();
  return {
    filename: 'insights.xlsx',
    mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    data: xlsx
  };
};

export const schedules = new Map<string, ReportSchedule & { job?: import('node-cron').ScheduledTask }>();
