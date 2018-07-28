import {Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryColumn} from "typeorm";

@Entity()
export class User {

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

    @Column()
    notifications: boolean;

    @CreateDateColumn()
    addtimestamp: Date;

    @UpdateDateColumn()
    updatetimestamp: Date;

}
