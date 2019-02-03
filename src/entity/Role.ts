import {Entity, Column, PrimaryColumn} from "typeorm";

@Entity()
export class Role {
    @PrimaryColumn()
    username: string;

    @Column()
    role: string;

}
