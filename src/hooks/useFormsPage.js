import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { patients } from '../data/mockData';

const useFormsPage = () => {
    const [selectedAnimal, setSelectedAnimal] = useState(null);
    const [viewState, setViewState] = useState('menu'); // 'menu' | 'selection' | 'form'
    const [targetForm, setTargetForm] = useState(null);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const urlForm = searchParams.get('form');
        const urlAnimalName = searchParams.get('animalName');

        if (urlForm && urlAnimalName) {
            // Find the animal based on name or ID to be safe
            const foundAnimal = patients.find(p => p.name === urlAnimalName || p.id === urlAnimalName);

            if (foundAnimal) {
                setTargetForm(urlForm);
                setSelectedAnimal(foundAnimal);
                setViewState('form');
            }
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
        setTargetForm(null);
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
        if (origin === 'history') {
            if (patientId) {
                navigate(`/patients/${patientId}`, { state: { initialTab: 'history' } });
            } else {
                navigate('/medical-history');
            }
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
