import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Vector-based PDF generation for Necropsy Report
export const generateNecropsyReportPDF = (formRefs) => {
    const pdf = new jsPDF({
        orientation: 'portrait',
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

    const addSectionHeader = (title) => {
        currentY += 4;
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(0, 0, 0);
        pdf.text(title.toUpperCase(), margin, currentY);
        currentY += 1.5;
        pdf.setDrawColor(0, 0, 0);
        pdf.setLineWidth(0.5);
        pdf.line(margin, currentY, pageWidth - margin, currentY);
        currentY += 4;
    };

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
            pdf.setTextColor(0, 0, 0);
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

        return y + maxRowHeight + 2;
    };

    const drawTextArea = (content) => {
        autoTable(pdf, {
            startY: currentY,
            body: [[content || ' ']],
            theme: 'plain',
            bodyStyles: { fontSize: 8, textColor: [0, 0, 0], halign: 'justify', cellPadding: 1 },
            margin: { left: margin, right: margin },
            tableWidth: usableWidth,
            pageBreak: 'auto'
        });
        currentY = pdf.lastAutoTable.finalY + 1;
        pdf.setDrawColor(150, 150, 150);
        pdf.setLineWidth(0.2);
        pdf.line(margin, currentY, pageWidth - margin, currentY);
        currentY += 6;
    };

    const drawFieldWithLabel = (label, content) => {
        if (currentY > 250) {
            pdf.addPage();
            currentY = margin;
        }
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(80, 80, 80);
        pdf.text(label, margin, currentY);
        currentY += 1;
        drawTextArea(content);
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

    addTitle('Coordinacion Estatal para el mejoramiento del zooMAT', 8, 'normal', 'center', [100, 100, 100]);
    addTitle('DIRECCIÓN DEL ZOOLÓGICO MIGUEL ÁLVAREZ DEL TORO', 11, 'bold');
    addTitle('CLÍNICA VETERINARIA', 10, 'normal', 'center', [100, 100, 100]);
    currentY += 2;
    addTitle('REPORTE DE NECROPSIA', 12, 'bold');
    currentY += 4;

    // FOLIO Y FECHAS
    const headerInfo = [
        { label: 'FOLIO NO:', value: formRefs.folio },
        { label: 'FECHA DE MUERTE:', value: formRefs.fechaMuerte },
        { label: 'FECHA DE NECROPSIA:', value: formRefs.fechaNecropsia },
    ];
    currentY = drawGridOfFields(headerInfo, currentY, 3);
    currentY += 2;

    // DATOS DEL EJEMPLAR
    addSectionHeader('Datos del Ejemplar');
    const animalData = [
        { label: 'NOMBRE CIENTÍFICO', value: formRefs.nombreCientifico },
        { label: 'NOMBRE COMÚN', value: formRefs.nombreComun },
        { label: 'PESO', value: formRefs.peso },
        { label: 'SEXO', value: formRefs.sexo },
        { label: 'GRUPO TAXONÓMICO', value: formRefs.grupoTaxonomico },
        { label: 'IDENTIFICACIÓN', value: formRefs.identificacion },
    ];
    currentY = drawGridOfFields(animalData, currentY, 3);

    // HISTORIA CLINICA
    addSectionHeader('Historia Clínica');
    drawTextArea(formRefs.historiaClinica);

    // OTROS / OBSERVACIONES
    addSectionHeader('Otros / Observaciones');
    drawTextArea(formRefs.otrosObservaciones);

    // HALLAZGOS MACROSCÓPICOS
    if (currentY > 230) {
        pdf.addPage();
        currentY = margin;
    }
    addSectionHeader('Hallazgos Macroscópicos');
    drawFieldWithLabel('Sistema Tegumentario', formRefs.sistemaTegumentario);
    drawFieldWithLabel('Sistema Cardio Respiratorio', formRefs.sistemaCardioRespiratorio);
    drawFieldWithLabel('Sistema Digestivo', formRefs.sistemaDigestivo);
    drawFieldWithLabel('Sistema Urogenital', formRefs.sistemaUrogenital);

    // Page break naturally falls around here
    if (currentY > 230) {
        pdf.addPage();
        currentY = margin;
    } else {
        addSectionHeader('Hallazgos Macroscópicos (Cont.)');
    }

    drawFieldWithLabel('Sistema Musculoesquelético', formRefs.sistemaMusculoesqueletico);
    drawFieldWithLabel('Sistema Nervioso', formRefs.sistemaNervioso);
    drawFieldWithLabel('Sistema Linfático', formRefs.sistemaLinfatico);

    // IMPRESIONES / DIAGNÓSTICO
    addSectionHeader('Impresiones y/o Posible Diagnóstico');
    drawTextArea(formRefs.impresionesDiagnostico);

    // CONTROL DE MUESTRAS
    if (currentY > 210) {
        pdf.addPage();
        currentY = margin;
    }
    addSectionHeader('Control de Muestras');

    const muestrasData = [
        { label: 'MUESTRAS REMITIDAS:', value: formRefs.muestrasRemitidas },
        { label: 'LABORATORIO:', value: formRefs.laboratorio },
    ];
    currentY = drawGridOfFields(muestrasData, currentY, 2);
    currentY += 4;

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(80, 80, 80);
    pdf.text('MÉTODO DE CONSERVACIÓN:', margin, currentY);
    currentY += 4;
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    pdf.text(formRefs.metodoConservacion || 'Ninguno', margin + 5, currentY);
    currentY += 6;

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(80, 80, 80);
    pdf.text('TEJIDOS COLECTADOS:', margin, currentY);
    currentY += 4;
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    pdf.text(formRefs.tejidosColectados || 'Ninguno', margin + 5, currentY);
    currentY += 6;

    drawFieldWithLabel('OTROS', formRefs.controlOtros);
    drawFieldWithLabel('OBSERVACIONES', formRefs.controlObservaciones);

    // FIRMAS
    currentY += 20;
    if (currentY > 260) {
        pdf.addPage();
        currentY = margin + 20;
    }

    const signWidth = 60;
    let x = margin + 20; // First signature
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.5);
    pdf.line(x, currentY, x + signWidth, currentY);

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text(formRefs.realizoNecropsia || 'Realizó Necropsia', x + (signWidth / 2), currentY + 5, { align: 'center' });

    x = pageWidth - margin - signWidth - 20; // Second signature
    pdf.line(x, currentY, x + signWidth, currentY);
    pdf.text(formRefs.firmaAutorizacion || 'Firma', x + (signWidth / 2), currentY + 5, { align: 'center' });

    pdf.save('Reporte_Necropsia.pdf');
};
