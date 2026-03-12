import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaIdCard, FaClipboardList, FaExclamationTriangle } from 'react-icons/fa';

const PatientCard = ({ patient, isCasualties = false }) => {
    const navigate = useNavigate();

    const handleImageError = (e) => {
        e.target.src = 'https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&q=80&w=800'; // Fallback cat image
    };

    const handleViewProfile = () => {
        navigate(`/${isCasualties ? 'casualties' : 'patients'}/${patient.id}`);
    };

    const handleViewHistory = () => {
        navigate(`/${isCasualties ? 'casualties' : 'patients'}/${patient.id}`, { state: { initialTab: 'history' } });
    };

    const getSpeciesLabel = (category) => {
        if (!category) return '';
        const map = {
            'mamiferos': 'Mamífero',
            'aves': 'Ave',
            'reptiles': 'Reptil',
            'anfibios': 'Anfibio'
        };
        return map[category.toLowerCase()] || category;
    };

    return (
        <div className="bg-white rounded-xl shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-200 border border-gray-100 flex flex-col overflow-hidden group">
            <div className="relative h-44 overflow-hidden">
                <img
                    src={patient.imageUrl || 'https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&q=80&w=800'}
                    alt={patient.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={handleImageError}
                />

                {/* The ID badge was moved to the body */}

                {/* The ID badge was moved to the body */}
            </div>

            <div className="p-4 flex flex-col gap-3">
                <div className="mb-1">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h3 className="text-xl font-extrabold text-gray-900 leading-tight m-0">{patient.commonName || 'Sin Nombre Común'}</h3>
                        <span className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-widest font-sans shrink-0 mt-1">
                            ID: {patient.id}
                        </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                        <p className="text-sm text-gray-500 italic m-0">{patient.scientificName}</p>
                        <span className="text-xs text-gray-400 font-medium bg-gray-100 px-2 py-0.5 rounded">{getSpeciesLabel(patient.category)}</span>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-2 py-3 border-y border-gray-100">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[0.65rem] text-gray-400 uppercase font-bold tracking-wide">EDAD</span>
                        <span className="text-sm text-gray-700 font-semibold">{patient.age || 'N/A'} años</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[0.65rem] text-gray-400 uppercase font-bold tracking-wide">SEXO</span>
                        <span className="text-sm text-gray-700 font-semibold">{patient.sex || 'N/A'}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[0.65rem] text-gray-400 uppercase font-bold tracking-wide">PESO</span>
                        <span className="text-sm text-gray-700 font-semibold">{patient.weight ? `${patient.weight} kg` : 'N/A'}</span>
                    </div>
                </div>

                <div className="flex justify-between items-center mt-auto pt-1">
                    <div className="flex items-center gap-1.5 text-gray-600 text-[0.85rem] font-medium">
                        <FaMapMarkerAlt />
                        <span>{patient.location}</span>
                    </div>
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
                            title="Historia Clínica"
                            onClick={handleViewHistory}
                        >
                            <FaClipboardList />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientCard;
