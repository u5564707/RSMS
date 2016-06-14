var nodeID;

function getNodeId(callback) {
  callback(nodeID);
}

function setNodeId(id) {
  nodeID = id;
}

function runUnitTests() {

  // create root node tests
  createRootNode();
  db.findOne({ _id: "rootNode" }, function(err, node) {
    if (err) {
      console.log("rootNode test failed!");
    } else {
      console.log("rootNode test passed!");
    }
  });
  db.findOne({ _id: "rootProcess" }, function(err, process) {
    if (err) {
      console.log("rootProcess test failed!");
    } else {
      console.log("rootProcess test passed!");
    }
  });

  // process samples tests
  processSamples("testProcess", "rootNode", "1,2");
  db.findOne({ _id: "testProcess" }, function(err, node) {
    if (err) {
      console.log("new process test failed!");
    } else {
      console.log("new process test passed!");
    }
  });
  db.findOne({ parentID: "rootNode" }, function(err, node) {
    if (err) {
      console.log("new node test failed!");
    } else {
      console.log("new node test passed!");
    }
    setNodeId(node._id);
  });
  db.findOne({ _id: "1" }, function(err, node) {
    if (err) {
      console.log("new sample test 1 failed!");
    } else {
      console.log("new sample test 1 passed!");
    }
  });
  db.findOne({ _id: "2" }, function(err, node) {
    if (err) {
      console.log("new sample test 2 failed!");
    } else {
      console.log("new sample test 2 passed!");
    }
  });
}

// uncomment to run unit tests
//runUnitTests();
