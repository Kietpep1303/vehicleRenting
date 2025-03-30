const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});

io.on('connection', (socket) => {
    socket.on('registerEmail', (email) => {
      connectedUsers[email] = socket.id;
    });
  
    socket.on('privateMessage', ({ senderEmail, recipientEmail, message }) => {
      const recipientSocket = connectedUsers[recipientEmail];
      if (recipientSocket) {
        io.to(recipientSocket).emit('privateMessage', { senderEmail, message });
      }
    });
});

const pool = require('./database/postgresql');


dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // Support for multiple ports application.
app.use(express.json());
app.use('/api/auth', require('./routes/authenticationRoute'));
app.use('/api/vehicle', require('./routes/vehicleRoute'));
app.use('/api/rental', require('./routes/rentalRoute'));

pool.connect(
    console.log('Connected to PostgreSQL database')
);

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });