'use strict';

const express = require('express');
const axios = require('axios');

// Constants
const PORT = 3000;
const HOST = '0.0.0.0';
const API_URL = process.env.API_URL+':8080';

// App
const app = express();
app.get('/', async (req, res) => {
    let response = await axios.get(API_URL);
    res.send(`전달받은 메세지: ${response.data}`);
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
console.log(API_URL);