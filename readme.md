## How to Run?

> Note: 'key.json' file is required to run the application. This is the key file for the Google Vision API.

1. Clone the repository
2. Run `npm install` to install the dependencies
3. Run `npm start` to start the application
4. Make a post request to `http://localhost:3000/extract` with adding the image file as a form-data with the key `image`

> Alternatively use the below cURL command to make the request

```bash
curl --location 'http://localhost:3000/extract' \
--form 'image=@"<absolute path to the image>"'
```

## Responses

1. image4.jpeg

```
{
    "message": "Internal server error",
    "error": "Couldn't extract dates"
}
```

2. image3.jpeg

```
{
    "birthDate": "4 Dec 1988",
    "expiryDate": "28 Sept 2025"
}
```

3. image2.jpeg

```
{
    "birthDate": "25 May 1983",
    "expiryDate": "18 Oct 2021"
}
```

4. image.jpeg

```
{
    "birthDate": "14 Oct 1993",
    "expiryDate": "16 Jul 2015"
}
```
