 import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import TransactionRepository from '../repositories/TransactionsRepository'
import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;

}
class CreateTransactionService {

  public async execute({title, value, type, category }: Request): Promise<Transaction> {

    if (!['income', 'outcome'].includes(type)){
     throw new AppError ('Transaction invalid', 401);
    }

    const transactionRepository = getCustomRepository (TransactionRepository);
    const categoriesRepository = getRepository(Category);

    const { total } = await transactionRepository.getBalance();

    if (type ==='outcome' && total < value){
      throw new AppError ('You do not have enough balance');
    }

    let transactionCategory = await categoriesRepository.findOne({
      where:{
        title: category,
      },
    });

    if (!transactionCategory){
      transactionCategory = categoriesRepository.create({
        title: category,
      });

      await categoriesRepository.save(transactionCategory);

    }
    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category: transactionCategory,

    });

    await transactionRepository.save(transaction);
    return transaction;
  }
}

export default CreateTransactionService;
