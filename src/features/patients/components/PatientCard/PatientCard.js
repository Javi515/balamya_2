import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaIdCard, FaClipboardList, FaPaw } from 'react-icons/fa';

const LEGACY_FALLBACK_IMAGE =
    'https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&q=80&w=800';

const getSpeciesLabel = (category) => {
    if (!category) return '';

    const map = {
        mamiferos: 'Mamifero',
        aves: 'Ave',
        reptiles: 'Reptil',
        anfibios: 'Anfibio',
    };

    return map[String(category).toLowerCase()] || category;
};

const PatientCardImage = ({ patient, apiMode }) => {
    const [imageFailed, setImageFailed] = useState(false);
    const imageAlt = patient.name || patient.commonName || patient.scientificName || 'Paciente';
    const shouldRenderImage = apiMode
        ? Boolean(patient.imageUrl) && !imageFailed
        : !imageFailed;

    if (!shouldRenderImage) {
        return (
            <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300 text-5xl">
                <FaPaw />
            </div>
        );
    }

    return (
        <img
            src={apiMode ? patient.imageUrl : (patient.imageUrl || LEGACY_FALLBACK_IMAGE)}
            alt={imageAlt}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImageFailed(true)}
        />
    );
};

const PatientCard = ({ patient, isCasualties = false, detailsEnabled = true, apiMode = false }) => {
    const navigate = useNavigate();
    const ageLabel = patient.ageText || (patient.age ? `${patient.age} anios` : 'N/A');
    const taxonomicLabel = patient.taxonomicGroup || getSpeciesLabel(patient.category) || 'Sin grupo';
    const displayName = patient.name || patient.commonName || 'Sin nombre';
    const groupingLabel = patient.grouping
        ? `${patient.grouping}${patient.specimenCount ? ` (${patient.specimenCount})` : ''}`
        : 'N/A';

    const handleViewProfile = () => {
        navigate(`/${isCasualties ? 'casualties' : 'patients'}/${patient.id}`, {
            state: { patient },
        });
    };

    const handleViewHistory = () => {
        navigate(`/${isCasualties ? 'casualties' : 'patients'}/${patient.id}`, {
            state: { initialTab: 'history', patient },
        });
    };

    return (
        <div className="bg-white rounded-xl shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-200 border border-gray-100 flex flex-col overflow-hidden group">
            <div className="relative h-44 overflow-hidden">
                <PatientCardImage patient={patient} apiMode={apiMode} />
            </div>

            <div className="p-4 flex flex-col gap-3">
                <div className="mb-1">
                    <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="text-xl font-extrabold text-gray-900 leading-tight m-0">
                            {displayName}
                        </h3>
                        <span className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-widest font-sans shrink-0 mt-1">
                            ID: {patient.id}
                        </span>
                    </div>
                    <div className="flex flex-col gap-1 mb-2">
                        {patient.name && (
                            <div className="flex items-baseline gap-2">
                                <span className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-wide w-20 shrink-0">Nombre propio</span>
                                <span className="text-sm text-gray-700 font-medium">{patient.name}</span>
                            </div>
                        )}
                        {patient.commonName && (
                            <div className="flex items-baseline gap-2">
                                <span className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-wide w-20 shrink-0">Común</span>
                                <span className="text-sm text-gray-600">{patient.commonName}</span>
                            </div>
                        )}
                        {patient.scientificName && (
                            <div className="flex items-baseline gap-2">
                                <span className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-wide w-20 shrink-0">Científico</span>
                                <span className="text-sm text-gray-500 italic">{patient.scientificName}</span>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 font-medium bg-gray-100 px-2 py-0.5 rounded">
                            {taxonomicLabel}
                        </span>
                        {patient.family && (
                            <span className="text-xs text-gray-400">Familia: <span className="font-medium">{patient.family}</span></span>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-2 py-3 border-y border-gray-100">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[0.65rem] text-gray-400 uppercase font-bold tracking-wide">EDAD</span>
                        <span className="text-sm text-gray-700 font-semibold">{ageLabel}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[0.65rem] text-gray-400 uppercase font-bold tracking-wide">SEXO</span>
                        <span className="text-sm text-gray-700 font-semibold">{patient.sex || 'N/A'}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[0.65rem] text-gray-400 uppercase font-bold tracking-wide">
                            {apiMode ? 'AGRUP.' : 'PESO'}
                        </span>
                        <span className="text-sm text-gray-700 font-semibold">
                            {apiMode ? groupingLabel : (patient.weight ? `${patient.weight} kg` : 'N/A')}
                        </span>
                    </div>
                </div>

                {patient.procedencia && (
                    <div className="text-sm text-gray-500">
                        Procedencia: <span className="font-medium text-gray-700">{patient.procedencia}</span>
                    </div>
                )}
                {isCasualties && patient.casualtyReason && (
                    <div className="text-sm text-gray-500">
                        Motivo de baja: <span className="font-medium text-red-600">{patient.casualtyReason}</span>
                    </div>
                )}

                <div className="flex justify-between items-center mt-auto pt-1">
                    <div className="flex items-center gap-1.5 text-gray-600 text-[0.85rem] font-medium">
                        <FaMapMarkerAlt />
                        <span>{patient.location || 'Sin recinto'}</span>
                    </div>
                    {detailsEnabled && (
                        <div className="flex gap-2">
                            <button
                                className="bg-transparent border-none cursor-pointer p-2 rounded-lg text-gray-500 transition-all duration-200 hover:bg-gray-100 hover:text-gray-900 hover:scale-110"
                                title="Expediente"
                                onClick={handleViewProfile}
                            >
                                <FaIdCard />
                            </button>
                            <button
                                className="bg-transparent border-none cursor-pointer p-2 rounded-lg text-gray-500 transition-all duration-200 hover:bg-gray-100 hover:text-gray-900 hover:scale-110"
                                title="Historia Clinica"
                                onClick={handleViewHistory}
                            >
                                <FaClipboardList />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PatientCard;
