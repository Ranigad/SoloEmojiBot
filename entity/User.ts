import {Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryColumn} from "typeorm";

@Entity()
class User {

    @PrimaryColumn()
    username: string; // Long Discord username

    @Column()
    name: string;

    @Column()
    discriminator: string;

    @Column({
        nullable: true
    })
    displayname: string;

    @Column()
    friend_id: string;

    @Column({
        default: false
    })
    notifications: boolean;

    @Column({
        default: false
    })
    support_opt_out: boolean;

    @Column({
        default: false
    })
    deleted: boolean;

    @CreateDateColumn()
    addtimestamp: Date;

    @UpdateDateColumn()
    updatetimestamp: Date;

}

module.exports = User;
