import { getValue, selector } from "./base.js"

/* ******************** VARIABLES ******************* */

// DOM Variables
const firstname = selector("#firstname")
const lastname = selector("#lastname")
const email = selector("#email")
const phone = selector("#phone")
const btn = selector("#btn")
const myForm = selector("#myform")

const tableContainer = selector("#table-container")
const tableScreen = selector("#table-screen")
const empty = selector("#empty")
const loading = selector("#loading")

// IndexedDB Variables
const indexedDB = window.indexedDB.open("Users_Table", 12)
let db



/* ******************* FUNCTIONS ****************** */

const addData = () => {
    changeBtn(true, 'add')

    const userData = {
        id: userId(),
        firstname: getValue(firstname),
        lastname: getValue(lastname),
        email: getValue(email),
        phone: getValue(phone)
    }

    const tx = transact('users', 'readwrite')
    const store = tx.objectStore('users')
    store.add(userData)

    tx.oncomplete = e => {
        changeBtn(false, 'add')
        showMessage("User Added", 'success')
        myForm.reset()
        checkDB()
    }
}


const changeBtn = (state, name) => {
    if(state){
        switch (name) {
            case "add":
                btn.innerText = "adding..."
                btn.disabled = true
                break
        
            case "update":
                btn.innerText = "updating..."
                btn.disabled = true
                break
        }
    }
    else{
        switch (name) {
            case "add":
                btn.innerText = "Add"
                btn.disabled = false
                break
        
            case "update":
                btn.innerText = "Update"
                btn.disabled = false
                break
        }
    }
}


const checkBtn = (event) => {
    let name = event.target.dataset.name
    
    switch(name){
        case 'add':
            validateInputs() && addData()
            break

        case 'update':
            validateInputs() && updateUpgradedData()
            break
    }
}


const checkDB = () => {
    loading.style.display = 'none'
    
    const tx = transact('users', 'readonly')
    const store = tx.objectStore('users')
    const request = store.count()

    request.onsuccess = e => {
        const count = e.target.result

        if(count < 1){
            empty.style.display = 'block'
            tableContainer.style.display = 'none'
        }
        else{
            empty.style.display = 'none'
            tableContainer.style.display = 'block'
            updateTable()
        }

    }
}


const deleteData = id => {
    const tx = transact('users', 'readwrite')
    const store = tx.objectStore('users')
    store.delete(id)

    tx.oncomplete = e => {
        showMessage('User Deleted', 'success')
        checkDB()
    }
}


const prepareUpdate = data => {
    firstname.value = data.firstname
    lastname.value = data.lastname
    email.value = data.email
    phone.value = data.phone

    myForm.setAttribute("data-id", data.id)

    btn.innerText = "Update"
    btn.setAttribute('data-name', 'update')
}


const showMessage = (msg, type = 'error') => {
    switch (type) {
        case "success":
            swal(msg, '', 'success')
            break
    
        default:
            swal(msg, '', 'error')
            break
    }
}


const transact = (objectStore, mode) => {
    const tx = db.transaction(objectStore, mode)
    return tx
}


const restoreDefaultBtn = () => {
    btn.innerText = "Add"
    btn.setAttribute('data-name', 'add')
}


const restorDefaultInput = input => {
    if(input.classList.contains("required")){
        input.classList.remove("required")
        input.nextElementSibling.classList.add("hide")
    }
}


const updateData = id => {
    const tx = transact('users', 'readonly')
    const store = tx.objectStore('users')
    const request = store.get(id)

    request.onsuccess = e => {
        const data = e.target.result
        prepareUpdate(data)
    }
}

const updateUpgradedData = () => {
    changeBtn(true, 'update')
    
    const id = myForm.dataset.id
    const userData = {
        id,
        firstname: getValue(firstname),
        lastname: getValue(lastname),
        email: getValue(email),
        phone: getValue(phone)
    }

    const tx = transact('users', 'readwrite')
    const store = tx.objectStore('users')
    store.put(userData)

    tx.oncomplete = e => {
        showMessage("User Updated", 'success')
        changeBtn(false, 'update')
        checkDB()
        restoreDefaultBtn()
        myForm.reset()

    }
}


const updateTable = () => {
    tableScreen.innerHTML = ""

    const tx = transact('users', 'readonly')
    const store = tx.objectStore('users')
    const request = store.getAll()

    request.onsuccess = e => {
        const users = e.target.result

        console.log(users)

        users.forEach((user, index) => {
            const tr = document.createElement('tr')
            tr.innerHTML = `<td>${index + 1}</td>
                            <td>${user.firstname}</td>
                            <td>${user.lastname}</td>
                            <td>
                                <a
                                    href="mailto:${user.email}"
                                    class="text-decoration-none"
                                >
                                    ${user.email}
                                </a>
                            </td>
                            <td>
                                <a
                                    href="tel:${user.phone}"
                                    class="text-decoration-none"
                                >
                                    ${user.phone}
                                </a>
                            </td>
                            <td class="d-flex align-items-center">
                                <button
                                    onclick="deleteData('${user.id}');"
                                    class="btn mr-2 btn-sm d-inline-block btn-danger"
                                    title="delete"
                                >
                                    &times;
                                </button>
                                <button
                                    class="btn btn-sm d-inline-block btn-primary"
                                    title="edit"
                                    onclick="updateData('${user.id}');"
                                >
                                    &plus;
                                </button>
                            </td>`;
            tableScreen.appendChild(tr)
            
        })
    }
}

setTimeout(checkDB, 5000)


const userId = () => new Date().toUTCString().split(' ').join('-')


const validateInputs = () => {
    let result = true

    if(getValue(firstname).length < 2){
        console.log(getValue(firstname))
        firstname.classList.add("required")
        firstname.nextElementSibling.classList.remove("hide")
        
        result = false
    }
    
    if(getValue(lastname).length < 2){
        lastname.classList.add("required")
        lastname.nextElementSibling.classList.remove("hide")

        result = false
    }

    if(getValue(email).length < 2){
        email.classList.add("required")
        email.nextElementSibling.classList.remove("hide")

        result = false
    }

    if(getValue(phone).length < 2){
        phone.classList.add("required")
        phone.nextElementSibling.classList.remove("hide")

        result = false
    }

    return result
}

// Make Functions Global
window.deleteData = deleteData
window.updateData = updateData


/* ************************* EVENTS ************************ */

// DOM Events
btn.addEventListener("click", e =>{
    e.preventDefault()
    checkBtn(e)
})

firstname.addEventListener("keypress", () => {
    restorDefaultInput(firstname)
})

lastname.addEventListener("keypress", () => {
    restorDefaultInput(lastname)
})

email.addEventListener("keypress", () => {
    restorDefaultInput(email)
})

phone.addEventListener("keypress", () => {
    restorDefaultInput(phone)
})


// IndexedDB Events
indexedDB.addEventListener("success", e => {
    db = e.target.result
})

indexedDB.addEventListener("error", e => {
    console.error("Error from DB: ", e.target.error)
})

indexedDB.addEventListener("upgradeneeded", e => {
    db = e.target.result
    db.createObjectStore("users", {keyPath: 'id'})
})