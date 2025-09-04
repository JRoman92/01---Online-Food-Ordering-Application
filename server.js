const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Serve menu data

app.listen(PORT, () => {
    console.log(`Backend server running at http://localhost:${PORT}`);
});
