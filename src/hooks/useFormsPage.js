import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { getPatientByNameOrId } from '../services/patientsService';

const useFormsPage = () => {
    const [selectedAnimal, setSelectedAnimal] = useState(null);
    const [viewState, setViewState] = useState('menu'); // 'menu' | 'selection' | 'form'
    const [targetForm, setTargetForm] = useState(null);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const urlForm = searchParams.get('form');
        const urlAnimalName = searchParams.get('animalName');
        const shouldSelectAnimalFirst = searchParams.get('selectAnimal') === 'true';

        if (urlForm && urlAnimalName) {
            const foundAnimal = location.state?.patient || getPatientByNameOrId(urlAnimalName);

            if (foundAnimal) {
                setTargetForm(urlForm);
                setSelectedAnimal(foundAnimal);
                setViewState('form');
            }
        } else if (urlForm && shouldSelectAnimalFirst) {
            setTargetForm(urlForm);
            setSelectedAnimal(null);
            setViewState('selection');
        } else if (urlForm && !urlAnimalName) {
            // New entry without a pre-selected animal (e.g. "Nuevo Ingreso")
            setTargetForm(urlForm);
            setSelectedAnimal(null);
            setViewState('form');
        }
    }, [searchParams]);

    const handleSelectForm = (formKey) => {
        setTargetForm(formKey);
        setViewState('selection');
    };

    const handleAnimalSelect = (animal) => {
        setSelectedAnimal(animal);
        setViewState('form');
    };

    const cancelSelection = () => {
        const origin = searchParams.get('origin');
        if (origin) {
            backToMenu();
            return;
        }

        setTargetForm(null);
        setSelectedAnimal(null);
        setViewState('menu');
    };

    const backToSelection = () => {
        const origin = searchParams.get('origin');
        if (origin) {
            backToMenu();
        } else {
            setViewState('selection');
            setSelectedAnimal(null);
        }
    };

    const handleChangeAnimal = () => {
        setSelectedAnimal(null);
        setViewState('selection');
    };

    const backToMenu = () => {
        const origin = searchParams.get('origin');
        const patientId = searchParams.get('patientId');
        if (origin === 'casualties') {
            if (patientId) {
                navigate(`/casualties/${patientId}`, { state: { patient: selectedAnimal || undefined } });
            } else {
                navigate('/casualties');
            }
        } else if (origin === 'history') {
            if (patientId) {
                navigate(`/patients/${patientId}`, { state: { initialTab: 'history', patient: selectedAnimal || undefined } });
            } else {
                navigate('/medical-history');
            }
        } else if (origin === 'medical-history') {
            navigate('/medical-history');
        } else if (origin === 'hospitalization') {
            navigate('/hospitalization');
        } else if (origin === 'treatments') {
            navigate('/treatments');
        } else if (origin === 'vaccinations') {
            navigate('/vaccinations');
        } else if (origin === 'deworming') {
            navigate('/deworming');
        } else {
            setViewState('menu');
            setTargetForm(null);
            setSelectedAnimal(null);
        }
    };

    return {
        selectedAnimal,
        viewState,
        targetForm,
        handleSelectForm,
        handleAnimalSelect,
        cancelSelection,
        backToSelection,
        handleChangeAnimal,
        backToMenu
    };
};

export default useFormsPage;
