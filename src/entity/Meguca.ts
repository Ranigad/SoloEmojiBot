import {Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {MagiRecoUser} from "./MagiRecoUser";
import {MasterMeguca} from "./MasterMeguca";
import {Memoria} from "./Memoria";

@Entity()
export class Meguca {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    support_type: number;

    @Column({
        nullable: true
    })
    bonus: number;

    @Column({
        default: 1
    })
    level: number;

    @Column({
        default: 1
    })
    magia_level: number;

    @Column({
        default: 0
    })
    revision: number;

    @Column({
        default: 0
    })
    slots: number;

    @Column({
        default: 1
    })
    attack: number;

    @Column({
        default: 1
    })
    defense: number;

    @Column({
        default: 1
    })
    hp: number;

    @ManyToOne(() => MasterMeguca, (masterMeguca) => masterMeguca.meguca, {cascade: false})
    masterMeguca: MasterMeguca;

    @OneToMany(() => Memoria, (memo) => memo.meguca, {cascade: true})
    memes: Memoria[];

    @ManyToOne(() => MagiRecoUser, (user) => user.meguca, {cascade: false})
    user: MagiRecoUser;
}
