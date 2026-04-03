import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import { formatDateBr } from './calculations.js';
import { customersRouter } from './routes/customers.js';
import { loansRouter } from './routes/loans.js';
import { quotesRouter } from './routes/quotes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createApp() {
  const app = express();
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));
  app.locals.formatDateBr = formatDateBr;
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static(path.join(__dirname, 'public')));

  app.get('/', (req, res) => res.redirect('/customers'));
  app.use('/customers', customersRouter);
  app.use('/loans', loansRouter);
  app.use('/api', quotesRouter);

  app.use((err, req, res, _next) => {
    console.error(err);
    res.status(500).render('error', { message: err.message || 'Internal error' });
  });

  return app;
}
