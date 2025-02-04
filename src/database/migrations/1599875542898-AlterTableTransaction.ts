import {MigrationInterface, QueryRunner, TableForeignKey, Table, TableColumn} from "typeorm";

export default class AlterTableTransaction1599875542898 implements MigrationInterface {
public async up(queryRunner: QueryRunner): Promise<void> {

  await queryRunner.createForeignKey('transactions',
    new TableForeignKey({
      name: 'TransactionCategory',
      columnNames: ['category_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'categories',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    }),
  );
}

public async down(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.dropForeignKey('transactions', 'TransactionCategory');
 // await queryRunner.dropColumn('transaction', 'category_id');

}
}
