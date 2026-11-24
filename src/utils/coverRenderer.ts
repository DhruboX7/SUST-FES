import { jsPDF } from 'jspdf';
import { CoverDesignId, CoverFormData } from '../types/cover';
import { SUST_LOGO_URL } from '../components/SustLogo';

export interface DesignPalette {
  paper: string;
  primary: string;
  secondary: string;
  accent: string;
  ink: string;
  mutedInk: string;
  plaqueBg: string;
  plaqueBorder: string;
  headerBg?: string;
  headerText?: string;
}

export function getCoverDesignPalette(designId: CoverDesignId, monochromePrint: boolean): DesignPalette {
  if (monochromePrint) {
    return {
      paper: '#FFFFFF',
      primary: '#111111',
      secondary: '#374151',
      accent: '#1F2937',
      ink: '#111111',
      mutedInk: '#374151',
      plaqueBg: '#F9FAFB',
      plaqueBorder: '#111111',
      headerBg: designId === 'emerald-banner' ? '#111111' : undefined,
      headerText: designId === 'emerald-banner' ? '#FFFFFF' : undefined,
    };
  }

  switch (designId) {
    case 'forestry-botanical':
      return {
        paper: '#FCFBF7',
        primary: '#19382B',
        secondary: '#42684D',
        accent: '#987453',
        ink: '#19382B',
        mutedInk: '#42684D',
        plaqueBg: '#F3F1E8',
        plaqueBorder: '#42684D',
      };
    case 'emerald-banner':
      return {
        paper: '#FFFFFF',
        primary: '#19382B',
        secondary: '#42684D',
        accent: '#987453',
        ink: '#142D22',
        mutedInk: '#42684D',
        plaqueBg: '#F3F1E8',
        plaqueBorder: '#19382B',
        headerBg: '#19382B',
        headerText: '#F3F1E8',
      };
    case 'swiss-minimal':
      return {
        paper: '#FFFFFF',
        primary: '#0F172A',
        secondary: '#334155',
        accent: '#64748B',
        ink: '#0F172A',
        mutedInk: '#334155',
        plaqueBg: '#F8FAFC',
        plaqueBorder: '#0F172A',
      };
    case 'royal-herbarium':
      return {
        paper: '#FAF8F2',
        primary: '#5C1E26',
        secondary: '#7C2D36',
        accent: '#987453',
        ink: '#1F1B18',
        mutedInk: '#5C4B43',
        plaqueBg: '#F4EFE4',
        plaqueBorder: '#987453',
      };
    case 'botanical-ribbon':
      return {
        paper: '#FFFFFF',
        primary: '#19382B',
        secondary: '#42684D',
        accent: '#8A9C74',
        ink: '#142D22',
        mutedInk: '#42684D',
        plaqueBg: '#F3F1E8',
        plaqueBorder: '#8A9C74',
      };
    case 'navy-gold-formal':
      return {
        paper: '#FFFFFF',
        primary: '#0F2942',
        secondary: '#1E4068',
        accent: '#A67C37',
        ink: '#0F172A',
        mutedInk: '#334155',
        plaqueBg: '#F8F9FC',
        plaqueBorder: '#A67C37',
      };
    case 'minimal-studio':
      return {
        paper: '#FFFFFF',
        primary: '#19382B',
        secondary: '#42684D',
        accent: '#BBC4A6',
        ink: '#19382B',
        mutedInk: '#42684D',
        plaqueBg: '#FAF9F4',
        plaqueBorder: '#BBC4A6',
      };
    case 'classic-academic':
    default:
      return {
        paper: '#FFFFFF',
        primary: '#0F172A',
        secondary: '#19382B',
        accent: '#42684D',
        ink: '#0F172A',
        mutedInk: '#334155',
        plaqueBg: '#F8FAFC',
        plaqueBorder: '#1E293B',
      };
  }
}

export function formatCoverDate(dateStr: string): string {
  if (!dateStr) return '—';
  const trimmed = dateStr.trim();
  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    const mIdx = parseInt(month, 10) - 1;
    if (mIdx >= 0 && mIdx < 12) {
      return `${parseInt(day, 10)} ${months[mIdx]} ${year}`;
    }
    return `${day}-${month}-${year}`;
  }
  return trimmed;
}

export function formatDepartmentHeading(dept: string): string {
  const clean = (dept || '').trim();
  if (!clean) return 'Department of Forestry and Environmental Science';
  if (/^department\s+of\s+/i.test(clean)) return clean;
  return `Department of ${clean}`;
}

