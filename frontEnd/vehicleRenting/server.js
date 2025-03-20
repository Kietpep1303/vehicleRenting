const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

const connectMongoDB = require('./database/mongodb');
const authenticationRoute = require('./routes/authenticationRoute');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.use(express.json());
app.use('/api/auth', authenticationRoute);

connectMongoDB();

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});