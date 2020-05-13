import { Router } from 'express';
import { getCustomRepository } from 'typeorm';
import multer from 'multer';

import uploadConfig from '../config/upload';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const upload = multer(uploadConfig);

const transactionsRouter = Router();

const CreateTransaction = new CreateTransactionService();

transactionsRouter.get('/', async (request, response) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository);

  try {
    const transactions = await transactionsRepository.find({
      relations: ['category'],
      select: ['id', 'title', 'value', 'type', 'created_at', 'updated_at'],
    });

    const balance = await transactionsRepository.getBalance();

    return response.json({ transactions, balance });
  } catch (err) {
    return response.status(err.statusCode).json({ error: err.message });
  }
});

transactionsRouter.post('/', async (request, response) => {
  try {
    const { title, value, type, category } = request.body;

    const transaction = await CreateTransaction.execute({
      title,
      value,
      type,
      category,
    });

    delete transaction.category_id;

    return response.json(transaction);
  } catch (err) {
    return response
      .status(err.statusCode)
      .json({ message: err.message, status: 'error' });
  }
});

transactionsRouter.delete('/:id', async (request, response) => {
  try {
    const { id } = request.params;

    const DeleteTransaction = new DeleteTransactionService();

    await DeleteTransaction.execute({ id });
    return response.json({ message: 'Transaction deleted with success!' });
  } catch (err) {
    return response.status(err.statusCode).json({ error: err.message });
  }
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const importTransactions = new ImportTransactionsService();

    const filePath = request.file.path;

    const csvData = await importTransactions.execute({ filePath });

    return response.json(csvData);
  },
);

export default transactionsRouter;
