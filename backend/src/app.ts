import express from 'express';
import mongoose from 'mongoose';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import auth_routes from './features/auth/authRoutes.js';
import ques_routes from './features/questions/quesRoutes.js';
import errorHandler from './middleware/errorHandler.js';
import sub_routes from './features/submission/subRoutes.js';
const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'https://devcode-tau.vercel.app',
  'https://devcode-git-main-charan-teja-projects1.vercel.app',
  'https://devcode-gw5vohpm6-charan-teja-projects1.vercel.app',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

const DB_URL = process.env.DB_URL;
if (!DB_URL) throw new Error('DB_URL environment variable is not defined');
mongoose.connect(DB_URL)
    .then((result) => {
        console.log('Connected to database');
        app.listen(3000, () => {
            console.log('Server is running on port 3000');
        });
    })
    .catch((err) => console.log(err));

app.use('/auth', auth_routes);
app.use('/api', ques_routes);
app.use('/api', sub_routes);
app.use(errorHandler);
