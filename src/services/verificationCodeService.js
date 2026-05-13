import { apiFetch } from './api';

const VERIFICATION_CODE_ENDPOINT = '/api/auth/verification-code';

const getVerificationCode = async () => {
    const response = await apiFetch(VERIFICATION_CODE_ENDPOINT);
    return response;
};

export { getVerificationCode };
