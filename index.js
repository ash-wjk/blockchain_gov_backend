const express = require('express');
const bodyParser = require('body-parser');
const ProjectNode = require('./projectNode');

const DATA_TYPES = Object.freeze({
	PROJECT:'project',
	EXPENDITURE: 'expenditure',
	MILESTONE: 'milestone'
});

let lastProjectUUID = 0;
const generateProjectUUID = () => {
	lastProjectUUID ++;
	return `p${lastProjectUUID}`;
};

//p2p test on localhost
// const port = 18070+Math.floor(Math.random()*30);
// const http_port = 3000+Math.floor(Math.random()*10);

const port = 18097;
const http_port = process.env.PORT || 3001;

console.log('starting node on ', port)
let node1 = new ProjectNode(port);
node1.init();

let ProjectHTTP = function (){
	const app = new express();

	app.use(bodyParser.json());

	app.use(function(req, res, next) {
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
		next();
	  });

	app.get('/addNode/:host/:port', (req, res)=>{
		console.log(`add host: ${req.params.host} port: ${req.params.port}`)
		node1.addPeer(req.params.host, req.params.port)
		res.send();
	})

	app.post('/addProject',(req,res) => {
		const projectId = generateProjectUUID();
		
		const record = {
			projectId,
			...req.body
		};

		const blockData = {
			type:DATA_TYPES.PROJECT,
			record,
		}

		node1.createBlock(blockData);
		res.send();
	})

	app.post('/addExpenditure',(req,res) => {
		const blockData = {
			type:DATA_TYPES.EXPENDITURE,
			record:req.body,
		}

		node1.createBlock(blockData);
		res.send();
	})

	app.post('/addMilestone',(req,res) => {
		const record = {
			completionDate: new Date(),
			...req.body
		};

		const blockData = {
			type:DATA_TYPES.MILESTONE,
			record,
		}

		node1.createBlock(blockData);
		console.log(node1.getStats());
		res.send();
		
	})

	app.get('/projects',(req,res) => {

		const chain = node1.getChain();
		const projects = [];

		chain.forEach(block => {
			if(block.data.type === DATA_TYPES.PROJECT){
				const project = {
					id:block.data.record.projectId,
					name: block.data.record.projectName,
				}
				projects.push(project);
			}
		});

		res.json(projects);
		
	})

	app.get('/projectData/:projectId',(req,res) => {

		const projectId = req.params.projectId;
		const chain = node1.getChain();

		let projectRecord;
		const expenditureRecords = [];
		const milestoneRecords = [];
		

		for (let index = 0; index < chain.length; index++) {
			const block = chain[index];
			
			if(block.data.type === DATA_TYPES.PROJECT &&  block.data.record.projectId === projectId){
				projectRecord = block.data.record;		
			}

			if(block.data.type === DATA_TYPES.EXPENDITURE &&  block.data.record.projectId === projectId){
				expenditureRecords.push(block.data.record);
			}

			if(block.data.type === DATA_TYPES.MILESTONE &&  block.data.record.projectId === projectId){
				milestoneRecords.push(block.data.record);
			}
		}

		projectRecord.projectExpenditures = expenditureRecords;

		projectRecord.projectMilestones.forEach(milestone => {
			 const milestoneRecord = milestoneRecords.find(record => record.id === milestone.id);
			 if(milestoneRecord){
				 milestone.completionDate = milestoneRecord.completionDate;
			 }
		});

		const project = {
			id:projectRecord.projectId,
			name: projectRecord.projectName,
			description: projectRecord.projectDescription,
			budget: projectRecord.projectBudget,
			startDate: projectRecord.projectStartDate,
			endDate: projectRecord.projectEndDate,
			milestones: projectRecord.projectMilestones,
			expenditures: projectRecord.projectExpenditures,
		}

		res.json(project);
	})

	app.listen(http_port, () => {
		console.log(`http server up.. ${http_port}`);
	})
}

let httpserver = new ProjectHTTP();