require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const userRoutes = require("./routes/userRoutes");
const companyRoutes = require('./routes/companyRoutes');
const branchRoutes = require('./routes/branchRoutes');
const supervisorRoutes = require('./routes/supervisorRoutes');
const salesmanRoutes = require('./routes/salesmanRoutes');
const taskRoutesNew = require('./routes/taskRoutesNew');
const connectDB = require("./config/db");

const app = express();
const PORT = process.env.PORT || 5000;

  // CORS options
const corsOptions = {

  origin: "*", 
  methods: ["GET", "POST","PUT","DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

  // Connect to mangodb
  connectDB();


  // Middleware
app.use(cors(corsOptions));  
app.use(bodyParser.json());

// Routes
app.use("/api", userRoutes);
app.use('/api', companyRoutes); 
app.use('/api', branchRoutes);
app.use('/api', supervisorRoutes);  
app.use('/api', salesmanRoutes);
app.use('/api', taskRoutesNew);

// app.use('/api/attendance', attendanceRoutes);


// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
