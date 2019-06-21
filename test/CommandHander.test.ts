
import test from "ava";

import { CommandHandler } from "../src/CommandHandler";

test.beforeEach((t) => {
  (t.context as any).commandHandler = new CommandHandler(";", null);
});

test("CommandHandler#parser parses commands/args as expected", (t) => {
  const commandHandler = (t.context as any).commandHandler;

  t.is(commandHandler.parser("|test"), false, "Should ignore bad prefixes");
});
