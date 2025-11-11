const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    // Validate required fields
    if (!username || !password) {
        return res.status(400).json({
            message: "Username and password are required",
            missing: {
                username: !username,
                password: !password
            }
        });
    }

    // Validate username format (you can customize these rules)
    if (username.length < 3 || username.length > 20) {
        return res.status(400).json({
            message: "Username must be between 3 and 20 characters long"
        });
    }

    // Check if username already exists
    const userExists = users.find(user => user.username === username);
    if (userExists) {
        return res.status(409).json({
            message: "Username already exists"
        });
    }

    // Validate password strength (you can customize these rules)
    if (password.length < 6) {
        return res.status(400).json({
            message: "Password must be at least 6 characters long"
        });
    }

    // Add new user
    const newUser = {
        username,
        password  // In a real app, you should hash the password
    };
    users.push(newUser);

    return res.status(201).json({
        message: "User registered successfully",
        username: username
    });
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
    try {
        // Using async-await with Axios to fetch books
        // This simulates fetching from an API endpoint
        const booksList = await getBooks();
        const formatted = JSON.stringify(booksList, null, 2);
        res.status(200).type('application/json').send(formatted);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching books', error: error.message });
    }
});

// Helper function using Promise with Axios
// This simulates an API call that returns books
function getBooks() {
    return new Promise((resolve, reject) => {
        // Simulate async operation with setTimeout
        setTimeout(() => {
            try {
                // In a real scenario, you might use Axios to fetch from an API:
                // axios.get('http://api.example.com/books')
                //   .then(response => resolve(response.data))
                //   .catch(error => reject(error));

                // For this lab, we return the local books object
                resolve(books);
            } catch (error) {
                reject(error);
            }
        }, 100);
    });
}

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
    try {
        const isbn = req.params.isbn;
        // Using async-await to fetch book by ISBN
        const book = await getBookByISBN(isbn);

        if (book) {
            const formatted = JSON.stringify(book, null, 2);
            return res.status(200).type('application/json').send(formatted);
        }

        // Book not found
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching book by ISBN', error: error.message });
    }
});

// Helper function using Promise with Axios to get book by ISBN
function getBookByISBN(isbn) {
    return new Promise((resolve, reject) => {
        // Simulate async operation with setTimeout
        setTimeout(() => {
            try {
                // In a real scenario, you might use Axios to fetch from an API:
                // axios.get(`http://api.example.com/books/${isbn}`)
                //   .then(response => resolve(response.data))
                //   .catch(error => reject(error));

                // For this lab, we retrieve from the local books object
                const book = books[isbn];
                resolve(book);
            } catch (error) {
                reject(error);
            }
        }, 100);
    });
}

// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
    try {
        const author = req.params.author;
        // Using async-await to fetch books by author
        const authorBooks = await getBooksByAuthor(author);

        if (authorBooks.length > 0) {
            const formatted = JSON.stringify(authorBooks, null, 2);
            return res.status(200).type('application/json').send(formatted);
        }

        // No books found for author
        return res.status(404).json({ message: `No books found for author: ${author}` });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching books by author', error: error.message });
    }
});

// Helper function using Promise with Axios to get books by author
function getBooksByAuthor(author) {
    return new Promise((resolve, reject) => {
        // Simulate async operation with setTimeout
        setTimeout(() => {
            try {
                // In a real scenario, you might use Axios to fetch from an API:
                // axios.get(`http://api.example.com/books?author=${author}`)
                //   .then(response => resolve(response.data))
                //   .catch(error => reject(error));

                // For this lab, we filter from the local books object
                const authorBooks = Object.values(books).filter(book =>
                    book.author.toLowerCase() === author.toLowerCase()
                );
                resolve(authorBooks);
            } catch (error) {
                reject(error);
            }
        }, 100);
    });
}

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
    try {
        const title = req.params.title;
        // Using async-await to fetch books by title
        const titleBooks = await getBooksByTitle(title);

        if (titleBooks.length > 0) {
            const formatted = JSON.stringify(titleBooks, null, 2);
            return res.status(200).type('application/json').send(formatted);
        }

        // No books found with that title
        return res.status(404).json({ message: `No books found with title: ${title}` });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching books by title', error: error.message });
    }
});

// Helper function using Promise with Axios to get books by title
function getBooksByTitle(title) {
    return new Promise((resolve, reject) => {
        // Simulate async operation with setTimeout
        setTimeout(() => {
            try {
                // In a real scenario, you might use Axios to fetch from an API:
                // axios.get(`http://api.example.com/books?title=${title}`)
                //   .then(response => resolve(response.data))
                //   .catch(error => reject(error));

                // For this lab, we filter from the local books object
                const titleBooks = Object.values(books).filter(book =>
                    book.title.toLowerCase() === title.toLowerCase()
                );
                resolve(titleBooks);
            } catch (error) {
                reject(error);
            }
        }, 100);
    });
}

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    // Get ISBN from request parameters
    const isbn = req.params.isbn;
    const book = books[isbn];

    if (!book) {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
    }

    // Return the reviews object for the book
    const formatted = JSON.stringify(book.reviews, null, 2);
    return res.status(200).type('application/json').send(formatted);
});

module.exports.general = public_users;
