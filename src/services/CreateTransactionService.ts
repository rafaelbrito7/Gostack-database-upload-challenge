import { getRepository, getCustomRepository } from 'typeorm';

import AppError from '../errors/AppError';
import TransactionRepository from '../repositories/TransactionsRepository';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const categoryRepository = getRepository(Category);
    const transactionRepository = getCustomRepository(TransactionRepository);

    const { total } = await transactionRepository.getBalance();

    if (type === 'outcome' && value > total) {
      throw new AppError('No money available');
    }

    const transaction = transactionRepository.create({
      title,
      value,
      type,
    });

    const categoryExists = await categoryRepository.findOne({
      where: { title: category },
    });

    categoryExists
      ? (transaction.category = categoryExists)
      : (transaction.category = await categoryRepository.save(
          categoryRepository.create({
            title: category,
          }),
        ));

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
