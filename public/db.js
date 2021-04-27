let db;
let budgetVersion;
//new db request for a database.
const request = window.indexedDB.open("BudgetDB", budgetVersion || 13);

request.onupgradeneeded = function (event) {
    const { oldVersion } = event;
    const newVersion = event.newVersion || db.version;
    console.log(`DB Updated from version ${oldVersion} to ${newVersion}`);

    //object store
    db = event.target.result;
    if (db.objectStoreNames.length === 0) {
        db.createObjectStore("BudgetStore", { autoIncrement: true })
    }
};

request.onsuccess = function (event) {
    db = event.target.result;

    if (navigator.onLine) {
        checkDatabase();
    }
};

request.onerror = function (event) {
    console.log(event.target.errorCode)
};

function saveRecord(record) {
    // create a transaction on the pending db with readwrite access
    const transaction = db.transaction(["BudgetStore"], "readwrite");
    // access object store
    const BudgetStore = transaction.objectStore("BudgetStore");
    // add record
    BudgetStore.add(record)
}

function checkDatabase() {
    // open a transaction
    const transaction = db.transaction(["BudgetStore"], "readwrite");
    // access object store
    const BudgetStore = transaction.objectStore("BudgetStore");
    // get all records from store
    const getAll = BudgetStore.getAll();

    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json',
                },
            })
                .then((response) => response.json())
                .then(() => {
                    // if successful, open a transaction
                    let transaction = db.transaction(["BudgetStore"], "readwrite");
                    // access object store
                    let BudgetStore = transaction.objectStore("BudgetStore");
                    // clear all items in store
                    BudgetStore.clear();
                });
        }
    };
}

// listen for app coming back online
window.addEventListener('online', checkDatabase);
