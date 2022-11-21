const express = require('express')
const dns = require('node:dns')
const router = express.Router()
// const needle = require('needle')
const apicache = require('apicache')
const IPGeolocationAPI = require('ip-geolocation-api-javascript-sdk')
var GeolocationParams = require('ip-geolocation-api-javascript-sdk/GeolocationParams.js')

// Enviroment variables
const API_BASE_URL = process.env.API_BASE_URL
const API_KEY_NAME = process.env.API_KEY_NAME
const API_KEY_VALUE = process.env.API_KEY_VALUE

const ipgeolocationApi = new IPGeolocationAPI(API_KEY_VALUE, false)
const geolocationParams = new GeolocationParams()

// Init cache
let cache = apicache.middleware

router.get('/', cache('1 day'), async (req, res) => {
  async function connectToApi() {
    try {
      const params = new URLSearchParams({
        [API_KEY_NAME]: API_KEY_VALUE,
        ...req.query
      })

      // const apiRes = await needle('get', `${API_BASE_URL}?${params}`)
      // const data = apiRes.body
      ipgeolocationApi.getGeolocation(data => {
        res.status(200).json(data)
      }, geolocationParams)

      // Log the request to the public API
      if (process.env.NODE_ENV !== 'production') {
        console.log(`REQUEST: ${API_BASE_URL}?${params}`)
      }

      // res.status(200).json(data)
    } catch (error) {
      res.status(500).json({ error })
    }
  }

  try {
    // Resolve a domain if needed
    if ('domain' in req.query) {
      const domain = req.query.domain
      delete req.query.domain
      let obj = await dns.promises.resolve(domain)
      ipAddress = obj[0]
      req.query.ip = ipAddress
      geolocationParams.setIPAddress(ipAddress)
      connectToApi()
    } else if ('ip' in req.query) {
      geolocationParams.setIPAddress(req.query.ip)
      connectToApi()
    } else {
      req.query.ip = req.headers['x-forwarded-for']
      geolocationParams.setIPAddress(req.query.ip)
      connectToApi()
    }
  } catch (error) {
    res.status(500).json({ error })
  }
})

module.exports = router
