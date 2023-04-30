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

const extractDates = (textAnnotations) => {
    let dob = null;
    let doe = null;
    for (let i = 0; i < textAnnotations.length; i++) {
        if (dob && doe) {
            break;
        }
        if ((textAnnotations[i].match(/date of birth/i) || (textAnnotations[i].match(/birth date/i))) && !dob) {
            if (textAnnotations[i + 1]) {
                dob = new Date(textAnnotations[i + 1].trim())
            }
        }
        if ((textAnnotations[i].match(/date of expiry/i) || textAnnotations[i].match(/expiry date/i)) && !doe) {
            if (textAnnotations[i + 1]) {
                doe = new Date(textAnnotations[i + 1].trim())
            }
        }
    }
    if ([dob, doe].some(date => date == "Invalid Date")) {
        console.log("Incorrect date conversion")
        throw new Error("OCR recognized incorrect date format");
    }
    if (dob && dob > new Date()) {
        console.log("Invalid date of birth, date of birth is in future")
        throw new Error("Invalid date of birth, date of birth is in future");
    }
    // NOTE: Uncomment this if you want to check for passport expiry
    // if (doe && doe < new Date()) {
    //     throw new Error('Passport expired');
    // }
    if (!dob || !doe) {
        console.log('Couldn\'t extract dates properly from OCR response')
        throw new Error('Couldn\'t extract dates');
    }

    return {
        birthDate: dob && dob.toLocaleDateString('en-GB', {
            day: 'numeric', month: 'short', year: 'numeric'
        }),
        expiryDate: doe && doe.toLocaleDateString('en-GB', {
            day: 'numeric', month: 'short', year: 'numeric'
        })
    };
};

async function readOCR (imageBuffer) {
    const [result] = await client.textDetection(imageBuffer)
    if (result.error) {
        console.log(`Error in OCR: ${result.error}`)
        throw new Error('Error in OCR', result.error);
    }
    if (result.fullTextAnnotation) {
        const textAnnotations = result.fullTextAnnotation.text.split('\n');
        const { birthDate, expiryDate } = extractDates(textAnnotations);
        if (!birthDate || !expiryDate) {
            console.log('No dates found while extracting dates from text annotations')
            throw new Error('No dates found');
        }
        return { birthDate, expiryDate };
    } else {
        console.log('No text found while getting response from google cloud vision')
        throw new Error('No text found');
    }
}

app.post('/extract', upload.single('image'), async (req, res) => {
    try {
        const { buffer } = req.file;
        const { birthDate, expiryDate } = await readOCR(buffer);
        res.json({ birthDate, expiryDate });
    } catch (error) {
        console.log(`Error in extracting dates: ${error.message}`);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

app.listen(3000, () => console.log('Server listening on port 3000'));
