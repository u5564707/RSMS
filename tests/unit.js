// Tomasz J Kocik (u5564707), ANU Techlauncher 2016

function newProjectTest() {
	testDb = new Datastore({ filename: 'userData', autoload: true });

	testDb.find({}, function (err, userDataDocs) {
		
		// tests if userData contains exactly 2 documents
		if (userDataDocs.length != 2) {
			console.log("'New Project' test failed: userData does not contain exactly 2 documents");
		} else {
			
			// tests if the documents are the root node and process documents
			if (!((userDataDocs[0]._id == "rootNode" && userDataDocs[0].parentID == null && userDataDocs[0].processName == "Source samples"
					&& userDataDocs[1]._id == "Source samples" && userDataDocs[1].attributeNames == "")
					|| (userDataDocs[0]._id == "Source samples" && userDataDocs[0].attributeNames == ""
					&& userDataDocs[1]._id == "rootNode" && userDataDocs[1].parentID == null && userDataDocs[1].processName == "Source samples"))) {
				console.log("'New Project' test failed: userData contains at least 1 incorrect document");
			} else {
				console.log("New Project test passed!");
			}
		} 
	});
}

function openProjectTest(location) {
	sourceFileDb = new Datastore({ filename: location, autoload: true });
	userDataDb = new Datastore({ filename: 'userData', autoload: true });
	
	sourceFileDb.find({}, function (err, sourceFileDocs) {
		userDataDb.find({}, function (err, userDataDocs) {
			
			// tests if userData and the opened file have the same number of documents
			if (sourceFileDocs.length != userDataDocs.length) {
				console.log("'Open Project' test failed: the opened file does not contain the same number of documents that userData contains");
			} else {
				
				// tests if each document id in the opened file is in userData
				for (i=0; i<sourceFileDocs.length; i++) {
					var matchFound = false;
					
					for (j=0; j<userDataDocs.length; j++) {
						if (sourceFileDocs[i]._id == userDataDocs[j]._id
								|| (sourceFileDocs[i]._id.nodeID == userDataDocs[j]._id.nodeID
								&& sourceFileDocs[i]._id.sampleID == userDataDocs[j]._id.sampleID)) {
							matchFound = true;
						}
					}
					
					if (!matchFound) {
						console.log("'Open Project' test failed: userData does not contain all documents that the opened file contains");
						callback();
					}
				}
			
				console.log("'Open Project' test passed!");
			}
		});
	});
}

// test for both 'Save' and 'Save As'
function saveTest(location) {
	userDataDb = new Datastore({ filename: 'userData', autoload: true });
	destinationFileDb = new Datastore({ filename: location, autoload: true });

	userDataDb.find({}, function (err, userDataDocs) {
		destinationFileDb.find({}, function (err, destinationFileDocs) {
			
			// tests if userData and the opened file have the same number of documents
			if (userDataDocs.length != destinationFileDocs.length) {
				console.log("'Save Project' test failed: the saved file does not contain the same number of documents that userData contains");
			} else {
				
				// tests if each document id in userData is in the saved file
				for (i=0; i<userDataDocs.length; i++) {
					var matchFound = false;
					
					for (j=0; j<destinationFileDocs.length; j++) {
						if (userDataDocs[i]._id == destinationFileDocs[j]._id
								|| (userDataDocs[i]._id.nodeID == destinationFileDocs[j]._id.nodeID
								&& userDataDocs[i]._id.sampleID == destinationFileDocs[j]._id.sampleID)) {
							matchFound = true;
						}
					}
					
					if (!matchFound) {
						console.log("'Save Project' test failed: the saved file does not contain all documents that userData contains", function () {
							callback();
						});
					}
				}
			
				console.log("'Save Project' test passed!");
			}
		});
	});
}