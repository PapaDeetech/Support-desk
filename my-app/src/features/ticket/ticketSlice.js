import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import ticketService from './ticketService'

const initialState = {
    tickets: [],
    ticket: {},
    isError: false,
    isSuccess: false,
    isLoading: false,
    reviewIsLoading: false,
    message: '',
}

// Create a new ticket
export const createTicket = createAsyncThunk(
    'tickets/create',
    async (ticketData, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.user.token;
            return await ticketService.createTicket(ticketData, token);
        } catch (error) {
            const message = (
                error.response && error.response.data && error.response.data.message) || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
)

// Get user tickets
export const getTickets = createAsyncThunk(
    'tickets/getUserAll',
    async (_, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.user.token;
            return await ticketService.getTickets(token);
        } catch (error) {
            const message = (
                error.response && error.response.data && error.response.data.message) || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
)

// Get ticket details
export const getTicket = createAsyncThunk(
    'tickets/get',
    async (ticketId, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.user.token;
            return await ticketService.getTicket(ticketId, token);
        } catch (error) {
            const message = (
                error.response && error.response.data && error.response.data.message) || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
)

//  Close ticket
export const closeTicket = createAsyncThunk(
    'tickets/close',
    async (ticketId, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.user.token;
            return await ticketService.closeTicket(ticketId, token);
        } catch (error) {
            const message = (
                error.response && error.response.data && error.response.data.message) || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
)

// Like or unlike a ticket
export const likeTicket = createAsyncThunk(
    'tickets/like',
    async (ticketId, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.user.token;
            return await ticketService.likeTicket(ticketId, token);
        } catch (error) {
            const message = (
                error.response && error.response.data && error.response.data.message) || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Review
export const createTicketReview = createAsyncThunk(
  'tickets/createReview',
  async ({ ticketId, reviewData }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token

      return await ticketService.submitTicketReview(ticketId, reviewData, token)
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to submit review'

      return thunkAPI.rejectWithValue(message)
    }
  }
)

export const ticketsSlice = createSlice({
    name: 'ticketsSlice',
    initialState,
    reducers: {
        reset: (state) => initialState
    },
    extraReducers: (builder) => {
    builder
        .addCase(createTicket.pending, (state) => {
            state.isLoading = true
            state.isError = false
        })
        .addCase(createTicket.fulfilled, (state) => {
            state.isLoading = false
            state.isSuccess = true
        })
        .addCase(createTicket.rejected, (state, action) => {
            state.isLoading = false
            state.isError = true
            state.message = action.payload
        })

        .addCase(getTickets.pending, (state) => {
            state.isLoading = true
        })
        .addCase(getTickets.fulfilled, (state, action) => {
            state.isLoading = false
            state.isSuccess = true
            state.tickets = action.payload
        })
        .addCase(getTickets.rejected, (state, action) => {
            state.isLoading = false
            state.isError = true
            state.message = action.payload
        })

        .addCase(getTicket.pending, (state) => {
            state.isLoading = true
        })
        .addCase(getTicket.fulfilled, (state, action) => {
            state.isLoading = false
            state.isSuccess = true
            state.ticket = action.payload
        })
        .addCase(getTicket.rejected, (state, action) => {
            state.isLoading = false
            state.isError = true
            state.message = action.payload
        })

        .addCase(closeTicket.pending, (state) => {
            state.isLoading = true
        })
        .addCase(closeTicket.fulfilled, (state, action) => {
            state.isLoading = false
            state.isSuccess = true

            const updatedTicket = action.payload

            if (updatedTicket?._id) {
                if (state.ticket?._id === updatedTicket._id) {
                    state.ticket = updatedTicket
                }

                state.tickets = state.tickets.map((ticket) =>
                    ticket._id === updatedTicket._id
                        ? updatedTicket
                        : ticket
                )
            }
        })
        .addCase(closeTicket.rejected, (state, action) => {
            state.isLoading = false
            state.isError = true
            state.message = action.payload
        })

        .addCase(likeTicket.fulfilled, (state, action) => {
            state.isLoading = false
            state.isSuccess = true

            const updatedTicket = action.payload

            if (state.ticket?._id === updatedTicket._id) {
                state.ticket.likes = updatedTicket.likes
                state.ticket.likesCount = updatedTicket.likesCount
            }

            state.tickets = state.tickets.map((ticket) =>
                ticket._id === updatedTicket._id
                    ? {
                        ...ticket,
                        likes: updatedTicket.likes,
                        likesCount: updatedTicket.likesCount,
                    }
                    : ticket
            )
        })

        .addCase(createTicketReview.pending, (state) => {
            state.reviewIsLoading = true
            state.isError = false
            state.message = ''
        })
        .addCase(createTicketReview.fulfilled, (state, action) => {
            state.reviewIsLoading = false
            state.isSuccess = true

            if (state.ticket?._id) {
                state.ticket.review = action.payload
            }

            state.tickets = state.tickets.map((ticket) =>
                ticket._id === state.ticket?._id
                    ? { ...ticket, review: action.payload }
                    : ticket
            )
        })
        .addCase(createTicketReview.rejected, (state, action) => {
            state.reviewIsLoading = false
            state.isError = true
            state.message =
                action.payload || 'Failed to submit review'
        })
    }
})


export const {reset} = ticketsSlice.actions
export default ticketsSlice.reducer