// Tomasz J Kocik (u5564707), ANU Techlauncher 2016

var projectOpened                    = false,
    samplesTableRowCount             = 1,
    attriTableRowCount               = 1,
    lastClickedNewProcessListElement = null,
    openedFileLocation,
    lastClickedNode,
    lastClickedProcess, // for process view
	lastClickedProcess2; // for main view

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

function getLastClickedProcess2(callback) {
	callback(lastClickedProcess);
}

function setLastClickedProcess2(process) {
	lastClickedProcess = process;
}