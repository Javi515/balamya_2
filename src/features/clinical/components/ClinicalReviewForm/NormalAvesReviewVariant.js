import { useState } from 'react';
import { createPortal } from 'react-dom';
import '../../../../styles/FloatingActions.css';
import { FaSave, FaFilePdf, FaTimes, FaPaperclip } from 'react-icons/fa';
import ImageUploader from '../../../../components/common/ImageUploader/ImageUploader';
import { SectionTitle, FormGroup, FormInput, FormTextArea } from './ClinicalHelpers';
import LabDocumentUploader from '../../../../components/common/LabDocumentUploader/LabDocumentUploader';

const NormalAvesReviewVariant = ({
    patient,
    fields,
    handleChange,
    step,
    getTitle,
    isSaved,
    handleNext,
    handleBack,
    handleSave,
    handleExportPDF,
    isAves,
    responsable,
    canUpdate,
    isDirty,
    onUpdateSave,
    idRegistro,
}) => {
    const [showAttach, setShowAttach] = useState(false);
    const f = (name) => ({ value: fields[name], onChange: (e) => handleChange(name, e.target.value) });

    return (
        <>
            {/* Hoja 1 */}
            <div className="form-page block bg-white p-8 shadow-lg mb-8 rounded-sm" id="hoja1">
                <div className="flex justify-between items-start w-full mb-3" style={{ gap: '16px' }}>
                    <ImageUploader placeholderText="Logo" className="header-logo-left" />
                    <div className="flex flex-col items-center justify-center text-center flex-1 min-w-0">
                        <h1 className="text-xl font-bold text-gray-800 m-0 mb-0.5">
                            Zoológico Regional Miguel Álvarez del Toro
                        </h1>
                        <h2 className="text-base text-gray-500 font-normal m-0 mb-1">
                            Clínica Veterinaria
                        </h2>
                        <hr className="w-full border-t border-gray-300 my-1.5" />
                        <h3 className="text-sm font-bold uppercase text-black m-0">
                            {getTitle()}
                        </h3>
                    </div>
                    <ImageUploader placeholderText="Logo" className="header-logo-right" />
                </div>

                {/* Datos Generales */}
                <div className="mb-3">
                    <SectionTitle>Datos Generales</SectionTitle>
                    {isAves ? (
                        <>
                            <div className="grid grid-cols-3 gap-x-6 gap-y-2 mb-1">
                                <FormGroup label="Familia"><FormInput {...f('familia')} readOnly /></FormGroup>
                                <FormGroup label="Nombre Científico"><FormInput {...f('nombreCientifico')} readOnly /></FormGroup>
                                <FormGroup label="Nombre Común"><FormInput {...f('nombreComun')} readOnly /></FormGroup>
                            </div>
                            <div className="grid grid-cols-3 gap-x-6 gap-y-2">
                                <FormGroup label="Fecha">
                                    <input
                                        type="date"
                                        value={fields.fecha}
                                        onChange={e => handleChange('fecha', e.target.value)}
                                        className="w-full border-b border-gray-300 bg-transparent py-1 px-1 text-sm focus:outline-none focus:border-blue-500"
                                    />
                                </FormGroup>
                                <FormGroup label="Ubicación"><FormInput {...f('ubicacion')} readOnly /></FormGroup>
                                <FormGroup label="Identificación"><FormInput {...f('identificacion')} readOnly /></FormGroup>
                                <FormGroup label="Edad"><FormInput {...f('edad')} readOnly /></FormGroup>
                                <FormGroup label="Peso (kg)"><FormInput {...f('peso')} placeholder="ej: 72.5" /></FormGroup>
                                <FormGroup label="Sexo"><FormInput {...f('sexo')} readOnly /></FormGroup>
                            </div>
                        </>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-2">
                            <FormGroup label="Fecha">
                                <input
                                    type="date"
                                    value={fields.fecha}
                                    onChange={e => handleChange('fecha', e.target.value)}
                                    className="w-full border-b border-gray-300 bg-transparent py-1 px-1 text-sm focus:outline-none focus:border-blue-500"
                                />
                            </FormGroup>
                            <FormGroup label="Nombre Científico"><FormInput {...f('nombreCientifico')} readOnly /></FormGroup>
                            <FormGroup label="Nombre Común"><FormInput {...f('nombreComun')} readOnly /></FormGroup>
                            <FormGroup label="Ubicación"><FormInput {...f('ubicacion')} readOnly /></FormGroup>
                            <FormGroup label="Identificación"><FormInput {...f('identificacion')} readOnly /></FormGroup>
                            <FormGroup label="Edad"><FormInput {...f('edad')} readOnly /></FormGroup>
                            <FormGroup label="Peso (kg)"><FormInput {...f('peso')} placeholder="ej: 72.5" /></FormGroup>
                            <FormGroup label="Sexo"><FormInput {...f('sexo')} readOnly /></FormGroup>
                        </div>
                    )}
                </div>

                {/* Anamnesis */}
                <div className="mb-3">
                    <SectionTitle>Anamnesis</SectionTitle>
                    <FormTextArea rows="4" {...f('anamnesis')} />
                </div>

                {/* Revisión Clínica */}
                <div className="mb-3">
                    <SectionTitle>Revisión Clínica</SectionTitle>
                    <div className="mt-2">
                        <h5 className="text-sm font-bold text-gray-700 mb-2">Constantes Fisiológicas</h5>
                        <div className="flex flex-wrap justify-between gap-3">
                            <div className="flex-1 min-w-[70px]"><FormGroup label="F.C. (lpm)"><FormInput {...f('frecuenciaCardiaca')} placeholder="ej: 68.60" /></FormGroup></div>
                            <div className="flex-1 min-w-[70px]"><FormGroup label="F.R. (rpm)"><FormInput {...f('frecuenciaRespiratoria')} placeholder="ej: 18.50" /></FormGroup></div>
                            <div className="flex-1 min-w-[70px]"><FormGroup label="Temp. (°C)"><FormInput {...f('temperatura')} placeholder="ej: 38.50" /></FormGroup></div>
                            <div className="flex-1 min-w-[70px]"><FormGroup label="T.LL.C. (seg)"><FormInput {...f('tllc')} placeholder="ej: 2.50" /></FormGroup></div>
                        </div>
                    </div>
                    <div className="mt-2">
                        <h5 className="text-sm font-bold text-gray-700 mb-1">Aspecto General del Ejemplar</h5>
                        <FormTextArea rows="3" {...f('aspectoGeneral')} />
                    </div>
                    <div className="mt-2">
                        <label className="text-sm text-gray-600 block mb-0.5">Piel / Plumas</label>
                        <FormTextArea rows="3" {...f('pielPlumas')} />
                    </div>
                    <div className="mt-2">
                        <label className="text-sm text-gray-600 block mb-0.5">Cardiovascular</label>
                        <FormTextArea rows="3" {...f('cardiovascular')} />
                    </div>
                    <div className="mt-2">
                        <label className="text-sm text-gray-600 block mb-0.5">Respiratorio</label>
                        <FormTextArea rows="3" {...f('respiratorio')} />
                    </div>
                </div>
            </div>

            {/* Separador de página */}
            <div className="page-separator"></div>

            {/* Hoja 2 */}
            <div className="form-page block bg-white p-8 shadow-lg mb-8 rounded-sm" id="hoja2">
                <div className="mb-3">
                    <div className="mt-2">
                        <label className="text-sm text-gray-600 block mb-0.5">Digestivo</label>
                        <FormTextArea rows="3" {...f('digestivo')} />
                    </div>
                    <div className="mt-2">
                        <label className="text-sm text-gray-600 block mb-0.5">Músculo esquelético</label>
                        <FormTextArea rows="3" {...f('musculoesqueletico')} />
                    </div>
                    <div className="mt-2">
                        <label className="text-sm text-gray-600 block mb-0.5">Visual / Auditivo</label>
                        <FormTextArea rows="3" {...f('visualAuditivo')} />
                    </div>
                    <div className="mt-2">
                        <label className="text-sm text-gray-600 block mb-0.5">Urogenital</label>
                        <FormTextArea rows="3" {...f('urogenital')} />
                    </div>
                    <div className="mt-2">
                        <label className="text-sm text-gray-600 block mb-0.5">Nervioso</label>
                        <FormTextArea rows="3" {...f('nervioso')} />
                    </div>
                    {!isAves && (
                        <div className="mt-2">
                            <label className="text-sm text-gray-600 block mb-0.5">Ganglios Linfáticos</label>
                            <FormTextArea rows="3" {...f('gangliosLinfaticos')} />
                        </div>
                    )}
                </div>

                <div className="mb-3">
                    <SectionTitle>Pruebas de Laboratorio Solicitadas</SectionTitle>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 items-center">
                        <FormGroup label={isAves ? 'H' : 'BH'}>
                            <FormInput {...f(isAves ? 'h' : 'bh')} />
                        </FormGroup>
                        <FormGroup label="QS"><FormInput {...f('qs')} /></FormGroup>
                        <FormGroup label="Frotis"><FormInput {...f('frotis')} /></FormGroup>
                        <FormGroup label="PAF"><FormInput {...f('paf')} /></FormGroup>
                        {!isAves && <FormGroup label="EGO"><FormInput {...f('ego')} /></FormGroup>}
                        <FormGroup label="Coproparasitoscópico"><FormInput {...f('coproparasitoscopico')} /></FormGroup>
                    </div>
                    <div className="mt-2">
                        <FormGroup label="Rx"><FormInput {...f('rayosX')} /></FormGroup>
                    </div>
                    <div className="mt-1">
                        <label className="text-sm text-gray-600 block mb-0.5">Ultrasonido</label>
                        <FormInput {...f('ultrasonido')} />
                    </div>
                </div>

                <div className="mb-3">
                    <SectionTitle>Impresiones Diagnósticas</SectionTitle>
                    <FormTextArea rows="5" {...f('impresionesdiagnosticas')} />
                </div>

                <div className="mb-3">
                    <SectionTitle>Tratamientos</SectionTitle>
                    <FormTextArea rows="3" {...f('tratamientos')} />
                </div>

                <div className="mt-6 pt-4 border-t border-gray-300">
                    <div className="relative flex justify-center">
                        <div className="max-w-xs w-full text-center">
                            <label className="block mb-6 text-sm text-gray-600">Responsable Clínico</label>
                            <input
                                type="text"
                                className="w-full border-b-2 border-black bg-transparent py-1 px-1 text-center text-sm focus:outline-none focus:border-blue-500"
                                value={responsable}
                                readOnly
                            />
                        </div>
                        {isAves && (
                            <div className="absolute right-0 bottom-0 w-28">
                                <FormGroup label="Hoja"><FormInput {...f('numeroHoja')} /></FormGroup>
                            </div>
                        )}
                    </div>
                </div>

                <div className="floating-actions">
                    {idRegistro && (
                        <button className="floating-btn attach-btn" onClick={() => setShowAttach(true)} title="Adjuntar documentos">
                            <FaPaperclip />
                        </button>
                    )}
                    {canUpdate ? (
                        isDirty ? (
                            <button className="floating-btn save-btn" onClick={onUpdateSave} title="Guardar cambios">
                                <FaSave />
                            </button>
                        ) : (
                            <button className="floating-btn pdf-btn" onClick={handleExportPDF} title="Descargar PDF">
                                <FaFilePdf />
                            </button>
                        )
                    ) : !isSaved ? (
                        <button className="floating-btn save-btn" onClick={handleSave} title="Guardar">
                            <FaSave />
                        </button>
                    ) : (
                        <button className="floating-btn pdf-btn" onClick={handleExportPDF} title="Descargar PDF">
                            <FaFilePdf />
                        </button>
                    )}
                </div>

                {showAttach && createPortal(
                    <div className="attach-modal-overlay" onClick={() => setShowAttach(false)}>
                        <div className="attach-modal" onClick={(e) => e.stopPropagation()}>
                            <div className="attach-modal-header">
                                <h3 className="attach-modal-title">Documentos de Laboratorio</h3>
                                <button className="attach-modal-close" onClick={() => setShowAttach(false)}>
                                    <FaTimes />
                                </button>
                            </div>
                            <LabDocumentUploader tipo="revision_clinica" idRegistro={idRegistro} />
                        </div>
                    </div>,
                    document.body
                )}
            </div>
        </>
    );
};

export default NormalAvesReviewVariant;
