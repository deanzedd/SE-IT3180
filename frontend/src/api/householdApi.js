import axiosClient from './axiosClient';

const householdApi = {
    getAll(params) {
        return axiosClient.get('/households', { params });
    },
    create(data) {
        return axiosClient.post('/households', data);
    },
    update(id, data) {
        return axiosClient.put(`/households/${id}`, data);
    },
    remove(id) {
        return axiosClient.delete(`/households/${id}`);
    },
};

export default householdApi;
