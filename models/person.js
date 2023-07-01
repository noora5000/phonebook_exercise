const mongoose=require('mongoose')

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI

//connecting to url:
mongoose.connect(url)
  .then(result => {
    console.log('Connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

// create person-schema
const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 3,
    required: true
  },
  number: {
    type: String,
    minlength: 9,
    validate: {
      validator: function(v){
        return /^\d{2,3}-\d+$/.test(v)
      },
      message: 'Invalid phone number'
    },
    required: true
  }
})

/*koostua kahdesta väliviivalla erotetusta osasta joissa ensimmäisessä osassa on 2 tai 3 numeroa ja toisessa osassa riittävä määrä numeroita */

// alter person-schema
personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)