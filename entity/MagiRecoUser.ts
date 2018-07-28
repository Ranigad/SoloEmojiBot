import {Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryColumn} from "typeorm";

@Entity()
export class MagiRecoUser {

    @PrimaryColumn()
    user_id: string; // Long MagiRecoUser ID

    @Column({
        unique: true
    })
    friend_id: string;

    @Column()
    display_name: string;

    @Column({
        default: 1
    })
    user_rank: number;

    @Column({
        nullable: true
    })
    class_rank: string;

    @Column({
        nullable: true
    })
    last_access: string;

    @Column({
        default: ""
    })
    comment: string;

    @CreateDateColumn()
    addtimestamp: Date;

    @UpdateDateColumn()
    updatetimestamp: Date;

}
