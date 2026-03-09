import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Vector-based PDF generation for Hosp Follow Up
export const generateHospFollowUpPDF = (formRefs) => {
    const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'letter'
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 12;

    pdf.setFont('helvetica');
    let currentY = margin;

    const addTitle = (text, fontSize = 11, fontStyle = 'bold', align = 'center', color = [0, 0, 0]) => {
        pdf.setFontSize(fontSize);
        pdf.setFont('helvetica', fontStyle);
        pdf.setTextColor(color[0], color[1], color[2]);
        const x = align === 'center' ? pageWidth / 2 : margin;
        pdf.text(text, x, currentY, { align });
        currentY += (fontSize * 0.35) + 2;
    };

    // --- HOJA PRINCIPAL ---
    const logoSize = 18;
    if (formRefs.logoLeft) {
        try {
            pdf.addImage(formRefs.logoLeft, 'PNG', margin, currentY - 2, logoSize, logoSize);
        } catch (e) {
            console.error("Error drawing left logo", e);
        }
    }

    if (formRefs.logoRight) {
        try {
            pdf.addImage(formRefs.logoRight, 'PNG', pageWidth - margin - logoSize, currentY - 2, logoSize, logoSize);
        } catch (e) {
            console.error("Error drawing right logo", e);
        }
    }

    addTitle('COORDINACIÓN ESTATAL', 9, 'normal', 'center', [100, 100, 100]);
    currentY -= 1;
    addTitle('CURADURÍA GENERAL DE NUTRICIÓN Y SALUD ANIMAL', 9, 'normal', 'center', [100, 100, 100]);
    currentY += 2;
    addTitle('FORMATO DE SEGUIMIENTO DE PACIENTES HOSPITALIZADOS EN CLÍNICA VETERINARIA', 12, 'bold');
    currentY += 1;
    addTitle('Calzada Cerro Hueco S/N, Col. El Zapotal, C.P. 29094, Tuxtla Gutiérrez, Chiapas', 8, 'normal', 'center', [100, 100, 100]);
    currentY += 6;

    // --- FECHA Y RESPONSABLE ---
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text('Fecha:', margin, currentY);
    pdf.setFont('helvetica', 'normal');
    pdf.text(formRefs.fecha || ' ', margin + 12, currentY);

    const respX = pageWidth / 2;
    pdf.setFont('helvetica', 'bold');
    pdf.text('Responsable:', respX, currentY);
    pdf.setFont('helvetica', 'normal');
    pdf.text(formRefs.responsable || ' ', respX + 22, currentY);

    currentY += 6;

    // --- TABLA DE SEGUIMIENTO ---
    const tableData = formRefs.tableData && formRefs.tableData.length > 0
        ? formRefs.tableData
        : [['', '', '', '', '', '', '', '', '', '']];

    autoTable(pdf, {
        startY: currentY,
        head: [['PACIENTE\n(Nombre / ID)', 'HORA', 'PESO', 'F.C.', 'F.R.', 'TEMP.', 'PULSO', 'MUCOSAS', 'TLLC', 'OBSERVACIONES']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [230, 230, 230], textColor: [0, 0, 0], fontSize: 7, fontStyle: 'bold', halign: 'center', valign: 'middle' },
        bodyStyles: { fontSize: 8, textColor: [0, 0, 0], halign: 'center', valign: 'middle' },
        margin: { left: margin, right: margin },
        styles: { cellPadding: 2, lineColor: [0, 0, 0], lineWidth: 0.2 },
        columnStyles: {
            0: { cellWidth: 35 }, // Paciente
            1: { cellWidth: 15 }, // Hora
            9: { cellWidth: 'auto', halign: 'left' } // Observaciones
        }
    });

    pdf.save('Formato_Seguimiento_Hospitalizados.pdf');
};
