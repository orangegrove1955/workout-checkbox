
// Run on page load
document.addEventListener('DOMContentLoaded', function () {
  document.getElementById("enter").addEventListener("click", addNewRow);
  document.getElementById("clear").addEventListener("click", clear);
  document.getElementById("add").addEventListener("click", openAdd);
  document.getElementById('cancel').addEventListener("click", closeAdd);
  document.getElementById('new-set').addEventListener("click", addSet);
  loadElements();
});

/** Open modal to add new exercise */
function openAdd() {
  document.getElementById('entry').className = 'is-visible';
}

/** Close modal */
function closeAdd() {
  document.getElementById('entry').className = 'not-visible';
  resetEntry();
}

/** Get user input and set values to storage */
function addNewRow() {
  let key = document.getElementById('exercise').value;
  if (key == '' || key == ' ') {
    alert("Please enter an exercise value");
  }
  else {
    let values = [];
    for (let i = 1; i <= document.getElementsByClassName('set').length; i++) {
      values.push(document.getElementById('set' + i).value);
    }
    setToStorage(key, values);
    loadElements();
    closeAdd();
  }
}

/** Set value into storage */
function setToStorage(key, values) {
  let obj = {};
  obj[key] = values;
  chrome.storage.sync.set(obj);
}

/** Load each element from storage into the table */
function loadElements() {
  let max = 0;
  chrome.storage.sync.get(result => {
    // Get all keys in storage and map over them
    let keys = Object.keys(result);
    // If no keys, don't build table
    if (!keys.length) {
      return;
    }
    keys.map((key) => {
      // Create new row
      let row = document.createElement('tr');
      row.id = key + "-row";
      // Add name to start of row
      let name = document.createElement('td');
      name.innerHTML = key;
      row.append(name);

      // Map over each set and create data element
      result[key].map((item, index) => {
        if (item) {
          if (index > max) {
            max = index;
          }
          let data = document.createElement('td');
          data.innerHTML = '<input type="checkbox"> ' + item;
          row.append(data);
        }
      });

      // Add delete button to row
      let del = document.createElement('button');
      del.innerText = 'Delete';
      del.id = key;
      del.addEventListener('click', deleteRow);
      row.append(del);

      document.getElementById('all').append(row);
    });

    // Create header row
    // TODO: Fix so doesn't show on empty storage
    let tableHead = document.getElementById('head');
    if (!tableHead.innerHTML) {
      let head = document.createElement('tr');
      head.innerHTML = '<th>Exercise</th>';
      for (let i = 1; i <= max + 1; i++) {
        head.innerHTML += '<th>Set ' + i + "</th>";
      }
      tableHead.append(head);
    }
  })
}

/** Add a new set line for inputs */
function addSet() {
  let count = document.getElementsByClassName('input-row').length;
  let newSet = document.createElement('div');
  newSet.className = 'set';
  newSet.innerHTML = `
  <div class="input-row">
    <label for="set${count}">Set ${count}</label>
    <input type="text" id="set${count}">
  </div>`;
  document.getElementById('inputs').append(newSet);
}

/* ============================== REMOVALS ============================= */

/** Remove a row from the page */
function deleteRow(e) {
  deleteFromDOM(e.path[1]);
  deleteFromStorage(e.path[0].id);
}

/** Remove element from the DOM so it is no longer visible */
function deleteFromDOM(element) {
  element.parentNode.removeChild(element);
}

/** Remove exercise from storage */
function deleteFromStorage(key) {
  chrome.storage.sync.remove(key);
}

/** Clear all storage */
function clear() {
  chrome.storage.sync.clear();
  deleteFromDOM(document.getElementById('all'));
}

/** Reset entry layout */
function resetEntry() {
  document.getElementById('inputs').innerHTML =
  `<div class="input-row">
    <label for="set1">Set 1</label>
    <input type="text" id="set1">
  </div>
  <div class="input-row">
    <label for="set2">Set 2</label>
    <input type="text" id="set2">
  </div>
  <div class="input-row">
    <label for="set3">Set 3</label>
    <input type="text" id="set3">
  </div>`;
}