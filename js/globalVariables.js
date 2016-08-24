var projectOpened = false,
    openedFileLocation,
    lastClickedNode,
    lastClickedProcess,
    tableEdited = false;

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

function isTableEdited(callback) {
	callback(tableEdited);
}

function setTableEdited(edited) {
	tableEdited = edited;
}