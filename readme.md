## How to Run?

> Note: 'key.json' file is required to run the application. This is the key file for the Google Vision API.

1. Clone the repository
2. Run `npm install` to install the dependencies
3. Run `npm start` to start the application
4. Make a post request to `http://localhost:3000/extract` with adding the image file as a form-data with the key `image`

## Responses

1. image4.jpeg

```
{
    "birthDate": null,
    "expiryDate": "2007-01-14T00:00:00.000Z"
}
```

2. image3.jpeg

```
{
    "birthDate": "2007-01-01T00:00:00.000Z",
    "expiryDate": "2023-01-14T00:00:00.000Z"
}
```

3. image3.jpeg

```
{
    "birthDate": "1983-05-24T23:00:00.000Z",
    "expiryDate": "2021-10-17T23:00:00.000Z"
}
```

4. image.jpeg

```
{
    "birthDate": "1993-10-13T23:00:00.000Z",
    "expiryDate": "2015-07-15T23:00:00.000Z"
}
```
