import { Router } from 'express';
import { pool } from '../database.js';
import { asyncHandler } from '../async-handler.js';

export const customersRouter = Router();

customersRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query('SELECT id, name FROM customers ORDER BY name');
    res.render('customers-list', { customers: rows, title: 'Clientes' });
  }),
);

customersRouter.get('/new', (req, res) => {
  res.render('customers-form', { customer: null, title: 'Novo cliente' });
});

customersRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const name = String(req.body.name || '').trim();
    if (!name) return res.status(400).send('Nome é obrigatório');
    await pool.query('INSERT INTO customers (name) VALUES ($1)', [name]);
    res.redirect('/customers');
  }),
);

customersRouter.get(
  '/:id/edit',
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const { rows } = await pool.query('SELECT id, name FROM customers WHERE id = $1', [id]);
    if (!rows[0]) return res.status(404).render('error', { message: 'Cliente não encontrado' });
    res.render('customers-form', { customer: rows[0], title: 'Edit customer' });
  }),
);

customersRouter.post(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const name = String(req.body.name || '').trim();
    if (!name) return res.status(400).send('Nome é obrigatório');
    await pool.query('UPDATE customers SET name = $1 WHERE id = $2', [name, id]);
    res.redirect('/customers');
  }),
);

customersRouter.post(
  '/:id/delete',
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id, 10);
    try {
      await pool.query('DELETE FROM customers WHERE id = $1', [id]);
    } catch (e) {
      if (e.code === '23503') {
        return res.status(400).render('error', {
          message: 'Não é possível deletar: este cliente tem empréstimos vinculados.',
        });
      }
      throw e;
    }
    res.redirect('/customers');
  }),
);
