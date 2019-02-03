import {Column, Entity, OneToMany, PrimaryColumn} from "typeorm";
import {Memoria} from "./Memoria";

@Entity()
export class MasterMemoria {
    @PrimaryColumn()
    jpn_name: string;

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

    @OneToMany(() => Memoria, memo => memo.masterMemoria, {cascade: true})
    memes: Memoria[];
}
