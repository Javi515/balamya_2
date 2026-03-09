import { useState } from 'react';

const useFormState = (initialStep = 1) => {
    const [step, setStep] = useState(initialStep);
    const [isSaved, setIsSaved] = useState(false);

    const handleNext = () => setStep((prev) => prev + 1);
    const handleBack = () => setStep((prev) => Math.max(1, prev - 1));
    const handleSave = () => {
        alert('Datos guardados exitosamente (simulación).');
        setIsSaved(true);
    };

    return {
        step,
        isSaved,
        handleNext,
        handleBack,
        handleSave
    };
};

export default useFormState;
