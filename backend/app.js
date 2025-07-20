const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/resume', require('./routes/resumeRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/template', require('./routes/templateRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/form', require('./routes/formRoutes'));
// serves uploaded files
app.use('/uploads', express.static('uploads'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
