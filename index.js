const express = require('express');
const ejs = require('ejs');
const path = require('path');
const mongoose = require("mongoose");
const fs = require('fs');
const Url = require('./urlModel');
const qrcode = require('qrcode');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));

// Database Connection
mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/Qrcode", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("Database connected");
}).catch((err) => {
    console.error("Error connecting to the database:", err);
});

// Ensure the images directory exists
const imagesDir = path.join(__dirname, 'public', 'images');
if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
}

// Views Configuration
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'view'));

// Routes
app.get("/", (req, res) => {
    res.render("index"); // Render the index EJS file
});

app.post('/scan', async (req, res) => {
    const input_text = String(req.body.text); // Convert input to string
    console.log(input_text);

    const url = await Url.create({ urls: input_text }); // Save URL in the database

    qrcode.toDataURL(input_text, (err, src) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error generating QR Code');
        }

        const filePath = path.join(imagesDir, 'qr_code.png'); // Path to save QR code
        const base64Data = src.replace(/^data:image\/png;base64,/, "");

        fs.writeFile(filePath, base64Data, 'base64', (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error saving QR Code');
            }

            res.render("scan", { qr_code: src });
        });
    });
});

app.get('/download', (req, res) => {
    const filePath = path.join(imagesDir, 'qr_code.png');

    res.download(filePath, 'qr_code.png', (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error downloading QR Code');
        }
    });
});

// Start Server
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
