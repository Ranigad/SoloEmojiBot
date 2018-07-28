import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany} from "typeorm";
import { Meguca } from "./Meguca";

@Entity()
export class MasterMeguca {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    jpn_name: string;

    // These fields are nullable, because data may have to be added after supports are imported
    @Column({
        nullable: true
    })
    eng_sur: string;

    @Column({
        nullable: true
    })
    eng_given: string;

    @Column({
        nullable: true
    })
    nick: string;

    @Column({
        nullable: true
    })
    meguca_type: number;

    @OneToMany(type => Meguca, meguca => meguca.masterMeguca)
    meguca: Meguca[];

    type() {
        switch(this.meguca_type){
            case 1: {
                return "FIRE";
            }
            case 2: {
                return "WATER";
            }
            case 3: {
                return "TIMBER";
            }
            case 4: {
                return "LIGHT";
            }
            case 5: {
                return "DARK";
            }
        }
    }


}