export function buildCoverFilename(data: CoverFormData, ext: 'pdf' | 'png'): string {
  const code = (data.courseCode || 'FES').replace(/[^A-Za-z0-9]+/g, '_').replace(/^_|_$/g, '');
  const type = data.coverType.replace(/\s+/g, '_');
  const reg = (data.registrationNo || 'Cover').replace(/[^A-Za-z0-9]+/g, '');
  return `SUST_${code}_${type}_${reg}.${ext}`;
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = (text || '').split(/\s+/).filter(Boolean);
  if (words.length === 0) return [''];
  const lines: string[] = [];
  let current = words[0];

  for (let i = 1; i < words.length; i++) {
    const candidate = `${current} ${words[i]}`;
    if (ctx.measureText(candidate).width <= maxWidth) {
      current = candidate;
    } else {
      lines.push(current);
      current = words[i];
    }
  }
  lines.push(current);
  return lines;
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawCornerBrackets(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  arm: number,
  color: string,
  lineWidth: number
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;

  // Top-left
  ctx.beginPath();
  ctx.moveTo(x, y + arm);
  ctx.lineTo(x, y);
  ctx.lineTo(x + arm, y);
  ctx.stroke();

  // Top-right
  ctx.beginPath();
  ctx.moveTo(x + w - arm, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w, y + arm);
  ctx.stroke();

  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(x, y + h - arm);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x + arm, y + h);
  ctx.stroke();

  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(x + w - arm, y + h);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x + w, y + h - arm);
  ctx.stroke();

  ctx.restore();
}

