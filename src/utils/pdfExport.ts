import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Task, Goal } from '../types';

export interface PdfExportOptions {
  title?: string;
  includeTasks?: boolean;
  includeGoals?: boolean;
  includeAnalytics?: boolean;
  filterPriority?: string;
}

export async function exportElementToPdf(
  elementId: string,
  fileName: string = 'تقرير_إنجاز_الشامل.pdf'
): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Element to export not found:', elementId);
    return false;
  }

  try {
    // Render element with high scale for crisp text
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 1200,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    const pageHeight = pdf.internal.pageSize.getHeight();

    let heightLeft = pdfHeight;
    let position = 0;

    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
    heightLeft -= pageHeight;

    // Add additional pages if content spans across multiple A4 pages
    while (heightLeft >= 0) {
      position = heightLeft - pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(fileName);
    return true;
  } catch (error) {
    console.error('Failed to generate PDF:', error);
    // Fallback to native window.print if html2canvas/jspdf encounters canvas limitation
    window.print();
    return false;
  }
}
