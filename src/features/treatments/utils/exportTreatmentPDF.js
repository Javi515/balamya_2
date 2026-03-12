import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Esta función dibuja el PDF 100% vectorial usando jsPDF y el plugin autoTable
export const generateTreatmentPDF = (patientData, protocolRows, appliedRows, formRefs, variant) => {
    // 1. Configuración inicial del documento
    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'letter'
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 12; // Margen uniforme
    const usableWidth = pageWidth - (margin * 2);

    // Tipografía base
    pdf.setFont('helvetica');

    // MÉTODOS DE AYUDA (HELPER FUNCTIONS)
    let currentY = margin;

    const addTitle = (text, fontSize = 11, fontStyle = 'bold', align = 'center', color = [0, 0, 0]) => {
        pdf.setFontSize(fontSize);
        pdf.setFont('helvetica', fontStyle);
        pdf.setTextColor(color[0], color[1], color[2]);
        const x = align === 'center' ? pageWidth / 2 : margin;
        pdf.text(text, x, currentY, { align });
        currentY += (fontSize * 0.35) + 2; // Salto de línea dinámico
    };

    const addSectionHeader = (title) => {
        currentY += 4;
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(0, 0, 0);
        pdf.text(title.toUpperCase(), margin, currentY);
        currentY += 1.5;
        // Línea debajo del título
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

            // Etiqueta
            pdf.setFontSize(7);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(0, 0, 0);
            pdf.text(field.label, x, y);

            // Valor
            pdf.setFontSize(8);
            pdf.setFont('helvetica', 'normal');
            const val = field.value || ' ';
            pdf.text(val, x, y + 4);

            // Línea de subrayado
            pdf.setDrawColor(150, 150, 150);
            pdf.setLineWidth(0.2);
            pdf.line(x, y + 5, x + colWidth - 5, y + 5);

            x += colWidth;
        });

        return y + maxRowHeight + 2;
    };

    // --- HOJA PRINCIPAL ---

    // Encabezado con logos condicionales
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

    // Título Principal
    addTitle('DIRECCIÓN DEL ZOOLÓGICO MIGUEL ÁLVAREZ DEL TORO', 11);
    addTitle('CLÍNICA VETERINARIA', 10, 'normal');
    currentY += 4;
    addTitle(variant === 'aves' ? 'FORMATO DE TRATAMIENTO AVES' : variant === 'grupal' ? 'FORMATO DE TRATAMIENTO GRUPAL' : 'FORMATO DE TRATAMIENTO', 12, 'bold');
    currentY += 6;

    // 2. Datos Generales
    addSectionHeader('Datos Generales');

    let generalFields1 = [];
    if (variant === 'grupal') {
        generalFields1 = [
            { label: 'Nombre Científico', value: formRefs.nombreCientifico || patientData?.scientificName || '' },
            { label: 'Nombre Común', value: formRefs.nombreComun || patientData?.commonName || '' },
            { label: 'Ubicación', value: formRefs.ubicacion || patientData?.location || '' },
            { label: 'No de Ejemplares', value: formRefs.numeroEjemplares || '' }
        ];
    } else {
        generalFields1 = [
            { label: 'Nombre Científico', value: formRefs.nombreCientifico || patientData?.scientificName || '' },
            { label: 'Nombre Común', value: formRefs.nombreComun || patientData?.commonName || '' },
            { label: 'Identificación', value: formRefs.identificacion || patientData?.id || '' },
            { label: 'Sexo', value: formRefs.sexo || '' },
            { label: 'Peso', value: formRefs.peso || '' },
            { label: 'Edad', value: formRefs.edad || patientData?.age || '' },
            { label: 'Ubicación', value: formRefs.ubicacion || patientData?.location || '' },
        ];
    }

    currentY = drawGridOfFields(generalFields1, currentY, 4);

    // 3. Anamnesis
    addSectionHeader('Anamnesis');
    autoTable(pdf, {
        startY: currentY,
        body: [[formRefs.anamnesis || ' ']],
        theme: 'plain',
        bodyStyles: { fontSize: 8, textColor: [0, 0, 0], halign: 'justify', cellPadding: 1 },
        margin: { left: margin, right: margin },
        tableWidth: usableWidth,
    });
    currentY = pdf.lastAutoTable.finalY + 1;
    pdf.setDrawColor(150, 150, 150);
    pdf.setLineWidth(0.2);
    pdf.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 8;

    // Impresiones Diagnósticas (Solo Variante Aves)
    if (variant === 'aves') {
        addSectionHeader('Impresiones Diagnósticas');
        autoTable(pdf, {
            startY: currentY,
            body: [[formRefs.impresionesDiagnosticas || ' ']],
            theme: 'plain',
            bodyStyles: { fontSize: 8, textColor: [0, 0, 0], halign: 'justify', cellPadding: 1 },
            margin: { left: margin, right: margin },
            tableWidth: usableWidth,
        });
        currentY = pdf.lastAutoTable.finalY + 1;
        pdf.setDrawColor(150, 150, 150);
        pdf.setLineWidth(0.2);
        pdf.line(margin, currentY, pageWidth - margin, currentY);
        currentY += 8;
    }

    // 4. Protocolo de Tratamiento
    addSectionHeader('Protocolo de Tratamiento');
    const protocolData = formRefs.protocolDataRaw && formRefs.protocolDataRaw.length > 0
        ? formRefs.protocolDataRaw
        : [['', '', '', '', '', '', ''], ['', '', '', '', '', '', '']];

    const dosisLabel = variant === 'normal' ? 'DOSIS MG/KG' : 'DOSIS';

    autoTable(pdf, {
        startY: currentY,
        head: [['PRINCIPIO ACTIVO', dosisLabel, 'PRODUCTO COMERCIAL', 'CANTIDAD AL APLICAR', 'VÍA DE ADMÓN', 'FRECUENCIA', 'NO DE DÍAS']],
        body: protocolData.length > 0 ? protocolData : [['', '', '', '', '', '', ''], ['', '', '', '', '', '', '']],
        theme: 'grid',
        headStyles: { fillColor: [230, 230, 230], textColor: [0, 0, 0], fontSize: 6, fontStyle: 'bold', halign: 'center' },
        bodyStyles: { fontSize: 7, textColor: [0, 0, 0], halign: 'center' },
        margin: { left: margin, right: margin },
        styles: { cellPadding: 2, lineColor: [0, 0, 0], lineWidth: 0.2 },
    });
    currentY = pdf.lastAutoTable.finalY + 8;

    // --- SALTO DE HOJA SI NO HAY ESPACIO ---
    if (currentY > 200) {
        pdf.addPage();
        currentY = margin;
        addTitle(variant === 'aves' ? 'FORMATO DE TRATAMIENTO AVES (Continuación)' : variant === 'grupal' ? 'FORMATO DE TRATAMIENTO GRUPAL (Continuación)' : 'FORMATO DE TRATAMIENTO (Continuación)', 10, 'bold');
        currentY += 4;
    }

    // 5. Tratamiento Aplicado
    addSectionHeader('Tratamiento Aplicado');

    if (variant === 'aves') {
        const appliedAvesData = formRefs.appliedDataRaw && formRefs.appliedDataRaw.length > 0
            ? formRefs.appliedDataRaw
            : [['', '', '', '', ''], ['', '', '', '', '']];

        autoTable(pdf, {
            startY: currentY,
            head: [['FECHA', 'HORA', 'TRATAMIENTO', 'OBSERVACIONES', 'RESPONSABLE']],
            body: appliedAvesData.length > 0 ? appliedAvesData : [['', '', '', '', ''], ['', '', '', '', '']],
            theme: 'grid',
            headStyles: { fillColor: [230, 230, 230], textColor: [0, 0, 0], fontSize: 7, fontStyle: 'bold', halign: 'center' },
            bodyStyles: { fontSize: 8, textColor: [0, 0, 0], halign: 'center' },
            margin: { left: margin, right: margin },
            styles: { cellPadding: 2, lineColor: [0, 0, 0], lineWidth: 0.2 },
        });
        currentY = pdf.lastAutoTable.finalY + 8;
    } else if (variant === 'grupal') {
        // Variante GRUPAL tiene tabla lineal simple igual que Aves
        const appliedGrupalData = formRefs.appliedDataRaw && formRefs.appliedDataRaw.length > 0
            ? formRefs.appliedDataRaw
            : [['', ''], ['', '']];

        autoTable(pdf, {
            startY: currentY,
            head: [['FECHA', 'TRATAMIENTO APLICADO']],
            body: appliedGrupalData.length > 0 ? appliedGrupalData : [['', ''], ['', '']],
            theme: 'grid',
            headStyles: { fillColor: [230, 230, 230], textColor: [0, 0, 0], fontSize: 7, fontStyle: 'bold', halign: 'center' },
            bodyStyles: { fontSize: 8, textColor: [0, 0, 0], halign: 'center' },
            margin: { left: margin, right: margin },
            styles: { cellPadding: 2, lineColor: [0, 0, 0], lineWidth: 0.2 },
            columnStyles: {
                0: { cellWidth: 35 } // Fecha width
            }
        });
        currentY = pdf.lastAutoTable.finalY + 8;

    } else {
        // Variante NORMAL es especial, viene en bloques de 4 filas
        const blocks = formRefs.appliedDataRaw || [];

        // Generar tabla de bloques manualmente con AutoTable para Variant Normal
        // We reshape the raw data into AutoTable compatible blocks
        const customAppliedBody = [];

        blocks.forEach(block => {
            // Block is basically a list of 3 rows text + 1 textarea
            if (block && block.length >= 4) {
                // Fila principal
                customAppliedBody.push([
                    { content: block[0][0] || ' ', styles: { halign: 'center' } }, // Fecha
                    { content: block[0][1] || ' ', styles: { halign: 'left' } }, // Tratam
                    { content: block[0][2] || ' ', styles: { halign: 'center' } }  // Resp
                ]);
                // Segunda Fila
                customAppliedBody.push([
                    { content: block[1][0] || ' ', styles: { halign: 'center' } }, // Fecha (Vacio)
                    { content: block[1][1] || ' ', styles: { halign: 'left' } }, // Tratam
                    { content: block[1][2] || ' ', styles: { halign: 'center' } }  // Resp
                ]);
                // Tercer Fila
                customAppliedBody.push([
                    { content: block[2][0] || ' ', styles: { halign: 'center' } }, // Fecha (Vacio)
                    { content: block[2][1] || ' ', styles: { halign: 'left' } }, // Tratam
                    { content: block[2][2] || ' ', styles: { halign: 'center' } }  // Resp
                ]);
                // Observaciones
                customAppliedBody.push([
                    { content: 'Observaciones: \n' + (block[3][0] || ' '), colSpan: 3, styles: { halign: 'left', fontStyle: 'italic', fillColor: [250, 250, 250] } }
                ]);
            }
        });

        if (customAppliedBody.length === 0) {
            customAppliedBody.push(['', '', ''], ['', '', ''], ['', '', ''], [{ content: 'Observaciones:\n', colSpan: 3 }]);
        }

        autoTable(pdf, {
            startY: currentY,
            head: [['FECHA', 'TRATAMIENTO APLICADO', 'RESPONSABLE']],
            body: customAppliedBody,
            theme: 'grid',
            headStyles: { fillColor: [230, 230, 230], textColor: [0, 0, 0], fontSize: 7, fontStyle: 'bold', halign: 'center' },
            bodyStyles: { fontSize: 8, textColor: [0, 0, 0], halign: 'center' },
            margin: { left: margin, right: margin },
            styles: { cellPadding: 2, lineColor: [0, 0, 0], lineWidth: 0.2 },
            columnStyles: {
                0: { cellWidth: 25 }, // Fecha
                2: { cellWidth: 35 } // Responsable
            }
        });
        currentY = pdf.lastAutoTable.finalY + 8;
    }

    // Paginación si es necesario para Firmas
    if (currentY > 230) {
        pdf.addPage();
        currentY = margin;
    } else {
        currentY += 20;
    }


    // 6. Firmas y Cierre
    const signWidth = 70;
    const centerX = pageWidth / 2;
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.5);
    pdf.line(centerX - (signWidth / 2), currentY, centerX + (signWidth / 2), currentY);

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Responsable Clínico', centerX, currentY - 2, { align: 'center' });

    // Hoja info
    pdf.text(`Hoja: ${formRefs.numeroHoja || '1'}`, pageWidth - margin - 15, currentY);

    // Guardar el PDF
    pdf.save(`Formato_Tratamiento_${variant}_${patientData?.id || 'Paciente'}.pdf`);
};
