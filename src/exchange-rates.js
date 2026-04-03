const PTAX_ODATA_BASE = 'https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata';

export function formatPtaxDate(date) {
  const d = date instanceof Date ? date : new Date(date);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${mm}-${dd}-${yyyy}`;
}

export async function fetchCurrencies() {
  const url = `${PTAX_ODATA_BASE}/Moedas?$format=json&$orderby=nomeFormatado`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`BCB Moedas: HTTP ${res.status}`);
  const data = await res.json();
  return Array.isArray(data.value) ? data.value : [];
}

function pickPtaxClosingSell(rows) {
  if (!rows || !rows.length) return null;
  const closing = rows.filter((r) => r.tipoBoletim === 'Fechamento PTAX');
  const list = closing.length ? closing : rows;
  const last = list[list.length - 1];
  return last ? Number(last.cotacaoVenda) : null;
}

export async function fetchDailyCurrencyQuote(currencyCode, referenceDate) {
  const dateStr = formatPtaxDate(referenceDate);
  const url = `${PTAX_ODATA_BASE}/CotacaoMoedaDia(moeda=@moeda,dataCotacao=@dataCotacao)?@moeda='${currencyCode}'&@dataCotacao='${dateStr}'&$format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`BCB CotacaoMoedaDia: HTTP ${res.status}`);
  const data = await res.json();
  const quote = pickPtaxClosingSell(data.value);
  return { quote, rows: data.value || [], dateStr };
}

export async function fetchQuoteWithFallback(currencyCode, startDate = new Date(), maxDaysBack = 10) {
  const base = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  for (let i = 0; i < maxDaysBack; i++) {
    const day = new Date(base);
    day.setDate(base.getDate() - i);
    const { quote, rows, dateStr } = await fetchDailyCurrencyQuote(currencyCode, day);
    if (quote != null && !Number.isNaN(quote)) {
      return {
        quote,
        referenceDateLabel: dateStr,
        quoteDate: day,
        rows,
      };
    }
  }
  throw new Error(`No PTAX quote for ${currencyCode} in the last ${maxDaysBack} days.`);
}
