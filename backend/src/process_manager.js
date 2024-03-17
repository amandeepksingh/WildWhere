const {fork} = require('child_process');

const Proc_healthtype = {
		running: "running",
		stopped: "stopped",
		crashed: "crashed",
};

class ProcessManager {
	constructor() {
		this.processes = [];
	}

	startProcess(Path) {
		const pr = fork(Path);
		console.log("PM: forking path")
		;
		let processDesc = {
			keepRunning: false,
			process: pr,
			desc: "server process.",
			health: Proc_healthtype.running,
		};
		
		this.processes.push(processDesc);
		processDesc.process.on('exit', (code, signal)=>{
			console.log(`Process exited with ${code} with signal ${signal}`);
			this.removeProcess(processDesc);
			processDesc.health = Proc_healthtype.stopped;
		});
		console.log("PM: process pushed successfully");
		return processDesc;
	}
	removeProcess(ProcessDesc) {
		//find the index
		const index = this.processes.indexOf(ProcessDesc);
		
		if(index !== -1) {
			this.processes.splice(index, 1);
		}
		console.log("PM: Process removed");
		
	}
	killProcess(ProcessDesc){
		//find the index
		const index = this.processes.indexOf(ProcessDesc);
		
		if(index !== -1) {
			this.processes.splice(index, 1);
		}

		ProcessDesc.pr.kill();
		
	}
	killAllProcesses() {
		this.processes.forEach((processD)=>{
			processD.process.kill();
		});
		this.processes = [];
	}
}


const PM = new ProcessManager();

console.log("creating new Process Manager");

console.log("Due to early development stage starting only server.js");

let start_process = true;
while(true){
	//console.log("checking to see if process should be started");
	if(start_process) {
		console.log("process has been stopped trying to restart");
		const childP = PM.startProcess('./server.js');
		start_process = (childP.health === Proc_healthtype.stopped && childP.keepRunning) ? true : false;
	console.log(`Started process: ${childP.desc}`);

	setTimeout(() => {
	}, 49999);
	}
}

