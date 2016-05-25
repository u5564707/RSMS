/* Datastore schema
    Process: { _id, attributeNames: [] }
    Node:    { _id, parentID, processName }
    Sample:  { _id: { NodeID, SampleID }, attributes: [] }
*/

var Datastore = require('nedb')
  , db

function createDummyDatastore() {
    db = new Datastore({ filename: 'datastore', autoload: true });

    // insert processes
    db.insert({ _id: "rootProcess", attributeNames: ["mass (mg)"] });
    db.insert({ _id: "DNA Extract", attributeNames: ["Date Extracted", "Kit", "Elution mL", "DNA ng", "Notes"] });

    // insert nodes
    db.insert({ _id: "rootNode", parentID: null, processName: "rootProcess" });
    db.insert({ _id: "node2", parentID: "rootNode", processName: "DNA Extract" });

    // insert samples
    db.insert({ _id: { nodeID: "rootNode", sampleID: "1" }, attributes: ["50"] });
    db.insert({ _id: { nodeID: "rootNode", sampleID: "2" }, attributes: ["55"] });
    db.insert({ _id: { nodeID: "rootNode", sampleID: "3" }, attributes: ["80"] });
    db.insert({ _id: { nodeID: "rootNode", sampleID: "4" }, attributes: ["60"] });
    db.insert({ _id: { nodeID: "node2", sampleID: "1" }, attributes: ["12/3", "Qiagen", "160", "12", ""] });
    db.insert({ _id: { nodeID: "node2", sampleID: "2" }, attributes: ["12/3", "Qiagen", "160", "18", ""] });
    db.insert({ _id: { nodeID: "node2", sampleID: "3" }, attributes: ["12/3", "Qiagen", "80", "10", "Second elution failed, so only 80mL"] });
}

// return all attribute names from the process of nodeID as an array
function getProcessAttributeNames(nodeID, callback) {
    db.findOne({ _id: nodeID }, function(err, node) {
        db.findOne({ _id: node.processName }, function(err, process) {
            callback(process.attributeNames);
        });
    });
}

// return all nodes as an array of documents
function getAllNodes(callback) {
    db.find({ parentID: { $exists: true } }, function(err, nodes) {
        callback(nodes);
    });
}

// return the node with nodeID as a document
function getNode(nodeID, callback) {
    db.findOne({ _id: nodeID }, function(err, node) {
        callback(node);
    });
}

// return all child nodes of nodeID as an array of documents
function getChildNodes(nodeID, callback) {
    db.find({ parentID: nodeID }, function(err, nodes) {
        callback(nodes);
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

