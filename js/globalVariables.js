var projectOpened = false,
    openedFileLocation,
    lastClickedNode,
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

function isTableEdited(callback) {
	callback(tableEdited);
}

function setTableEdited(edited) {
	tableEdited = edited;
}