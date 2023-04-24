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
        console.log(result.error)
        throw new Error('Error in OCR', result.error);
    }
    if (result.fullTextAnnotation) {
        // console.log(result.fullTextAnnotation)
        const textAnnotations = result.fullTextAnnotation.text.split('\n');
        let dob = null;
        let doe = null;
        for (let i = 0; i < textAnnotations.length; i++) {
            if (textAnnotations[i].match(/date of birth/i) && !dob) {
                dob = textAnnotations[i + 1].trim()
            }
            if ((textAnnotations[i].match(/date of expiry/i) || textAnnotations[i].match(/expiry date/i)) && !doe) {
                doe = textAnnotations[i + 1].trim()
            }

            if (dob && doe) {
                break;
            }
        }
        console.log("dob", dob, "doe", doe)
        return {
            birthDate: dob && new Date(dob),
            expiryDate: doe && new Date(doe)
        };
    } else {
        throw new Error('No text found');
    }
}

app.post('/extract', upload.single('image'), async (req, res) => {
    try {
        const { buffer } = req.file;
        const { birthDate, expiryDate } = await extractDates(buffer);
        res.json({ birthDate, expiryDate });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.listen(3000, () => console.log('Server listening on port 3000'));

(() => {
    console.log(new Date("23 APR 2020"))
})()