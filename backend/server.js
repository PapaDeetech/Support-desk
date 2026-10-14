const express = require('express')
const dotenv = require('dotenv').config()
const colors = require('colors')
const connectDB = require('./config/db')
const PORT = process.env.PORT || 8000
const{errorHandler} = require('./middleware/errorMiddleware')
const cors = require('cors');

const app = express();



app.use(cors({
    origin: 'https://support-desk-git-main-papa-dee-tech.vercel.app',
    
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
}));

// Connect to database
connectDB()

app.use(express.json())
app.use(express.urlencoded({ extended: false }))


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

app.get('/', (req, res) => {
//   res.send('Hello, World!')
  res.json({ message: 'Welcome to Support Desk API!'})
})

// Routes
app.use('/api/users', require('./routes/userRoutes'))
app.use('/api/tickets', require('./routes/ticketRoutes'))
app.use('/api/admin', require('./routes/adminRoutes'))
app.use(errorHandler)