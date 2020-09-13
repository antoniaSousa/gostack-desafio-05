import Transaction from '../models/Transaction';
import fs from 'fs';
import csvParse from 'csv-parse';
import { getRepository, In, getCustomRepository } from 'typeorm';
import TransactionRepository from '../repositories/TransactionsRepository';

import Category from '../models/Category';

interface CSVTransaction {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;

}
class ImportTransactionsService {
  async execute(filePath: string): Promise<Transaction[]> {
    const transactionRepository = getCustomRepository(TransactionRepository);

    const readCSVStream = fs.createReadStream(filePath);

    const parseStream = csvParse({
      from_line: 2,

    });
    const parseCSV = readCSVStream.pipe(parseStream);

    const transactions: CSVTransaction [] = [];
    const categories: string [] = [];

    parseCSV.on('data', async line =>{
    const [ title, type, value, category] = line.map((cell: String)=>
    cell.trim(),
    );
    if (!title || !type || !value) return;

    categories.push(category)

    transactions.push({title, type, value, category});
    });
     await new Promise(resolve => parseCSV.on('end', resolve));

     const categoriesRepository = getRepository(Category);

     const existenCategories = await categoriesRepository.find ({
       where: {
         title: In(categories),
       },
     });
    const existenCategoriesTitle = existenCategories.map(
      (category: Category) => category.title,
    );

     const addCategoryTitle = categories
     .filter(category => !existenCategoriesTitle.includes(category))
     .filter((value, index, self) => self.indexOf(value) == index);

     const newCategories = categoriesRepository.create (
       addCategoryTitle.map(title =>({
         title,
       })),
   );
   await categoriesRepository.save(newCategories);


   const finalCategories = [ ...newCategories, ...existenCategories];

   const createdTransactions = transactionRepository.create(
     transactions.map(transaction =>({
       title: transaction.title,
       type: transaction.type,
       value: transaction.value,
       category: finalCategories.find(
         category => category.title == transaction.category,
       ),

     })),
   );
    await transactionRepository.save(createdTransactions);

    await fs.promises.unlink(filePath);

    return createdTransactions;

    }
  }


export default ImportTransactionsService;
