import api from './axios';

export const getBankInfos = async (params) => {
    const response = await api.get('/bank-info', { params });
    return response.data;
};

export const getBankInfo = async (id) => {
    const response = await api.get(`/bank-info/${id}`);
    return response.data;
};

export const createBankInfo = async (data) => {
    const response = await api.post('/bank-info', data);
    return response.data;
};

export const updateBankInfo = async (id, data) => {
    const response = await api.put(`/bank-info/${id}`, data);
    return response.data;
};

export const deleteBankInfo = async (id) => {
    const response = await api.delete(`/bank-info/${id}`);
    return response.data;
};
