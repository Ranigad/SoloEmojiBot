import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class Guild {
    @PrimaryColumn()
    guild_id: string;

    @Column()
    prefix: string;
}
