import express from "express";
import routes from "./routes.js";
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
}
app.use(cors(corsOptions));
app.use(express.json());
app.use('', routes);

export default app;