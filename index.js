require('dotenv').config()
const express = require('express')
const Phone= require('./models/Person')
const app = express()
var morgan = require('morgan')
let persons=[]
app.use(express.json())
app.use(express.static('dist'))
morgan.token('post-data', (req) => {
  return req.method === 'POST' ? JSON.stringify(req.body) : ''
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :post-data'))

app.get('/api/persons',(request,response) => {
  Phone.find({}).then(phone => {
    response.json(phone)
  })
})

app.get('/info',(request,response) => {
  Phone.countDocuments({})
    .then(count => {
      const time = new Date()
      response.send(`
        <div>
          <p>Phonebook has info for ${count} people</p>
          <p>${time}</p>
        </div>
      `)
    })
    .catch(error => {
      console.error('Error fetching info:', error)
      response.status(500).send({ error: 'Unable to fetch phonebook info' })
    })
})

app.get('/api/persons/:id',(request,response,next) => {
  Phone.findById(request.params.id).then(phone => {
    if (phone){
      response.json(phone)
    } else {
      response.status(404).end()
    }
  })
    .catch(error => next(error))
})

app.delete('/api/persons/:id',(request,response,next) => {
  Phone.findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id',(request,response,next) => {
  const { name, number } = request.body

  Phone.findById(request.params.id)
    .then (phone => {
      if (!phone) {
        return response.status(404).end()
      }

      phone.name = name
      phone.number = number
      return phone.save().then((update) => {
        response.json(update)
      })
    })
    .catch(error => next(error))
})
app.post('/api/persons',(request,response,next) => {
  const body=request.body
  if (persons.find(person => person.name.trim().toLowerCase()===body.name.trim().toLowerCase())){
    return response.status(409).json({
      error:'name must be unique'
    })
  }
  const  person = new Phone({
    name:body.name,
    number: body.number
  })
  person.save().then(saved => {
    response.json(saved)
  })
    .catch(error => next(error))
})

const unknownEndpoint = (request,response) => {
  response.status(404).send({ error : 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }
  else if (error.name === 'ValidationError') {
    return response.status(400).json({ error : error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT=process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})