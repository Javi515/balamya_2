import React from 'react';
import '../../../styles/FloatingActions.css';
import { FaSave, FaFilePdf, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import ImageUploader from '../../common/ImageUploader';
import { SectionTitle, FormGroup, FormInput, FormTextArea } from './ClinicalHelpers';

const NormalAvesReviewVariant = ({
    patient,
    step,
    getTitle,
    isSaved,
    handleNext,
    handleBack,
    handleSave,
    handleExportPDF,
    isAves
}) => {
    return (
        <>
            {/* Hoja 1 */}
            {/* Hoja 1 */}
            <div className="form-page block bg-white p-8 shadow-lg mb-8 rounded-sm" id="hoja1">
                <div className="flex justify-between items-start w-full mb-3" style={{ gap: '16px' }}>
                    <ImageUploader placeholderText="Logo" className="header-logo-left shrink-0" />
                    <div className="flex flex-col items-center justify-center text-center flex-1">
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
                    <ImageUploader placeholderText="Logo" className="header-logo-right shrink-0" />
                </div>

                {/* Datos Generales */}
                <div className="mb-3">
                    <SectionTitle>Datos Generales</SectionTitle>
                    {isAves ? (
                        /* Formato Aves: Familia + Nombre científico + Nombre común, luego Ubicación + Identificación + Edad + Peso + Sexo */
                        <>
                            <div className="grid grid-cols-3 gap-x-6 gap-y-2 mb-1">
                                <FormGroup label="Familia"><FormInput /></FormGroup>
                                <FormGroup label="Nombre Científico"><FormInput defaultValue={patient?.scientificName || ''} /></FormGroup>
                                <FormGroup label="Nombre Común"><FormInput defaultValue={patient?.commonName || ''} /></FormGroup>
                            </div>
                            <div className="grid grid-cols-5 gap-x-6 gap-y-2">
                                <FormGroup label="Ubicación"><FormInput defaultValue={patient?.location || ''} /></FormGroup>
                                <FormGroup label="Identificación"><FormInput defaultValue={patient?.id || ''} /></FormGroup>
                                <FormGroup label="Edad"><FormInput defaultValue={patient?.age ? `${patient.age} años` : ''} /></FormGroup>
                                <FormGroup label="Peso"><FormInput defaultValue={patient?.weight ? `${patient.weight} kg` : ''} /></FormGroup>
                                <FormGroup label="Sexo"><FormInput defaultValue={patient?.sex || ''} /></FormGroup>
                            </div>
                        </>
                    ) : (
                        /* Formato General Ejemplares */
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-2">
                            <FormGroup label="Fecha"><input type="date" className="w-full border-b border-gray-300 bg-transparent py-1 px-1 text-sm focus:outline-none focus:border-blue-500" /></FormGroup>
                            <FormGroup label="Nombre Científico"><FormInput defaultValue={patient?.scientificName || ''} /></FormGroup>
                            <FormGroup label="Nombre Común"><FormInput defaultValue={patient?.commonName || ''} /></FormGroup>
                            <FormGroup label="Ubicación"><FormInput defaultValue={patient?.location || ''} /></FormGroup>
                            <FormGroup label="Identificación"><FormInput defaultValue={patient?.id || ''} /></FormGroup>
                            <FormGroup label="Edad"><FormInput defaultValue={patient?.age ? `${patient.age} años` : ''} /></FormGroup>
                            <FormGroup label="Peso"><FormInput defaultValue={patient?.weight ? `${patient.weight} kg` : ''} /></FormGroup>
                            <FormGroup label="Sexo"><FormInput defaultValue={patient?.sex || ''} /></FormGroup>
                        </div>
                    )}
                </div>

                {/* Anamnesis */}
                <div className="mb-3">
                    <SectionTitle>Anamnesis</SectionTitle>
                    <FormTextArea rows="4" />
                </div>

                {/* Revisión Clínica */}
                <div className="mb-3">
                    <SectionTitle>Revisión Clínica</SectionTitle>
                    <div className="mt-2">
                        <h5 className="text-sm font-bold text-gray-700 mb-2">Constantes Fisiológicas</h5>
                        <div className="flex flex-wrap justify-between gap-3">
                            <div className="flex-1 min-w-[70px]"><FormGroup label="F.C."><FormInput /></FormGroup></div>
                            <div className="flex-1 min-w-[70px]"><FormGroup label="F.R."><FormInput /></FormGroup></div>
                            <div className="flex-1 min-w-[70px]"><FormGroup label="Temp."><FormInput /></FormGroup></div>
                            <div className="flex-1 min-w-[70px]"><FormGroup label="T.LL.C."><FormInput /></FormGroup></div>
                        </div>
                    </div>
                    <div className="mt-2">
                        <h5 className="text-sm font-bold text-gray-700 mb-1">Aspecto General del Ejemplar</h5>
                        <FormTextArea rows="3" />
                    </div>
                    <div className="mt-2">
                        <label className="text-sm text-gray-600 block mb-0.5">Piel / Plumas</label>
                        <FormTextArea rows="3" />
                    </div>
                    <div className="mt-2">
                        <label className="text-sm text-gray-600 block mb-0.5">Cardiovascular</label>
                        <FormTextArea rows="3" />
                    </div>
                    <div className="mt-2">
                        <label className="text-sm text-gray-600 block mb-0.5">Respiratorio</label>
                        <FormTextArea rows="3" />
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
                        <FormTextArea rows="3" />
                    </div>
                    <div className="mt-2">
                        <label className="text-sm text-gray-600 block mb-0.5">Músculo esquelético</label>
                        <FormTextArea rows="3" />
                    </div>
                    <div className="mt-2">
                        <label className="text-sm text-gray-600 block mb-0.5">Visual / Auditivo</label>
                        <FormTextArea rows="3" />
                    </div>
                    <div className="mt-2">
                        <label className="text-sm text-gray-600 block mb-0.5">Urogenital</label>
                        <FormTextArea rows="3" />
                    </div>
                    <div className="mt-2">
                        <label className="text-sm text-gray-600 block mb-0.5">Nervioso</label>
                        <FormTextArea rows="3" />
                    </div>
                    {/* Ganglios Linfáticos solo para formato general de Ejemplares */}
                    {!isAves && (
                        <div className="mt-2">
                            <label className="text-sm text-gray-600 block mb-0.5">Ganglios Linfáticos</label>
                            <FormTextArea rows="3" />
                        </div>
                    )}
                </div>

                <div className="mb-3">
                    <SectionTitle>Pruebas de Laboratorio Solicitadas</SectionTitle>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 items-center">
                        {/* Aves usa "H", Ejemplares general usa "BH" */}
                        <FormGroup label={isAves ? 'H' : 'BH'}><FormInput /></FormGroup>
                        <FormGroup label="QS"><FormInput /></FormGroup>
                        <FormGroup label="Frotis"><FormInput /></FormGroup>
                        <FormGroup label="PAF"><FormInput /></FormGroup>
                        {!isAves && <FormGroup label="EGO"><FormInput /></FormGroup>}
                        <FormGroup label="Coproparasitoscópico"><FormInput /></FormGroup>
                    </div>
                    <div className="mt-2">
                        <FormGroup label="Rx"><FormInput /></FormGroup>
                    </div>
                    <div className="mt-1">
                        <label className="text-sm text-gray-600 block mb-0.5">Ultrasonido</label>
                        <FormInput />
                    </div>
                </div>

                <div className="mb-3">
                    <SectionTitle>Impresiones Diagnósticas</SectionTitle>
                    <FormTextArea rows="5" />
                </div>

                <div className="mt-6 pt-4 border-t border-gray-300">
                    <div className="flex items-end justify-between gap-4">
                        <div className="flex-1">
                            <label className="block mb-6 text-sm text-gray-600">Responsable Clínico</label>
                            <input type="text" className="w-full border-b-2 border-black bg-transparent py-1 px-1 text-sm focus:outline-none focus:border-blue-500" />
                        </div>
                        {isAves && (
                            <div className="w-32">
                                <FormGroup label="Hoja"><FormInput /></FormGroup>
                            </div>
                        )}
                    </div>
                </div>

                <div className="floating-actions ">
                    {!isSaved ? (
                        <button className="floating-btn save-btn" onClick={handleSave} title="Guardar">
                            <FaSave />
                        </button>
                    ) : (
                        <button className="floating-btn pdf-btn" onClick={handleExportPDF} title="Descargar PDF">
                            <FaFilePdf />
                        </button>
                    )}
                </div>
            </div>
        </>
    );
};

export default NormalAvesReviewVariant;
