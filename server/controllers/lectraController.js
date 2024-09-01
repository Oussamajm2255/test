// controllers/lectraController.js
const db = require('../config/database');
const moment = require('moment-timezone');
const logger = require('../config/logger'); // Assuming you have a logger for consistent logging

// Function to fetch data from Lectra tables
async function getLectraData(req, res) {
    const lectraNumber = req.params.lectraNumber;

    // Validate lectraNumber to ensure it is a number or a valid format
    if (!/^\d+$/.test(lectraNumber)) {
        return res.status(400).json({ error: 'Invalid Lectra number' });
    }

    try {
        // Fetch data from the Lectra table based on lectraNumber
        const query = `SELECT * FROM lectra_${lectraNumber}`;
        const [results] = await db.execute(query);

        // Adjust dates to local timezone (Tunisia)
        const timezone = 'Africa/Tunis'; 
        results.forEach(result => {
            if (result.Date) { // Check if Date exists in the result
                result.Date = moment(result.Date).tz(timezone).format(); 
            }
        });

        logger.info(`Data fetched from Lectra ${lectraNumber}:`, results); // Use logger instead of console.log

        // Return the fetched data as JSON response
        res.json(results);
    } catch (error) {
        logger.error('Error fetching Lectra data:', error); // Use logger for error reporting
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = {
    getLectraData
};

