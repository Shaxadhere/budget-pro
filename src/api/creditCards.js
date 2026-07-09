import api from './axios';

export const getCreditCards = async () => {
    const response = await api.get('/credit-cards');
    return response.data;
};

export const getCreditCard = async (id) => {
    const response = await api.get(`/credit-cards/${id}`);
    return response.data;
};

export const createCreditCard = async (data) => {
    const response = await api.post('/credit-cards', data);
    return response.data;
};

export const updateCreditCard = async (id, data) => {
    const response = await api.put(`/credit-cards/${id}`, data);
    return response.data;
};

export const deleteCreditCard = async (id) => {
    const response = await api.delete(`/credit-cards/${id}`);
    return response.data;
};
