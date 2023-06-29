const express = require('express')
const app = express()
const morgan = require('morgan')
morgan.token('body', (req) => {
  let body = JSON.stringify(req.body)
  return body
})
const cors = require('cors')

app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));
app.use(cors())


let persons = [
    {
      id: 1,
      name: "Arto Hellas",
      number: "040-123456"
    },
    {
      id: 2,
      name: "Ada Lovelace",
      number: "39-44-5323523"
    },
    {
      id: 3,
      name: "Dan Abramov",
      number: "12-43-234345"
    },
    {
      id: 4,
      name: "Mary Poppendick",
      number: "39-23-6423111"
    },
]

app.get('/', (req, res) => {
    res.send('<h1>Hello World!</h1>')
})

app.get('/info', (req, res) => {
    const len = persons.length
    const timeStamp = new Date(Date.now())
    res.send(`<p>Phonebook has info for ${len} people.</p>
             <p>${timeStamp}</p>`)

})

app.get('/api/persons', (req, res) => {
    res.json(persons)
})

app.get('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    const person = persons.find(person => {
      return person.id === id
    })
    if (!person) {
        res.status(404).end()
    } else {
        res.json(person)
    }
})


const generateRandomId = () => {
  const maxId = persons.length > 0
    ? Math.max(...persons.map(n=>n.id))
    : 0
  const min = Math.ceil(maxId + 1)
  const max = Math.floor(1000)
  return Math.floor(Math.random() * (max - min) + min)
}

app.post('/api/persons', (req, res) => {
  const body = req.body

  if(!body.name || !body.number) {
    return req.status(400).json({ 
        error: 'content missing.' 
      })
  }
  if(persons.map(person=>person.name).includes(body.name)){
    return res.status(400).json({
        error: 'name must be unique.'
      })
  }

  const person = {
    id: generateRandomId(),
    name: body.name,
    number: body.number,
  }

  persons = persons.concat(person)

  res.json(person)

  morgan.token('param', function(req, res, param) {
    return req.params[param];
  })
})

app.delete('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    persons = persons.filter(person => person.id !== id)

    res.status(204).end()
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
