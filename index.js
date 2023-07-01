require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

morgan.token('body', (req) => {
  let body = JSON.stringify(req.body)
  return body
})

const errorHandler = (error, req, res, next) => {
  console.error(error.message)
  if (error.name === 'CastError'){
    return res.status(400).send({ error: 'malformatted id.' })
  } else if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message })
  }
  next(error)
}

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}

app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
app.use(cors())
app.use(express.static('build'))

// A function to update or create a person info for the phonebook
const updateOrCreatePerson = (personId, { name, number }, res, next) => {
  Person.findByIdAndUpdate(personId, { name, number }, { new: true, runValidators: true, context: 'query' })
    .then(updatedPerson => {
      res.json(updatedPerson)
    })
    .catch(error => next(error))
}

// Route handler for info-page
app.get('/info', (req, res) => {
  Person.find({}).then(people => {
    const list = people.length
    const timeStamp = new Date(Date.now())
    res.send(`<p>Phonebook has info for ${list} people.</p>
               <p>${timeStamp}</p>`)
  })
})

// Route handler for showing all persons
app.get('/api/persons', (req, res) => {
  Person.find({}).then(people => {
    res.json(people)
  })
})

// Route handler for showing a contact by id
app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => {
      if(person){
        res.json(person)
      } else {
        res.status(404).end()
      }
    })
    .catch(error => next(error))
})

// Route handler for adding a person to the phonebook
app.post('/api/persons', (req, res, next) => {
  const { name, number } = req.body

  // Check if name already exists in the phonebook with 'Person.find'.
  Person.find({})
    .then(people => {
      const existingPerson = people.find(obj => obj.name === name)

      if (!existingPerson) {
        const person = new Person({
          name: name,
          number: number,
        })

        person.save()
          .then(savedPerson => {
            res.json(savedPerson)
          })
          .catch(error => next(error))

      } else if (existingPerson.number === number) {
        console.log(`${existingPerson.name} already exists with the number ${existingPerson.number}`)
        return res.status(409).json({ error: `${existingPerson.name} already exists with the number ${existingPerson.number}` })
      } else {
        console.log(`Updating contact info for ${name}`)
        console.log(`${existingPerson.number} -> ${number}`)
        // Call the function to update the person
        updateOrCreatePerson(existingPerson.id, { name, number }, res, next)
      }
    })
    .catch(error => next(error))
})

// Route handler for updating a person
app.put('/api/persons/:id', (req, res, next) => {
  const { name, number } = req.body

  // Call the function to update the person
  updateOrCreatePerson(req.params.id, { name, number }, res, next)
})

// Functionality for deleting person from the phonebook.
app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then(result => {
      res.status(204).end()
    })

})

app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
