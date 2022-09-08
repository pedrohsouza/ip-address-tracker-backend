const express = require('express')
const dns = require('node:dns')
const router = express.Router()
const needle = require('needle')
const apicache = require('apicache')

// Enviroment variables
const API_BASE_URL = process.env.API_BASE_URL
const API_KEY_NAME = process.env.API_KEY_NAME
const API_KEY_VALUE = process.env.API_KEY_VALUE

// Init cache
let cache = apicache.middleware

router.get('/', cache('1 day'), async (req, res) => {
  async function connectToApi() {
    const params = new URLSearchParams({
      [API_KEY_NAME]: API_KEY_VALUE,
      ...req.query
    })

    const apiRes = await needle('get', `${API_BASE_URL}?${params}`)
    const data = apiRes.body

    // Log the request to the public API
    if (process.env.NODE_ENV !== 'production') {
      console.log(`REQUEST: ${API_BASE_URL}?${params}`)
    }

    res.status(200).json(data)
  }

  try {
    // Resolve a domain if needed
    if ('domain' in req.query) {
      const domain = req.query.domain
      try {
        let obj = await dns.promises.resolveAny(domain)
        ipAddress = obj[0].address
        req.query.ip = ipAddress
        connectToApi()
      } catch (error) {
        console.log(error)
        res.send(error)
      }
    } else if ('ip' in req.query) {
      connectToApi()
    } else {
      req.query.ip = req.headers['x-forwarded-for']
      connectToApi()
    }
  } catch (error) {
    res.status(500).json({ error })
  }
})

module.exports = router
