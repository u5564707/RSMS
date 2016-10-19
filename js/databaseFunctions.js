// Tomasz J Kocik (u5564707) and Bo Shi, 2016

/* Datastore schema
	Process: { _id, attributeNames: [] }
	Node:    { _id, name, parentID, processName, dateTitle }
	Sample:  { _id, nodeID, sampleID, attr_1, attr_2, ... , attr_n }
*/


var Datastore = require('nedb'),
    db        = new Datastore({ filename : 'userData', autoload : true });

    deleteButton = function (value, data, cell, row, options) {
    	return "<button>x</button>";
    };

// replaces all documents of userData file with the root node and root process
function initialiseUserData() {
	var date = new Date();
	var todayString = date.ymdhm();
	console.log("emptying userData...");
	db.remove({}, { multi : true }, function () {
		console.log("emptied!");

		console.log("inserting 'Source samples' process...");
		db.insert({ _id : "Source samples", attributeNames : [] }, function () {
			console.log("inserted!");

			console.log("inserting 'rootNode' node...");
			db.insert({ _id : "rootNode", parentID : null, name : 'Source samples' ,processName : "Source samples",title: date.ymdhm()}, function () {
				console.log("inserted!");

				newProjectTest();

				initialProject();
			});
		});
	});
}

// copies all documents from file at sourceFileLocation to userData
function copyToUserData(sourceFileLocation) {
	console.log("emptying userData...");
	db.remove({}, { multi : true }, function (err, numRemoved) {
		console.log("removed " + numRemoved + " documents!");

		sourceFileDb = new Datastore({ filename : sourceFileLocation, autoload : true });

		sourceFileDb.find({}, function (err, sourceFileDocs) {
			console.log("copying documents from " + sourceFileLocation + " to userData...");
			db.insert(sourceFileDocs, function (err, newDocs) {
				console.log("copied " + newDocs.length + " documents!");

				openProjectTest(sourceFileLocation);

				initialProject();
			});
		});
	});
}

// copies all documents from userData to file at destinationFileLocation
function copyFromUserData(destinationFileLocation) {
	destinationFileDb = new Datastore({ filename : destinationFileLocation, autoload : true });

	console.log("emptying " + destinationFileLocation + "...");
	destinationFileDb.remove({}, { multi : true }, function (err, numRemoved) {
		console.log("removed " + numRemoved + " documents!");

		db.find({}, function (err, userDataDocs) {
			console.log("copying documents from userData to " + destinationFileLocation + "...");
			destinationFileDb.insert(userDataDocs, function (err, newDocs) {
				console.log("copied " + newDocs.length + " documents!");

				saveTest(destinationFileLocation);
			});
		});
	});
}

// return all descendants of node with nodeID in Treant JSON structure
function getChildNodes(nodeID, callback) {
	db.find({ parentID : nodeID }, function (err, nodes) {
		let children = [];

		if (nodes.length == 0) {
			callback(children);
		} else {
			for (let i = 0; i < nodes.length; i++) {
				children.push({ text : { name : nodes[i].name ,title:nodes[i].title}, HTMLid : nodes[i]._id });

				// recursively find grandchildren
				getChildNodes(nodes[i]._id, function (grandchildren) {
					children[i].children = grandchildren;

					callback(children);
				});
			}
		}
	});
}

// return Treant chart config in JSON structure
function getTreeConfig(callback) {

	let chart_config = {
		chart : { container : "#tree", rootOrientation: 'WEST' },
		nodeStructure : { HTMLid : "rootNode", text : { name : "Source samples" ,title:date.ymdhm()} }
	};

	getChildNodes(chart_config.nodeStructure.HTMLid, function (children) {
		chart_config.nodeStructure.children = children;

		console.log(tosource(chart_config));
		callback(chart_config);
	});
}

// return an array of all process IDs except the "Source samples"
function getAllProcessIDs(callback) {

	// find all process docs except "Source samples" - "attributeNames : { $exists : true }" wasn't working for some reason
	db.find({ parentID : { $exists : false }, nodeID : { $exists : false }, _id : { $ne : "Source samples" } },
			function (err, processIDs) {
		var processIDList = [];

		for (i=0; i<processIDs.length; i++) {
			processIDList[i] = processIDs[i]._id;
		}

		callback(processIDList);
	});
}

