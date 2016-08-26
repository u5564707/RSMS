var projectOpened        = false,
    samplesTableRowCount = 1,
    attriTableRowCount   = 1,
    openedFileLocation,
    lastClickedNode,
    lastClickedProcess;

function getOpenedFileLocation(callback) {
	callback(openedFileLocation);
}

function setOpenedFileLocation(location) {
	openedFileLocation = location;
}

function getLastClickedNode(callback) {
	callback(lastClickedNode);
}

function setLastClickedNode(node) {
	lastClickedNode = node;
}

function getLastClickedProcess(callback) {
	callback(lastClickedProcess);
}

function setLastClickedProcess(process) {
	lastClickedProcess = process;
}