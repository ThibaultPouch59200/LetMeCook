const express = require('express')
const cors = require('cors')
const path = require('path')

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/ingredients', require('./routes/ingredients'))
app.use('/api/recipes', require('./routes/recipes'))

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'public')))
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
  })
}

module.exports = app
