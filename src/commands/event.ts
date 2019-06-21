import {BaseCommand} from "../BaseCommand";
import { Logger } from "../Logger";

import * as noodle from "noodlejs";
import * as rp from "request-promise";

// Event Timer: https://rice.qyu.be/lua-bin/event_timer.lua?msg=en

export class EventCommand extends BaseCommand {

    static aliases = ["event"];

    constructor(debug= false) {
        super(debug);
    }

    handler(...args) {
        const [wiki, bot, message, cmdargs] = args;

        this.run(bot, message, cmdargs);
    }

    async run(bot, message, cmdargs) {
        const url = "https://rice.qyu.be/lua-bin/event_timer.lua?msg=en";
        const brief_url = url.slice(8);
        const query = [
            {
                url,
                selector: "#el_d1",
                type: "html",
                extract: "text",
                cache: false
            },
            {
                url,
                selector: "#el_h1",
                type: "html",
                extract: "text",
                cache: false
            },
            {
                url,
                selector: "#el_m1",
                type: "html",
                extract: "text",
                cache: false
            },
            {
                url,
                selector: "#el_s1",
                type: "html",
                extract: "text",
                cache: false
            }
        ];

        const options = {
            method: "GET",
            uri: url,
            resolveWithFullResponse: true
        };
        const result = await rp(options);
        Logger.log(result);

        const general_event_url = "https://magireco.wikia.com/wiki/Current_Event";
        const event_title_data = await noodle.query({url: general_event_url,
            type: "html", selector: "#PageHeader div.page-header__main h1.page-header__title",
            extract: "text", cache: false});
        let event_name = event_title_data.results[0].results[0];
        if (event_name === undefined) { event_name = "Current_Event"; }
        const url_end = event_name.replace(/ /g, "_");
        const event_url = general_event_url.replace("Current_Event", url_end);

        const data = await noodle.query(query);
        const cd_days = data.results[0].results[0];
        const cd_hours = data.results[1].results[0];
        const cd_minutes = data.results[2].results[0];
        const cd_seconds = data.results[3].results[0];
        const countdown_time = `${cd_days} days, ${cd_hours} hours, and ${cd_minutes} minutes`;

        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        const redirected_href = result.request.uri.href;
        const date_regex = /iso=.+/g;
        const date_retrieved = redirected_href.match(date_regex)[0];

        // Slice does not include end index
        const date_year = date_retrieved.slice(4, 8);
        const date_month = date_retrieved.slice(8, 10);
        const date_month_val = parseInt(date_month, 10);
        let month = null;
        if (date_month_val < 1 || date_month_val > 13) {
            month = date_month_val;
        } else {
            month = months[date_month_val - 1];
        }
        const date_day = date_retrieved.slice(10, 12);
        const date_day_val = parseInt(date_day, 10);
        const date_hour = date_retrieved.slice(13, 15);
        const date_minute = date_retrieved.slice(15, 17);
        const date_second = date_retrieved.slice(17, 19);

        const full_date = `${month} ${date_day_val}, ${date_year} ${date_hour}:${date_minute}:${date_second}`;

        const reply = `**Event**: ${event_name} (${event_url})
Use **.eventdrops** to see event farming information.
**Ends in**: ${countdown_time} (*${full_date} JST*)`;
        return message.channel.send(reply);
    }

}
