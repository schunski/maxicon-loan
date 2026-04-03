import { Router } from 'express';
import { pool } from '../database.js';
import { asyncHandler } from '../async-handler.js';
import { fetchCurrencies, fetchQuoteWithFallback } from '../exchange-rates.js';
import { formatDateBr, parseDateInput, toIsoDateString } from '../calculations.js';
import { presentLoan } from '../loan-presenter.js';

export const loansRouter = Router();

async function currenciesWithBrl() {
  const list = await fetchCurrencies();
  const mapped = list.map((m) => ({ ...m, label: m.nomeFormatado }));
  return [{ simbolo: 'BRL', nomeFormatado: 'Brazilian Real', label: 'Brazilian Real (BRL)' }, ...mapped];
}

loansRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query(`
      SELECT e.*, c.name AS customer_name FROM loans e
      JOIN customers c ON c.id = e.customer_id ORDER BY e.due_date DESC`);
    res.render('loans-list', { loans: rows.map(presentLoan), title: 'Loans' });
  }),
);

loansRouter.get(
  '/new',
  asyncHandler(async (req, res) => {
    const { rows: customers } = await pool.query('SELECT id, name FROM customers ORDER BY name');
    const currencies = await currenciesWithBrl();
    res.render('loans-form', {
      loan: null,
      customers,
      currencies,
      title: 'Novo empréstimo',
      exchangeError: null,
    });
  }),
);

loansRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const customerId = parseInt(req.body.customer_id, 10);
    const currency = String(req.body.currency || '').toUpperCase().trim();
    const amount = parseFloat(String(req.body.amount).replace(',', '.'));
    const loanDate = req.body.loan_date;
    const dueDate = req.body.due_date;
    const annualRate = parseFloat(String(req.body.annual_interest_rate_percent).replace(',', '.'));
    if (!customerId || !currency || Number.isNaN(amount) || amount <= 0) {
      return res.status(400).render('error', { message: 'Invalid data.' });
    }
    let loanD;
    let dueD;
    try {
      loanD = parseDateInput(loanDate);
      dueD = parseDateInput(dueDate);
    } catch {
      return res.status(400).render('error', { message: 'Data inválida. Use o formato dd/mm/aaaa.' });
    }
    if (dueD <= loanD) {
      return res.status(400).render('error', {
        message: 'Data de vencimento deve ser após data do empréstimo.',
      });
    }
    if (Number.isNaN(annualRate) || annualRate < 0) {
      return res.status(400).render('error', { message: 'Taxa de juros anual inválida.' });
    }
    let brlRate;
    let quoteRef = null;
    try {
      if (currency === 'BRL') {
        brlRate = 1;
      } else {
        const q = await fetchQuoteWithFallback(currency, new Date(), 12);
        brlRate = q.quote;
        quoteRef = q.quoteDate;
      }
    } catch (e) {
      const { rows: customers } = await pool.query('SELECT id, name FROM customers ORDER BY name');
      const currencies = await currenciesWithBrl();
      return res.status(502).render('loans-form', {
        loan: { ...req.body, customer_id: customerId },
        customers,
        currencies,
        title: 'Novo empréstimo',
        exchangeError: e.message || 'Failed to fetch BCB rates.',
      });
    }
    await pool.query(
      `INSERT INTO loans (customer_id, loan_date, currency, amount, brl_rate, due_date, annual_interest_rate_percent, quote_reference_date) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [
        customerId,
        toIsoDateString(loanD),
        currency,
        amount,
        brlRate,
        toIsoDateString(dueD),
        annualRate,
        quoteRef ? toIsoDateString(quoteRef) : null,
      ],
    );
    res.redirect('/loans');
  }),
);

loansRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const { rows } = await pool.query(
      `SELECT e.*, c.name AS customer_name FROM loans e JOIN customers c ON c.id = e.customer_id WHERE e.id = $1`,
      [id],
    );
    if (!rows[0]) return res.status(404).render('error', { message: 'Empréstimo não encontrado' });
    res.render('loans-show', { loan: presentLoan(rows[0]), title: 'Loan #' + id });
  }),
);

loansRouter.get(
  '/:id/edit',
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const { rows } = await pool.query('SELECT * FROM loans WHERE id = $1', [id]);
    if (!rows[0]) return res.status(404).render('error', { message: 'Empréstimo não encontrado' });
    const { rows: customers } = await pool.query('SELECT id, name FROM customers ORDER BY name');
    const currencies = await currenciesWithBrl();
    const row = rows[0];
    res.render('loans-form', {
      loan: {
        ...row,
        loan_date: formatDateBr(row.loan_date),
        due_date: formatDateBr(row.due_date),
      },
      customers,
      currencies,
      title: 'Editar empréstimo',
      exchangeError: null,
    });
  }),
);

loansRouter.post(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const customerId = parseInt(req.body.customer_id, 10);
    const currency = String(req.body.currency || '').toUpperCase().trim();
    const amount = parseFloat(String(req.body.amount).replace(',', '.'));
    const loanDate = req.body.loan_date;
    const dueDate = req.body.due_date;
    const annualRate = parseFloat(String(req.body.annual_interest_rate_percent).replace(',', '.'));
    let loanD;
    let dueD;
    try {
      loanD = parseDateInput(loanDate);
      dueD = parseDateInput(dueDate);
    } catch {
      return res.status(400).render('error', { message: 'Data inválida. Use o formato dd/mm/aaaa.' });
    }
    if (dueD <= loanD) {
      return res.status(400).render('error', {
        message: 'Data de vencimento deve ser após data do empréstimo.',
      });
    }
    let brlRate;
    let quoteRef = null;
    try {
      if (currency === 'BRL') {
        brlRate = 1;
      } else {
        const q = await fetchQuoteWithFallback(currency, new Date(), 12);
        brlRate = q.quote;
        quoteRef = q.quoteDate;
      }
    } catch (e) {
      const { rows: customers } = await pool.query('SELECT id, name FROM customers ORDER BY name');
      const currencies = await currenciesWithBrl();
      return res.status(502).render('loans-form', {
        loan: { ...req.body, id, customer_id: customerId },
        customers,
        currencies,
        title: 'Edit loan',
        exchangeError: e.message || 'Falha ao buscar cotações do BCB.',
      });
    }
    await pool.query(
      `UPDATE loans SET customer_id=$1, loan_date=$2, currency=$3, amount=$4, brl_rate=$5, due_date=$6, annual_interest_rate_percent=$7, quote_reference_date=$8 WHERE id=$9`,
      [
        customerId,
        toIsoDateString(loanD),
        currency,
        amount,
        brlRate,
        toIsoDateString(dueD),
        annualRate,
        quoteRef ? toIsoDateString(quoteRef) : null,
        id,
      ],
    );
    res.redirect('/loans/' + id);
  }),
);

loansRouter.post(
  '/:id/delete',
  asyncHandler(async (req, res) => {
    await pool.query('DELETE FROM loans WHERE id = $1', [parseInt(req.params.id, 10)]);
    res.redirect('/loans');
  }),
);
