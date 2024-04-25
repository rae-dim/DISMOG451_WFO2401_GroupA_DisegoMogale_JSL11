// TASK: import helper functions from utils
// TASK: import initialData

import {initialData} from "./initialData.js"
import {getTasks, createNewTask, patchTask, putTask, deleteTask} from "./utils/taskFunctions.js"
/*************************************************************************************************************************************************
 * FIX BUGS!!!
 * **********************************************************************************************************************************************/

// Function checks if local storage already has data, if not it loads initialData to localStorage
function initializeData() {
  if (!localStorage.getItem('tasks')) {
    localStorage.setItem('tasks', JSON.stringify(initialData)); 
    localStorage.setItem('showSideBar', 'true')
  } else {
    console.log('Data already exists in localStorage');
  }
}
initializeData();

// TASK: Get elements from the DOM
/* elements were retrieved using the search function. since "elements" is an object, searching for "element." would
find the relevant elements  */
const elements = {
  headerBoardName: document.getElementById("header-board-name"),
  columnDivs: document.querySelectorAll(".column-div"),
  editTaskModal: document.querySelector(".edit-task-modal-window"),
  filterDiv: document.getElementById("filterDiv"),
  hideSideBarBtn: document.getElementById("hide-side-bar-btn"),
  showSideBarBtn: document.getElementById("show-side-bar-btn"),
  themeSwitch: document.getElementById("switch"),
  createNewTaskBtn: document.getElementById("add-new-task-btn"),
  modalWindow: document.getElementById("new-task-modal-window"),
  
}

let activeBoard = ""

// Extracts unique board names from tasks
// TASK: FIX BUGS
function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks() || []; //in case tasks in empty, we are preventing an error by initializing an empty array in that case
  const boards = [...new Set(tasks.map(task => task.board).filter(Boolean))];
  displayBoards(boards);
  if (boards.length > 0) {
    const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard"))
    activeBoard = localStorageBoard ? localStorageBoard :  boards[0]; //if board is empty, boards[0] would cause an error
    elements.headerBoardName.textContent = activeBoard
    styleActiveBoard(activeBoard)
    refreshTasksUI
    } 
 }

  

// Creates different boards in the DOM
// TASK: Fix Bugs
function displayBoards(boards) {
  const boardsContainer = document.getElementById("boards-nav-links-div");
  boardsContainer.innerHTML = ''; 
  boards.forEach(board => {
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");
    boardElement.addEventListener("click", () => { //added an event listener
      elements.headerBoardName.textContent = board;
      filterAndDisplayTasksByBoard(board);
      activeBoard = board //assigns active board
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard))
      styleActiveBoard(activeBoard)
    });
    boardsContainer.appendChild(boardElement);
  });

}

const columns = {
  todo: "TODO",
  doing: "DOING",
  done: "DONE"
}

// Filters tasks corresponding to the board name and displays them on the DOM.
// TASK: Fix Bugs
function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks(); // Fetch tasks from a simulated local storage function
  const filteredTasks = tasks.filter(task => task.board === boardName); //"===" should be used for comparisson instead of "=" to avoid unintentionally altering data

  // Ensure the column titles are set outside of this function or correctly initialized before this function runs

  elements.columnDivs.forEach(column => {
    const status = column.getAttribute("data-status");
    // Reset column content while preserving the column title
    const colmunTitles = columns[status]
    column.innerHTML = `<div class="column-head-div">
                          <span class="dot" id="${status}-dot"></span>
                          <h4 class="columnHeader">${colmunTitles}</h4>
                        </div>`;

    const tasksContainer = document.createElement("div");
    column.appendChild(tasksContainer);

    filteredTasks.filter(task => task.status === status).forEach(task => {  //"===" should be used for comparisson instead of "=" to avoid unintentionally altering data
      const taskElement = document.createElement("div");
      taskElement.classList.add("task-div");
      taskElement.textContent = task.title;
      taskElement.setAttribute('data-task-id', task.id);

      // Listen for a click event on each task and open a modal
      taskElement.addEventListener("click", () => { 
        openEditTaskModal(task);
      });

      tasksContainer.appendChild(taskElement);
    });
  });
}


function refreshTasksUI() {
  filterAndDisplayTasksByBoard(activeBoard);
}

// Styles the active board by adding an active class
// TASK: Fix Bugs
function styleActiveBoard(boardName) {
  document.querySelectorAll('.board-btn').forEach(btn => { //the correct method is forEach not foreach
    
    if(btn.textContent === boardName) {
      btn.classList.add('active') 
    }
    else {
      btn.classList.remove('active'); //Correct method to remove class is to use .classlist.remove(). the classList property of a DOM element is used to manipulate its CSS classes
    }
  });
}


function addTaskToUI(task) {
  const column = document.querySelector(`.column-div[data-status="${task.status}"]`); 
  if (!column) {
    console.error(`Column not found for status: ${task.status}`);
    return;
  }

  let tasksContainer = column.querySelector('.tasks-container');
  if (!tasksContainer) {
    console.warn(`Tasks container not found for status: ${task.status}, creating one.`);
    tasksContainer = document.createElement('div');
    tasksContainer.className = 'tasks-container';
    column.appendChild(tasksContainer);
  }

  const taskElement = document.createElement('div');
  taskElement.className = 'task-div';
  taskElement.textContent = task.title; // Modify as needed
  taskElement.setAttribute('data-task-id', task.id);
  
  tasksContainer.appendChild(taskElement); //append task element
}



