import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import noteService from './noteService'

const initialState = {
  notes: [],
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
}

// Get ticket notes
export const getNotes = createAsyncThunk(
  'notes/getUserAll',
  async (ticketId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token

      return await noteService.getNotes(ticketId, token)
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        error.toString()

      return thunkAPI.rejectWithValue(message)
    }
  }
)

// Create ticket note with optional image attachments
export const createNote = createAsyncThunk(
  'notes/createNote',
  async ({ noteText, ticketId, attachments = [] }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token

      return await noteService.createNote(
        noteText,
        ticketId,
        token,
        attachments
      )
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        error.toString()

      return thunkAPI.rejectWithValue(message)
    }
  }
)

export const notesSlice = createSlice({
  name: 'notes',
  initialState,

  reducers: {
    reset: (state) => {
      Object.assign(state, initialState)
    },
  },

  extraReducers: (builder) => {
    builder
      // Get notes
      .addCase(getNotes.pending, (state) => {
        state.isLoading = true
        state.isError = false
        state.message = ''
      })
      .addCase(getNotes.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.isError = false
        state.notes = action.payload
      })
      .addCase(getNotes.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })

      // Create note
      .addCase(createNote.pending, (state) => {
        state.isLoading = true
        state.isError = false
        state.isSuccess = false
        state.message = ''
      })
      .addCase(createNote.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.isError = false

        // Add the newly created note to the notes list
        state.notes.push(action.payload)
      })
      .addCase(createNote.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
  },
})

export const { reset } = notesSlice.actions

export default notesSlice.reducer