import { Frequency } from '@lib/common/types/frequency';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column()
  city: string;

  @Column({ type: 'enum', enum: ['daily', 'hourly'] })
  frequency: Frequency;

  @Column({ default: false })
  confirmed: boolean;

  @Column()
  token: string;
}
