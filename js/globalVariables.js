var openedFileLocation,
    lastClickedNode,
    tableEdited = false;

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

function getOpenedFileLocation(callback) {
  callback(openedFileLocation);
}

function setOpenedFileLocation(location) {
  openedFileLocation = location;
}