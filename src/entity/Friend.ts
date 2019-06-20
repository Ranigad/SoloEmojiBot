import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Friend {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    user_a: string;

    @Column()
    user_b: string;

    @Column({
        default: false
    })
    a_follows: boolean;

    @Column({
        default: false
    })
    b_follows: boolean;
}
