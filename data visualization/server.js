const http = require('http');
const fs = require('fs');
const path = require('path');


const htmlMIMEType = 'text/html';
const cssMIMEType = 'text/css';
const jsMIMEType = 'text/javascript';
const jsonMIMEType = 'application/json';
const otherMIMEType = 'application/octave-stream';

const httpServer = http.createServer( (req, res) => {
    console.log(`req: ${req.url}`);
    if (req.url === '/') {
        sendRes('index.html', 'text/html', res);
    } else {
        sendRes(req.url, getContentType(req.url), res);
    }
});

const port = 3000;

httpServer.listen(port, () => {
    console.log(`Server was created: http://localhost:3000`);
});

function sendRes(url, contentType, res) {
    let file = path.join( __dirname, url);
    console.log(file);
     
    fs.readFile(file, (err, content) => {
        if (err) {
            res.writeHead(404);
            res.write('file not found');
            res.end();
            console.log(`Error 404 ${file}`);
        } else {
            res.writeHead(200, {'Content-Type': contentType});
            res.write(content);    
            res.end();
            console.log(`res 200 ${file}`);
        }
    });
}

function getContentType(url) {
    switch (path.extname(url)) {
        case '.html':
            return htmlMIMEType;
        case '.css':
            return cssMIMEType;
        case '.js':
            return jsMIMEType;
        case '.json':
            return jsonMIMEType;    
        default:
            return otherMIMEType;
    }
}