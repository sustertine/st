const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((request, response) => {
    const {url, method} = request;

    switch (url) {
        case '/funkcionalnosti-streznika':
            sendResponse(response, 200, 'text/html', fs.readFileSync(`${__dirname}/pages/docs.html`));
            break;
        case '/posebnosti':
            sendResponse(response, 200, 'text/html', fs.readFileSync(`${__dirname}/pages/specs.txt`, 'utf-8'));
            break;
        case '/resources/usecase.png':
            const imagePath = path.join(__dirname, 'resources', 'usecase.png');
            const image = fs.readFileSync(imagePath);
            sendResponse(response, 200, 'image/png', image);
            break;
        default:
            sendResponse(response, 404, 'text/html', '<h1>Page not found</h1>');
            break;
    }
});


function sendResponse(response, statusCode, contentType, data) {
    response.writeHead(statusCode, {'Content-Type': contentType});
    response.write(data);
    response.end();
}


const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
