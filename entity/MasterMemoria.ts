import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany} from "typeorm";
import { Memoria } from "./Memoria";

@Entity()
export class MasterMemoria {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    jpn_name: string;

    // These fields are nullable, because data may have to be added after supports are imported
    @Column({
        nullable: true
    })
    eng_name: string;

    @Column({
        nullable: true
    })
    active: boolean;

    @Column({
        nullable: true
    })
    rating: number;

    @OneToMany(type => Memoria, memoria => memoria.masterMemoria)
    memes: Memoria[];


}
