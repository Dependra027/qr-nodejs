const express=require('express');
const ejs=require('ejs');
const path=require('path');
const mongoose=require("mongoose");
const fs = require('fs');
const Url=require('./urlModel')
const qrcode=require('qrcode');
const app=express();
const port=process.env.port || 3000; //This line dynamically assigns the port number for a Node.js application. It uses the PORT environment variable if set, otherwise defaults to 3000, enabling easy deployment across different environments without code modification.


app.use(express.json());

//this is used to grab info from the body
app.use(express.urlencoded({extended: false}));


const db=mongoose.connect("mongodb://localhost:27017/Qrcode")

if(!db){
    console.log("Error connecting database");
}
else{
    console.log("Database connected");
}
app.use(express.static('public'));
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'view')) // to let application know that it have to find view in the created view folder
app.get("/",(req,res)=>{
    res.render("index"); //we are rendering a index ejs file
});


app.post('/scan',async (req,res)=>{
    // converting user input into qrcode
    const input_text=req.body.text; // as the name of textarea is text
    const input_textStr=String(input_text);

    console.log(input_textStr);
    
    const url=await Url.create({
        urls: input_textStr    });
    //pass the text to qr code
    qrcode.toDataURL(input_text, (err, src) => {
        const filePath = path.join(__dirname, 'public', 'images', 'qr_code.png');// we need to make directory
        const base64Data = src.replace(/^data:image\/png;base64,/, "");

        fs.writeFile(filePath, base64Data, 'base64', (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Internal Server Error');
            }

            res.render("scan", {
                qr_code: src,
            });
        });
    });
});
app.get('/download', (req, res) => {
    const filePath = path.join(__dirname, 'public', 'images', 'qr_code.png');

    // now i am Sending  the QR code file for download
    res.download(filePath, 'qr_code.png', (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Internal Server Error');
        }
    });
});
app.listen(port,console.log(`Listening on port ${port}`));
