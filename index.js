const express = require('express');
const bodyParser = require('body-parser');
const ProjectNode = require('./projectNode');

const DATA_TYPES = Object.freeze({
	PROJECT:'project',
	EXPENDITURE: 'expenditure',
	MILESTONE: 'milestone'
});

let lastProjectUUID = 0;
const generateProjectUUID = () => lastProjectUUID + 1;

const port = 18070+Math.floor(Math.random()*30);
console.log('starting node on ', port)
let node1 = new ProjectNode(port);
node1.init();

//const http_port = 3000+Math.floor(Math.random()*10);
const http_port = process.env.PORT || 3001;

let ProjectHTTP = function (){
	const app = new express();

	app.use(bodyParser.json());

	app.get('/addNode/:port', (req, res)=>{
		console.log('add host: '+req.params.port)
		node1.addPeer('localhost', req.params.port)
		res.send();
	})

	app.get('/spawnProject/:teammember', (req, res)=>{
		let newBlock = node1.createBlock(req.params.teammember);
		console.log('block created');
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
		console.log(node1.getStats());
		res.send();
	})

	app.post('/addExpenditure',(req,res) => {
		
	})

	app.post('/addMilestone',(req,res) => {
		
	})

	app.get('/projects',(req,res) => {
		
	})

	app.get('/projectData/:projectId',(req,res) => {
		
	})

	app.get('/expenditures/:projectId',(req,res) => {
		
	})

	app.get('/milestones/:projectId',(req,res) => {
		
	})

	app.listen(http_port, () => {
		console.log(`http server up.. ${http_port}`);
	})
}

let httpserver = new ProjectHTTP();