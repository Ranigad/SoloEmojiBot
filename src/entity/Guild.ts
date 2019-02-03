import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity()
export class Guild {
    @PrimaryColumn()
    guild_id: string;

    @Column()
    prefix: string;
}

