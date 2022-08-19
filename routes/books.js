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
 *         title: Turing collection
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
 *   post:
 *     summary: Create a new book
 *     tags: [Books]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Book'
 *     responses:
 *       200:
 *         description: The book was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       500:
 *         description: Some server error
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
        // Lowdb version 3 and ES6 have some issues. this is a work around.
        // Not too worried as this demos main focus is Swagger. Use lowdb V1 in future.
        // Using lodash chain to .push(), won't work with lowdb V3
        const newBooks = req.app.db.chain.get("books").push(book)
        // Need to log to register in memory
        console.log("Added " + JSON.stringify(newBooks))
        // standard lowdb .write() to disk
        req.app.db.write()
        // Done, send for swagger doc viewing.
        res.send(book)
    } catch (error) {
        return res.status(500).send(error)
    }
})

/**
 * @swagger
 * /books/{id}:
 *  put:
 *    summary: Update the book by the id
 *    tags: [Books]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: The book id
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Book'
 *    responses:
 *      200:
 *        description: The book was updated
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Book'
 *      404:
 *        description: The book was not found
 *      500:
 *        description: Server error!
 */

// Update book
router.put("/:id", (req, res) => {
    try {
        // Like before, this is a work around lowdbV3 / ES6 conflicts.
        // Using lodash chain to .find() & .assign()
        const putBook = req.app.db.chain.get("books").find({ id: req.params.id }).assign(req.body)
        // Need to log to register in memory
        console.log("To alter " + JSON.stringify(putBook))
        // standard lowdb .write() to disk
        req.app.db.write()
        // send new details for doc viewing.
        res.send(req.app.db.chain.get("books").find({ id: req.params.id}).value())
    } catch (error) {
        return res.status(500).send(error)
    }
})

/**
 * @swagger
 * /books/{id}:
 *   delete:
 *     summary: Remove the book by id
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The book id
 * 
 *     responses:
 *       200:
 *         description: The book was deleted
 *       404:
 *         description: The book was not found
 */

// Delete book
router.delete("/:id", (req, res) => {
    // Like before, this is a work around lowdbV3 / ES6 conflicts.
    // Using lodash chain to .remove()
    const delBook = req.app.db.chain.get("books").remove({ id: req.params.id})
    // Need to log to register in memory
    console.log("To delete " + JSON.stringify(delBook))
    // standard lowdb .write() to disk
    req.app.db.write()
    // Once deleted, send confirmation status
    res.sendStatus(200)
})

// Export
export { router as booksRouter }