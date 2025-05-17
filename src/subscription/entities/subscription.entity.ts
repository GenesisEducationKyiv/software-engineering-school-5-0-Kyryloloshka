import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column()
  city: string;

  @Column()
  frequency: 'hourly' | 'daily' | 'every-minute';

  @Column({ default: false })
  confirmed: boolean;

  @Column()
  token: string;
}
