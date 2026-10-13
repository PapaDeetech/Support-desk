const express = require('express');
require('dotenv').config();
const cors = require('cors');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');

const PORT = process.env.PORT || 8000;
const app = express();

// Middleware
app.use(cors({
    origin: 'https://supportapp1.netlify.app'
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Welcome route
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to Support Desk API!'
    });
});

// API routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/tickets', require('./routes/ticketRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Error handler must come after the routes
app.use(errorHandler);

// Connect to MongoDB, then start the server
const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }
};

startServer();