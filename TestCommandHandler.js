

let CommandHandler = require('./CommandHandler.js');
let CH = new CommandHandler(';', true);

let testCases = [
    {'content': ';emoji 1d', 'server': {'id': 'test'}}
/**
// Test wlink
    ';wlink',
    ';test',
    ';wset magireco',
    ';wlink Madoka',
    ';wlink Madoka Homura',
    ';emoji',
    'Test Message',
// Test Commands with different number of arguments
    ';testcommand help 1',
    ';testcommand help',
    ';testcommand 1 2 3',
    ';testcommand 1 2',
    ';testcommand 1',
    ';testcommand'
// */
];

console.log('Test Start\n---');

if (process.argv.length < 3) {
    for (let i = 0; i < testCases.length; i++) {
        console.log(`Test input: ${testCases[i]}`);
        CH.handle(testCases[i]);
        console.log("\n");
    }
} else {
    console.log(`Test input: ${process.argv[2]}`);
    CH.handle(process.argv[2]);
    console.log("\n");
}

console.log('---\nTest Successful');