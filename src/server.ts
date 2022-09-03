/* eslint-disable @typescript-eslint/naming-convention */
import express from 'express';
import { join, extname } from 'node:path';
import { readFileSync } from 'node:fs';
import bodyParser from 'body-parser';
import multer from 'multer';
import db from './database.js';
import dayjs from 'dayjs';
const app = express();
const port = 3000;
const regexTransactions =
  /^([\w\s]+),([\d+]+),([\d+-\d]+),([\w+\s]+),([\d+]+),([\d+-\d]+),(\d+\.?\d{2}?),(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})\n?$/m;
const storage = multer.diskStorage({
  filename: (req, file, next) => {
    const originalname: string = file.originalname.replace('.csv', '');
    const date = new Date().getTime();
    const name = `${originalname}_${date}.csv`;
    next(null, name);
  },
  destination: './uploads',
});
const upload = multer({
  storage,
  fileFilter: (req, file, next) => {
    const ext = extname(file.originalname);
    if (ext !== '.csv') {
      return next(null, false);
    }
    return next(null, true);
  },
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, '..', 'public', 'index.html'));
});

app.use(express.static(join(__dirname, '..', 'public')));
app.use(express.static(join(__dirname, '.', 'database')));

app.post('/upload', upload.array('file'), async (req, res, next) => {
  let positionSheet = 0;
  let message: any;
  let blOK = true;
  if (req.files?.length === 0) {
    blOK = false;
    message = {
      status: blOK,
      response: 'Faça upload de algum arquivo.',
    };
    return res.send(message);
  }
  const formattedTransactions = (req.files as any[]).map(async file => {
    positionSheet++;
    const path = join(file.path);
    const transactionsString = readFileSync(path).toString().toUpperCase();
    blOK = true;
    if (!regexTransactions.test(transactionsString)) {
      blOK = false;
      return (message = {
        status: blOK,
        response: `A planilha na posição ${positionSheet} que esta tentando enviar está vazia.`,
      });
    } else {
      const transactions = transactionsString.split(/\r?\n/);
      const firstTransactionString = transactions[0];
      const firstTransactionArray = firstTransactionString.split(',');
      const firstTransactionDate = firstTransactionArray[7];
      const dateFirstTransactionConverted = new Date(firstTransactionArray[7]);
      const startDay = dayjs(dateFirstTransactionConverted)
        .startOf('day')
        .format();
      const endDay = dayjs(dateFirstTransactionConverted).endOf('day').format();
      const getTransactionsDay = await db('transactions')
        .select('transactions.date')
        .from('transactions')
        .whereBetween('transactions.date', [startDay, endDay]);

      return transactions.map(transaction => {
        const [
          origin_bank,
          origin_branch,
          origin_account,
          destination_bank,
          destination_branch,
          destination_account,
          amount_in_cents,
          date,
        ] = transaction.split(',');

        if (transaction.includes(',,')) {
          return false;
        }

        if (
          new Date(firstTransactionDate).getDate() ===
            new Date(date).getDate() &&
          getTransactionsDay.length === 0
        ) {
          return {
            origin_bank,
            origin_branch,
            origin_account,
            destination_bank,
            destination_branch,
            destination_account,
            amount_in_cents: Number(amount_in_cents) * 100,
            date,
          };
        } else {
          return false;
        }
      });
    }
  });

  if (blOK) {
    message = {
      status: blOK,
      response: 'Upload de todas as planilhas feito com sucesso.',
    };
    const transactionsFiltered = (await Promise.all(formattedTransactions))
      .flat()
      .filter(element => element);
    if (transactionsFiltered.length === 0) {
      return res.send({
        status: false,
        response: `A planilha na posição ${positionSheet} já possui uma transação deste dia.`,
      });
    }
    await db('transactions').insert(transactionsFiltered, ['id']);
    return res.status(200).send(message);
  } else {
    return res.status(500).send(message);
  }
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
  console.log('URL BANCO :>> ', process.env.CONNECTION_BD_KEY);
});

app.route('/allTransaction').get(async (req, res) => {
  const allTransaction = await db('transactions')
    .select('transactions.date', 'transactions.created_at')
    .from('transactions');
  res.send(allTransaction);
});
