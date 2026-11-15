require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(` India R&D Incentive Platform Server Active `);
    console.log(` URL: http://localhost:${PORT}`);
    console.log(` Health Endpoint: http://localhost:${PORT}/api/health`);
    console.log(` Screener API: http://localhost:${PORT}/api/v1/india/eligibility/screen`);
    console.log(`====================================================`);
  });
};

startServer();

