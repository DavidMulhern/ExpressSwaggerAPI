import express from 'express';
import { nanoid } from 'nanoid';
// router
const router = express.Router();
// Define id length
const idLength = 8;

// Define book for swagger docs.

/**
 * @swagger
 * components:
 *   schemas:
 *     Book:
 *       type: object
 *       required:
 *         - title
 *         - author
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the book
 *         title:
 *           type: string
 *           description: The book title
 *         author:
 *           type: string
 *           description: The book author
 *       example:
 *         id: d5fE_asz
 *         title: The New Turing Omnibus
 *         author: Alexander K. Dewdney
 */

 /**
  * @swagger
  * tags:
  *   name: Books
  *   description: The books managing API
  */

/**
 * @swagger
 * /books:
 *   get:
 *     summary: Returns the list of all the books
 *     tags: [Books]
 *     responses:
 *       200:
 *         description: The list of the books
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
 */

// Define routes for server
// All books
router.get("/", (req, res) => {
	const books = req.app.db.chain.get("books");
	res.send(books);
});

/**
 * @swagger
 * /books/{id}:
 *   get:
 *     summary: Get the book by id
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The book id
 *     responses:
 *       200:
 *         description: The book description by id
 *         contens:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       404:
 *         description: The book was not found
 */

// Book by id
router.get("/:id", (req, res) => {
    const book = req.app.db.chain.get("books").find({ id: req.params.id}).value()
    // If book not found.
    if(!book)
    {
        res.sendStatus(404)
    }
    res.send(book)
})

/**
 * @swagger
 * /books:
 *  post:
 *    summary: Create a new book
 *    tags: [Books]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Book'
 *    repsonses:
 *      200:
 *        description: The book was successfully created
 *        content: 
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Book'
 *      500:
 *        description: Server Error
 */

// Add book
router.post("/", (req, res) => {
    try {
        // New object
        const book = {
            // assign id
            id: nanoid(idLength),
            // this is just for demonstration purposes, don't do this.
            ... req.body
        }
        req.app.db.chain.get("books").push(book)
        console.log("Book: " + JSON.stringify(book))
        res.send(book) // YOU ARE HERE
    } catch (error) {
        return res.status(500).send(error)
    }
})

// Update book
router.put("/:id", (req, res) => {
    try {
        req.app.db.get("books").find({ id: req.params.id }).assign(req.body).write()

        res.send(req.app.db.get("books").find({id:req.params.id}))
    } catch (error) {
        return res.status(500).send(error)
    }
})

// Delete book
router.delete("/:id", (req, res) => {
    req.app.db.get("books").remove({ id: req.params.id}).write()

    // Once deleted
    res.sendStatus(200)
})

// Export
export { router as booksRouter }