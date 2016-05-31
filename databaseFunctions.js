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

// return all attribute names from the process of nodeID as an array
function getProcessAttributeNames(nodeID, callback) {
    db.findOne({ _id: nodeID }, function(err, node) {
        db.findOne({ _id: node.processName }, function(err, process) {
            callback(process.attributeNames);
        });
    });
}

// return all samples with nodeID in tabulator structure (only returns ids for now)
function getNodeSamples(nodeID, callback) {
    db.find({ "_id.nodeID": nodeID }, function(err, samples) {
        db.findOne({ _id: nodeID }, function(err, node) {
            db.findOne({ _id: node.processName }, function(err, process) {
                var sampleData = [];
                for (i=0; i<samples.length; i++) {
                    var sample = {
                        id: samples[i]._id.sampleID
                    }
                    sampleData.push(sample);
                }
                callback(sampleData);
            });
        });
    });
}

