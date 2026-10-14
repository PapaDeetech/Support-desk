
import axios from 'axios';

const API_URL = 'https://support-desk-lh08.onrender.com/api/admin/';

const getConfig = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

const getUsers = async (token) => {
  const response = await axios.get(
    `${API_URL}users`,
    getConfig(token)
  );

  return response.data;
};

const getTickets = async (token) => {
  const response = await axios.get(
    `${API_URL}tickets`,
    getConfig(token)
  );

  return response.data;
};

const updateTicket = async (ticketId, ticketData, token) => {
  const response = await axios.put(
    `${API_URL}tickets/${ticketId}`,
    ticketData,
    getConfig(token)
  );

  return response.data;
};

const deleteTicket = async (ticketId, token) => {
  const response = await axios.delete(
    `${API_URL}tickets/${ticketId}`,
    getConfig(token)
  );

  return response.data;
};

const adminService = {
  getUsers,
  getTickets,
  updateTicket,
  deleteTicket,
};

export default adminService;
