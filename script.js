const Modal = {

    modal_overlay: document.querySelector(".modal-overlay"),


    modal_open() {
        Modal.modal_overlay.classList.add("active")
    },

    close_modal() {
        Modal.modal_overlay.classList.toggle('active')
    }

}

const Storage = {
    get(){
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },
    
    set(transactions){
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
    }
}

const Transaction = {
    all: Storage.get(),

    add(transaction) {
        Transaction.all.push(transaction)

        App.reload()
    },

    remove(index){

        Transaction.all.splice(index, 1)
        
        App.reload()
        
    },

    incomes () {
        let income = 0;

        Transaction.all.forEach(function(transaction){
            if(transaction.amount > 0){
                income += transaction.amount
            }
        })

        return income;
    },

    expenses() {
        let expenses = 0;

        Transaction.all.forEach(function(transaction){
            if(transaction.amount < 0){
                expenses += transaction.amount
            }
        })

        return expenses;
    },

    total() {
        return Transaction.incomes() + Transaction.expenses()
    }
}

const DOM = {

    transactionContainer: document.querySelector('#data_table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        
        tr.dataset.index = index

        DOM.transactionContainer.appendChild(tr)
    },

    innerHTMLTransaction(transaction, index) {

        const amount = Utils.formatCurrency(transaction.amount)

        const CSSClass = transaction.amount > 0 ? 'income' : 'outcome' 

        const html = `
        <tr>
        <td class="description">${transaction.description}</td>
        <td class=${CSSClass}>${amount}</td>
        <td class="date">${transaction.date}</td>
        <td>
            <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="remover transação" title="Remover Transação">
        </td>
    </tr>
    `
    return html
    },

    updateBalance() {
        document.getElementById('incomeDisplay').innerHTML = Utils.formatCurrency(Transaction.incomes())

        document.getElementById('outcomeDisplay').innerHTML = Utils.formatCurrency(Transaction.expenses())

        document.getElementById('totalDisplay').innerHTML = Utils.formatCurrency(Transaction.total())
    },

    clearTransactions() {
        DOM.transactionContainer.innerHTML = ""
    }
}

const Utils = {
    
    formatAmount(value){
        value = value * 100


        return Math.round(value)
    },

    formatDate(date){
        const splitedDate = date.split('-')
        
        return `${splitedDate[2]}/${splitedDate[1]}/${splitedDate[0]}`
    },

    formatCurrency(value) {
        const signal = Number(value) < 0 ? '-' : ''

        value = String(value).replace(/\D/g, "")

        value = value / 100

        value = Number(value).toLocaleString('pt-BR', {
            style: "currency",
            currency: 'BRL'
        })

        return signal + ' ' + value
    }
}

const Form = {

    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    validateFields(){

        const { description, amount, date} = Form.getValues()

        if(description.trim() === "" || amount.trim() === "" || date.trim() === ""){
            throw new Error("Por favor, preencha todos o campos do formulário abaixo.")
        }

    },

    formatValues(){
        let { description, amount, date} = Form.getValues()

        amount = Utils.formatAmount(amount)
        date = Utils.formatDate(date)

        return {
            description: description,
            amount,
            date
        }
    },

    saveTransaction(transaction){

        Transaction.add(transaction)

    },

    clearFields(){

        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },


    submit(event) {
        event.preventDefault()

        try{

            Form.validateFields()
            const transaction = Form.formatValues()
            Form.saveTransaction(transaction)
            Form.clearFields()
            Modal.close_modal()

        }catch (error) {

            alert(error.message)

        }
    }
}


const App = {
    init() {

        Transaction.all.forEach(DOM.addTransaction)
        
        DOM.updateBalance()

        Storage.set(Transaction.all)
    },

    reload(){
        DOM.clearTransactions()
        App.init()
    }
}

App.init()
