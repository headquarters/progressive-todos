/**
 * If PouchDB support, plus AJAX, then use local DB and remotely sync on changes.
 * If no PouchDB support, but AJAX, then make AJAX requests to prevent page refreshes.
 * If none of this support exists, don't do anything on the client side.
 */
var support = {
    "PouchDB": false,
    "AJAX": true,
};
var db = null;
var listId = window.location.href.match(/list\/(\w+)$/)[1];
var httpRequest = new XMLHttpRequest();
var todosList = document.getElementById("todos-list");
var todoForm = document.getElementById("add-todo");
var todosCount = document.getElementById("todos-list").children.length;
var newTodo = document.getElementById("new-todo");

try {
    // throws `ReferenceError: 'ArrayBuffer' is undefined` in IE9
    db = new PouchDB(listId);
    populateList();
} catch(e) {
    support.PouchDB = false;
}

if(!httpRequest) {
    support.AJAX = false;
}

if(support.PouchDB && support.AJAX) {
    // support for PouchDB and AJAX probably go hand-in-hand, but checking them separately anyway
    todoForm.addEventListener("submit", addLocalTodo);
    todosList.addEventListener("click", deleteLocalTodo);
} else if(!support.PouchDB && support.AJAX) {
    todoForm.addEventListener("submit", addRemoteTodo);
    todosList.addEventListener("click", deleteRemoteTodo);
}

function addLocalTodo(event) {
    var data;
    var element;
    var todoId;
    var listElement;
    var todoMarkup;
    var todo;

    todo = newTodo.value;
    todoId = generateId();

    db.put({
      _id: todoId,
      text: todo,
      created: (new Date()).getTime(),
      completed: false
    }).then(function (response) {
        if (response.ok) {
            todoMarkup = createTodoItem(listId, todoId, todo);

            todosList.appendChild(todoMarkup);

            if(document.getElementById("no-todos")) {
              document.getElementById("no-todos").remove();
            }
        } else {
            console.log("Problem adding new TODO to local database.");
        }
    }).catch(function (err) {
        console.log(err);
    });

    event.preventDefault();
}

function deleteLocalTodo(event) {
    var todoId;
    var message;

    if(event.target.type === "submit") {
        todoId = event.target.parentElement.elements[0].value;

        db.get(todoId).then(function(doc) {
            return db.remove(doc);
        }).then(function (result) {
            event.target.parentElement.parentElement.remove();
            todosCount--;

            if (todosCount === 0) {
              message = document.createElement("P");
              message.id = "no-todos";
              message.innerText = "No todos, yet. Add one below to get started.";
              todoForm.parentElement.insertBefore(message, todoForm);
            }
        }).catch(function (err) {
            console.log(err);
        });

        event.preventDefault();
    }
}

function addRemoteTodo(event) {
    var url = event.target.action;
    var data = "list_id=" + encodeURIComponent(listId) + "&todo=" +
        encodeURIComponent(newTodo.value);
    var response;
    var todoMarkup;

    httpRequest.onreadystatechange = handleResponse;
    httpRequest.open("POST", url);
    httpRequest.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    httpRequest.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    httpRequest.send(data);

    function handleResponse(event) {
      if (httpRequest.readyState === XMLHttpRequest.DONE) {
        if (httpRequest.status === 200) {
            response = JSON.parse(httpRequest.responseText);

            if(response.ok) {
                todoMarkup = createTodoItem(listId, response.id, newTodo.value);

                todosList.appendChild(todoMarkup);
            } else {
                console.log("Something was wrong with the HTTP request.");
            }
        } else {
          console.log("The server did not respond with a 200 status code.");
        }
      }
    }

    event.preventDefault();
}

function deleteRemoteTodo(event) {
    if(event.target.type !== "submit") {
        return;
    }

    var button = event.target;
    var url = button.parentElement.action;
    var todoId = button.parentElement.elements[0].value;
    var data = "list_id=" + encodeURIComponent(listId) + "&todo_id=" +
        encodeURIComponent(todoId) + "&_method=DELETE";
    var response;
    var todoMarkup;

    httpRequest.onreadystatechange = handleResponse;
    httpRequest.open("POST", url);
    httpRequest.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    httpRequest.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    httpRequest.send(data);

    function handleResponse(event) {
      if (httpRequest.readyState === XMLHttpRequest.DONE) {
        if (httpRequest.status === 200) {
            response = JSON.parse(httpRequest.responseText);

            if(response.ok) {
                button.parentElement.parentElement.remove();
                todosCount--;
            } else {
                console.log("Something was wrong with the HTTP request.");
            }
        } else {
          console.log("The server did not respond with a 200 status code.");
        }
      }
    }

    event.preventDefault();
}

function populateList() {
    var todos;
    var todosMarkup = document.createDocumentFragment();
    var todo;

    // http://pouchdb.com/api.html#batch_fetch
    db.allDocs({
      include_docs: true
    }).then(function (result) {
        todos = result;

        if(todos.rows.length > 0) {
            document.getElementById("no-todos").remove();
        }

        for(var i = 0; i < todos.rows.length; i++) {
            todo = todos.rows[i].doc;

            todosMarkup.appendChild(createTodoItem(listId, todo._id, todo.text));
        }

        todosList.appendChild(todosMarkup);
        todosCount = todos.rows.length;
    }).catch(function (err) {
        console.log(err);
    });
}

function createTodoItem(listId, todoId, todo) {
    var todoMarkup = '<form method="post" action="/todo/#{todo_id}?_method=DELETE">\
                            <input type="hidden" name="todo_id" value="#{todo_id}">\
                            <input type="hidden" name="list_id" value="#{list_id}">\
                            #{todo_text}\
                            <button type="submit">Delete</button>\
                        </form>';

    todoMarkup = todoMarkup.replace(/#{list_id}/g, listId);
    todoMarkup = todoMarkup.replace(/#{todo_id}/g, todoId);
    todoMarkup = todoMarkup.replace(/#{todo_text}/g, todo);

    listElement = document.createElement("LI");

    listElement.innerHTML = todoMarkup;

    todosCount++;

    return listElement;
}

/**
 * Generates an ID for a todo based on timestamp plus random 3 digit number.
 * The recommendation is to use put() over post() and provide an ID
 * to support sorting: http://pouchdb.com/api.html#using-dbpost
 */
function generateId() {
 return (Math.floor((1 + Math.random()) * 0x100) +
         (new Date()).getTime()).toString();
}
