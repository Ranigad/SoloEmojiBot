import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {Meguca} from "./Meguca";
import {MasterMemoria} from "./MasterMemoria";

@Entity()
export class Memoria {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        default: 0
    })
    lbCount: number;

    @Column({
        default: 1
    })
    level: number;

    @ManyToOne(() => MasterMemoria, masterMemoria => masterMemoria.memes, {cascade: false})
    masterMemoria: MasterMemoria;

    @ManyToOne(() => Meguca, meguca => meguca.memes, {cascade: false})
    meguca: Meguca;
}
