const express = require('express')
const cors = require('cors')
const rateLimit = require('express-rate-limit')
require('dotenv').config()

const PORT = process.env.PORT || 3000

const app = express()

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100
})
app.use(limiter)
app.set('trust proxy', 1)

// Enable cors
app.use(cors())

// Routes
app.use('/api', require('./routes/index'))

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
