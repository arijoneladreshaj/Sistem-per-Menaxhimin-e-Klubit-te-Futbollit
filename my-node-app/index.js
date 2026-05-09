const express = require('express');
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Serveri im i parë me Node.js! 🚀');
});

app.listen(3000, () => {
  console.log('Serveri po ekzekutohet: http://localhost:3000');
});