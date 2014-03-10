# Dashboard app

This folder contains the dashboard application, which should run at `app.dodatado.com`

### Notes
- Overriden the function in `api/responses/notFound.js` to serve the `views/homepage.ejs` file instead of the standard `views/404.ejs` file (404 page should instead be rendered by the angular app)
