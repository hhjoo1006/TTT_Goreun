import {spawn} from 'node:child_process';
// Public local preview; credentials, when needed, use the private stdin flow documented in prototype/.
const child=spawn(process.execPath,['scripts/preview.mjs'],{cwd:new URL('../prototype/',import.meta.url),stdio:['pipe','inherit','inherit']});
child.stdin.end('{}\n');
child.on('exit',code=>{process.exitCode=code??1;});
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>child.kill(signal));
