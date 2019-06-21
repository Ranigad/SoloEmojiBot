import {Column, Entity, OneToMany, PrimaryColumn} from "typeorm";
import {Meguca} from "./Meguca";

@Entity()
export class MasterMeguca {
    @PrimaryColumn()
    jpn_name: string;

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

    @OneToMany(() => Meguca, (meguca) => meguca.masterMeguca, {cascade: true})
    meguca: Meguca[];
}
