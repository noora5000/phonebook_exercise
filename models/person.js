const mongoose=require('mongoose')

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI

//connecting to url:
mongoose.connect(url)
    .then(result => {
        console.log("Connected to MongoDB")
    })
    .catch((error)=>{
        console.log("error connecting to MongoDB:", error.message)
    })

// create person-schema
const personSchema = new mongoose.Schema({
    name: String,
    number: String
})

// alter person-schema
personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('Person', personSchema)