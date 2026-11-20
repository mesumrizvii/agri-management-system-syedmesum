// Builds the 4 API calls for one backend resource, e.g. makeApi("/crops").
// The server answers { succeeded, message, data }.
// FormData bodies (buyer photo) are sent as multipart automatically by axios.
import http from "./axiosSetup";

export const makeApi = (path, listKey) => ({
  list: async () => {
    const { data } = await http.get(path);
    return listKey ? data.data[listKey] : data.data;
  },
  create: async (body) => (await http.post(path, body)).data.data,
  update: async (id, body) => (await http.put(`${path}/${id}`, body)).data.data,
  remove: async (id) => (await http.delete(`${path}/${id}`)).data.data,
});
