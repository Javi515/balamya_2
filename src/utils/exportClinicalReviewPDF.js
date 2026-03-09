import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Vector-based PDF generation for Clinical Review (General & Aves)
export const generateClinicalReviewPDF = (formRefs, variant = 'normal') => {
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

    addTitle('Zoológico Regional Miguel Álvarez del Toro', 12, 'bold');
    addTitle('Clínica Veterinaria', 10, 'normal', 'center', [100, 100, 100]);
    currentY += 2;
    const documentTitle = variant === 'aves' ? 'FORMATO DE REVISIÓN CLÍNICA DE EJEMPLARES (AVES)' : 'FORMATO DE REVISIÓN CLÍNICA DE EJEMPLARES';
    addTitle(documentTitle, 10, 'bold');
    currentY += 4;

    // --- DATOS GENERALES ---
    addSectionHeader('Datos Generales');

    let generalFields = [];
    if (variant === 'aves') {
        generalFields = [
            { label: 'Familia', value: formRefs.familia },
            { label: 'Nombre Científico', value: formRefs.nombreCientifico },
            { label: 'Nombre Común', value: formRefs.nombreComun },
            { label: 'Ubicación', value: formRefs.ubicacion },
            { label: 'Identificación', value: formRefs.identificacion },
            { label: 'Edad', value: formRefs.edad },
            { label: 'Peso', value: formRefs.peso },
            { label: 'Sexo', value: formRefs.sexo },
        ];
    } else if (variant === 'reptiles') {
        generalFields = [
            { label: 'Fecha', value: formRefs.fecha },
            { label: 'Especie', value: formRefs.especie },
            { label: 'Nombre Común', value: formRefs.nombreComun },
            { label: 'Identificación', value: formRefs.identificacion },
            { label: 'Ubicación', value: formRefs.ubicacion },
            { label: 'Edad', value: formRefs.edad },
            { label: 'Sexo', value: formRefs.sexo },
            { label: 'Peso', value: formRefs.peso },
            { label: 'Nombre', value: formRefs.nombre },
        ];
    } else {
        generalFields = [
            { label: 'Fecha', value: formRefs.fecha },
            { label: 'Nombre Científico', value: formRefs.nombreCientifico },
            { label: 'Nombre Común', value: formRefs.nombreComun },
            { label: 'Ubicación', value: formRefs.ubicacion },
            { label: 'Identificación', value: formRefs.identificacion },
            { label: 'Edad', value: formRefs.edad },
            { label: 'Peso', value: formRefs.peso },
            { label: 'Sexo', value: formRefs.sexo },
        ];
    }

    currentY = drawGridOfFields(generalFields, currentY, 4);

    // --- ANAMNESIS ---
    addSectionHeader('Anamnesis');
    drawTextArea(formRefs.anamnesis);

    // --- REVISIÓN CLÍNICA ---
    if (variant === 'reptiles') {
        addSectionHeader('Revisión Clínica (Reptiles)');
        drawFieldWithLabel('Aspecto General del Ejemplar', formRefs.aspectoGeneral);
        drawFieldWithLabel('Entorno y ambiente', formRefs.entornoAmbiente);

        if (currentY > 230) {
            pdf.addPage();
            currentY = margin;
        }

        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(80, 80, 80);
        pdf.text('Sistema(s) afectado(s):', margin, currentY);
        currentY += 4;

        // Print checked systems
        const checkedSystems = formRefs.sistemasAfectados && formRefs.sistemasAfectados.length > 0
            ? formRefs.sistemasAfectados.join(', ')
            : 'Ninguno marcado';

        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(0, 0, 0);
        pdf.text(checkedSystems, margin + 5, currentY);
        currentY += 6;

        drawFieldWithLabel('Descripción del problema', formRefs.descripcionProblema);

    } else {
        addSectionHeader('Revisión Clínica');

        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(80, 80, 80);
        pdf.text('Constantes Fisiológicas', margin, currentY);
        currentY += 4;

        const vitalSigns = [
            { label: 'F.C.', value: formRefs.fc },
            { label: 'F.R.', value: formRefs.fr },
            { label: 'Temp.', value: formRefs.temp },
            { label: 'T.LL.C.', value: formRefs.tllc },
        ];
        currentY = drawGridOfFields(vitalSigns, currentY, 4);
        currentY += 2;

        drawFieldWithLabel('Aspecto General del Ejemplar', formRefs.aspectoGeneral);
        drawFieldWithLabel('Piel / Plumas', formRefs.pielPlumas);
        drawFieldWithLabel('Cardiovascular', formRefs.cardiovascular);
        drawFieldWithLabel('Respiratorio', formRefs.respiratorio);

        // Salto de página preventivo
        if (currentY > 230) {
            pdf.addPage();
            currentY = margin;
        }

        drawFieldWithLabel('Digestivo', formRefs.digestivo);
        drawFieldWithLabel('Músculo esquelético', formRefs.musculoEsqueletico);
        drawFieldWithLabel('Visual / Auditivo', formRefs.visualAuditivo);
        drawFieldWithLabel('Urogenital', formRefs.urogenital);
        drawFieldWithLabel('Nervioso', formRefs.nervioso);

        if (variant === 'normal') {
            drawFieldWithLabel('Ganglios Linfáticos', formRefs.gangliosLinfaticos);
        }
    }

    // --- PRUEBAS SOLICITADAS ---
    if (currentY > 240) {
        pdf.addPage();
        currentY = margin;
    }

    let tests = [];
    if (variant === 'reptiles') {
        addSectionHeader('Pruebas de Laboratorio');
        tests = [
            { label: 'B.H.', value: formRefs.pruebaBh },
            { label: 'Q.S.', value: formRefs.pruebaQs },
            { label: 'Copro', value: formRefs.pruebaCopro },
            { label: 'Otra', value: formRefs.pruebaOtra },
            { label: 'Rayos X', value: formRefs.pruebaRx },
            { label: 'Ultrasonido', value: formRefs.pruebaUsg },
        ];
        currentY = drawGridOfFields(tests, currentY, 3);
        drawFieldWithLabel('Observaciones', formRefs.observacionesLab);
    } else {
        addSectionHeader('Pruebas de Laboratorio Solicitadas');
        if (variant === 'aves') {
            tests = [
                { label: 'H', value: formRefs.pruebaH },
                { label: 'QS', value: formRefs.pruebaQs },
                { label: 'Frotis', value: formRefs.pruebaFrotis },
                { label: 'PAF', value: formRefs.pruebaPaf },
                { label: 'Coproparasitoscópico', value: formRefs.pruebaCopro },
                { label: 'Rx', value: formRefs.pruebaRx },
                { label: 'Ultrasonido', value: formRefs.pruebaUsg },
            ];
        } else {
            tests = [
                { label: 'BH', value: formRefs.pruebaBh },
                { label: 'QS', value: formRefs.pruebaQs },
                { label: 'Frotis', value: formRefs.pruebaFrotis },
                { label: 'PAF', value: formRefs.pruebaPaf },
                { label: 'EGO', value: formRefs.pruebaEgo },
                { label: 'Copro', value: formRefs.pruebaCopro },
                { label: 'Rx', value: formRefs.pruebaRx },
                { label: 'Ultrasonido', value: formRefs.pruebaUsg },
            ];
        }
        currentY = drawGridOfFields(tests, currentY, 4);
    }

    // --- IMPRESIONES DIAGNÓSTICAS ---
    if (currentY > 230) {
        pdf.addPage();
        currentY = margin;
    }
    addSectionHeader('Impresiones Diagnósticas');
    drawTextArea(formRefs.impresionesDiagnosticas);

    // --- FIRMAS ---
    currentY += 30; // Leave space for signature
    if (currentY > 260) {
        pdf.addPage();
        currentY = margin + 30;
    }

    const signWidth = 60;
    let x = margin;
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.5);
    pdf.line(x, currentY, x + signWidth, currentY);

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text(formRefs.responsableClinico || 'Responsable Clínico', x + (signWidth / 2), currentY + 5, { align: 'center' });

    if (variant === 'aves') {
        pdf.text(`Hoja: ${formRefs.numeroHoja || '1'}`, pageWidth - margin - 20, currentY);
    }

    pdf.save(`Formato_Revision_Clinica_${variant}.pdf`);
};
