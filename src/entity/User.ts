import {Entity, Column, CreateDateColumn, PrimaryColumn} from "typeorm";

@Entity()
export class User {
    @PrimaryColumn()
    username: string;

    @Column()
    discordname: string;

    @Column({nullable: true})
    discriminator: string;

    @Column()
    displayname: string;

    @Column()
    friend_id: string;

    @Column({default: false})
    notifications: boolean;

    @CreateDateColumn()
    addtimestamp: Date;

    @Column({default: false})
    deleted: boolean;
}
