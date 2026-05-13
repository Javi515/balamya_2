import { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useSearchParams } from 'react-router-dom';
import { FaFilePdf, FaSave, FaPaperclip, FaTimes } from 'react-icons/fa';
import styles from './NecropsyReportForm.module.css';
import '../../../../styles/FloatingActions.css';
import useFormState from '../../../../hooks/useFormState';
import ImageUploader from '../../../../components/common/ImageUploader/ImageUploader';
import LabDocumentUploader from '../../../../components/common/LabDocumentUploader/LabDocumentUploader';
import { generateNecropsyReportPDF } from '../../utils/exportNecropsyReportPDF';
import { createNecropsy, updateNecropsy, getNecropsyById, getNextFolio } from '../../../../services/necropsyService';
import { createBaja } from '../../../../services/bajaService';
import { useAuth } from '../../../../context/AuthContext';

const cx = (...classNames) => classNames.filter(Boolean).map((name) => styles[name] || name).join(' ');

const selectClass = (className) => `.${styles[className]}`;

const NecropsyReportForm = ({ patient }) => {
    const formRef = useRef(null);
    const location = useLocation();
    const { user } = useAuth();
    const { isSaved, handleSave } = useFormState();
    const [showAttach, setShowAttach] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [searchParams] = useSearchParams();
    const isViewMode = !!location.state?.existingNecropsy || !!searchParams.get('idNecropsia');
    const isViewOnly = !!location.state?.viewOnly;
    const [isDirty, setIsDirty] = useState(false);
    const [signatoryName, setSignatoryName] = useState(user?.name || '');
    const [savedNecropsyId, setSavedNecropsyId] = useState(
        location.state?.existingNecropsy?.id_necropsia
        || location.state?.existingNecropsy?.id
        || searchParams.get('idNecropsia')
        || null
    );

    useEffect(() => {
        if (!isViewMode || !formRef.current) return;
        const el = formRef.current;
        const mark = () => setIsDirty(true);
        el.addEventListener('input', mark);
        el.addEventListener('change', mark);
        return () => { el.removeEventListener('input', mark); el.removeEventListener('change', mark); };
    }, [isViewMode]);

    const applyPreFill = (d) => {
        const el = formRef.current;
        if (!d || !el) return;
        const underlineInputs = el.querySelectorAll(selectClass('underline-input'));
        if (underlineInputs[0]) underlineInputs[0].value = d.folio || '';
        if (underlineInputs[1]) underlineInputs[1].value = d.fecha_muerte || '';
        if (underlineInputs[2]) underlineInputs[2].value = d.fecha_necropsia || '';
        if (underlineInputs[3]) underlineInputs[3].value = d.laboratorio || '';
        const professionalInputs = el.querySelectorAll(selectClass('professional-text-input'));
        if (professionalInputs[2]) professionalInputs[2].value = d.peso_necropsia ?? '';
        if (professionalInputs[3]) professionalInputs[3].value = d.sexo || '';
        const textareas = Array.from(el.querySelectorAll(selectClass('form-textarea')));
        [d.historia_clinica, d.otros_observaciones, d.sistema_tegumentario, d.sistema_cardio_respiratorio,
         d.sistema_digestivo, d.sistema_urogenital, d.sistema_musculoesqueletico,
         d.sistema_nervioso, d.sistema_linfatico, d.impresiones_diagnostico,
         d.tejido_otros, d.observaciones_tejidos,
        ].forEach((val, i) => { if (textareas[i] && val) textareas[i].value = val; });
        el.querySelectorAll('input[name="samples"]').forEach(input => {
            const label = input.parentElement?.textContent?.trim();
            if (d.muestras_remitidas && label === 'SI') input.checked = true;
            if (!d.muestras_remitidas && label === 'NO') input.checked = true;
        });
        const sampleGrids = el.querySelectorAll(selectClass('sample-grid'));
        const conservacion = Array.from(sampleGrids[0]?.querySelectorAll('input[type="checkbox"]') || []);
        [d.metodo_formol, d.metodo_congelacion, d.metodo_refrigeracion, d.metodo_alcohol]
            .forEach((val, i) => { if (conservacion[i]) conservacion[i].checked = !!val; });
        const tejidos = Array.from(sampleGrids[1]?.querySelectorAll('input[type="checkbox"]') || []);
        [d.tejido_corazon, d.tejido_rinon, d.tejido_espina_dorsal, d.tejido_pulmon,
         d.tejido_intestino, d.tejido_nodulo_linfatico, d.tejido_higado, d.tejido_cerebro,
         d.tejido_bazo, d.tejido_ojo]
            .forEach((val, i) => { if (tejidos[i]) tejidos[i].checked = !!val; });
        if (d.nombre_usuario) setSignatoryName(d.nombre_usuario);
    };

    useEffect(() => {
        const d = location.state?.existingNecropsy;
        if (d) { applyPreFill(d); return; }

        const idNecropsia = searchParams.get('idNecropsia');
        if (idNecropsia) {
            getNecropsyById(idNecropsia).then(applyPreFill).catch(() => {});
            return;
        }

        getNextFolio().then((folio) => {
            const el = formRef.current;
            if (!el || !folio) return;
            const underlineInputs = el.querySelectorAll(`.${styles['underline-input']}`);
            if (underlineInputs[0]) underlineInputs[0].value = folio;
        }).catch(() => {});
    }, []);

    const handleApiSave = async () => {
        const element = formRef.current;
        if (!element) return;

        const textareas = Array.from(element.querySelectorAll(selectClass('form-textarea')));
        const underlineInputs = element.querySelectorAll(selectClass('underline-input'));
        const professionalInputs = element.querySelectorAll(selectClass('professional-text-input'));

        const getAreaValue = (index) => textareas[index]?.value || '';

        const getSampleGridCheckboxes = (sectionIndex) => {
            const sampleGrids = element.querySelectorAll(selectClass('sample-grid'));
            const section = sampleGrids[sectionIndex];
            if (!section) return [];
            return Array.from(section.querySelectorAll('input[type="checkbox"]'));
        };

        const samplesChecked = element.querySelector('input[name="samples"]:checked');
        const muestrasRemitidas = samplesChecked
            ? samplesChecked.parentElement?.textContent?.trim() === 'SI'
            : false;

        const pesoRaw = parseFloat(professionalInputs[2]?.value);
        if (isNaN(pesoRaw) || pesoRaw <= 0) {
            alert('El campo PESO debe ser un número válido mayor a 0 (Ej: 1.50).');
            return;
        }

        const conservacion = getSampleGridCheckboxes(0);
        const tejidos = getSampleGridCheckboxes(1);

        const metodoConservacionTejidos = conservacion
            .filter((c) => c.checked)
            .map((c) => c.closest(selectClass('sample-item'))?.querySelector('label')?.textContent?.trim() || '')
            .join(', ');

        const payload = {
            idEjemplar: patient?.idEjemplar || '',
            fechaMuerte: underlineInputs[1]?.value || '',
            fechaNecropsia: underlineInputs[2]?.value || '',
            pesoNecropsia: pesoRaw,
            sexo: professionalInputs[3]?.value || '',
            historiaClinica: getAreaValue(0),
            otrosObservaciones: getAreaValue(1),
            sistemaTegumentario: getAreaValue(2),
            sistemaCardioRespiratorio: getAreaValue(3),
            sistemaDigestivo: getAreaValue(4),
            sistemaUrogenital: getAreaValue(5),
            sistemaMusculoesqueletico: getAreaValue(6),
            sistemaNervioso: getAreaValue(7),
            sistemaLinfatico: getAreaValue(8),
            impresionesdiagnostico: getAreaValue(9),
            muestrasRemitidas,
            laboratorio: underlineInputs[3]?.value || '',
            metodoFormol: conservacion[0]?.checked || false,
            metodoCongelacion: conservacion[1]?.checked || false,
            metodoRefrigeracion: conservacion[2]?.checked || false,
            metodoAlcohol: conservacion[3]?.checked || false,
            tejidoCorazon: tejidos[0]?.checked || false,
            tejidoRinon: tejidos[1]?.checked || false,
            tejidoEspinaDorsal: tejidos[2]?.checked || false,
            tejidoPulmon: tejidos[3]?.checked || false,
            tejidoIntestino: tejidos[4]?.checked || false,
            tejidoNodutoLinfatico: tejidos[5]?.checked || false,
            tejidoHigado: tejidos[6]?.checked || false,
            tejidoCerebro: tejidos[7]?.checked || false,
            tejidoBazo: tejidos[8]?.checked || false,
            tejidoOjo: tejidos[9]?.checked || false,
            tejidoOtros: getAreaValue(10),
            observacionesTejidos: getAreaValue(11),
            metodoConservacionTejidos,
        };

        try {
            setIsSaving(true);
            const response = await createNecropsy(payload);
            if (response?.necropsia?.folio && underlineInputs[0]) {
                underlineInputs[0].value = response.necropsia.folio;
            }
            const idFromResponse = response?.id_necropsia || response?.idNecropsia
                || response?.necropsia?.id_necropsia || response?.necropsia?.id || null;
            if (idFromResponse) setSavedNecropsyId(String(idFromResponse));
            console.log('[necropsy] pendingBaja:', location.state?.pendingBaja);
            console.log('[necropsy] response completo:', response);
            if (location.state?.pendingBaja) {
                const idEjemplar = location.state?.pendingBajaIdEjemplar || patient?.idEjemplar || patient?.id;
                const idNecropsia = response?.id_necropsia
                    || response?.idNecropsia
                    || response?.necropsia?.id_necropsia
                    || response?.necropsia?.id
                    || null;
                console.log('[necropsy] idEjemplar para baja:', idEjemplar, '| idNecropsia:', idNecropsia);
                try {
                    await createBaja(idEjemplar, 'Muerte', idNecropsia);
                } catch (bajaErr) {
                    console.error('[createBaja pendingBaja]', bajaErr);
                }
            }
            handleSave();
            alert(response?.message || 'Necropsia registrada correctamente');
        } catch (err) {
            alert(`Error al guardar necropsia: ${err.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const taxon = (patient?.taxonomicGroup || patient?.category || '').toLowerCase();
    const isAve = taxon.includes('ave');
    const isMamifero = taxon.includes('mamifero') || taxon.includes('mamífero');
    const isReptil = taxon.includes('reptil');
    const isAnfibio = taxon.includes('anfibio');

    const handleUpdate = async () => {
        const element = formRef.current;
        if (!element) return;
        const textareas = Array.from(element.querySelectorAll(selectClass('form-textarea')));
        const underlineInputs = element.querySelectorAll(selectClass('underline-input'));
        const professionalInputs = element.querySelectorAll(selectClass('professional-text-input'));
        const getAreaValue = (i) => textareas[i]?.value || '';
        const getSampleGridCheckboxes = (si) => {
            const grids = element.querySelectorAll(selectClass('sample-grid'));
            return Array.from(grids[si]?.querySelectorAll('input[type="checkbox"]') || []);
        };
        const samplesChecked = element.querySelector('input[name="samples"]:checked');
        const muestrasRemitidas = samplesChecked ? samplesChecked.parentElement?.textContent?.trim() === 'SI' : false;
        const pesoRaw = parseFloat(professionalInputs[2]?.value);
        if (isNaN(pesoRaw) || pesoRaw <= 0) { alert('El campo PESO debe ser un número válido mayor a 0.'); return; }
        const conservacion = getSampleGridCheckboxes(0);
        const tejidos = getSampleGridCheckboxes(1);
        const metodoConservacionTejidos = conservacion.filter(c => c.checked).map(c => c.closest(selectClass('sample-item'))?.querySelector('label')?.textContent?.trim() || '').join(', ');
        const payload = {
            fechaMuerte: underlineInputs[1]?.value || '',
            fechaNecropsia: underlineInputs[2]?.value || '',
            folio: underlineInputs[0]?.value || '',
            pesoNecropsia: pesoRaw,
            sexo: professionalInputs[3]?.value || '',
            historiaClinica: getAreaValue(0),
            otrosObservaciones: getAreaValue(1),
            sistemaTegumentario: getAreaValue(2),
            sistemaCardioRespiratorio: getAreaValue(3),
            sistemaDigestivo: getAreaValue(4),
            sistemaUrogenital: getAreaValue(5),
            sistemaMusculoesqueletico: getAreaValue(6),
            sistemaNervioso: getAreaValue(7),
            sistemaLinfatico: getAreaValue(8),
            impresionesdiagnostico: getAreaValue(9),
            muestrasRemitidas,
            laboratorio: underlineInputs[3]?.value || '',
            metodoFormol: conservacion[0]?.checked || false,
            metodoCongelacion: conservacion[1]?.checked || false,
            metodoRefrigeracion: conservacion[2]?.checked || false,
            metodoAlcohol: conservacion[3]?.checked || false,
            tejidoCorazon: tejidos[0]?.checked || false,
            tejidoRinon: tejidos[1]?.checked || false,
            tejidoEspinaDorsal: tejidos[2]?.checked || false,
            tejidoPulmon: tejidos[3]?.checked || false,
            tejidoIntestino: tejidos[4]?.checked || false,
            tejidoNodutoLinfatico: tejidos[5]?.checked || false,
            tejidoHigado: tejidos[6]?.checked || false,
            tejidoCerebro: tejidos[7]?.checked || false,
            tejidoBazo: tejidos[8]?.checked || false,
            tejidoOjo: tejidos[9]?.checked || false,
            tejidoOtros: getAreaValue(10),
            observacionesTejidos: getAreaValue(11),
            metodoConservacionTejidos,
        };
        try {
            setIsSaving(true);
            const idNecropsia = location.state.existingNecropsy.id_necropsia || location.state.existingNecropsy.id;
            await updateNecropsy(idNecropsia, payload);
            setIsDirty(false);
            alert('Necropsia actualizada correctamente');
        } catch (err) {
            alert(`Error al actualizar necropsia: ${err.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleExportPDF = () => {
        const element = formRef.current;
        if (!element) {
            return;
        }

        const textareas = Array.from(element.querySelectorAll(selectClass('form-textarea')));
        const underlineInputs = element.querySelectorAll(selectClass('underline-input'));
        const professionalInputs = element.querySelectorAll(selectClass('professional-text-input'));
        const signatureInputs = element.querySelectorAll(selectClass('signature-input'));

        const getAreaValue = (index) => textareas[index]?.value || '';

        const getRadioValue = (name) => {
            const checked = element.querySelector(`input[name="${name}"]:checked`);
            return checked ? checked.parentElement?.textContent?.trim() || checked.value : '';
        };

        const getCheckedValues = (sectionIndex) => {
            const sampleGrids = element.querySelectorAll(selectClass('sample-grid'));
            const section = sampleGrids[sectionIndex];

            if (!section) {
                return '';
            }

            return Array.from(section.querySelectorAll('input[type="checkbox"]'))
                .filter((checkbox) => checkbox.checked)
                .map((checkbox) => checkbox.closest(selectClass('sample-item'))?.querySelector('label')?.textContent?.trim() || checkbox.value)
                .join(', ');
        };

        const getLogoSrc = (className) => {
            const image = element.querySelector(`${selectClass(className)} img[class*="uploaded-image"]`);
            return image ? image.src : null;
        };

        generateNecropsyReportPDF({
            logoLeft: getLogoSrc('header-logo-left'),
            logoRight: getLogoSrc('header-logo-right'),
            folio: underlineInputs[0]?.value || '',
            fechaMuerte: underlineInputs[1]?.value || '',
            fechaNecropsia: underlineInputs[2]?.value || '',
            nombreCientifico: professionalInputs[0]?.value || '',
            nombreComun: professionalInputs[1]?.value || '',
            peso: professionalInputs[2]?.value || '',
            sexo: professionalInputs[3]?.value || '',
            grupoTaxonomico: getRadioValue('taxon'),
            identificacion: professionalInputs[4]?.value || '',
            historiaClinica: getAreaValue(0),
            otrosObservaciones: getAreaValue(1),
            sistemaTegumentario: getAreaValue(2),
            sistemaCardioRespiratorio: getAreaValue(3),
            sistemaDigestivo: getAreaValue(4),
            sistemaUrogenital: getAreaValue(5),
            sistemaMusculoesqueletico: getAreaValue(6),
            sistemaNervioso: getAreaValue(7),
            sistemaLinfatico: getAreaValue(8),
            impresionesDiagnostico: getAreaValue(9),
            muestrasRemitidas: getRadioValue('samples'),
            laboratorio: underlineInputs[3]?.value || '',
            metodoConservacion: getCheckedValues(0),
            tejidosColectados: getCheckedValues(1),
            controlOtros: getAreaValue(10),
            controlObservaciones: getAreaValue(11),
            realizoNecropsia: signatureInputs[0]?.value || '',
            firmaAutorizacion: signatureInputs[1]?.value || '',
        });
    };

    return (
        <div key={patient?.id} className={`${cx('necropsy-report-form', 'global-form-width')}${isViewOnly ? ` ${styles['view-only']}` : ''}`} ref={formRef}>
            <div className={styles['form-page']} id="hoja1">
                <div
                    className={styles['form-header']}
                    style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px', width: '100%' }}
                >
                    <ImageUploader placeholderText="Logo" className={styles['header-logo-left']} />
                    <div style={{ flex: 1, textAlign: 'center' }}>
                        <h4 className={styles['header-subtitle']} style={{ margin: '0 0 2px 0' }}>Coordinacion Estatal para el mejoramiento del zooMAT</h4>
                        <h1 className={styles['header-title']} style={{ margin: '0 0 2px 0' }}>DIRECCIÓN DEL ZOOLÓGICO MIGUEL ÁLVAREZ DEL TORO</h1>
                        <h2 className={styles['header-department']} style={{ margin: '0 0 2px 0' }}>CLÍNICA VETERINARIA</h2>
                        <h3 className={styles['header-form-name']} style={{ margin: 0 }}>REPORTE DE NECROPSIA</h3>
                    </div>
                    <ImageUploader placeholderText="Logo" className={styles['header-logo-right']} />
                </div>

                <div className={styles['form-section']}>
                    <div className={cx('form-row', 'header-info-row')}>
                        <div className={cx('form-group', 'inline')}>
                            <label>FOLIO NO:</label>
                            <input type="text" className={cx('form-input', 'underline-input')} readOnly />
                        </div>
                        <div className={cx('form-group', 'inline')}>
                            <label>FECHA DE MUERTE:</label>
                            <input type="date" className={cx('form-input', 'underline-input')} required />
                        </div>
                        <div className={cx('form-group', 'inline')}>
                            <label>FECHA DE NECROPSIA:</label>
                            <input type="date" className={cx('form-input', 'underline-input')} required />
                        </div>
                    </div>
                </div>

                <div className={styles['form-section']}>
                    <h4 className={styles['section-title']}>DATOS DEL EJEMPLAR</h4>
                    <div className={styles['form-row']}>
                        <div className={styles['form-col']}>
                            <div className={styles['form-group']}>
                                <label>NOMBRE CIENTÍFICO</label>
                                <input type="text" className={cx('form-input', 'professional-text-input')} defaultValue={patient?.scientificName || patient?.species || ''} readOnly />
                            </div>
                            <div className={styles['form-group']}>
                                <label>NOMBRE COMÚN</label>
                                <input type="text" className={cx('form-input', 'professional-text-input')} defaultValue={patient?.commonName || ''} readOnly />
                            </div>
                            <div className={styles['form-row']} style={{ marginBottom: 0 }}>
                                <div className={styles['form-group']} style={{ flex: 1 }}>
                                    <label>PESO</label>
                                    <input type="number" min="0" step="0.01" placeholder="Ej: 1.50" className={cx('form-input', 'professional-text-input')} style={{ width: '100%' }} defaultValue={patient?.weight || ''} onKeyDown={(e) => ['e','E','+','-'].includes(e.key) && e.preventDefault()} />
                                </div>
                                <div className={styles['form-group']} style={{ flex: 1 }}>
                                    <label>SEXO</label>
                                    <input type="text" className={cx('form-input', 'professional-text-input')} style={{ width: '100%' }} defaultValue={patient?.sex || ''} readOnly />
                                </div>
                            </div>
                        </div>
                        <div className={styles['form-col']}>
                            <div className={styles['form-group']}>
                                <label>GRUPO TAXONÓMICO</label>
                                <div className={styles['radio-group']} style={{ marginTop: '5px' }}>
                                    <label><input type="radio" name="taxon" defaultChecked={isAve} disabled /> Ave</label>
                                    <label><input type="radio" name="taxon" defaultChecked={isMamifero} disabled /> Mamífero</label>
                                    <label><input type="radio" name="taxon" defaultChecked={isReptil} disabled /> Reptil</label>
                                    <label><input type="radio" name="taxon" defaultChecked={isAnfibio} disabled /> Anfibio</label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={styles['form-group']}>
                        <label>IDENTIFICACIÓN</label>
                        <input type="text" className={cx('form-input', 'professional-text-input')} defaultValue={patient?.id || ''} readOnly />
                    </div>
                </div>

                <div className={styles['form-section']}>
                    <h4 className={styles['section-title']}>Historia Clínica</h4>
                    <textarea className={styles['form-textarea']} rows="3" placeholder="Describa los antecedentes clínicos relevantes..."></textarea>
                </div>

                <div className={styles['form-section']} style={{ border: 'none', paddingLeft: 0 }}>
                    <div className={styles['form-group']}>
                        <label>OTROS / OBSERVACIONES</label>
                        <textarea className={cx('form-textarea', 'simple-textarea')}></textarea>
                    </div>
                </div>

                <div className={styles['form-section']}>
                    <h4 className={styles['section-title']}>Hallazgos Macroscópicos</h4>

                    <div className={styles['form-group']}>
                        <label>Sistema Tegumentario</label>
                        <textarea className={styles['form-textarea']} rows="2"></textarea>
                    </div>

                    <div className={styles['form-group']}>
                        <label>Sistema Cardio Respiratorio</label>
                        <textarea className={styles['form-textarea']} rows="2"></textarea>
                    </div>

                    <div className={styles['form-group']}>
                        <label>Sistema Digestivo</label>
                        <textarea className={styles['form-textarea']} rows="2"></textarea>
                    </div>

                    <div className={styles['form-group']}>
                        <label>Sistema Urogenital</label>
                        <textarea className={styles['form-textarea']} rows="2"></textarea>
                    </div>
                </div>
            </div>

            <div className={styles['page-separator']}></div>

            <div className={styles['form-page']} id="hoja2">
                <div className={styles['form-section']}>
                    <h4 className={styles['section-title']}>HALLAZGOS MACROSCÓPICOS (CONT.)</h4>

                    <div className={styles['form-group']}>
                        <label>SISTEMA MUSCULOESQUELÉTICO</label>
                        <textarea className={styles['form-textarea']} rows="2"></textarea>
                    </div>

                    <div className={styles['form-group']}>
                        <label>SISTEMA NERVIOSO</label>
                        <textarea className={styles['form-textarea']} rows="2"></textarea>
                    </div>

                    <div className={styles['form-group']}>
                        <label>SISTEMA LINFÁTICO</label>
                        <textarea className={styles['form-textarea']} rows="2"></textarea>
                    </div>
                </div>

                <div className={styles['form-section']}>
                    <h4 className={styles['section-title']}>IMPRESIONES Y/O POSIBLE DIAGNÓSTICO</h4>
                    <textarea className={styles['form-textarea']} rows="3" placeholder="Escriba sus conclusiones..."></textarea>
                </div>

                <div className={styles['form-section']}>
                    <h4 className={styles['section-title']}>CONTROL DE MUESTRAS</h4>

                    <div className={styles['form-row']}>
                        <div className={cx('form-group', 'inline')}>
                            <label>MUESTRAS REMITIDAS:</label>
                            <div className={styles['radio-group']}>
                                <label><input type="radio" name="samples" /> SI</label>
                                <label><input type="radio" name="samples" /> NO</label>
                            </div>
                        </div>
                        <div className={cx('form-group', 'inline')} style={{ flexGrow: 1 }}>
                            <label>LABORATORIO:</label>
                            <input type="text" className={cx('form-input', 'underline-input')} style={{ width: '100%' }} />
                        </div>
                    </div>

                    <div className={styles['form-group']}>
                        <h4 className={styles['section-title']} style={{ fontSize: '0.7rem', marginBottom: '8px' }}>MÉTODO DE CONSERVACIÓN</h4>
                        <div className={styles['sample-grid']}>
                            <div className={styles['sample-item']}>
                                <label>Formol 10%</label>
                                <input type="checkbox" />
                            </div>
                            <div className={styles['sample-item']}>
                                <label>Congelación</label>
                                <input type="checkbox" />
                            </div>
                            <div className={styles['sample-item']}>
                                <label>Refrigeración</label>
                                <input type="checkbox" />
                            </div>
                            <div className={styles['sample-item']}>
                                <label>Alcohol 70%</label>
                                <input type="checkbox" />
                            </div>
                        </div>
                    </div>

                    <div className={styles['form-group']}>
                        <h4 className={styles['section-title']} style={{ fontSize: '0.7rem', marginBottom: '8px' }}>TEJIDOS COLECTADOS</h4>
                        <div className={styles['sample-grid']}>
                            {['Corazón', 'Riñón', 'Espina Dorsal', 'Pulmón', 'Intestino', 'Nódulo Linfático', 'Hígado', 'Cerebro', 'Bazo', 'Ojo'].map((item) => (
                                <div className={styles['sample-item']} key={item}>
                                    <label>{item}</label>
                                    <input type="checkbox" />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={styles['form-group']}>
                        <h4 className={styles['section-title']} style={{ fontSize: '0.7rem', marginBottom: '8px' }}>OTROS</h4>
                        <textarea className={styles['form-textarea']} rows="1"></textarea>
                    </div>

                    <div className={styles['form-group']}>
                        <h4 className={styles['section-title']} style={{ fontSize: '0.7rem', marginBottom: '8px' }}>OBSERVACIONES</h4>
                        <textarea className={styles['form-textarea']} rows="2"></textarea>
                    </div>
                </div>

                <div className={styles['signature-section']} style={{ borderTop: 'none', paddingTop: 0 }}>
                    <div className={styles['signature-block']}>
                        <input type="text" className={styles['signature-input']} value={signatoryName} readOnly onChange={() => {}} style={{ cursor: 'default', pointerEvents: 'none' }} />
                        <label>Realizó Necropsia</label>
                    </div>
                    <div className={styles['signature-block']}>
                        <input type="text" className={styles['signature-input']} placeholder="" readOnly style={{ cursor: 'default', pointerEvents: 'none' }} />
                        <label>Firma</label>
                    </div>
                </div>

                <div className="floating-actions">
                    {savedNecropsyId && !isViewOnly && (
                        <button className="floating-btn attach-btn" onClick={() => setShowAttach(true)} title="Adjuntar documentos">
                            <FaPaperclip />
                        </button>
                    )}
                    {isViewOnly ? (
                        <button className="floating-btn pdf-btn" onClick={handleExportPDF} title="Descargar PDF">
                            <FaFilePdf />
                        </button>
                    ) : isViewMode ? (
                        isDirty ? (
                            <button className="floating-btn save-btn" onClick={handleUpdate} disabled={isSaving} title="Guardar cambios">
                                <FaSave />
                            </button>
                        ) : (
                            <button className="floating-btn pdf-btn" onClick={handleExportPDF} title="Descargar PDF">
                                <FaFilePdf />
                            </button>
                        )
                    ) : (
                        !isSaved ? (
                            <button className="floating-btn save-btn" onClick={handleApiSave} disabled={isSaving} title="Guardar Reporte">
                                <FaSave />
                            </button>
                        ) : (
                            <button className="floating-btn pdf-btn" onClick={handleExportPDF} title="Descargar PDF">
                                <FaFilePdf />
                            </button>
                        )
                    )}
                </div>

                {/* Modal adjuntar documentos */}
                {showAttach && createPortal(
                    <div className="attach-modal-overlay" onClick={() => setShowAttach(false)}>
                        <div className="attach-modal" onClick={(e) => e.stopPropagation()}>
                            <div className="attach-modal-header">
                                <h3 className="attach-modal-title">Documentos de Laboratorio</h3>
                                <button className="attach-modal-close" onClick={() => setShowAttach(false)}>
                                    <FaTimes />
                                </button>
                            </div>
                            <LabDocumentUploader tipo="necropsia" idRegistro={savedNecropsyId} />
                        </div>
                    </div>,
                    document.body
                )}
            </div>
        </div>
    );
};

export default NecropsyReportForm;
