import { useState } from 'react';

const useFormState = (initialStep = 1, initialSaved = false) => {
    const [step, setStep] = useState(initialStep);
    const [isSaved, setIsSaved] = useState(initialSaved);

    const handleNext = () => setStep((prev) => prev + 1);
    const handleBack = () => setStep((prev) => Math.max(1, prev - 1));
    const handleSave = () => {
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
