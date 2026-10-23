import api from "./api";

export async function getVehicles() {
const response = await api.get("/vehicles");
return response.data;
}

export async function getVehicleById(id) {
const response = await api.get("/vehicles/" + id);
return response.data;
}

export async function createVehicle(payload) {
const response = await api.post("/vehicles", payload);
return response.data;
}

export async function updateVehicle(id, payload) {
const response = await api.put("/vehicles/" + id, payload);
return response.data;
}

export async function deleteVehicle(id) {
await api.delete("/vehicles/" + id);
}