const express = require('express');
const multer = require('multer');
const vision = require('@google-cloud/vision');
const fs = require('fs');
const client = new vision.ImageAnnotatorClient({
    keyFilename: './key.json'
});

const app = express();

const storage = multer.memoryStorage();
const upload = multer({ storage });


async function extractDates (imageBuffer) {
    const [result] = await client.textDetection(imageBuffer)
    if (result.error) {
        console.log(`Error in OCR: ${result.error}`)
        throw new Error('Error in OCR', result.error);
    }
    if (result.fullTextAnnotation) {
        const textAnnotations = result.fullTextAnnotation.text.split('\n');
        let dob = null;
        let doe = null;
        for (let i = 0; i < textAnnotations.length; i++) {
            if (dob && doe) {
                break;
            }
            if ((textAnnotations[i].match(/date of birth/i) || (textAnnotations[i].match(/birth date/i))) && !dob) {
                dob = new Date(textAnnotations[i + 1].trim())
            }
            if ((textAnnotations[i].match(/date of expiry/i) || textAnnotations[i].match(/expiry date/i)) && !doe) {
                doe = new Date(textAnnotations[i + 1].trim())
            }
        }
        if (dob && dob > new Date()) {
            throw new Error('Invalid date of birth');
        }
        if (doe && doe < new Date()) {
            throw new Error('Passport expired');
        }
        return {
            birthDate: dob && dob.toLocaleDateString('en-GB', {
                day: 'numeric', month: 'short', year: 'numeric'
            }),
            expiryDate: doe && doe.toLocaleDateString('en-GB', {
                day: 'numeric', month: 'short', year: 'numeric'
            })
        };
    } else {
        console.log('No text found while getting response from google cloud vision')
        throw new Error('No text found');
    }
}

app.post('/extract', upload.single('image'), async (req, res) => {
    try {
        const { buffer } = req.file;
        const { birthDate, expiryDate } = await extractDates(buffer);
        res.json({ birthDate, expiryDate });
    } catch (error) {
        console.log(`Error in extracting dates: ${error.message}`);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

app.listen(3000, () => console.log('Server listening on port 3000'));
