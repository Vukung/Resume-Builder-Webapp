const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/resume', require('./routes/resumeRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
// app.use('/api/template', require('./routes/templateRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/form', require('./routes/formRoutes'));

// The '/uploads' route has been removed as the feature is removed

const PORT = process.env.PORT || 5000;

// const response = await fetch(`https://resume-rocket-backend.onrender.com/api/auth/login`, { 
// });

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
