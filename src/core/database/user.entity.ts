import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RefreshToken } from './refresh-token.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  photoUrl: string;

  @Column({ length: 120 })
  fullname: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ type: 'date', nullable: true })
  birthDate: Date;

  @Column('text', { array: true, default: ['employee'] }) // superadmin; admin; employee;
  roles: string[];

  @OneToMany(() => RefreshToken, (rt) => rt.user)
  refreshTokens: RefreshToken[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
