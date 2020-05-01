// import AppError from '../errors/AppError';

import { getRepository, getCustomRepository } from 'typeorm';

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

    const checkCategoryExists = await categoryRepository.findOne({
      where: { title: category },
    });

    let transaction;
    if (checkCategoryExists) {
      transaction = transactionRepository.create({
        title,
        value,
        type,
        category_id: checkCategoryExists.id,
      });
    } else {
      const newCategory = categoryRepository.create({
        title: category,
      });

      await categoryRepository.save(newCategory);

      transaction = transactionRepository.create({
        title,
        value,
        type,
        category_id: newCategory.id,
      });
    }

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
