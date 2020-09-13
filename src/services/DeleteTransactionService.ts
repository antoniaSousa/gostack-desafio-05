import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';


class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
   const trasactionsRepository = getCustomRepository(TransactionsRepository);

   const transaction = await trasactionsRepository.findOne(id);

   if (!transaction){
     throw new AppError ('Transaction does not exist');

   }
    await trasactionsRepository.remove(transaction);
}
}
export default DeleteTransactionService;
