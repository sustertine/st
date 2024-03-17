const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());

let users = {};

app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl} ${req.body ? JSON.stringify(req.body) : ''}`);
    next();
});

function auth(req, res, next) {
    const { username, password } = req.headers;
    const user = users[username];
    if (!user || user.password !== password) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
    req.user = user;
    next();
}

app.post('/register', (req, res) => {
    const { username, password } = req.body;
    if (users[username]) {
        return res.status(400).json({ message: 'User already exists' });
    }
    users[username] = { username, password };
    res.status(201).json({ message: 'User registered successfully' });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users[username];
    if (!user || user.password !== password) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
    res.status(200).json({ message: 'Logged in successfully' });
});

app.get('/protected', auth, (req, res) => {
    res.status(200).json({ message: 'You are authenticated', user: req.user });
});

app.listen(3000, () => console.log('Server running on port 3000'));