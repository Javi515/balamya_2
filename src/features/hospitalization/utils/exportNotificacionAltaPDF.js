import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Vector-based PDF generation for Notificación de Alta
export const generateNotificacionAltaPDF = (formRefs) => {
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

    addTitle('Zoológico Regional Miguel Álvarez del Toro', 12, 'bold');
    addTitle('Clínica Veterinaria', 10, 'normal', 'center', [100, 100, 100]);
    currentY += 2;
    addTitle('Notificación de Alta', 11, 'bold');
    currentY += 6;

    // DATOS DEL EJEMPLAR
    addSectionHeader('Datos del Ejemplar');
    const row1 = [
        { label: 'Fecha', value: formRefs.fecha },
        { label: 'Área / Anexo Veterinaria', value: formRefs.area },
    ];
    currentY = drawGridOfFields(row1, currentY, 2);

    const row2 = [
        { label: 'Identificación', value: formRefs.identificacion },
        { label: 'Especie', value: formRefs.especie },
        { label: 'Nombre Común', value: formRefs.nombreComun },
    ];
    currentY = drawGridOfFields(row2, currentY, 3);

    const row3 = [
        { label: 'No. de Albergue / Jaula / Terrario', value: formRefs.albergue },
        { label: 'Edad', value: formRefs.edad },
        { label: 'Sexo', value: formRefs.sexo },
    ];
    currentY = drawGridOfFields(row3, currentY, 3);

    // DESCRIPCIÓN DEL ALTA
    addSectionHeader('Descripción del Alta');
    drawTextArea(formRefs.descripcion);

    // HORA DE ALTA (Special Layout)
    addSectionHeader('Hora de Alta');
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);

    const sentence = `Hora:  ${formRefs.horaAlta || '_____'}  de  ${formRefs.fechaAlta || '_______'}  del Alta del paciente:  ${formRefs.pacienteAlta || '___________'}`;
    pdf.text(sentence, margin, currentY);
    currentY += 10;

    // FIRMAS
    currentY += 30; // Leave space for signature
    if (currentY > 260) {
        pdf.addPage();
        currentY = margin + 30;
    }

    const signWidth = 60;
    let x = margin + 20; // First signature
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.5);
    pdf.line(x, currentY, x + signWidth, currentY);

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Notificó', x + (signWidth / 2), currentY + 5, { align: 'center' });

    x = pageWidth - margin - signWidth - 20; // Second signature
    pdf.line(x, currentY, x + signWidth, currentY);
    pdf.text('Enterado', x + (signWidth / 2), currentY + 5, { align: 'center' });


    pdf.save('Notificacion_De_Alta.pdf');
};
