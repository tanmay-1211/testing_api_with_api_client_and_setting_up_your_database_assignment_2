const express = require('express');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3010;
const DATA_FILE = 'data.json';

app.use(cors());
app.use(bodyParser.json());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Function to read books from data.json
const readBooks = () => {
    if (!fs.existsSync(DATA_FILE)) return [];
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
};

// Function to write books to data.json
const writeBooks = (books) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(books, null, 2), 'utf8');
};

// Create a new book
app.post('/books', (req, res) => {
    let books = readBooks();
    const newBook = req.body;
    
    if (books.some(book => book.book_id == newBook.book_id)) {
        return res.status(400).json({ message: "Book ID already exists" });
    }

    books.push(newBook);
    writeBooks(books);
    res.status(201).json(newBook);
});

// Get all books
app.get('/books', (req, res) => {
    const books = readBooks();
    res.json(books);
});

// Get a specific book by ID
app.get('/books/:id', (req, res) => {
    const books = readBooks();
    const book = books.find(b => b.book_id == req.params.id);
    
    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }
    
    res.json(book);
});

// Update a book by ID using spread operator
app.put('/books/:id', (req, res) => {
    let books = readBooks();
    const index = books.findIndex(b => b.book_id == req.params.id);
    
    if (index === -1) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Update using spread operator
    books[index] = { ...books[index], ...req.body };
    writeBooks(books);
    
    res.json(books[index]);
});

// Delete a book using splice and slice
app.delete('/books/:id', (req, res) => {
    let books = readBooks();
    const index = books.findIndex(b => b.book_id == req.params.id);

    if (index === -1) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Remove book using splice
    books.splice(index, 1);
    
    // Alternative: Use slice to create a new array without the deleted book
    // books = books.slice(0, index).concat(books.slice(index + 1));

    writeBooks(books);
    res.json({ message: "Book deleted successfully" });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});