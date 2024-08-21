const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const passport = require("./config/passport");  // Import the configured passport
const session = require("express-session");
require('dotenv').config();
const path = require('path')
const __dirname1 = path.resolve();
const authRoutes = require("./routes/authRoutes");
const todoRoutes = require("./routes/todoRoutes");
const connectDB = require("./config/database");
const userRoutes = require('./routes/userRoutes');

const app = express();

// CORS configuration
const corsOptions = {
  origin: "http://localhost:5173", // Your client's URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Other middleware
app.use(express.json());
app.use(session({ 
  secret: process.env.SESSION_SECRET || "your_session_secret", 
  resave: false, 
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

app.use('/api', userRoutes);

// Initialize Passport and restore authentication state, if any, from the session
app.use(passport.initialize()); 
app.use(passport.session());

// Database connection
connectDB();

// Routes
app.use("/auth", authRoutes);
app.use("/todos", passport.authenticate('jwt', { session: false }), todoRoutes); // Protect /todos route

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

//deploy
if(process.env.NODE_ENV==="production")
{
  app.use(express.static(path.join(__dirname1,"client","build")))
  app.get("*",(req,res)=>
  {
    res.sendFile(path.resolve(__dirname1,"client","build","index.html"))
  })
}

const port = process.env.PORT || 9000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});