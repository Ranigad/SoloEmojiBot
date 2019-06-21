import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import {Meguca} from "./Meguca";

@Entity()
export class MagiRecoUser {
    @PrimaryColumn()
    user_id: string;

    @Column({
        unique: true
    })
    friend_id: string;

    @Column()
    display_name: string;

    @Column()
    user_rank: number;

    @Column({
        nullable: true
    })
    class_rank: string;

    @Column({
        nullable: true
    })
    last_access: Date;

    @Column({
        default: "",
        nullable: true
    })
    comment: string;

    @Column()
    addtimestamp: Date;

    @Column({
        nullable: true
    })
    updatetimestamp: Date;

    @OneToMany(() => Meguca, (meguca) => meguca.user, {cascade: true})
    meguca: Meguca[];

}
