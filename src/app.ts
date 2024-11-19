import express, { Request, Response } from 'express';
import axios from 'axios';
import https from 'https';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
const app = express();
const port = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.static('public'));
app.use(express.json());

const agent = new https.Agent({
    rejectUnauthorized: false
})

app.get('/', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, 'index.html'));
})

app.get('/getdata', async (req: Request, res: Response) => {
    try {
        const response = await axios.get('https://weather.uwyo.edu/cgi-bin/wyowx.fcgi?TYPE=sflist&DATE=current&HOUR=current&UNITS=M&STATION=SBSN', { httpsAgent: agent });
        res.send(response.data);
    } catch (error) {
        console.error(error);
    }
})

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
})