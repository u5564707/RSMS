/* Datastore schema
    Process: { _id, attributeNames: [] }
    Node:    { _id, parentID, processName }
    Sample:  { _id: { NodeID, SampleID }, attributes: [] }
*/

var Datastore = require('nedb')
  , db

function createTestData1() {
    db = new Datastore({ filename: 'testData1', autoload: true });

    // insert processes
    db.insert({ _id: "rootProcess", attributeNames: ["mass (mg)"] });
    db.insert({ _id: "DNA Extract", attributeNames: ["Date Extracted", "Kit", "Elution mL", "DNA ng", "Notes"] });

    // insert nodes
    db.insert({ _id: "rootNode", parentID: null, processName: "rootProcess" });
    db.insert({ _id: "node2", parentID: "rootNode", processName: "DNA Extract" });

    // insert samples
    db.insert({ _id: { nodeID: "rootNode", sampleID: "1" }, attributeData: ["50"] });
    db.insert({ _id: { nodeID: "rootNode", sampleID: "2" }, attributeData: ["55"] });
    db.insert({ _id: { nodeID: "rootNode", sampleID: "3" }, attributeData: ["80"] });
    db.insert({ _id: { nodeID: "rootNode", sampleID: "4" }, attributeData: ["60"] });
    db.insert({ _id: { nodeID: "node2", sampleID: "1" }, attributeData: ["12/3", "Qiagen", "160", "12", ""] });
    db.insert({ _id: { nodeID: "node2", sampleID: "2" }, attributeData: ["12/3", "Qiagen", "160", "18", ""] });
    db.insert({ _id: { nodeID: "node2", sampleID: "3" }, attributeData: ["12/3", "Qiagen", "80", "10", "Second elution failed, so only 80mL"] });
}

function createTestData2() {
    db = new Datastore({ filename: 'testData2', autoload: true });

    // insert processes
    db.insert({ _id: "rootProcess", attributeNames: ["mass (mg)"] });
    db.insert({ _id: "DNA Extract", attributeNames: ["Date Extracted", "Kit", "Elution mL", "DNA ng", "Notes"] });

    // insert nodes
    db.insert({ _id: "rootNode", parentID: null, processName: "rootProcess" });
    db.insert({ _id: "node2", parentID: "rootNode", processName: "DNA Extract" });
    db.insert({ _id: "node3", parentID: "rootNode", processName: "DNA Extract" });
    db.insert({ _id: "node4", parentID: "node3", processName: "DNA Extract" });

    // insert samples
    db.insert({ _id: { nodeID: "rootNode", sampleID: "1" }, attributeData: ["50"] });
    db.insert({ _id: { nodeID: "rootNode", sampleID: "2" }, attributeData: ["55"] });
    db.insert({ _id: { nodeID: "rootNode", sampleID: "3" }, attributeData: ["80"] });
    db.insert({ _id: { nodeID: "rootNode", sampleID: "4" }, attributeData: ["60"] });
    db.insert({ _id: { nodeID: "node2", sampleID: "1" }, attributeData: ["12/3", "Qiagen", "160", "12", ""] });
    db.insert({ _id: { nodeID: "node2", sampleID: "2" }, attributeData: ["12/3", "Qiagen", "160", "18", ""] });
    db.insert({ _id: { nodeID: "node2", sampleID: "3" }, attributeData: ["12/3", "Qiagen", "80", "10", "Second elution failed, so only 80mL"] });
    db.insert({ _id: { nodeID: "node3", sampleID: "1" }, attributeData: ["50"] });
    db.insert({ _id: { nodeID: "node3", sampleID: "2" }, attributeData: ["55"] });
    db.insert({ _id: { nodeID: "node3", sampleID: "3" }, attributeData: ["80"] });
    db.insert({ _id: { nodeID: "node3", sampleID: "4" }, attributeData: ["60"] });
    db.insert({ _id: { nodeID: "node4", sampleID: "1" }, attributeData: ["12/3", "Qiagen", "160", "12", ""] });
    db.insert({ _id: { nodeID: "node4", sampleID: "2" }, attributeData: ["12/3", "Qiagen", "160", "18", ""] });
    db.insert({ _id: { nodeID: "node4", sampleID: "3" }, attributeData: ["12/3", "Qiagen", "80", "10", "Second elution failed, so only 80mL"] });
}

// return the node with nodeID as a document
function getNode(nodeID, callback) {
    db.findOne({ _id: nodeID }, function(err, node) {
        callback(node);
    });
}

// return all child nodes of nodeID as an array of documents
function getNonRootNodes(nodeID, callback) {
    db.find({ parentID: { $exists: true }, _id: { $ne: "rootNode" } }, function(err, nodes) {
        callback(nodes);
    });
}

function getTreeConfig(callback) {
    getNode("rootNode", function (rootNode) {
        getNonRootNodes(rootNode._id, function(childNodes) {
            var chart_config = [
		        { container: "#tree" }
	        ];
	        
	        // define rootNode
            chart_config.push({
                text: { name: rootNode._id },
                HTMLid: rootNode._id
            });
            
            // define other nodes
            for (i=0; i<childNodes.length; i++) {
			    // search chart_config for childNodes[i]'s parent
			    for (j=1; j<chart_config.length; j++) {
				    if (childNodes[i].parentID == chart_config[j].HTMLid) {
					    chart_config.push({
						    parent: chart_config[j],
						    text: { name: childNodes[i]._id },
						    HTMLid: childNodes[i]._id,
						    HTMLclass: "sampleset"
					    });
				    }
			    }
		    }
		    
		    callback(chart_config);
	    });
    });
}

// return all attributeNames of a nodeID's process in a tabulator array structure
function getProcessAttributeNames(nodeID, callback) {
    db.findOne({ _id: nodeID }, function(err, node) {
        db.findOne({ _id: node.processName }, function(err, process) {
            var columns = [{ title: "Id", field: "id", editable: true, sorter: "string" }];
            for (i=0; i<process.attributeNames.length; i++) {
                columns.push({ title: process.attributeNames[i], field: process.attributeNames[i], editable: true, sorter: "string" });
            }
            callback(columns);
        });
    });
}

// return all samples with nodeID in a tabulator array structure
function getNodeSamples(nodeID, callback) {
    db.find({ "_id.nodeID": nodeID }, function(err, samples) {
        db.findOne({ _id: nodeID }, function(err, node) {
            db.findOne({ _id: node.processName }, function(err, process) {
                var sampleData = [];
                for (i=0; i<samples.length; i++) {
                    var sample = { id: samples[i]._id.sampleID }
                    for (j=0; j<process.attributeNames.length; j++) {
                        sample[process.attributeNames[j]] = samples[i].attributeData[j];
                    }
                    sampleData.push(sample);
                }
                callback(sampleData);
            });
        });
    });
}

//function updateNodeSamples(nodeID, sampleData) {
//
//}

function updateNodeSamples(sampleData) {
//db.insert(sampleData);
}