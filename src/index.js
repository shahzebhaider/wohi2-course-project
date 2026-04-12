const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

// this one is for Middleware
app.use(express.json());

// this one is for Import router
const questionsRouter = require('./routes/questions');

// this one is sfor API routes
app.use('/api/questions', questionsRouter);

// this onw is for 404 fallback
app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

// this one is for Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
