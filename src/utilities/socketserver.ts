// const express = require('express');
// const http = require('http');
// const socketIo = require('socket.io');
// const { DashboardData, startPeriodicUpdates } = require('../controllers/DashboardController');

// const app = express();
// const server = http.createServer(app);
// const io = socketIo(server, {
//   cors: {
//     origin: "*", // Adjust this to your frontend URL in production
//     methods: ["GET", "POST"]
//   }
// });

// // Make io accessible to routes
// app.set('io', io);

// // Start periodic updates
// startPeriodicUpdates(io);

// // Socket.IO connection handling
// io.on('connection', (socket) => {
//   console.log('New client connected:', socket.id);

//   // Handle department-specific subscriptions
//   socket.on('subscribe', (departmentId) => {
//     socket.join(`dept_${departmentId}`);
//     console.log(`Client ${socket.id} subscribed to department ${departmentId}`);
//   });

//   socket.on('disconnect', () => {
//     console.log('Client disconnected:', socket.id);
//   });
// });

// // Your other middleware and routes
// app.use(express.json());
// app.post('/dashboard', DashboardData);

// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).send('Something broke!');
// });

// const PORT = process.env.PORT || 3000;
// const HOST = '192.168.1.37';  
// // const HOST = '192.168.130.119';  // To listen on all network interfaces (external access)

// app.listen(PORT, HOST, () => {
//   console.log(`Server is running on http://localhost:${PORT} or http://${HOST}:${PORT}`);
// });


