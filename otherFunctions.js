var lastClickedNode,
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
