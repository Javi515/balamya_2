import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Esta función dibuja el PDF 100% vectorial usando jsPDF y el plugin autoTable
export const generateAnesthesiaPDF = (patientData, protocolRows, monitoringRows, formRefs) => {
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

    // --- HOJA 1 ---

    // Encabezado con logos condicionales
    const logoSize = 18;
    // Si hay logo izquierdo, se dibuja en la esquina superior izquierda
    if (formRefs.logoLeft) {
        try {
            pdf.addImage(formRefs.logoLeft, 'PNG', margin, currentY - 2, logoSize, logoSize);
        } catch (e) {
            console.error("Error drawing left logo", e);
        }
    }

    // Si hay logo derecho, se dibuja en la esquina superior derecha
    if (formRefs.logoRight) {
        try {
            pdf.addImage(formRefs.logoRight, 'PNG', pageWidth - margin - logoSize, currentY - 2, logoSize, logoSize);
        } catch (e) {
            console.error("Error drawing right logo", e);
        }
    }

    addTitle('DIRECCIÓN DEL ZOOLÓGICO MIGUEL ÁLVAREZ DEL TORO', 11);
    addTitle('CLÍNICA VETERINARIA', 10, 'normal');
    currentY += 4;
    addTitle('REGISTRO DE ANESTESIA', 12, 'bold');
    currentY += 6;

    // 2. Datos Generales
    addSectionHeader('Datos Generales');
    const generalFields1 = [
        { label: 'Fecha', value: formRefs.fecha || '' },
        { label: 'Especie', value: formRefs.especie || patientData?.scientificName || '' },
        { label: 'Identificación', value: formRefs.identificacion || patientData?.id || '' },
        { label: 'Sexo', value: formRefs.sexo || '' },
        { label: 'Peso (último registrado)', value: formRefs.pesoAnterior || '' },
        { label: 'Peso actualizado', value: formRefs.pesoActualizado || '' },
        { label: 'Edad', value: formRefs.edad || patientData?.age || '' },
        { label: 'Método de administración', value: formRefs.metodo || '' },
    ];
    currentY = drawGridOfFields(generalFields1, currentY, 4);

    // 3. Procedimiento
    addSectionHeader('Procedimiento a realizar');
    autoTable(pdf, {
        startY: currentY,
        body: [[formRefs.procedimiento || ' ']],
        theme: 'plain',
        bodyStyles: { fontSize: 8, textColor: [0, 0, 0], halign: 'justify', cellPadding: 1 },
        margin: { left: margin, right: margin },
        tableWidth: usableWidth,
    });
    // Dibujar linea baja simulada del textarea
    currentY = pdf.lastAutoTable.finalY + 1;
    pdf.setDrawColor(150, 150, 150);
    pdf.setLineWidth(0.2);
    pdf.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 8;

    // 4. Estados y Condición (Radio buttons)
    // Para simplificar, en el PDF imprimimos la selección actual como texto claro.
    addSectionHeader('Clasificación y Estado');
    const statusFields = [
        { label: 'Estado Físico Actual (1-5)', value: formRefs.estadoFisico || 'Clase __' },
        { label: 'Estado Fisiológico', value: formRefs.estadoFisiologico || '___' },
        { label: 'Condición Física', value: formRefs.condicionFisica || '___' }
    ];
    currentY = drawGridOfFields(statusFields, currentY, 3);

    // 5. Tiempos
    addSectionHeader('Tiempos del Procedimiento');
    const timeFields = [
        { label: 'Hora inicio', value: formRefs.horaInicio || '' },
        { label: 'Sonda endotraqueal', value: formRefs.sonda || '' },
        { label: 'T. inducción', value: formRefs.tiempoInduccion || '' },
        { label: 'T. recuperación', value: formRefs.tiempoRecuperacion || '' },
        { label: 'Tiempo total', value: formRefs.tiempoTotal || '' }
    ];
    currentY = drawGridOfFields(timeFields, currentY, 5);

    // 6. Valoración Previa
    addSectionHeader('Valoración Previa');
    const medFields = [
        { label: 'Hemograma', value: formRefs.hemograma || '' },
        { label: 'Bioquímica', value: formRefs.bioquimica || '' },
        { label: 'Deshidratación', value: formRefs.deshidratacion || '' }
    ];
    currentY = drawGridOfFields(medFields, currentY, 3);

    // 7. Protocolo Anestésico (Tabla usando autoTable)
    addSectionHeader('Protocolo Anestésico');

    // Use raw data extracted from DOM instead of empty React state rows
    const protocolData = formRefs.protocolDataRaw && formRefs.protocolDataRaw.length > 0
        ? formRefs.protocolDataRaw
        : [['', '', '', '', ''], ['', '', '', '', '']];

    autoTable(pdf, {
        startY: currentY,
        head: [['FÁRMACO', 'DOSIS (MG/KG)', 'VOLUMEN (ML)', 'VÍA DE ADMÓN', 'HORA / INTERVALO']],
        body: protocolData.length > 0 ? protocolData : [['', '', '', '', ''], ['', '', '', '', '']],
        theme: 'grid',
        headStyles: { fillColor: [230, 230, 230], textColor: [0, 0, 0], fontSize: 7, fontStyle: 'bold', halign: 'center' },
        bodyStyles: { fontSize: 8, textColor: [0, 0, 0], halign: 'center' },
        margin: { left: margin, right: margin },
        styles: { cellPadding: 2, lineColor: [0, 0, 0], lineWidth: 0.2 },
    });

    currentY = pdf.lastAutoTable.finalY + 8;

    // 8. Comentarios
    addSectionHeader('Comentarios / Observaciones');
    autoTable(pdf, {
        startY: currentY,
        body: [[formRefs.comentarios || ' ']],
        theme: 'plain',
        bodyStyles: { fontSize: 8, textColor: [0, 0, 0], halign: 'justify', cellPadding: 1 },
        margin: { left: margin, right: margin },
        tableWidth: usableWidth,
    });
    currentY = pdf.lastAutoTable.finalY + 1;
    pdf.setDrawColor(150, 150, 150);
    pdf.setLineWidth(0.2);
    pdf.line(margin, currentY, pageWidth - margin, currentY);

    // --- HOJA 2 ---
    pdf.addPage();
    currentY = margin;

    addTitle('REGISTRO DE ANESTESIA (Continuación)', 10, 'bold');
    currentY += 4;

    // 9. Monitorización
    addSectionHeader('Monitorización');

    // Use raw data extracted from DOM instead of empty React state rows
    const monitoringData = formRefs.monitoringDataRaw && formRefs.monitoringDataRaw.length > 0
        ? formRefs.monitoringDataRaw
        : [['', '', '', '', '', '', ''], ['', '', '', '', '', '', '']];

    autoTable(pdf, {
        startY: currentY,
        head: [['HORA', 'F.C.', 'F.R.', 'T.LLC/SEG', 'T (°C)', 'SAT. O2 (%)', 'OBSERVACIONES']],
        body: monitoringData.length > 0 ? monitoringData : [['', '', '', '', '', '', ''], ['', '', '', '', '', '', '']],
        theme: 'grid',
        headStyles: { fillColor: [230, 230, 230], textColor: [0, 0, 0], fontSize: 7, fontStyle: 'bold', halign: 'center' },
        bodyStyles: { fontSize: 8, textColor: [0, 0, 0], halign: 'center' },
        margin: { left: margin, right: margin },
        styles: { cellPadding: 2, lineColor: [0, 0, 0], lineWidth: 0.2 },
    });

    currentY = pdf.lastAutoTable.finalY + 8;

    // 10. Muestras
    addSectionHeader('Toma de muestras y diagnóstico');
    autoTable(pdf, {
        startY: currentY,
        head: [['SANGRE', 'HECES', 'PIEL/PELO', 'ORINA', 'LCR', 'PARÁSITOS', 'RX', 'ENDOSCOPIA', 'US']],
        body: [[
            formRefs.muestraSangre ? 'X' : '',
            formRefs.muestraHeces ? 'X' : '',
            formRefs.muestraPiel ? 'X' : '',
            formRefs.muestraOrina ? 'X' : '',
            formRefs.muestraLcr ? 'X' : '',
            formRefs.muestraParasitos ? 'X' : '',
            formRefs.muestraRx ? 'X' : '',
            formRefs.muestraEndos ? 'X' : '',
            formRefs.muestraUs ? 'X' : ''
        ]],
        theme: 'grid',
        headStyles: { fillColor: [230, 230, 230], textColor: [0, 0, 0], fontSize: 7, fontStyle: 'bold', halign: 'center' },
        bodyStyles: { fontSize: 8, textColor: [0, 0, 0], halign: 'center', fontStyle: 'bold' },
        margin: { left: margin, right: margin },
        styles: { cellPadding: 2, lineColor: [0, 0, 0], lineWidth: 0.2, minCellHeight: 8 },
    });

    currentY = pdf.lastAutoTable.finalY + 40;

    // 11. Firmas
    const signWidth = 70;
    const centerX = pageWidth / 2;
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.5);
    pdf.line(centerX - (signWidth / 2), currentY, centerX + (signWidth / 2), currentY);

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text(formRefs.medicoResponsable || 'Médico Responsable', centerX, currentY - 2, { align: 'center' });

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Firma del Médico Responsable', centerX, currentY + 5, { align: 'center' });

    // Guardar el PDF
    pdf.save('Registro_Anestesia.pdf');
};
