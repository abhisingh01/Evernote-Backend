const connectToMongo = require('./db')
const express = require('express')
var cors = require('cors')
connectToMongo()

const app = express()
const port = 4000

app.use(cors())
app.use(express.json())

// Available routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/notes',require('./routes/notes'))

app.listen(port, ()=>{
    console.log(`Evernote Backend listening on http://127.0.0.1:${port}`)
})