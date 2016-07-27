/* Datastore schema
  Process: { _id, attributeNames: [] }
  Node:    { _id, parentID, processName }
  Sample:  { _id: { NodeID, SampleID }, attr_1, attr_2, ... , attr_n }
*/

var Datastore = require('nedb'),
    db;

// creates first node
function createRootNode() {
  db = new Datastore({ filename: 'userData', autoload: true });

  db.insert({ _id: "rootProcess", attributeNames: [] });
  db.insert({ _id: "rootNode", parentID: null, processName: "rootProcess" });
}

// creates dummy datastore for testing
function createTestData() {
  db = new Datastore({ filename: 'testData', autoload: true });
  db.remove({}, { multi: true });

  // insert processes
  db.insert({ _id: "rootProcess", attributeNames: ["mass (mg)"] });
  db.insert({ _id: "DNA Extract", attributeNames: ["Date Extracted", "Kit", "Elution mL", "DNA mg", "Notes"] });

  // insert nodes
  db.insert({ _id: "rootNode", parentID: null, processName: "rootProcess" });
  db.insert({ _id: "node2", parentID: "rootNode", processName: "DNA Extract" });
  db.insert({ _id: "node3", parentID: "rootNode", processName: "DNA Extract" });
  db.insert({ _id: "node4", parentID: "node3", processName: "DNA Extract" });

  // insert samples
  db.insert({ _id: { nodeID: "rootNode", sampleID: "1" }, "mass (mg)": "50" });
  db.insert({ _id: { nodeID: "rootNode", sampleID: "2" }, "mass (mg)": "55" });
  db.insert({ _id: { nodeID: "rootNode", sampleID: "3" }, "mass (mg)": "80" });
  db.insert({ _id: { nodeID: "rootNode", sampleID: "4" }, "mass (mg)": "60" });
  db.insert({ _id: { nodeID: "node2", sampleID: "1" }, "Date Extracted": "12/3",
              Kit: "Qiagen", "Elution mL": "160", "DNA mg": "12", Notes: "" });
  db.insert({ _id: { nodeID: "node2", sampleID: "2" }, "Date Extracted": "12/3",
              Kit: "Qiagen", "Elution mL": "160", "DNA mg": "18", Notes: "" });
  db.insert({ _id: { nodeID: "node2", sampleID: "3" }, "Date Extracted": "12/3",
              Kit: "Qiagen", "Elution mL": "80", "DNA mg": "10", Notes: "Second elution failed, so only 80mL" });
  db.insert({ _id: { nodeID: "node3", sampleID: "1" }, "Date Extracted": "12/3",
              Kit: "Qiagen", "Elution mL": "160", "DNA mg": "12", Notes: "" });
  db.insert({ _id: { nodeID: "node3", sampleID: "2" }, "Date Extracted": "12/3",
              Kit: "Qiagen", "Elution mL": "160", "DNA mg": "18", Notes: "" });
  db.insert({ _id: { nodeID: "node3", sampleID: "3" }, "Date Extracted": "12/3",
              Kit: "Qiagen", "Elution mL": "80", "DNA mg": "10", Notes: "Second elution failed, so only 80mL" });
  db.insert({ _id: { nodeID: "node4", sampleID: "1" }, "Date Extracted": "12/3",
              Kit: "Qiagen", "Elution mL": "160", "DNA mg": "12", Notes: "" });
  db.insert({ _id: { nodeID: "node4", sampleID: "2" }, "Date Extracted": "12/3",
              Kit: "Qiagen", "Elution mL": "160", "DNA mg": "18", Notes: "" });
  db.insert({ _id: { nodeID: "node4", sampleID: "3" }, "Date Extracted": "12/3",
              Kit: "Qiagen", "Elution mL": "80", "DNA mg": "10", Notes: "Second elution failed, so only 80mL" });
}

// return the node with nodeID as a document
function getNode(nodeID, callback) {
  db.findOne({ _id: nodeID }, function(err, node) {
    callback(node);
  });
}

// return the child nodes of nodeID as an array of documents
function getChildNodes(nodeID, callback) {
  db.find({ parentID: nodeID }, function(err, nodes) {
    children = [];
    for (i=0; i<nodes.length; i++) {
      children.push({
        text: { name: nodes[i].processName },
        HTMLid: nodes[i]._id
      });
      getChildNodes(nodes[i]._id, function(grandChildren) {
        children.push({
          children: grandChildren
        });
      });
    }
    callback(children);
  });
}

function getTreeConfig(callback) {
  var chart_config = {
    chart: {
      container: "#tree"
    },
    nodeStructure: {
      text: { name: "rootProcess" },
      HTMLid: "rootNode"
    }
  };

  getChildNodes("rootNode", function(childNodes) {
    chart_config.nodeStructure.children = childNodes;
    callback(chart_config);
  });
}

// return all attributeNames of a nodeID's process in a tabulator array structure
function getProcessAttributeNames(nodeID, callback) {
  db.findOne({ _id: nodeID }, function(err, node) {
    db.findOne({ _id: node.processName }, function(err, process) {
      var columns = [];
      if (nodeID == "rootNode") {
        columns.push({ title: "Id", field: "id", sortable: true, sorter: "string",
                       fitColumns: true, editable: true });
      } else {
        columns.push({ title: "Id", field: "id", sortable: true, sorter: "string",
                       fitColumns: true, editable: false });
      }
      for (i=0; i<process.attributeNames.length; i++) {
        columns.push({ title: process.attributeNames[i], field: process.attributeNames[i],
                       sortable: true, sorter: "string", fitColumns: true, editable: true });
      }
      callback(columns);
    });
  });
}

// return all samples with nodeID in a tabulator array structure
function getNodeSamples(nodeID, callback) {
  db.find({ "_id.nodeID": nodeID }, function(err, samples) {
    var tableData = [];
    for (i=0; i<samples.length; i++) {
      var sample = { id: samples[i]._id.sampleID };
      for (var key in samples[i]) {
        // make sure key is not metadata
        if (Object.prototype.hasOwnProperty.call(samples[i], key) && key != "_id") {
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
  for (i=1; i<tableColumns.length; i++) {
    columns.push(tableColumns[i].title);
  }
  db.findOne({ _id: nodeID }, function(err, node) {
    db.update({ _id: node.processName }, { attributeNames: columns }, {});
  });
}

// update samples with nodeID given tabulator tableData
function updateNodeSamples(nodeID, tableData) {

  // remove all samples with nodeID
  db.remove({ "_id.nodeID": nodeID }, { multi: true });

  // insert sample documents
  for (i=0; i<tableData.length; i++) {
    var sample = { _id: { nodeID: nodeID, sampleID: tableData[i].id } };
    for (var key in tableData[i]) {
      if (Object.prototype.hasOwnProperty.call(tableData[i], key) && key != "id") {
        sample[key] = tableData[i][key];
      }
    }
    db.insert(sample);
  }
}

function processSamples(processName, parentID, samplesString) {
  db.insert({ _id: processName, attributeNames: [] });
  db.insert({ parentID: parentID, processName: processName }, function(err, newNode) {
    var sampleIDs = samplesString.split(',');
    for (i=0; i<sampleIDs.length; i++) {
      db.insert({ _id: { nodeID: newNode._id, sampleID: sampleIDs[i] } });
    }
  });
}
