const express = require('express');
const multer = require('multer');
const AWS = require('aws-sdk');
const fs = require('fs')
require('dotenv').config()

// Set up AWS configuration
AWS.config.update({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.ACCESS_KEY_SECRET,
  region: 'ap-south-1',
});

const s3 = new AWS.S3();

const app = express();

// Set up multer for file upload
const upload = multer({ dest: 'uploads/' });

// Serve the index.html page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Handle file upload
app.post('/upload', upload.single('file'), (req, res) => {
  const file = req.file;

  if (!file) {
    res.status(400).send('No file uploaded');
    return;
  }

  // Read the file data
  const fileContent = fs.readFileSync(file.path);

  // Set up S3 upload parameters
  const params = {
    Bucket: process.env.BUCKET_NAME,
    Key: file.originalname,
    Body: fileContent,
  };

  // Upload the file to S3
  s3.upload(params, (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error uploading file');
    } else {
      console.log('File uploaded successfully:', data.Location);
      res.send('File uploaded successfully');
    }
  });
});

// Start the server
app.listen(80, () => {
  console.log('Server listening on port 80');
});