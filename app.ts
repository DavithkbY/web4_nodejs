import http  from 'http'
import axios from 'axios'
import json2html from 'node-json2html'
import qs from "querystring";

const hostname = 'localhost'
const port = 9000
let qss = require('querystring');
const bodyParser = require("body-parser");
const server = http.createServer((req, res) => {
    const path = req.url.replace(/\/?(?:\?.*)?$/, '').toLowerCase()
    switch(path) {
        case '/hello':
            res.writeHead(200, { 'Content-Type': 'text/html' })
            res.write('Hello world!')
            res.end();
            break

        case '/success':
            res.writeHead(201, { 'Content-Type': 'text/html' })
            res.write('New article added succesfully!')
            res.end();
            break
        case '/news/all':
            res.writeHead(200, { 'Content-Type': 'text/html' })
            // call data => build html with data => write html => end response

            makeGetRequest().then(data => buildHtmlForOverview(data)).then(html => res.write(html)).then(() => res.end())

            break
        case '/news/add':
            res.writeHead(200, { 'Content-Type': 'text/html' })
            // call data => build html with data => write html => end response
            makeGetRequest().then(data => buildHtmlForForm()).then(html => res.write(html)).then(() => res.end())
            break

        case '/news/new':
            let body = ''
            req.on('data', chunk => {
                body += chunk
            })
            req.on('end', chunk => {
                let data = body
                addData(data)
                res.writeHead(301, {
                    Location: `/success`
                }).end();
            })

            break
    }
})

async function addData(data){
    let response = await axios.post('http://localhost:8080/posts/form',data).then(response =>{
        console.log(response)
    })
}

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/ press Ctrl-C to terminate....`)
})

function buildHtmlForForm() {
    return  '<!DOCTYPE html>'+
    ' <form method="post" action="/news/new">\n' +
        '  <label for="fname">Title:</label><br>\n' +
        '  <input required type="text" id="title" name="title" ><br>\n' +
        '  <label for="lname">Author:</label><br>\n' +
        '  <input required type="text" id="author" name="author"><br><br>\n' +
        '  <label for="lname">Content:</label><br>\n' +
        '  <input required type="text" id="content" name="content" ><br><br>\n' +
        '  <input type="submit" value="Submit">\n' +
        '</form> '
}
async function makeGetRequest () {
    let res = await axios.get('http://localhost:8080/posts')
    return res.data
}

function buildHtmlForOverview(data) {
    let html = json2html.render(data,
        {"<>": "li", "html":[{"<>": "span", "text": "${title} ${text} ${author} ${createdAt}"}]})

    return  '<!DOCTYPE html>'+
        '<html>'+
        '<head>News Items</head>'+
        '<body>' + html + '</body>'+
        '</html>'
}

