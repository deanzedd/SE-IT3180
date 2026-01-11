import axiosClient from './axiosClient';

const residentsApi = {
    getAll(params) {
        return axiosClient.get('/residents', { params });
    },
    getById(id) {
        return axiosClient.get(`/residents/${id}`);
    },
    create(data) {
        return axiosClient.post('/residents', data);
    },
    update(id, data) {
        return axiosClient.put(`/residents/${id}`, data);
    },
    remove(id) {
        return axiosClient.delete(`/residents/${id}`);
    },
};

export default residentsApi;
