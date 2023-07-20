import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  UpdateDateColumn,
  CreateDateColumn,
  BaseEntity,
} from 'typeorm';

@Entity()
export class Category extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column({ type: 'varchar', unique: true })
  public name!: string;

  @Column({ type: 'varchar', nullable: true })
  public description?: string;

  @Column({ type: 'integer', nullable: true })
  public parentId?: number;

  @Column({ nullable: true, type: 'varchar', array: true })
  public images: string[];

  @Column({ nullable: true, type: 'integer', array: true })
  public products: number[];

  @OneToMany(() => Category, (category) => category.parent)
  public subcategories: Category[];

  @ManyToOne(() => Category, (category) => category.subcategories)
  public parent?: Category;

  @CreateDateColumn()
  public createdAt!: Date;

  @UpdateDateColumn()
  public updatedAt!: Date;
}
