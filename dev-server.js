const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;
app.use(cors());
app.use(express.json());
app.post('/api/recommendations', (req, res) => {
  const { productName } = req.body;
  
  console.log(`Received recommendation request for: ${productName}`);
  setTimeout(() => {
    const mockRecommendations = [
      {
        name: `${productName} Pro Case`,
        reason: `Perfect protection for your ${productName} with premium materials`
      },
      {
        name: `${productName} Wireless Mouse`,
        reason: `Ergonomic wireless mouse designed to complement your ${productName}`
      },
      {
        name: `${productName} External Monitor`,
        reason: `Expand your workspace with a high-resolution display for ${productName}`
      },
      {
        name: `${productName} Charging Dock`,
        reason: `Keep your ${productName} charged and organized with this sleek dock`
      }
    ];
    
    res.json({
      recommendations: mockRecommendations
    });
  }, 500); // 500ms delay to simulate network latency
});
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Development API server is running' });
});
app.use('/api/*', (req, res) => {
  res.status(404).json({ 
    error: 'API endpoint not found',
    message: `The endpoint ${req.path} is not available on this development server`
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Development API server running on http://localhost:${PORT}`);
  console.log(`📡 Available endpoints:`);
  console.log(`   POST /api/recommendations - Get product recommendations`);
  console.log(`   GET  /api/health - Health check`);
});