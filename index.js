const express = require('express')
const fetch = require('node-fetch')
const redis = require('redis')

const PORT = process.env.PORT || 5000
const REDIS_PORT = process.env.REDIS_PORT || 6379

const app = express()
const client = redis.createClient(REDIS_PORT)

const BASE_URL = 'https://pokeapi.co/api/v2/pokemon/'
// Set response
const setResponse = (details) => `<h1>${details}</h1>`

// Make request to PokeAPI to get stats
const getStats = async (req, res, next) => {
  try {
    console.log('Fetching...')
    const { id } = req.params
    const response = await fetch(BASE_URL + id)
    const data = await response.json()

    const { name, height, weight } = data
    const pokeDetails = `Pokemon number ${id} is ${name}. They are ${height} decimetres tall and ${weight} hectograms heavy.`

    // Set data in Redis
    client.set(id, pokeDetails)
    res.send(setResponse(pokeDetails))
  } catch (error) {
    console.error(error)
    res.status(500)
  }
}

// Cache middleware
const cache = (req, res, next) => {
  const { id } = req.params
  client.get(id, (err, data) => {
    if (err) throw err
    if (data) {
      res.send(setResponse(data))
    } else {
      next()
    }
  })
}

app.get('/pokemon/:id', cache, getStats)

app.listen(PORT, () => console.log(`App listening on port ${PORT}`))
