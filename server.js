const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Serve menu data
app.get('/menu', (req, res) => {
    fs.readFile(path.join(__dirname, 'menu.json'), 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to load menu.' });
        }
        res.json(JSON.parse(data));
    });
});

// Handle order submission
app.post('/order', (req, res) => {
    const order = req.body;
    // Here you could save the order to a database or file
    console.log('Order received:', order);
    res.json({ message: 'Order received successfully!' });
});

// Simple login endpoint
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    // Replace with real user validation as needed
    if (username === 'user' && password === 'pass') {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, message: 'Invalid username or password.' });
    }
});

// Simple signup endpoint (in-memory, for demo purposes)
const users = [{ username: 'user', password: 'pass' }];
app.post('/signup', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password required.' });
    }
    if (users.find(u => u.username === username)) {
        return res.status(409).json({ success: false, message: 'Username already exists.' });
    }
    users.push({ username, password });
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`Backend server running at http://localhost:${PORT}`);
});
