import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import lodash from 'lodash'
import { Low, JSONFile } from 'lowdb';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import swaggerUI from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';
// Import books router - Note .js extension? ES6?
import { booksRouter } from './routes/books.js'

// specify port
const PORT = process.env.PORT || 4004;
// Store data in file.
const __dirname = dirname(fileURLToPath(import.meta.url));
const file = join(__dirname, 'db.json');
// Initialise DB and adapter, save to db.json.
const adapter = new JSONFile(file);
// Create DB instance
const db = new Low(adapter);
await db.read()
// Default data for storage. Record with write
db.data = db.data || { books: [] }
// Making use of lodash api to return data efficiently.
db.chain = lodash.chain(db.data)
// Swagger options object (Before defining app)
const options = {
    // Define version and info
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Library API",
            version: "1.0.0",
            description: "A simple express library API"
        },
        // Define server
        servers: [
            {
                url: "http://localhost:4004"
            }
        ],
    },
     // Where to take the API's (everything that ends with .js)
     apis: ["./routes/*.js"]
}
// Initialise js doc and pass the options
const specs = swaggerJsDoc(options)
// Initialise express
const app = express()
// Deine api doc route, swaggerUI as a callback.
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs))
// Attach to DB instance in order to access routes.
app.db = db;
// Initialise cors
app.use(cors())
// parse json body
app.use(express.json())
// Connect morgan
app.use(morgan("dev"))
// Connect router to app
app.use("/books", booksRouter)
// Launch server and notify
app.listen(PORT, () => console.log(`the server is running on port${PORT}`))