try {
  const express = require('express');
  const { admin, db } = require('./services/firebase');
  const userRoutes = require('./api/userRoutes');
  const authRoutes = require('./api/authRoutes');
  const rewardRoutes = require('./api/rewardRoutes');
  const transactionRoutes = require('./api/transactionRoutes');
  const analyticsRoutes = require('./api/analyticsRoutes');

  const app = express();
  app.use(express.json());

  // All routes defined in userRoutes will be prefixed with /api/users
  app.use('/api/users', userRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/rewards', rewardRoutes);
  app.use('/api/transactions', transactionRoutes);
  app.use('/api/analytics', analyticsRoutes);

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
} catch (error) {
  console.error('Failed to start server:', error);
}