// return attributeNames of process with processID for the attributes table
function getAttributeNames(processID, callback) {
	db.findOne({ _id : processID }, function (err, process) {
		var tableData = [];

		for (var i = 0; i < process.attributeNames.length; i++) {
			tableData.push({ id : i, name : process.attributeNames[i] });
		}

		callback(tableData);
	});
}

// return all attributeNames of a nodeID's process in a tabulator column structure for the samples table
function getProcessAttributeNames(nodeID, callback) {
	db.findOne({ _id : nodeID }, function (err, node) {
		db.findOne({ _id : node.processName }, function (err, process) {
			var columns = [{ formatter : deleteButton, align : "center", width : 30,
				onClick : function (e, cell, val, data) {
			    	$("#samples-table").tabulator("deleteRow", data.id);
			    } }, { formatter : tickbox, width : 30, align : "center", onClick : function (e, cell, val, row) {
					var checkboxes = document.getElementById('myCheck');

			    	//alert("Printing row data for: " + row.id);
					//alert(document.getElementById("myCheck").id)
				}},
			];
			if (nodeID == "rootNode") {
				columns.push({ title : "Id", field : "id", sortable : true, sorter : "string",
					fitColumns : true, editable : true });
			} else {
				columns.push({ title : "Id", field : "id", sortable : true, sorter : "string",
					fitColumns : true, editable : false });
			}

			for (var i = 0; i < process.attributeNames.length; i++) {
				columns.push({ title : process.attributeNames[i], field : process.attributeNames[i],
					sortable : true, sorter : "string", fitColumns : true, editable : true, editableTitle : true });
			}

			callback(columns);
		});
	});
}

// return the name of a node with nodeID
function getNodeName(nodeID, callback) {
	db.findOne({ _id : nodeID }, function (err, node) {
		callback(node.name + '      '+ node.title);
	});
} 

// return all samples with nodeID in a tabulator array structure
function getNodeSamples(nodeID, callback) {
	db.find({ nodeID : nodeID }, function (err, samples) {
		var tableData = [];

		for (var i = 0; i < samples.length; i++) {
			var sample = { id : samples[i].sampleID };

			for (var key in samples[i]) {

				// make sure key is not metadata
				if (Object.prototype.hasOwnProperty.call(samples[i], key) && key != "_id" && key != "nodeID"
						&& key != "sampleID") {
					sample[key] = samples[i][key];
				}
			}

			tableData.push(sample);
		}

		callback(tableData);
	});
}

// update the process of nodeID given tabulator tableColumns
function updateProcess(nodeID, tableColumns) {
	var columns = [];

	for (i = 3; i < tableColumns.length; i++) { // i = 3 since the first 3 cols are not attributes
		columns.push(tableColumns[i].title);
	}

	db.findOne({ _id : nodeID }, function (err, node) {
		db.update({ _id : node.processName }, { attributeNames : columns }, {});
	});
}

// update samples with nodeID given tabulator tableData
function updateNodeSamples(nodeID, tableData) {

	// remove all samples with nodeID
	db.remove({ nodeID : nodeID }, { multi : true }, function (err, numRemoved) {

		// insert sample documents
		for (var i = 0; i < tableData.length; i++) {
			var sample = { nodeID : nodeID, sampleID : tableData[i].id };

			for (var key in tableData[i]) {
				if (Object.prototype.hasOwnProperty.call(tableData[i], key) && key != "_id" && key != "id") {
					sample[key] = tableData[i][key];
				}
			}

			db.insert(sample);
		}
	});
}

// add a process with no attributes
function addProcess(processName) {
	db.insert({ _id : processName, attributeNames : [] });
}

// update the process' attributeNames with attributeNames
function updateProcessAttributes(processName, tableData) {
	var attributeNames = [];

	for (var i = 0; i < tableData.length; i++) {
		attributeNames[i] = tableData[i].name;
	}

	db.update({ _id : processName }, { $set: { attributeNames : attributeNames } });
}

// adds new node and samples
function processSamples(processName, parentID, sampleIDs) {
	var date = new Date();
	var todayString = date.ymdhm();
	db.find({ processName : processName }, function (err, docs) {
		name = processName + (docs.length + 1);
		
		db.insert({ parentID : parentID, name : name, processName : processName,title: date.ymdhm()}, function (err, newNode) {
			for (let i = 0; i < sampleIDs.length; i++) {
				db.insert({ nodeID : newNode._id, sampleID : sampleIDs[i] });
			}
			
			initialProject();
		});
	});
}