function drawBotanicalTwig(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  color: string,
  scale = 1
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1.6;

  // Stem
  ctx.beginPath();
  ctx.moveTo(-48, 0);
  ctx.lineTo(48, 0);
  ctx.stroke();

  // Central diamond leaf
  ctx.beginPath();
  ctx.moveTo(0, -10);
  ctx.quadraticCurveTo(10, 0, 0, 10);
  ctx.quadraticCurveTo(-10, 0, 0, -10);
  ctx.fill();

  // Left and right flanking leaves
  [-24, 24].forEach((offset) => {
    ctx.beginPath();
    ctx.ellipse(offset, -5, 8, 3.4, offset < 0 ? -0.45 : 0.45, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(offset, 5, 8, 3.4, offset < 0 ? 0.45 : -0.45, 0, Math.PI * 2);
    ctx.stroke();
  });

  ctx.restore();
}

/**
 * High-DPI Canvas A4 Cover Sheet Renderer (794 x 1123 logical pt scaled by factor 2.5 => 1985 x 2808 px)
 * Guarantees crisp typography for English and Bengali, zero html2canvas CSS parsing errors,
 * and 1:1 visual fidelity with CoverSheetPreview.
 */
export async function renderCoverToCanvas(
  data: CoverFormData,
  scale = 2.5
): Promise<HTMLCanvasElement> {
  if (typeof document !== 'undefined' && 'fonts' in document) {
    try {
      await document.fonts.ready;
    } catch {
      // ignore font loading wait errors
    }
  }

  const LOGICAL_W = 794;
  const LOGICAL_H = 1123;

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(LOGICAL_W * scale);
  canvas.height = Math.round(LOGICAL_H * scale);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not acquire 2D canvas context.');
  }

  ctx.scale(scale, scale);
  const palette = getCoverDesignPalette(data.designId, data.monochromePrint);

  // 1. Paper Base
  ctx.fillStyle = palette.paper;
  ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);

  // 2. Design-specific frames, sidebars, or banners
  const isRibbon = data.designId === 'botanical-ribbon';
  const isBanner = data.designId === 'emerald-banner';
  const isMinimal = data.designId === 'minimal-studio';

  if (data.designId === 'classic-academic') {
    ctx.strokeStyle = palette.primary;
    ctx.lineWidth = 1.6;
    ctx.strokeRect(36, 36, LOGICAL_W - 72, LOGICAL_H - 72);
    ctx.strokeStyle = palette.accent;
    ctx.lineWidth = 0.7;
    ctx.strokeRect(43, 43, LOGICAL_W - 86, LOGICAL_H - 86);
  } else if (data.designId === 'forestry-botanical') {
    ctx.strokeStyle = palette.primary;
    ctx.lineWidth = 2;
    ctx.strokeRect(34, 34, LOGICAL_W - 68, LOGICAL_H - 68);
    ctx.strokeStyle = palette.accent;
    ctx.lineWidth = 1;
    ctx.strokeRect(42, 42, LOGICAL_W - 84, LOGICAL_H - 84);
    drawCornerBrackets(ctx, 26, 26, LOGICAL_W - 52, LOGICAL_H - 52, 34, palette.accent, 2.4);
  } else if (data.designId === 'swiss-minimal') {
    ctx.strokeStyle = palette.primary;
    ctx.lineWidth = 2.5;
    ctx.strokeRect(34, 34, LOGICAL_W - 68, LOGICAL_H - 68);
    ctx.lineWidth = 0.9;
    ctx.strokeRect(42, 42, LOGICAL_W - 84, LOGICAL_H - 84);
  } else if (data.designId === 'royal-herbarium' || data.designId === 'navy-gold-formal') {
    ctx.strokeStyle = palette.primary;
    ctx.lineWidth = 2;
    ctx.strokeRect(34, 34, LOGICAL_W - 68, LOGICAL_H - 68);
    ctx.strokeStyle = palette.accent;
    ctx.lineWidth = 1.2;
    ctx.strokeRect(42, 42, LOGICAL_W - 84, LOGICAL_H - 84);
    drawCornerBrackets(ctx, 28, 28, LOGICAL_W - 56, LOGICAL_H - 56, 28, palette.primary, 2.5);
  } else if (isBanner) {
    ctx.fillStyle = palette.headerBg || palette.primary;
    ctx.fillRect(0, 0, LOGICAL_W, 252);
    ctx.fillStyle = palette.accent;
    ctx.fillRect(0, 252, LOGICAL_W, 5);
    ctx.strokeStyle = palette.plaqueBorder;
    ctx.lineWidth = 1;
    ctx.strokeRect(34, 276, LOGICAL_W - 68, LOGICAL_H - 310);
  } else if (isRibbon) {
    ctx.fillStyle = palette.primary;
    ctx.fillRect(0, 0, 44, LOGICAL_H);
    ctx.fillStyle = palette.accent;
    ctx.fillRect(44, 0, 8, LOGICAL_H);
    ctx.strokeStyle = palette.plaqueBorder;
    ctx.lineWidth = 0.8;
    ctx.strokeRect(72, 36, LOGICAL_W - 108, LOGICAL_H - 72);
  } else if (isMinimal) {
    ctx.strokeStyle = palette.accent;
    ctx.lineWidth = 1;
    ctx.strokeRect(46, 46, LOGICAL_W - 92, LOGICAL_H - 92);
  }

  const contentLeft = isRibbon ? 96 : 74;
  const contentRight = isRibbon ? LOGICAL_W - 58 : LOGICAL_W - 74;
  const contentWidth = contentRight - contentLeft;
  const centerX = (contentLeft + contentRight) / 2;

  const serifFont = '"Fraunces", "Cormorant Garamond", "Noto Serif Bengali", Georgia, serif';
  const sansFont = '"Manrope", "Noto Sans Bengali", system-ui, sans-serif';

  // 3. University Header & Crest Logo
  let y = isBanner ? 42 : 76;

  if (data.showLogo) {
    const logoImg = await loadImage(SUST_LOGO_URL);
    const logoSize = isBanner ? 74 : 84;
    if (isBanner) {
      ctx.save();
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(centerX, y + logoSize / 2, logoSize / 2 + 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    if (logoImg) {
      ctx.drawImage(logoImg, centerX - logoSize / 2, y, logoSize, logoSize);
    }
    y += logoSize + 24;
  } else {
    y += 18;
  }

  // University Name
  ctx.textAlign = 'center';
  ctx.fillStyle = isBanner ? (palette.headerText || '#FFFFFF') : palette.primary;
  ctx.font = `700 22px ${serifFont}`;
  const uniLines = wrapLines(ctx, data.universityName || 'Shahjalal University of Science and Technology, Sylhet', contentWidth - 20);
  uniLines.forEach((line) => {
    ctx.fillText(line, centerX, y);
    y += 28;
  });

  // Department Name
  y += 2;
  ctx.fillStyle = isBanner ? '#BBC4A6' : palette.secondary;
  ctx.font = `600 15.5px ${sansFont}`;
  const deptLines = wrapLines(ctx, formatDepartmentHeading(data.department), contentWidth - 20);
  deptLines.forEach((line) => {
    ctx.fillText(line, centerX, y);
    y += 22;
  });

  if (isBanner) {
    y = 305;
  } else {
    y += 14;
    if (data.designId === 'forestry-botanical' || data.designId === 'royal-herbarium') {
      drawBotanicalTwig(ctx, centerX, y, palette.accent, 1.0);
      y += 28;
    } else {
      ctx.strokeStyle = palette.accent;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(centerX - 110, y);
      ctx.lineTo(centerX + 110, y);
      ctx.stroke();
      y += 28;
    }
  }

  // 4. Document Type Title (e.g., LAB REPORT / ASSIGNMENT)
  y += 12;
  ctx.fillStyle = palette.primary;
  ctx.font = `700 29px ${serifFont}`;
  const coverHeadline = data.coverType.toUpperCase();
  ctx.fillText(coverHeadline, centerX, y);

  // Subtle rule under document type
  y += 12;
  ctx.strokeStyle = palette.accent;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(centerX - 64, y);
  ctx.lineTo(centerX + 64, y);
  ctx.stroke();

  // 5. Course Code & Course Title Plaque
  y += 30;
  ctx.font = `600 18.5px ${serifFont}`;
  const courseTitleLines = wrapLines(ctx, data.courseTitle || 'Course Title', contentWidth - 64);
  const plaqueHeight = 68 + courseTitleLines.length * 25;

  drawRoundedRect(ctx, contentLeft + 18, y, contentWidth - 36, plaqueHeight, 8);
  ctx.fillStyle = palette.plaqueBg;
  ctx.fill();
  ctx.strokeStyle = palette.plaqueBorder;
  ctx.lineWidth = data.designId === 'swiss-minimal' ? 2 : 1.5;
  ctx.stroke();

  let py = y + 31;
  ctx.fillStyle = palette.secondary;
  ctx.font = `700 13.5px ${sansFont}`;
  ctx.fillText(`COURSE CODE : ${(data.courseCode || 'FES 0821xxxx').toUpperCase()}`, centerX, py);

  py += 27;
  ctx.fillStyle = palette.ink;
  ctx.font = `600 18.5px ${serifFont}`;
  courseTitleLines.forEach((line) => {
    ctx.fillText(line, centerX, py);
    py += 25;
  });

  y += plaqueHeight + 34;

  // 6. Topic / Experiment Details Block
  const detailRows: Array<{ label: string; value: string }> =
    data.coverType === 'Lab Report'
      ? [
          { label: 'Experiment No.', value: data.experimentNo || '01' },
          { label: 'Experiment Name', value: data.experimentName || '—' },
          { label: 'Date of Experiment', value: formatCoverDate(data.experimentDate) },
          { label: 'Date of Submission', value: formatCoverDate(data.reportSubmissionDate) },
        ]
      : [
          {
            label: data.coverType === 'Assignment' ? 'Assignment Title' : `${data.coverType} Title`,
            value: data.topicTitle || '—',
          },
          {
            label: data.coverType === 'Assignment' ? 'Date of Assignment' : 'Date of Topic',
            value: formatCoverDate(data.topicDate),
          },
          { label: 'Date of Submission', value: formatCoverDate(data.submissionDate) },
        ];

  ctx.textAlign = 'left';
  detailRows.forEach((row) => {
    ctx.font = `600 15px ${sansFont}`;
    const labelStr = `${row.label} : `;
    const labelW = ctx.measureText(labelStr).width;
    ctx.fillStyle = palette.secondary;
    ctx.fillText(labelStr, contentLeft + 22, y);

    ctx.font = `500 15.5px ${serifFont}`;
    ctx.fillStyle = palette.ink;
    const valLines = wrapLines(ctx, row.value, contentWidth - 44 - labelW);
    valLines.forEach((vl, idx) => {
      ctx.fillText(vl, idx === 0 ? contentLeft + 22 + labelW : contentLeft + 22, y);
      y += 24;
    });
    y += 4;
  });

  // 7. Submission Columns (Submitted To | Submitted By) pinned cleanly toward lower third
  const footerTop = Math.max(y + 34, 718);
  const colGap = 36;
  const colW = (contentWidth - 36 - colGap) / 2;
  const leftColX = contentLeft + 18;
  const rightColX = leftColX + colW + colGap;
  const dividerX = leftColX + colW + colGap / 2;

  // Top horizontal divider rule
  ctx.strokeStyle = palette.plaqueBorder;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(leftColX, footerTop - 16);
  ctx.lineTo(contentRight - 18, footerTop - 16);
  ctx.stroke();

  // Vertical center divider
  ctx.strokeStyle = palette.accent;
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(dividerX, footerTop);
  ctx.lineTo(dividerX, footerTop + 265);
  ctx.stroke();

  // Left Column: Submitted To
  let ly = footerTop + 20;
  ctx.fillStyle = palette.primary;
  ctx.font = `700 15.5px ${sansFont}`;
  ctx.fillText('SUBMITTED TO', leftColX, ly);

  ly += 8;
  ctx.strokeStyle = palette.accent;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(leftColX, ly);
  ctx.lineTo(leftColX + 68, ly);
  ctx.stroke();

  ly += 28;
  ctx.fillStyle = palette.ink;
  ctx.font = `700 16.5px ${serifFont}`;
  wrapLines(ctx, data.teacherName || 'Course Instructor', colW - 8).forEach((l) => {
    ctx.fillText(l, leftColX, ly);
    ly += 23;
  });

  ly += 2;
  ctx.fillStyle = palette.mutedInk;
  ctx.font = `500 14.5px ${sansFont}`;
  if (data.teacherDesignation) {
    wrapLines(ctx, data.teacherDesignation, colW - 8).forEach((l) => {
      ctx.fillText(l, leftColX, ly);
      ly += 21;
    });
  }
  const tDept = formatDepartmentHeading(data.teacherDepartment || data.department);
  wrapLines(ctx, tDept, colW - 8).forEach((l) => {
    ctx.fillText(l, leftColX, ly);
    ly += 21;
  });
  wrapLines(ctx, data.teacherUniversity || data.universityName, colW - 8).forEach((l) => {
    ctx.fillText(l, leftColX, ly);
    ly += 21;
  });

  // Right Column: Submitted By
  let ry = footerTop + 20;
  ctx.fillStyle = palette.primary;
  ctx.font = `700 15.5px ${sansFont}`;
  ctx.fillText('SUBMITTED BY', rightColX, ry);

  ry += 8;
  ctx.strokeStyle = palette.accent;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(rightColX, ry);
  ctx.lineTo(rightColX + 68, ry);
  ctx.stroke();

  ry += 28;
  const studentRows: Array<[string, string]> = [
    ['Name', data.studentName || 'Student Name'],
    ['Reg. No.', data.registrationNo || '2023xxxxxx'],
  ];
  if (data.batch.trim()) studentRows.push(['Batch', data.batch.trim()]);
  if (data.group.trim()) studentRows.push(['Group', data.group.trim()]);
  if (data.semester.trim()) studentRows.push(['Semester', data.semester.trim()]);
  if (data.session.trim()) studentRows.push(['Session', data.session.trim()]);
  studentRows.push(['Department', data.studentDepartment.trim() || 'FES, SUST']);

  studentRows.forEach(([lbl, val]) => {
    ctx.font = `600 13.5px ${sansFont}`;
    const k = `${lbl} : `;
    const kw = ctx.measureText(k).width;
    ctx.fillStyle = palette.secondary;
    ctx.fillText(k, rightColX, ry);

    ctx.font = lbl === 'Name' ? `700 15px ${serifFont}` : `500 14px ${sansFont}`;
    ctx.fillStyle = palette.ink;
    const vLines = wrapLines(ctx, val, colW - kw - 6);
    vLines.forEach((vl, i) => {
      ctx.fillText(vl, i === 0 ? rightColX + kw : rightColX + 12, ry);
      ry += 22;
    });
    ry += 2;
  });

  // Footer micro-line
  ctx.textAlign = 'center';
  ctx.fillStyle = palette.mutedInk;
  ctx.font = `500 10.5px ${sansFont}`;
  ctx.fillText(
    `${data.universityName || 'Shahjalal University of Science and Technology'} · ${formatDepartmentHeading(data.department)}`,
    centerX,
    LOGICAL_H - 52
  );

  return canvas;
}

export async function exportCoverAsPng(data: CoverFormData): Promise<void> {
  const canvas = await renderCoverToCanvas(data, 2.5);
  const dataUrl = canvas.toDataURL('image/png', 1.0);
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = buildCoverFilename(data, 'png');
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export async function exportCoverAsPdf(data: CoverFormData): Promise<void> {
  const canvas = await renderCoverToCanvas(data, 2.5);
  const imgData = canvas.toDataURL('image/png', 1.0);
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });
  pdf.addImage(imgData, 'PNG', 0, 0, 210, 297, undefined, 'FAST');
  pdf.save(buildCoverFilename(data, 'pdf'));
}
