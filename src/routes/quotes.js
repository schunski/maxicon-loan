import { Router } from 'express';
import { formatPtaxDate, fetchQuoteWithFallback } from '../exchange-rates.js';
import { asyncHandler } from '../async-handler.js';

export const quotesRouter = Router();

quotesRouter.get(
  '/quote',
  asyncHandler(async (req, res) => {
    const currency = String(req.query.currency || '').toUpperCase();
    if (currency === 'BRL') {
      res.json({
        quote: 1,
        referenceDate: formatPtaxDate(new Date()),
        message: 'BRL — taxa fixa 1',
      });
      return;
    }
    const result = await fetchQuoteWithFallback(currency, new Date(), 12);
    res.json({ quote: result.quote, referenceDate: result.referenceDateLabel });
  }),
);
