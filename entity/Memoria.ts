import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany} from "typeorm";
import { Meguca } from "./Meguca";
import { MasterMemoria } from "./MasterMemoria";

@Entity()
export class Memoria {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        default: false
    })
    mlb: boolean;

    @Column({
        default: 1
    })
    level: number;

    @ManyToOne(type => Meguca, meguca => meguca.memes)
    meguca: Meguca;

    @ManyToOne(type => MasterMemoria, masterMemoria => masterMemoria.memes)
    masterMemoria: MasterMemoria;

}
