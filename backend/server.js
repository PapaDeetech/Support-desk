const express = require('express')
const dotenv = require('dotenv').config()
const PORT = process.env.PORT || 8000

const app = express();

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

app.get('/', (req, res) => {
//   res.send('Hello, World!')
  res.json({ message: 'Welcome to Support Desk API!'})
})