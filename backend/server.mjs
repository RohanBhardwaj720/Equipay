// Path: server.mjs

import express from 'express'
import cors from 'cors'
import { DateTime } from 'luxon'
import fetch from 'node-fetch'
import { pool, runMigration } from './database.mjs'

const app = express()

// app.use(express.static("public"));
// app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

const downloadImageAsBase64 = async (url) => {
  try {
    const response = await fetch(url)
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64String = buffer.toString('base64')
    return base64String
  } catch (error) {
    console.error('Error downloading image and converting to base64:', error)
    throw error
  }
}

// for user table
// to get user details like picture, name and email
// Handle query parameters
app.get('/api/user', handleUserRequest)

// Handle path parameters
app.get('/api/user/:id', handleUserRequest)

async function handleUserRequest(req, res) {
  const email = req.query.email
  const user_id = req.params.id || req.query.user_id

  let query = ''
  let param = []

  if (email) {
    query = 'SELECT * FROM users WHERE user_email = $1'
    param = [email]
  } else if (user_id) {
    query = 'SELECT * FROM users WHERE user_id = $1'
    param = [user_id]
  } else {
    return res.status(400).send('Bad Request: Missing parameter (email or user_id required)')
  }

  try {
    const result = await pool.query(query, param)
    if (result.rows.length !== 0) {
      console.log(result.rows[0])
      return res.status(200).json(result.rows[0])
    } else {
      console.log('User not found')
      return res.status(404).send('User not found')
    }
  } catch (err) {
    console.error('Error executing query', err.stack)
    return res.status(500).send('Internal Server Error')
  }
}

