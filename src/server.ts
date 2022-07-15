import { connectDB } from './config/db';

import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import morgan from 'morgan';
// import cors from 'cors';
import colors from 'colors';

import './controllers/';

import { AppRouter } from './AppRouter';

// Load environment variables via config.env if in development mode

if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

// Connect database
connectDB();

const app: Application = express();

// app.use(cors());
// app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(AppRouter.getInstance());

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

if (process.env.NODE_ENV === 'production') {
    const publicPath = path.resolve(__dirname, '..', 'client', 'build');
    app.use(express.static(publicPath));

    app.get('*', (_req: Request, res: Response) => {
        res.sendFile(path.resolve(publicPath, 'index.html'));
    });
}
    
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(colors.blue(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)));

interface Error {
    message: string;
}
// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
    console.error(err)
    console.log(colors.red(`Error: ${err.message}`));
    // Close server and exit process
    server.close(() => process.exit(10));
});