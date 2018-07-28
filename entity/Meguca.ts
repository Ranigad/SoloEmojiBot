import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany} from "typeorm";
import { MasterMeguca } from "./MasterMeguca";
import { Memoria } from "./Memoria";

@Entity()
export class Meguca {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    user_id: string; // Long MagiRecoUser ID

    @Column({
        default: 0
    })
    support_type: number; //{0,1,2,3,4,5} => {ALL, FIRE, WATER, TIMBER, LIGHT, DARK}

    @Column({
        default: 0
    })
    bonus: number;

    @Column({
        default: 1
    })
    level: number;

    @Column({
        default: 1
    })
    magia_level: string;

    @Column({
        default: 0
    })
    revision: number; // slots available

    @Column({
        default: 0
    })
    slots: number;

    @ManyToOne(type => MasterMeguca, masterMeguca => masterMeguca.meguca)
    masterMeguca: MasterMeguca;

    @OneToMany(type => Memoria, meme => meme.meguca)
    memes: Memoria[];

    type() {
        switch(this.support_type){
            case 0: {
                return "ALL";
            }
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
