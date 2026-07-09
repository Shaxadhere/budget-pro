import api from './axios';

export const getCompanies = async (params) => {
    const response = await api.get('/companies', { params });
    return response.data;
};

export const getCompany = async (id) => {
    const response = await api.get(`/companies/${id}`);
    return response.data;
};

export const createCompany = async (data) => {
    const response = await api.post('/companies', data);
    return response.data;
};

export const updateCompany = async (id, data) => {
    const response = await api.put(`/companies/${id}`, data);
    return response.data;
};

export const deleteCompany = async (id) => {
    const response = await api.delete(`/companies/${id}`);
    return response.data;
};
