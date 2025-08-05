const express = require('express');
const app = express();
const port = process.env.PORT || 5000;

app.get('/test', (req, res) => {
  res.json({ 
    message: 'Server is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.listen(port, () => {
  console.log(`Test server running on port ${port}`);
}); 