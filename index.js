const express = require('express')
const fetch = require('node-fetch')
const redis = require('redis')

const PORT = process.env.PORT || 5000
const REDIS_PORT = process.env.REDIS_PORT || 6379

const BASE_URL = 'https://pokeapi.co/api/v2/pokemon/'

const app = express()
const client = redis.createClient(REDIS_PORT)

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
    client.setex(id, 3600, pokeDetails)

    // res.send(setResponse())
  } catch (error) {
    console.error(error)
    res.status(500)
  }
}

app.get('/pokemon/:id', getStats)

app.listen(PORT, () => console.log(`App listening on port ${PORT}`))
