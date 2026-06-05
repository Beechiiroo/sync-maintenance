import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface MaintenanceReportRow {
  equipment: string;
  task: string;
  frequency: string;
  next_due: string;
  status: string;
  last_performed?: string | null;
}

interface ReportOptions {
  title: string;
  subtitle?: string;
  period: { from: Date; to: Date };
  rows: MaintenanceReportRow[];
  companyName?: string;
  locale?: string;
}

/** Build a premium-looking maintenance PDF report (cover + KPIs + table). */
export function generateMaintenancePDF(opts: ReportOptions) {
  const { title, subtitle, period, rows, companyName = 'Sync Maintenance', locale = 'fr-FR' } = opts;
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  // ── Header band ───────────────────────────────────────────
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageW, 90, 'F');
  doc.setFillColor(59, 130, 246); // primary
  doc.rect(0, 86, pageW, 4, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text(companyName.toUpperCase(), 40, 40);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Industrial Maintenance Platform', 40, 58);
  doc.setFontSize(9);
  doc.text(`Généré le ${new Date().toLocaleString(locale)}`, pageW - 40, 40, { align: 'right' });

  // ── Title ────────────────────────────────────────────────
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text(title, 40, 140);

  if (subtitle) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139);
    doc.text(subtitle, 40, 162);
  }

  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Période : ${period.from.toLocaleDateString(locale)} → ${period.to.toLocaleDateString(locale)}`,
    40, 184
  );

  // ── KPI cards ────────────────────────────────────────────
  const total = rows.length;
  const overdue = rows.filter(r => r.status === 'overdue').length;
  const urgent = rows.filter(r => r.status === 'urgent').length;
  const done = rows.filter(r => r.last_performed).length;

  const cards = [
    { label: 'Tâches', value: total, color: [59, 130, 246] },
    { label: 'En retard', value: overdue, color: [239, 68, 68] },
    { label: 'Urgentes', value: urgent, color: [245, 158, 11] },
    { label: 'Réalisées', value: done, color: [34, 197, 94] },
  ];
  const cardW = (pageW - 80 - 30) / 4;
  cards.forEach((c, i) => {
    const x = 40 + i * (cardW + 10);
    const y = 210;
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(x, y, cardW, 70, 8, 8, 'F');
    doc.setFillColor(c.color[0], c.color[1], c.color[2]);
    doc.roundedRect(x, y, 4, 70, 2, 2, 'F');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(c.label, x + 14, y + 22);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(String(c.value), x + 14, y + 50);
    doc.setFont('helvetica', 'normal');
  });

  // ── Table ────────────────────────────────────────────────
  autoTable(doc, {
    startY: 310,
    head: [['Équipement', 'Tâche', 'Fréquence', 'Échéance', 'Statut', 'Dernière']],
    body: rows.map(r => [
      r.equipment,
      r.task,
      r.frequency,
      r.next_due,
      r.status,
      r.last_performed ? new Date(r.last_performed).toLocaleDateString(locale) : '—',
    ]),
    styles: { fontSize: 9, cellPadding: 6, textColor: [30, 41, 59] },
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 40, right: 40 },
    didDrawPage: () => {
      const p = doc.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(`${companyName} — Rapport confidentiel`, 40, pageH - 20);
      doc.text(`Page ${p}`, pageW - 40, pageH - 20, { align: 'right' });
    },
  });

  const fileSafe = title.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
  doc.save(`${fileSafe}-${period.from.toISOString().slice(0,10)}_${period.to.toISOString().slice(0,10)}.pdf`);
}
