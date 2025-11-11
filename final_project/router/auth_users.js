const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => { //returns boolean
    // A simple validation: username must be a non-empty string with length > 2
    return typeof username === 'string' && username.trim().length > 2;
}

const authenticatedUser = (username, password) => { //returns boolean
    // Check if there's a user with matching username and password
    return users.some(user => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Create JWT and save in session
    const accessToken = jwt.sign({ username: username }, 'access', { expiresIn: '1h' });
    req.session.authorization = {
        accessToken,
        username
    };

    return res.status(200).json({ message: 'User successfully logged in', token: accessToken });
});

// Add a book 
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;
    const username = req.session.authorization?.username;

    console.log("Session data:", req.session);

    // Validate review is provided in query
    if (!review) {
        return res.status(400).json({ message: 'Review text must be provided in query parameter' });
    }

    // Check if user is authenticated
    if (!username) {
        return res.status(401).json({ message: 'User not authenticated. Please login first.' });
    }

    // Check if book exists
    if (!books[isbn]) {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
    }

    // Add or update review for this user
    books[isbn].reviews[username] = review;

    return res.status(200).json({ message: 'Review successfully added/updated', review: review, isbn: isbn, username: username });
});

// Delete a book review for the logged-in user
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization?.username;

    // Check if user is authenticated
    if (!username) {
        return res.status(401).json({ message: 'User not authenticated. Please login first.' });
    }

    // Check if book exists
    if (!books[isbn]) {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
    }

    // Check if user has a review for this book
    if (!books[isbn].reviews[username]) {
        return res.status(404).json({ message: `No review found for this book by user ${username}` });
    }

    // Delete the review for this user
    delete books[isbn].reviews[username];

    return res.status(200).json({ message: 'Review successfully deleted', isbn: isbn, username: username });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