function setupEventListeners() {
  // Cancel editing task event listener
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  cancelEditBtn.addEventListener("click", () => toggleModal(false, elements.editTaskModal));

  // Cancel adding new task event listener
  const cancelAddTaskBtn = document.getElementById('cancel-add-task-btn');
  cancelAddTaskBtn.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Clicking outside the modal to close it
  elements.filterDiv.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Show sidebar event listener
  elements.hideSideBarBtn.addEventListener("click", () => toggleSidebar(false));
  elements.showSideBarBtn.addEventListener("click", () => toggleSidebar(true));

  // Theme switch event listener
  elements.themeSwitch.addEventListener('change', toggleTheme);

  // Show Add New Task Modal event listener
  elements.createNewTaskBtn.addEventListener('click', () => {
    toggleModal(true);
    elements.filterDiv.style.display = 'block'; // Also show the filter overlay
  });

  // Add new task form submission event listener
  elements.modalWindow.addEventListener('submit',  (event) => {
    addTask(event)
  });
}

// Toggles tasks modal
// Task: Fix bugs
function toggleModal(show, modal = elements.modalWindow) {
  const shouldShow = Boolean(show);
  modal.style.display = shouldShow ? 'block' : 'none'; 
}

/*************************************************************************************************************************************************
 * COMPLETE FUNCTION CODE
 * **********************************************************************************************************************************************/

function addTask(event) {  //functio adds new tasks based on the users input
  event.preventDefault();  //allows custom handling of the form data by preventing default form submissions

  //Assign user input to the task object
    const task = {
      // retrieves input feild values and creates a task object
      title: document.getElementById("title-input").value,
      board: elements.headerBoardName.textContent,
      status: document.getElementById("select-status").value,
      description: document.getElementById("desc-input").value, 
      
    };
    const newTask = createNewTask(task);
    if (newTask) {
      addTaskToUI(newTask); //if a new task is successfully created using the createNewTask function, it is added to the user interface
      toggleModal(false);
      elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
      event.target.reset();
      refreshTasksUI(); //updates the display of the board to reflect the new added tassk
    }
}


function toggleSidebar(show) {
  const sidebar = document.getElementById("side-bar-div");
  
  sidebar.style.display = show ? "block" : "none"; //the sidebar is rendered as a block-level element, thus making it visible else it is hidden
  elements.showSideBarBtn.style.display = show? "none" : "block"; //while the sidebar is in display, the button is hidden, else it is displayed
  
} 

function toggleTheme() {
  const lightThemeEnabled = elements.themeSwitch.checked; 
  const themeState = lightThemeEnabled ? 'enabled' : 'disabled'; 
  
  localStorage.setItem('light-theme', themeState);
 
  if (lightThemeEnabled) {
    document.body.classList.add('light-theme');
  } else {
    document.body.classList.remove('light-theme');
  }
}


function openEditTaskModal(task) {
  // Set task details in modal inputs
  const title = document.getElementById('edit-task-title-input');
  const description = document.getElementById('edit-task-desc-input');
  const status = document.getElementById('edit-select-status');

  title.value = task.title;
  description.value = task.description;
  status.value = task.status;

  // Get button elements from the task modal
  const saveTaskChangesBtn = document.getElementById("save-task-changes-btn")
  const deleteTaskbtn = document.getElementById("delete-task-btn");

  // Call saveTaskChanges upon click of Save Changes button
  saveTaskChangesBtn.addEventListener('click', function saveTask(){
    saveTaskChanges(task.id);
    saveTaskChangesBtn.removeEventListener('click', saveTask); // Remove event listener to avoid duplication
  }); //!come back!!

  // Delete task using a helper function and close the task modal
  const deleteTaskHandler = () => {
    deleteTask(task.id);
    toggleModal(false, elements.editTaskModal); // Close the modal
    elements.filterDiv.style.display = 'none'; 
    refreshTasksUI(); // Refresh user interface
    deleteTaskbtn.removeEventListener('click', deleteTaskHandler); // Avoid duplicate event listeners
    deleteTaskbtn.disabled = true; // Disable the delete button
  };

  // Ensure the delete button is enabled and add an event listener
  deleteTaskbtn.disabled = false;
  deleteTaskbtn.addEventListener('click', deleteTaskHandler);



  toggleModal(true, elements.editTaskModal); // Show the edit task modal
  elements.filterDiv.style.display = 'block'; 
}

function saveTaskChanges(taskId) {
  // Get new user inputs
  const newTitleInput = document.getElementById('edit-task-title-input').value;
  const newDescriptionInput = document.getElementById('edit-task-desc-input').value;
  const newStatusInput = document.getElementById('edit-select-status').value;

  // Create an object with the updated task details
 const newUpdatedTask = {
  title: newTitleInput,
  description: newDescriptionInput,
  status: newStatusInput,
  board: activeBoard
 }

  // Update task using a hlper functoin
 patchTask(taskId, newUpdatedTask);

  // Close the modal and refresh the UI to reflect the changes
  elements.editTaskModalWindow.style.display = "none";
  refreshTasksUI();
}

/*************************************************************************************************************************************************/

document.addEventListener('DOMContentLoaded', function() {
  init(); // init is called after the DOM is fully loaded
});

function init() {
  setupEventListeners();
  const showSidebar = localStorage.getItem('showSideBar') === 'true';
  toggleSidebar(showSidebar);
  const isLightTheme = localStorage.getItem('light-theme') === 'enabled';
  document.body.classList.toggle('light-theme', isLightTheme);
  fetchAndDisplayBoardsAndTasks(); // Initial display of boards and tasks
}