let counter = 0
const log = (...args) => console.log(`[${counter++}]`, ...args)

const path = require('path');
const fs = require('fs');

const Express = require('express');
const app = Express();
app.use(Express.static('public'));

const Busboy = require('busboy');
const { promisify } = require('util')
const { pipeline } = require('stream')
const pipelineAsync = promisify(pipeline)
 
const socketServer = require('http').createServer(app);
const io = require('socket.io')(socketServer);
io.on('connection', (socket) => { 
    console.log('connected!') 
});






const onFile = (fieldname, file, filename, encoding, mimetype) => {
    const saveTo = path.join('.', filename);
    log('Uploading: ' + saveTo);
    file.pipe(fs.createWriteStream(saveTo));
    log(`File [${fieldname}]: filename: '${filename}', encoding: ${encoding}, mimetype: ${mimetype}`);
    file.on('data', (data) => {
        const size = data.length
        log(`File [${fieldname}] got ${size} bytes`)
        io.emit('file-uploaded', size)
    });
    file.on('end', () => log(`File [${fieldname}] Finished`));
}

const onFinish = res => () => {
    log('Upload complete');
    res.writeHead(303, { Connection: 'close' });

    res.end("That's all folks!");
}
 
app.post('/', async (req, res) => {
    const busboy = new Busboy({ headers: req.headers });
    busboy.on('file', onFile);
    busboy.on('finish', onFinish(res));
    try {
        await pipelineAsync(
            req,
            busboy
        )
    } catch (error) {
        log('error**', error.stack)
        return res.end(`Error!!: ${error.stack}`)
    }
});

app.get('/', function (req, res) {
    res.sendFile(`${__dirname}/index.html`);
    res.end();
});

socketServer.listen(3000, () => {
    const addresses = socketServer.address()
    const { address: host, port } = addresses

    log('Example app listening at http://%s:%s', host, port)

});