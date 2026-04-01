/**
 * Export utilities for CSV, Excel-compatible CSV, and PDF generation
 */

// ─── CSV Export ──────────────────────────────────────────────────────────────
export function exportToCSV(data: Record<string, any>[], filename: string, columns?: { key: string; label: string }[]) {
  if (!data.length) return;

  const cols = columns || Object.keys(data[0]).map(k => ({ key: k, label: k }));
  const header = cols.map(c => `"${c.label}"`).join(';');
  const rows = data.map(row =>
    cols.map(c => {
      const val = row[c.key];
      if (val === null || val === undefined) return '""';
      return `"${String(val).replace(/"/g, '""')}"`;
    }).join(';')
  );

  const bom = '\uFEFF'; // UTF-8 BOM for Excel
  const csv = bom + [header, ...rows].join('\n');
  downloadBlob(csv, `${filename}.csv`, 'text/csv;charset=utf-8;');
}

// ─── PDF Export (simple table) ───────────────────────────────────────────────
export function exportToPDF(
  data: Record<string, any>[],
  filename: string,
  title: string,
  columns: { key: string; label: string; width?: number }[]
) {
  if (!data.length) return;

  const pageW = 595, pageH = 842; // A4
  const margin = 40;
  const colW = columns.map(c => c.width || Math.floor((pageW - margin * 2) / columns.length));
  const rowH = 22;
  const headerH = 28;

  let y = margin + 50;
  let pageContent = '';
  let pages: string[] = [];

  function newPage() {
    if (pageContent) pages.push(pageContent);
    pageContent = '';
    y = margin + 50;
    // Title
    pageContent += `BT /F1 16 Tf ${margin} ${pageH - margin - 20} Td (${escapePDF(title)}) Tj ET\n`;
    pageContent += `BT /F1 9 Tf ${margin} ${pageH - margin - 35} Td (${escapePDF(`Généré le ${new Date().toLocaleDateString('fr-FR')} — Page ${pages.length + 1}`)}) Tj ET\n`;
    // Header row
    let x = margin;
    pageContent += `0.93 0.93 0.96 rg ${margin} ${pageH - y - headerH} ${pageW - margin * 2} ${headerH} re f\n`;
    pageContent += `0 0 0 rg\n`;
    columns.forEach((col, i) => {
      pageContent += `BT /F1 9 Tf ${x + 4} ${pageH - y - headerH + 8} Td (${escapePDF(col.label)}) Tj ET\n`;
      x += colW[i];
    });
    y += headerH + 4;
  }

  newPage();

  data.forEach((row) => {
    if (y + rowH > pageH - margin) newPage();
    let x = margin;
    // Row line
    pageContent += `0.85 0.85 0.88 RG ${margin} ${pageH - y - rowH} m ${pageW - margin} ${pageH - y - rowH} l S\n`;
    columns.forEach((col, i) => {
      const val = String(row[col.key] ?? '').slice(0, 40);
      pageContent += `BT /F1 8 Tf ${x + 4} ${pageH - y - rowH + 6} Td (${escapePDF(val)}) Tj ET\n`;
      x += colW[i];
    });
    y += rowH;
  });

  if (pageContent) pages.push(pageContent);

  // Build simple PDF
  const pdf = buildSimplePDF(pages);
  downloadBlob(pdf, `${filename}.pdf`, 'application/pdf');
}

function escapePDF(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function buildSimplePDF(pages: string[]): string {
  const objects: string[] = [];
  let objId = 1;

  // Catalog
  objects.push(`${objId} 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj`); objId++;
  // Pages
  const pageRefs = pages.map((_, i) => `${4 + i} 0 R`).join(' ');
  objects.push(`${objId} 0 obj\n<< /Type /Pages /Kids [${pageRefs}] /Count ${pages.length} >>\nendobj`); objId++;
  // Font
  objects.push(`${objId} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj`); objId++;

  pages.forEach((content) => {
    const streamObj = objId + 1;
    objects.push(`${objId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents ${streamObj} 0 R /Resources << /Font << /F1 3 0 R >> >> >>\nendobj`);
    objId++;
    objects.push(`${objId} 0 obj\n<< /Length ${content.length} >>\nstream\n${content}\nendstream\nendobj`);
    objId++;
  });

  const offsets: number[] = [];
  let body = '';
  objects.forEach(obj => {
    offsets.push(body.length + 10); // approx header length
    body += obj + '\n';
  });

  const header = '%PDF-1.4\n';
  const xrefStart = header.length + body.length;
  let xref = `xref\n0 ${objId}\n0000000000 65535 f \n`;
  offsets.forEach(off => {
    xref += `${String(off + header.length).padStart(10, '0')} 00000 n \n`;
  });
  const trailer = `trailer\n<< /Size ${objId} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return header + body + xref + trailer;
}

// ─── Download Helper ─────────────────────────────────────────────────────────
function downloadBlob(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
