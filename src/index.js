import 'dotenv/config';
import express from 'express';
import { errorHandler } from './middlewares/errorHandler.js';

// Route modules
import authRouter from './routes/auth.js';
import creatorsRouter from './routes/creators.js';
import brandsRouter from './routes/brands.js';
import requirementsRouter from './routes/requirements.js';
import feedbackRouter from './routes/feedback.js';
import socialRouter from './routes/social.js';

const app = express();
const PORT = process.env.PORT ?? 8000;

// --- Middlewares ---
app.use(express.json());

// --- Routes ---
app.get('/', (req, res) => {
  return res.json({ status: 'Trustfluence API is up and running 🚀' });
});

app.use('/auth', authRouter);
app.use('/creators', creatorsRouter);
app.use('/brands', brandsRouter);
app.use('/requirements', requirementsRouter);
app.use('/feedback', feedbackRouter);
app.use('/social', socialRouter);

// --- Error handler (must be last) ---
app.use(errorHandler);

// --- Start ---
app.listen(PORT, () => console.log(`Server is listening on port: ${PORT}`));