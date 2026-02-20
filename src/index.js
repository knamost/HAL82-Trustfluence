import express from 'express';

const app = express();
const PORT = process.env.PORT ?? 8000;

// --- Middlewares ---
app.use(express.json());
// app.use(authenticate); // parses JWT from Authorization header on every request

// --- Routes ---
//app.use('/user', userRouter); // /user/signup, /user/login
// app.use(urlRouter);           // /shorten, /urls, /:shortCode, /:id

app.get('/', (req, res) => {
    return res.json({ status: 'Server is up and running' });
});

// --- Start ---
app.listen(PORT, () => console.log(`Server is listening on port: ${PORT}`));