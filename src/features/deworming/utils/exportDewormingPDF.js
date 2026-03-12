import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Vector-based PDF generation for Deworming Calendar
export const generateDewormingPDF = (generalData, records, formRefs) => {
    const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'letter'
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 12;
    const usableWidth = pageWidth - (margin * 2);

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

    // --- HEADER ---
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

    addTitle('2025, Año de "Rosario Castellanos Figueroa"', 9, 'normal', 'center', [100, 100, 100]);
    currentY += 2;
    addTitle('CALENDARIO DE DESPARASITACIÓN', 12, 'bold');
    currentY += 8;

    // --- DATOS GENERALES ---
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text('DATOS GENERALES', margin, currentY);
    currentY += 1.5;

    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.5);
    pdf.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 4;

    const drawGridOfFields = (fields, startY, colCount = 4) => {
        const colWidth = usableWidth / colCount;
        let x = margin;
        let y = startY;
        let maxRowHeight = 10;

        fields.forEach((field, index) => {
            if (index > 0 && index % colCount === 0) {
                x = margin;
                y += maxRowHeight;
            }

            pdf.setFontSize(7);
            pdf.setFont('helvetica', 'bold');
            pdf.text(field.label, x, y);

            pdf.setFontSize(8);
            pdf.setFont('helvetica', 'normal');
            const val = field.value || ' ';
            pdf.text(val, x, y + 4);

            pdf.setDrawColor(150, 150, 150);
            pdf.setLineWidth(0.2);
            pdf.line(x, y + 5, x + colWidth - 5, y + 5);

            x += colWidth;
        });

        return y + maxRowHeight + 5;
    };

    const generalFields = [
        { label: 'GRUPO', value: generalData.grupo },
        { label: 'NOMBRE CIENTÍFICO', value: generalData.nombreCientifico },
        { label: 'NOMBRE COMÚN', value: generalData.nombreComun },
        { label: 'SEXO', value: generalData.sexo },
        { label: 'PESO', value: generalData.peso },
        { label: 'EDAD', value: generalData.edad },
        { label: 'UBICACIÓN', value: generalData.ubicacion },
        { label: 'ESTADO FISIOLÓGICO', value: generalData.estadoFisiologico },
        { label: 'IDENTIFICACIÓN', value: generalData.identificacion },
    ];

    currentY = drawGridOfFields(generalFields, currentY, 5); // 5 cols since landscape

    // --- TABLE ---
    const tableData = records.length > 0 ? records.map(rec => [
        rec.fecha || '',
        rec.principioActivo || '',
        rec.dosisMgKg || '',
        rec.productoComercial || '',
        rec.dosisTotal || '',
        rec.via || '',
        rec.frecuencia || '',
        rec.proxima || ''
    ]) : [['', '', '', '', '', '', '', '']];

    autoTable(pdf, {
        startY: currentY,
        head: [['FECHA', 'PRINCIPIO ACTIVO', 'DOSIS MG/KG', 'PRODUCTO COMERCIAL', 'DOSIS TOTAL (ml/tab)', 'VÍA DE ADMINISTRACIÓN', 'FRECUENCIA', 'PRÓXIMA DESPARASITACIÓN']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [230, 230, 230], textColor: [0, 0, 0], fontSize: 7, fontStyle: 'bold', halign: 'center' },
        bodyStyles: { fontSize: 8, textColor: [0, 0, 0], halign: 'center' },
        margin: { left: margin, right: margin },
        styles: { cellPadding: 2, lineColor: [0, 0, 0], lineWidth: 0.2 },
    });

    pdf.save('Calendario_Desparasitacion.pdf');
};
