import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';

interface DocumentSection {
  title: string;
  content: string;
}

interface DocumentContent {
  sections: DocumentSection[];
}

@Injectable()
export class PdfService {
  async render(content: DocumentContent): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 60 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc
        .fontSize(20)
        .font('Helvetica-Bold')
        .text('VyaparSetu', { align: 'center' });

      doc.moveDown(0.5);
      doc.fontSize(10).font('Helvetica').fillColor('#666666').text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, { align: 'center' });
      doc.moveDown(1);

      for (const section of content.sections ?? []) {
        doc.fontSize(13).font('Helvetica-Bold').fillColor('#1a1a1a').text(section.title);
        doc.moveDown(0.3);
        doc.fontSize(11).font('Helvetica').fillColor('#333333').text(section.content ?? '', {
          lineGap: 4,
          paragraphGap: 6,
        });
        doc.moveDown(1);
      }

      doc.end();
    });
  }
}
