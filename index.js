require('dotenv').config()
const express = require('express')
const Phone= require('./models/Person')

const app = express()
var morgan = require('morgan')

let persons=[]

app.use(express.json())
app.use(express.static('dist'))

morgan.token('post-data', (req, res) => {
  return req.method === 'POST' ? JSON.stringify(req.body) : ''
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :post-data'))

app.get('/api/persons',(request,response)=>{
    Phone.find({}).then(phone => {
        response.json(phone)
    })
})

// app.get('/info',(request,response)=>{
//     const count=persons.length
//     const time=new Date()
//     response.send(`
//         <div>
//             <p>Phonebook has info for ${count} people</p>
//             <p>${time}</p>
//         </div>
//     `)
// })

app.get('/api/persons/:id',(request,response)=>{
    Phone.findById(request.params.id).then(phone => {
        response.json(phone)
    })
})

// app.delete('/api/persons/:id',(request,response)=>{
//     const id=request.params.id
//     persons=persons.filter(person=>person.id!==id)
//     response.status(204).end()
// })
app.post('/api/persons',(request,response)=>{
    const body=request.body
    if (!body.name || !body.number){
        return response.status(400).json({
            error:'details missing'
        })
    }
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
})

const PORT=process.env.PORT
app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`)
})