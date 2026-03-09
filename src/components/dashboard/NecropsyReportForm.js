import React, { useRef } from 'react';
import '../../styles/NecropsyReportForm.css';
import '../../styles/FloatingActions.css';

import { FaSave, FaFilePdf } from 'react-icons/fa';

import useFormState from '../../hooks/useFormState';
import ImageUploader from '../common/ImageUploader';
import { generateNecropsyReportPDF } from '../../utils/exportNecropsyReportPDF';

const NecropsyReportForm = ({ onBack }) => {
    const formRef = useRef(null);
    const { isSaved, handleSave } = useFormState();

    const handleExportPDF = () => {
        const el = formRef.current;
        if (!el) return;

        const getTextObj = (selector) => {
            const input = el.querySelector(selector);
            return input ? input.value : '';
        };

        const getAreaObj = (index) => {
            const textareas = Array.from(el.querySelectorAll('textarea'));
            return textareas[index] ? textareas[index].value : '';
        };

        const getRadioVal = (name) => {
            const checked = el.querySelector(`input[name="${name}"]:checked`);
            return checked ? checked.nextSibling?.textContent?.trim() || checked.value : '';
        };

        const getCheckboxesInDiv = (sectionIndex) => {
            const sampleGrids = el.querySelectorAll('.sample-grid');
            if (!sampleGrids[sectionIndex]) return '';
            const checkboxes = Array.from(sampleGrids[sectionIndex].querySelectorAll('input[type="checkbox"]'));
            return checkboxes.filter(cb => cb.checked).map(cb => cb.previousSibling?.textContent?.trim() || cb.value).join(', ');
        };

        const getLogoSrc = (selector) => {
            const img = el.querySelector(`${selector} img[class*="uploaded-image"]`);
            return img ? img.src : null;
        };

        const formRefs = {
            logoLeft: getLogoSrc('.header-logo-left'),
            logoRight: getLogoSrc('.header-logo-right'),

            folio: el.querySelectorAll('.underline-input')[0]?.value || '',
            fechaMuerte: el.querySelectorAll('.underline-input')[1]?.value || '',
            fechaNecropsia: el.querySelectorAll('.underline-input')[2]?.value || '',

            nombreCientifico: el.querySelectorAll('.professional-text-input')[0]?.value || '',
            nombreComun: el.querySelectorAll('.professional-text-input')[1]?.value || '',
            peso: el.querySelectorAll('.professional-text-input')[2]?.value || '',
            sexo: el.querySelectorAll('.professional-text-input')[3]?.value || '',
            grupoTaxonomico: getRadioVal('taxon'),
            identificacion: el.querySelectorAll('.professional-text-input')[4]?.value || '',

            historiaClinica: getAreaObj(0),
            otrosObservaciones: getAreaObj(1),

            sistemaTegumentario: getAreaObj(2),
            sistemaCardioRespiratorio: getAreaObj(3),
            sistemaDigestivo: getAreaObj(4),
            sistemaUrogenital: getAreaObj(5),
            sistemaMusculoesqueletico: getAreaObj(6),
            sistemaNervioso: getAreaObj(7),
            sistemaLinfatico: getAreaObj(8),

            impresionesDiagnostico: getAreaObj(9),

            muestrasRemitidas: getRadioVal('samples'),
            laboratorio: el.querySelectorAll('.underline-input')[3]?.value || '',

            metodoConservacion: getCheckboxesInDiv(0),
            tejidosColectados: getCheckboxesInDiv(1),

            controlOtros: getAreaObj(10),
            controlObservaciones: getAreaObj(11),

            realizoNecropsia: el.querySelectorAll('.signature-input')[0]?.value || '',
            firmaAutorizacion: el.querySelectorAll('.signature-input')[1]?.value || '',
        };

        generateNecropsyReportPDF(formRefs);
    };

    return (
        <div className="necropsy-report-form global-form-width" ref={formRef}>

            {/* Page 1 */}
            <div className="form-page" id="hoja1">

                {/* Header */}
                <div className="form-header" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px', width: '100%' }}>
                    <ImageUploader placeholderText="Logo" className="header-logo-left" />
                    <div style={{ flex: 1, textAlign: 'center' }}>
                        <h4 className="header-subtitle" style={{ margin: '0 0 2px 0' }}>Coordinacion Estatal para el mejoramiento del zooMAT</h4>
                        <h1 className="header-title" style={{ margin: '0 0 2px 0' }}>DIRECCIÓN DEL ZOOLÓGICO MIGUEL ÁLVAREZ DEL TORO</h1>
                        <h2 className="header-department" style={{ margin: '0 0 2px 0' }}>CLÍNICA VETERINARIA</h2>
                        <h3 className="header-form-name" style={{ margin: '0' }}>REPORTE DE NECROPSIA</h3>
                    </div>
                    <ImageUploader placeholderText="Logo" className="header-logo-right" />
                </div>

                {/* Header Info Grid */}
                <div className="form-section">
                    <div className="form-row header-info-row">
                        <div className="form-group inline">
                            <label>FOLIO NO:</label>
                            <input type="text" className="form-input underline-input" placeholder="0000" />
                        </div>
                        <div className="form-group inline">
                            <label>FECHA DE MUERTE:</label>
                            <input type="date" className="form-input underline-input" required />
                        </div>
                        <div className="form-group inline">
                            <label>FECHA DE NECROPSIA:</label>
                            <input type="date" className="form-input underline-input" required />
                        </div>
                    </div>
                </div>

                {/* Animal Data */}
                <div className="form-section">
                    <h4 className="section-title">DATOS DEL EJEMPLAR</h4>
                    <div className="form-row">
                        <div className="form-col">
                            <div className="form-group">
                                <label>NOMBRE CIENTÍFICO</label>
                                <input type="text" className="form-input professional-text-input" />
                            </div>
                            <div className="form-group">
                                <label>NOMBRE COMÚN</label>
                                <input type="text" className="form-input professional-text-input" />
                            </div>
                            <div className="form-row" style={{ marginBottom: 0 }}>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label>PESO</label>
                                    <input type="text" className="form-input professional-text-input" style={{ width: '100%' }} />
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label>SEXO</label>
                                    <input type="text" className="form-input professional-text-input" style={{ width: '100%' }} />
                                </div>
                            </div>
                        </div>
                        <div className="form-col">
                            <div className="form-group">
                                <label>GRUPO TAXONÓMICO</label>
                                <div className="radio-group" style={{ marginTop: '5px' }}>
                                    <label><input type="radio" name="taxon" /> Ave</label>
                                    <label><input type="radio" name="taxon" /> Mamífero</label>
                                    <label><input type="radio" name="taxon" /> Reptil</label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="form-group">
                        <label>IDENTIFICACIÓN</label>
                        <input type="text" className="form-input professional-text-input" />
                    </div>
                </div>

                {/* Clinical History */}
                <div className="form-section">
                    <h4 className="section-title">Historia Clínica</h4>
                    <textarea className="form-textarea" rows="3" placeholder="Describa los antecedentes clínicos relevantes..."></textarea>
                </div>

                {/* Otros / Observaciones */}
                <div className="form-section" style={{ border: 'none', paddingLeft: 0 }}>
                    <div className="form-group">
                        <label>OTROS / OBSERVACIONES</label>
                        <textarea className="form-textarea simple-textarea"></textarea>
                    </div>
                </div>

                {/* Findings */}
                <div className="form-section">
                    <h4 className="section-title">Hallazgos Macroscópicos</h4>

                    <div className="form-group">
                        <label>Sistema Tegumentario</label>
                        <textarea className="form-textarea" rows="2"></textarea>
                    </div>

                    <div className="form-group">
                        <label>Sistema Cardio Respiratorio</label>
                        <textarea className="form-textarea" rows="2"></textarea>
                    </div>

                    <div className="form-group">
                        <label>Sistema Digestivo</label>
                        <textarea className="form-textarea" rows="2"></textarea>
                    </div>

                    <div className="form-group">
                        <label>Sistema Urogenital</label>
                        <textarea className="form-textarea" rows="2"></textarea>
                    </div>
                </div>
            </div>

            {/* Page separator */}
            <div className="page-separator"></div>

            {/* Page 2 */}
            <div className="form-page" id="hoja2">

                <div className="form-section">
                    <h4 className="section-title">HALLAZGOS MACROSCÓPICOS (CONT.)</h4>

                    <div className="form-group">
                        <label>SISTEMA MUSCULOESQUELÉTICO</label>
                        <textarea className="form-textarea" rows="2"></textarea>
                    </div>

                    <div className="form-group">
                        <label>SISTEMA NERVIOSO</label>
                        <textarea className="form-textarea" rows="2"></textarea>
                    </div>

                    <div className="form-group">
                        <label>SISTEMA LINFÁTICO</label>
                        <textarea className="form-textarea" rows="2"></textarea>
                    </div>
                </div>

                <div className="form-section">
                    <h4 className="section-title">IMPRESIONES Y/O POSIBLE DIAGNÓSTICO</h4>
                    <textarea className="form-textarea" rows="3" placeholder="Escriba sus conclusiones..."></textarea>
                </div>

                <div className="form-section">
                    <h4 className="section-title">CONTROL DE MUESTRAS</h4>

                    <div className="form-row">
                        <div className="form-group inline">
                            <label>MUESTRAS REMITIDAS:</label>
                            <div className="radio-group">
                                <label><input type="radio" name="samples" /> SI</label>
                                <label><input type="radio" name="samples" /> NO</label>
                            </div>
                        </div>
                        <div className="form-group inline" style={{ flexGrow: 1 }}>
                            <label>LABORATORIO:</label>
                            <input type="text" className="form-input underline-input" style={{ width: '100%' }} />
                        </div>
                    </div>

                    <div className="form-group">
                        <h4 className="section-title" style={{ fontSize: '0.7rem', marginBottom: '8px' }}>MÉTODO DE CONSERVACIÓN</h4>
                        <div className="sample-grid">
                            <div className="sample-item">
                                <label>Formol 10%</label>
                                <input type="checkbox" />
                            </div>
                            <div className="sample-item">
                                <label>Congelación</label>
                                <input type="checkbox" />
                            </div>
                            <div className="sample-item">
                                <label>Refrigeración</label>
                                <input type="checkbox" />
                            </div>
                            <div className="sample-item">
                                <label>Alcohol 70%</label>
                                <input type="checkbox" />
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <h4 className="section-title" style={{ fontSize: '0.7rem', marginBottom: '8px' }}>TEJIDOS COLECTADOS</h4>
                        <div className="sample-grid">
                            {['Corazón', 'Riñón', 'Espina Dorsal', 'Pulmón', 'Intestino', 'Nódulo Linfático', 'Hígado', 'Cerebro', 'Bazo', 'Ojo'].map(item => (
                                <div className="sample-item" key={item}>
                                    <label>{item}</label>
                                    <input type="checkbox" />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <h4 className="section-title" style={{ fontSize: '0.7rem', marginBottom: '8px' }}>OTROS</h4>
                        <textarea className="form-textarea" rows="1"></textarea>
                    </div>

                    <div className="form-group">
                        <h4 className="section-title" style={{ fontSize: '0.7rem', marginBottom: '8px' }}>OBSERVACIONES</h4>
                        <textarea className="form-textarea" rows="2"></textarea>
                    </div>
                </div>

                {/* Signatures */}
                <div className="signature-section" style={{ borderTop: 'none', paddingTop: 0 }}>
                    <div className="signature-block">
                        <input type="text" className="signature-input" placeholder="" />
                        <label>Realizó Necropsia</label>
                    </div>
                    <div className="signature-block">
                        <input type="text" className="signature-input" placeholder="" />
                        <label>Firma</label>
                    </div>
                </div>

                {/* Floating action buttons */}
                <div className="floating-actions ">
                    {!isSaved ? (
                        <button className="floating-btn save-btn" onClick={handleSave} title="Guardar Reporte">
                            <FaSave />
                        </button>
                    ) : (
                        <button className="floating-btn pdf-btn" onClick={handleExportPDF} title="Descargar PDF">
                            <FaFilePdf />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NecropsyReportForm;
