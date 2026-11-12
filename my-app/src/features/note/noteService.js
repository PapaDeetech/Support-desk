import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL || ""}/api/tickets/`;

// Get user notes
const getNotes = async (ticketId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.get(
    `${API_URL}${ticketId}/notes`,
    config
  );

  return response.data;
};

// Create ticket note with optional image attachments
const createNote = async (noteText, ticketId, token, attachments = []) => {
  const formData = new FormData();

  formData.append("text", noteText);

  attachments.forEach((file) => {
    formData.append("attachments", file);
  });

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.post(
    `${API_URL}${ticketId}/notes`,
    formData,
    config
  );

  return response.data;
};

const noteService = {
  getNotes,
  createNote,
};

export default noteService;