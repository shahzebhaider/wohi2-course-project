const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Import router
const questionsRouter = require('./routes/questions');

// API routes
app.use('/api/questions', questionsRouter);

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
