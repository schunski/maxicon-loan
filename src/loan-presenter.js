import { monthsBetween, principalInBrl, maturityValueInBrl } from './calculations.js';

export function presentLoan(row) {
  const termMonths = monthsBetween(row.loan_date, row.due_date);
  const principalBrl = principalInBrl(row.amount, row.brl_rate);
  const maturityBrl =
    termMonths == null
      ? null
      : maturityValueInBrl(principalBrl, row.annual_interest_rate_percent, termMonths);
  return {
    ...row,
    termMonths,
    principalBrl,
    maturityBrl,
  };
}