// to post user details, when user logged in for the first time
app.post('/api/user', async (req, res) => {
  const { email, picture, name } = req.body

  try {
    const picture_in_base64 = await downloadImageAsBase64(picture)

    const userExistsResult = await pool.query('SELECT * FROM users WHERE user_email = $1', [email])

    if (userExistsResult.rows.length !== 0) {
      console.log('User already exists')
      const user_id = userExistsResult.rows[0].user_id
      return res.status(200).json({ user_id: user_id, message: 'User already exists' })
    } else {
      const insertResult = await pool.query(
        'INSERT INTO users (user_email, user_picture, user_name) VALUES ($1, $2, $3) RETURNING user_id',
        [email, picture_in_base64, name]
      )
      const user_id = insertResult.rows[0].user_id
      console.log('User added successfully')
      return res.status(201).json({ user_id: user_id, message: 'User added successfully' })
    }
  } catch (error) {
    console.error('Error processing request:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

// post user upi_id
app.post('/api/user/upi', async (req, res) => {
  const { user_id, upiId } = req.body

  try {
    await pool.query('UPDATE users SET user_upi_id = $1 WHERE user_id = $2', [upiId, user_id])
    console.log('UPI ID added successfully')
    return res.status(200).json({ message: 'UPI ID added successfully' })
  } catch (error) {
    console.error('Error processing request:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

// for trips table

//get all trips
app.get('/api/trip/all', async (req, res) => {
  const { user_id } = req.query
  try {
    const result = await pool.query(
      'SELECT * FROM trip_members INNER JOIN trips ON trip_members.trip_id = trips.trip_id where trip_members.user_id = $1',
      [user_id]
    )
    console.log(result.rows)
    res.status(200).json(result.rows)
  } catch (err) {
    console.error('Error executing query', err.stack)
    res.status(500).send('Internal Server Error')
  }
})

// get information about the trip
app.get('/api/trip', async (req, res) => {
  const { trip_id } = req.query
  try {
    const result = await pool.query('SELECT * FROM trips WHERE trip_id = $1', [trip_id])
    if (result.rows.length !== 0) {
      res.status(200).json(result.rows[0])
    } else {
      console.log('trip not found')
      res.status(404).send('trip not found')
    }
  } catch (err) {
    console.error('Error executing query', err.stack)
    res.status(500).send('Internal Server Error')
  }
})

// post a new trip
app.post('/api/trip', async (req, res) => {
  const { place, members_id, tripOrganizer } = req.body
  const totalSpending = 0
  const userSpending = 0
  const today = DateTime.local()

  try {
    const insertResult = await pool.query(
      'INSERT INTO trips (place, start_datetime, total_spendings, trip_organizer) VALUES ($1, $2, $3, $4) RETURNING trip_id',
      [place, today, totalSpending, tripOrganizer]
    )

    const newTripId = insertResult.rows[0].trip_id

    const promises = members_id.map((member_id) => {
      return pool.query(
        'INSERT INTO trip_members (trip_id, user_id, user_spending) VALUES ($1, $2, $3)',
        [newTripId, member_id, userSpending]
      )
    })

    await Promise.all(promises)

    console.log('Trip added successfully')
    res.status(200).send('Trip added successfully')
  } catch (err) {
    console.error('Error executing query', err.stack)
    res.status(500).send('Internal Server Error')
  }
})

// Get trip members
app.get('/api/trip/members', async (req, res) => {
  const { trip_id } = req.query
  try {
    const response = await pool.query(
      'SELECT * FROM trip_members INNER JOIN users ON trip_members.user_id = users.user_id WHERE trip_members.trip_id = $1',
      [trip_id]
    )
    console.log(response.rows)
    res.status(200).json(response.rows)
  } catch (err) {
    console.error('Error executing query', err.stack)
    res.status(500).send('Internal Server Error')
  }
})

// Get member spending
app.get('/api/spending', async (req, res) => {
  const { userId, tripId } = req.query
  try {
    const result = await pool.query(
      'SELECT user_spending FROM trip_members WHERE trip_id = $1 AND user_id = $2',
      [tripId, userId]
    )
    if (result.rows.length === 0) {
      res.status(400).send('Invalid tripId or userId')
    } else {
      res.status(200).json(result.rows[0])
    }
  } catch (err) {
    console.error('Error executing query', err.stack)
    res.status(500).send('Internal Server Error')
  }
})

// Pay your share
app.patch('/api/pay/:id', async (req, res) => {
  let { money, paidBy, paidTo } = req.body
  const trip_id = req.params.id
  money = parseFloat(money)

  if (isNaN(money)) {
    console.log('Invalid amount:', money)
    return res.status(400).send('Invalid amount')
  }

  try {
    await pool.query('BEGIN')

    const updatePaidBy = await pool.query(
      'UPDATE trip_members SET user_spending = user_spending + $1 WHERE trip_id = $2 AND user_id = $3',
      [money, trip_id, paidBy]
    )

    const updatePaidTo = await pool.query(
      'UPDATE trip_members SET user_spending = user_spending - $1 WHERE trip_id = $2 AND user_id = $3',
      [money, trip_id, paidTo]
    )

    await pool.query('COMMIT')

    console.log('Update results:', {
      updatePaidBy: updatePaidBy.rowCount,
      updatePaidTo: updatePaidTo.rowCount
    })

    if (updatePaidBy.rowCount === 0 || updatePaidTo.rowCount === 0) {
      throw new Error('No rows updated')
    }

    res.status(200).send('Transaction completed successfully')
  } catch (err) {
    await pool.query('ROLLBACK')
    console.error('Error executing query', err.stack)
    res.status(500).send('Internal Server Error')
  }
})

// pay to
app.patch('/api/addpayment/:id', async (req, res) => {
  const money = parseFloat(req.body.money)
  const paidBy = req.body.paidBy
  const trip_id = req.params.id

  if (isNaN(money)) {
    return res.status(400).json({ error: 'Invalid money value' })
  }

  try {
    const membersResult = await pool.query('SELECT * FROM trip_members WHERE trip_id = $1', [
      trip_id
    ])
    const members = membersResult.rows
    const eachOnesPart = money / members.length

    await pool.query('UPDATE trips SET total_spendings = total_spendings + $1 WHERE trip_id = $2', [
      money,
      trip_id
    ])

    const updatePromises = members.map((member) => {
      let newSpending = parseFloat(member.user_spending) - eachOnesPart
      if (member.user_id == paidBy) {
        newSpending += money
      }

      return pool.query(
        'UPDATE trip_members SET user_spending = $1 WHERE trip_id = $2 AND user_id = $3',
        [newSpending, trip_id, member.user_id]
      )
    })

    await Promise.all(updatePromises)

    res.status(200).json({ message: 'Payments updated successfully' })
  } catch (error) {
    console.error('Error executing query', error.stack)
    res.status(500).send('Internal Server Error')
  }
})

// history
app.get('/api/history', async (req, res) => {
  const { tripId } = req.query
  try {
    const result = await pool.query('SELECT * FROM transaction_history WHERE trip_id = $1', [
      tripId
    ])
    res.status(200).json(result.rows)
  } catch (err) {
    console.error('Error executing query', err.stack)
    res.status(500).send('Internal Server Error')
  }
})

app.post('/api/history', async (req, res) => {
  const { amount, paidTo, paidBy, tripId } = req.body
  const transactionDateTime = DateTime.local()
  try {
    await pool.query(
      'INSERT INTO transaction_history (amount, paid_by, paid_to, transaction_datetime, trip_id ) VALUES ($1::DOUBLE PRECISION, $2, $3, $4, $5)',
      [amount, paidBy, paidTo, transactionDateTime, tripId]
    )
    console.log('Transaction added successfully')
    res.status(200).send('Transaction added successfully')
  } catch (err) {
    console.error('Error executing query', err.stack)
    res.status(500).send('Internal Server Error')
  }
})

app.get('/api/settlements', async (req, res) => {
  const { tripOrganizer, tripId } = req.query
  try {
    const result = await pool.query(
      'SELECT users.user_name, trip_members.user_spending, users.user_upi_id FROM trip_members INNER JOIN users ON trip_members.user_id = users.user_id WHERE trip_members.user_spending > 0 AND trip_members.trip_id = $1 AND users.user_id != $2',
      [tripId, tripOrganizer]
    )
    res.status(200).json(result.rows)
  } catch (err) {
    console.error('Error executing query', err.stack)
    res.status(500).send('Internal Server Error')
  }
})

app.get('/api/userSpendings', async (req, res) => {
  const { user_id, trip_id } = req.query
  try {
    const result = await pool.query(
      'SELECT * FROM trip_members WHERE trip_id = $1 AND user_id = $2',
      [trip_id, user_id]
    )
    res.status(200).json(result.rows[0])
  } catch (err) {
    console.error('Error executing query', err.stack)
    res.status(500).send('Internal Server Error')
  }
})

app.listen(process.env.PORT, process.env.HOST, async () => {
  try {
    await runMigration()
    console.log(`Server running on http://${process.env.HOST}:${process.env.PORT}`)
  } catch (err) {
    console.error('Failed to start server:', err)
    process.exit(1)
  }
})
