import { useState } from 'react';
import { createPortal } from 'react-dom';
import '../../../../styles/FloatingActions.css';
import { FaSave, FaFilePdf, FaTimes, FaPaperclip } from 'react-icons/fa';
import ImageUploader from '../../../../components/common/ImageUploader/ImageUploader';
import { SectionTitle, FormGroup, FormInput, FormTextArea } from './ClinicalHelpers';
import LabDocumentUploader from '../../../../components/common/LabDocumentUploader/LabDocumentUploader';

const reptileSystems = [
    { label: 'Piel',              field: 'pielPlumas' },
    { label: 'Digestivo',         field: 'digestivo' },
    { label: 'Respiratorio',      field: 'respiratorio' },
    { label: 'Cardiovascular',    field: 'cardiovascular' },
    { label: 'Visual/auditivo',   field: 'visualAuditivo' },
    { label: 'Musculoesquelético',field: 'musculoesqueletico' },
    { label: 'Urinario/genital',  field: 'urogenital' },
    { label: 'Nervioso',          field: 'nervioso' },
    { label: 'Metabólico',        field: 'metabolico' },
];

const ReptilesReviewVariant = ({ patient, fields, handleChange, getTitle, isSaved, handleSave, handleExportPDF, responsable, canUpdate, isDirty, onUpdateSave, idRegistro }) => {
    const [showAttach, setShowAttach] = useState(false);
    const f = (name) => ({ value: fields[name], onChange: (e) => handleChange(name, e.target.value) });

    return (
        <div className="form-page block bg-white p-8 shadow-lg mb-8 rounded-sm" id="hoja1">
            {/* Header */}
            <div className="flex justify-between items-start w-full mb-5" style={{ gap: '20px' }}>
                <ImageUploader placeholderText="Logo" className="header-logo-left" />
                <div className="flex flex-col items-center justify-center text-center flex-1 min-w-0">
                    <h1 className="text-2xl font-bold text-gray-800 m-0 mb-1">
                        Zoológico Regional Miguel Álvarez del Toro
                    </h1>
                    <h2 className="text-xl text-gray-500 font-normal m-0 mb-2">
                        Clínica Veterinaria
                    </h2>
                    <hr className="w-full border-t border-gray-300 my-3" />
                    <h3 className="text-lg font-bold uppercase text-black m-0">
                        {getTitle()}
                    </h3>
                </div>
                <ImageUploader placeholderText="Logo" className="header-logo-right" />
            </div>

            {/* Datos Generales */}
            <div className="mb-4">
                <SectionTitle>Datos Generales</SectionTitle>
                <div className="grid grid-cols-3 gap-x-8 gap-y-2">
                    <FormGroup label="Fecha">
                        <input
                            type="date"
                            value={fields.fecha}
                            onChange={e => handleChange('fecha', e.target.value)}
                            className="w-full border-b border-gray-300 bg-transparent py-1 px-1 text-sm focus:outline-none focus:border-blue-500"
                        />
                    </FormGroup>
                    <FormGroup label="Especie"><FormInput {...f('nombreCientifico')} readOnly /></FormGroup>
                    <FormGroup label="N. común"><FormInput {...f('nombreComun')} readOnly /></FormGroup>
                    <FormGroup label="Identificación"><FormInput {...f('identificacion')} readOnly /></FormGroup>
                    <FormGroup label="Ubicación"><FormInput {...f('ubicacion')} readOnly /></FormGroup>
                    <FormGroup label="Edad"><FormInput {...f('edad')} readOnly /></FormGroup>
                    <FormGroup label="Sexo"><FormInput {...f('sexo')} readOnly /></FormGroup>
                    <FormGroup label="Peso (kg)"><FormInput {...f('peso')} placeholder="ej: 1.2" /></FormGroup>
                    <FormGroup label="Nombre"><FormInput {...f('nombre')} readOnly /></FormGroup>
                </div>
            </div>

            {/* Anamnesis */}
            <div className="mb-4">
                <SectionTitle>Anamnesis</SectionTitle>
                <FormTextArea rows="2" {...f('anamnesis')} />
            </div>

            {/* Revisión Clínica */}
            <div className="mb-4">
                <SectionTitle>Revisión Clínica (Reptiles)</SectionTitle>

                <div className="mt-3">
                    <h5 className="text-sm font-bold text-gray-700 mb-1">Aspecto General del Ejemplar</h5>
                    <FormTextArea rows="2" {...f('aspectoGeneral')} />
                </div>

                <div className="mt-3">
                    <h5 className="text-sm font-bold text-gray-700 mb-1">Entorno y ambiente</h5>
                    <FormTextArea rows="2" {...f('entornoAmbiente')} />
                </div>

                <div className="mt-3">
                    <h5 className="text-sm font-bold text-gray-700 mb-2">Sistema(s) afectado(s)</h5>
                    <div className="grid grid-cols-3 gap-x-5 gap-y-1 mb-3">
                        {reptileSystems.map(({ label, field }) => (
                            <label key={field} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={fields[field] === 'Afectado'}
                                    onChange={e => handleChange(field, e.target.checked ? 'Afectado' : '')}
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                                />
                                {label}
                            </label>
                        ))}
                    </div>
                </div>

                <div className="mt-3">
                    <h5 className="text-sm font-bold text-gray-700 mb-1">Descripción del problema</h5>
                    <FormTextArea rows="3" {...f('descripcionProblema')} />
                </div>
            </div>

            {/* Pruebas de Laboratorio */}
            <div className="mb-4">
                <SectionTitle>Pruebas de Laboratorio</SectionTitle>
                <div className="grid grid-cols-3 gap-x-8 gap-y-2">
                    <FormGroup label="B.H. (hemograma)"><FormInput {...f('hemograma')} /></FormGroup>
                    <FormGroup label="Química sanguínea"><FormInput {...f('quimiaSanguinea')} /></FormGroup>
                    <FormGroup label="Coproparasitoscópico"><FormInput {...f('coproparasitoscopico')} /></FormGroup>
                    <FormGroup label="Otra (especificar)"><FormInput {...f('otroEspecificar')} /></FormGroup>
                    <FormGroup label="Rayos X"><FormInput {...f('rayosX')} /></FormGroup>
                    <FormGroup label="Ultrasonido"><FormInput {...f('ultrasonido')} /></FormGroup>
                </div>
                <div className="mt-2">
                    <label className="text-sm text-gray-600">Observaciones</label>
                    <FormTextArea rows="2" {...f('observaciones')} />
                </div>
            </div>

            {/* Impresiones Diagnósticas */}
            <div className="mb-4">
                <SectionTitle>Impresiones Diagnósticas</SectionTitle>
                <FormTextArea rows="2" {...f('impresionesdiagnosticas')} />
            </div>

            {/* Tratamientos */}
            <div className="mb-4">
                <SectionTitle>Tratamientos</SectionTitle>
                <FormTextArea rows="2" {...f('tratamientos')} />
            </div>

            {/* Responsable Clínico */}
            <div className="mt-6 pt-4 border-t border-gray-300">
                <div className="max-w-xs mx-auto text-center">
                    <label className="block mb-8 text-sm text-gray-600">Responsable Clínico</label>
                    <input
                        type="text"
                        className="w-full border-b-2 border-black bg-transparent py-1 px-1 text-center text-sm focus:outline-none focus:border-blue-500"
                        value={responsable}
                        readOnly
                    />
                </div>
            </div>

            {/* Floating action buttons */}
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
    );
};

export default ReptilesReviewVariant;
