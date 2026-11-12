const express = require("express");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const colors = require("colors");
const connectDB = require("./config/db");
const PORT = process.env.PORT || 8000;
const { errorHandler } = require("./middleware/errorMiddleware");

const app = express();


const cors = require('cors');


const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',

  'https://support-desk-5vq7.vercel.app',
  'https://support-desk-5vq7-git-main-papa-dee-tech.vercel.app',
  'https://support-desk-5vq7-1hlwybvf5-papa-dee-tech.vercel.app',
];

console.log("CORS CONFIGURATION LOADED");
app.use(cors({
  origin: (origin, callback) => {
    console.log("Incoming request origin:", origin);

    if (!origin || allowedOrigins.includes(origin)) {
      console.log("CORS origin allowed:", origin);
      callback(null, true);
    } else {
      console.log("CORS origin rejected:", origin);
      callback(new Error(`CORS blocked for origin: ${origin}`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));


// Connect to database
connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.json({ message: "Welcome to Support Desk API!" });
});

// Routes
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/tickets", require("./routes/ticketRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

app.use(errorHandler);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
