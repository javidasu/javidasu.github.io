if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('./service-worker.js')
        .then(function() { console.log('Service Worker Registered'); });
}

(function() {
  'use strict';


    var html5rocks = {};


    if ('webkitIndexedDB' in window) {
        window.IDBTransaction = window.webkitIDBTransaction;
        window.IDBKeyRange = window.webkitIDBKeyRange;
    }

    html5rocks.indexedDB = {};
    html5rocks.indexedDB.db = null;

    html5rocks.indexedDB.onerror = function(e) {
        console.log(e);
    };

    html5rocks.indexedDB.open = function() {
        var version = 1;
        var request = indexedDB.open("todos", version);

        // We can only create Object stores in a versionchange transaction.
        request.onupgradeneeded = function(e) {
            var db = e.target.result;

            // A versionchange transaction is started automatically.
            e.target.transaction.onerror = html5rocks.indexedDB.onerror;

            if(db.objectStoreNames.contains("todo")) {
                db.deleteObjectStore("todo");
            }

            var store = db.createObjectStore("todo",
                {keyPath: "timeStamp"});
        };

        request.onsuccess = function(e) {
            html5rocks.indexedDB.db = e.target.result;
            html5rocks.indexedDB.getAllTodoItems();
        };

        request.onerror = html5rocks.indexedDB.onerror;
    };

    html5rocks.indexedDB.addTodo = function(todoText) {
        var db = html5rocks.indexedDB.db;
        var trans = db.transaction(["todo"], "readwrite");
        var store = trans.objectStore("todo");

        var data = {
            "text": todoText,
            "status": true,
            "timeStamp": new Date().getTime()
        };

        var request = store.put(data);

        request.onsuccess = function(e) {
            html5rocks.indexedDB.getAllTodoItems();
        };

        request.onerror = function(e) {
            console.log("Error Adding: ", e);
        };
    };
    html5rocks.indexedDB.deleteTodo = function(id) {
        var db = html5rocks.indexedDB.db;
        var trans = db.transaction(["todo"], "readwrite");
        var store = trans.objectStore("todo");
        var request = store.delete(+id);

        request.onsuccess = function(e) {
            html5rocks.indexedDB.getAllTodoItems();
        };

        request.onerror = function(e) {
            console.log("Error Adding: ", e);
        };
    };
    html5rocks.indexedDB.updateTodo = function(id){
        var db = html5rocks.indexedDB.db;
        var transaction = db.transaction(['todo'], 'readwrite');
        var objectStore = transaction.objectStore('todo');

        objectStore.openCursor().onsuccess = function(event) {
            const cursor = event.target.result;
            if (cursor) {
                if (cursor.value.timeStamp === +id) {
                    const updateData = cursor.value;

                    updateData.status = !updateData.status;
                    const request = cursor.update(updateData);
                    request.onsuccess = function() {
                        html5rocks.indexedDB.getAllTodoItems();
                    };
                };
                cursor.continue();
            } else {
                console.log('Entries displayed.');
            }
        };
    }

    html5rocks.indexedDB.getAllTodoItems = function() {

        $("#myUL").html("");

        var db = html5rocks.indexedDB.db;
        var trans = db.transaction(["todo"], "readwrite");
        var store = trans.objectStore("todo");

        // Get everything in the store;
        var keyRange = IDBKeyRange.lowerBound(0);
        var cursorRequest = store.openCursor(keyRange);

        cursorRequest.onsuccess = function(e) {
            var result = e.target.result;
            if(!!result == false)
                return;

            renderTodo(result.value);
            result.continue();
        };

        cursorRequest.onerror = html5rocks.indexedDB.onerror;
    };

    function renderTodo(row) {
        $("#myUL").prepend("<li id=\""+row.timeStamp+"\"  class=\"" + (row.status?"":"checked")+ " \" >"+row.text+"<span class=\"close\">×</span></li>")
    }

    html5rocks.indexedDB.open();




    // Add a "checked" symbol when clicking on a list item

    $("body").on("click", "#myUL li", function () {
        html5rocks.indexedDB.updateTodo($(this).attr("id"));
    });

    // add close handler
    $("body").on("click", "#myUL li .close", function () {
        html5rocks.indexedDB.deleteTodo($(this.parentElement).attr("id"))
    });

    // Create a new list item when clicking on the "Add" button
    $("body").on("click", ".addBtn", function () {
        var inputValue = $("#myInput").val();
        var li = document.createElement("li");
        var t = document.createTextNode(inputValue);
        li.appendChild(t);
        if (inputValue === '') {
            alert("You must write something!");
        } else {
            html5rocks.indexedDB.addTodo(inputValue);
            $("#myInput").val("");
        }


    });


})();
