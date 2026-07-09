import api from './axios';

export const getIncomes = async (params) => {
    const response = await api.get('/incomes', { params });
    return response.data;
};

export const getIncome = async (id) => {
    const response = await api.get(`/incomes/${id}`);
    return response.data;
};

export const createIncome = async (incomeData) => {
    const response = await api.post('/incomes', incomeData);
    return response.data;
};

export const updateIncome = async (id, incomeData) => {
    const response = await api.put(`/incomes/${id}`, incomeData);
    return response.data;
};

export const deleteIncome = async (id) => {
    const response = await api.delete(`/incomes/${id}`);
    return response.data;
};
