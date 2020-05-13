import { getCustomRepository } from 'typeorm';

import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  id: string;
}

class DeleteTransactionService {
  public async execute({ id }: Request): Promise<void> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const checkIfTransactionExists = await transactionsRepository.findOne({
      where: { id },
    });

    if (!checkIfTransactionExists)
      throw new AppError('Transaction was not found.');

    await transactionsRepository.delete(id);
  }
}

export default DeleteTransactionService;
