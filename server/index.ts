import * as express from 'express';
import { Request, Response } from 'express';

const PORT = 1100;
const APP_LOCATION = 'dist'

const app = express();
app.get('*.*', express.static(APP_LOCATION, { maxAge: '1y' }));
app.all('*', (req: Request, res: Response) => {
    res.status(200).sendFile(`/`, { root: APP_LOCATION });
});
app.listen(PORT, () => {
    console.log(`Express is running at port: ${PORT}`);
});