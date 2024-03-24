const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const app = express();
app.use(bodyParser.json());

let users = {};
const SECRET_KEY = 'A7CE5BF415E446819BFB32371B24F';

app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl} ${req.body ? JSON.stringify(req.body) : ''}`);
    next();
});

function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Missing or invalid Authorization header' });
    }
    const token = authHeader.slice(7);
    try {
        const payload = jwt.verify(token, SECRET_KEY);
        req.user = users[payload.username];
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
}

app.get('/api/users', authenticate, (req, res) => {
    res.status(200).json(Object.values(users));
});

app.get('/api/users/:username', authenticate, (req, res) => {
    const user = users[req.params.username];
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
});

app.put('/api/users/:username', authenticate, (req, res) => {
    const user = users[req.params.username];
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    Object.assign(user, req.body);
    res.status(200).json(user);
});

app.post('/auth/register', (req, res) => {
    const { username, password } = req.body;
    if (users[username]) {
        return res.status(400).json({ message: 'User already exists' });
    }
    users[username] = { username, password };
    res.status(201).json({ message: 'User registered successfully' });
});

app.post('/auth/login', (req, res) => {
    const { username, password } = req.body;
    const user = users[username];
    if (!user || user.password !== password) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' }); // Token expires in 1 hour
    res.status(200).json({ message: 'Logged in successfully', token });
});

app.listen(3000, () => console.log('Server running on port 3000'));