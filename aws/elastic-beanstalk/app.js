const express = require('express');
const { Client } = require('pg');
const app = express();
const port = process.env.PORT || 3000;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

client.connect();

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/questions', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM questions');
    res.json(result.rows);
  } catch (err) {
    res.status(500).send('Error retrieving questions');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;
