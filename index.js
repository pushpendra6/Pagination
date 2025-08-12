const express = require('express');
const fs = require('fs');
const path = require('path');
const db = require('./dbConfig/config');

const app = express();
const PORT = 5000;

const commentsPath = path.join(__dirname, 'comments.json');
const comments = JSON.parse(fs.readFileSync(commentsPath, 'utf8'));

const LIMIT = 15;


//Fetch data from comments.json and paginate it
app.get('/comments/:page', (req, res) => {
    console.log('Received request for comments page:', req.params.page);
    const page = parseInt(req.params.page) || 1;
    if (page < 1) {
        return res.status(400).json({ error: 'Page number must be 1 or greater.' });
    }

    const startIndex = (page - 1) * LIMIT;
    const endIndex = page * LIMIT;

    // Slice the data for the current page
    const paginatedData = comments.slice(startIndex, endIndex);

    if (paginatedData.length === 0) {
        return res.status(404).json({ error: 'No comments found for this page.' });
    }
    // Send paginated result 
    res.json({
        page: page,
        limit: LIMIT,
        totalComments: comments.length,
        totalPages: Math.ceil(comments.length / LIMIT),
        data: paginatedData
    });
});

//fetch data from db 
app.get('/commentsdb/:page', (req, res) => {
    const page = parseInt(req.params.page) || 1;
    if (page < 1) {
        return res.status(400).json({ error: 'Page number must be 1 or greater.' });
    }

    const offset = (page - 1) * LIMIT;

    db.query('SELECT COUNT(*) AS count FROM Comments', (err, countResult) => {
        if (err) throw err;

        const totalComments = countResult[0].count;
        const totalPages = Math.ceil(totalComments / LIMIT);

        db.query(
            'SELECT * FROM Comments LIMIT ? OFFSET ?',
            [LIMIT, offset],
            (err, rows) => {
                if (err) throw err;

                if (rows.length === 0) {
                    return res.status(404).json({ error: 'No comments found for this page.' });
                }

                res.json({
                    page: page,
                    limit: LIMIT,
                    totalComments: totalComments,
                    totalPages: totalPages,
                    data: rows
                });
            }
        );
    });
});


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
