import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find({ select: ['type', 'value'] });

    const { income, outcome } = transactions.reduce(
      (acc, obj) => {
        obj.type === 'income'
          ? (acc.income += +obj.value)
          : (acc.outcome += +obj.value);

        return acc;
      },
      { income: 0, outcome: 0 },
    );

    return {
      income,
      outcome,
      total: income - outcome,
    };
  }
}

export default TransactionsRepository;
