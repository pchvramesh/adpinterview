const getTasksURL = 'https://interview.adpeai.com/api/v2/get-task'
const submitTaskURL = 'https://interview.adpeai.com/api/v2/submit-task'

//API services
const getTasks = async () => {
    return fetch(getTasksURL).then((resp) => resp.json())
}

const submitTask = async (requestObj) => {
    console.log("Request Object : ",requestObj)
    return fetch(submitTaskURL, {
        method: 'POST',
        data: JSON.stringify(requestObj)
    })
}

//Util Functions
const filterTransactionsByYear = (data) => {
    let cYear = new Date().getFullYear()
    return data.filter((e) => {
        const year = e.timeStamp.split('-')[0]
        return cYear - 1 === Number(year)
    })
}

const groupByEmployee = (filtered) => {
    const data = {}
    filtered.forEach(e => {
        if (!data[e.employee.id]) {
            data[e.employee.id] = {
                transactions: [],
                sum: 0,
                ids: []
            }
        }
        data[e.employee.id].transactions.push(e)
    });

    Object.keys(data).forEach((key) => {
        data[key].transactions.forEach((e) => {
            data[key].sum += e.amount
        })

        // Get the transaction ids
        data[key].ids = data[key].transactions.filter((e) => e.type === 'alpha').map((e) => e.transactionID)
    })

    return Object.values(data)
}

const getHighestSumTotal = (data) => {
    return data.reduce((max, obj) => obj.sum > max.sum ? obj : max)
}


//Controller
const fetchData = async () => {
    try {
        const data = await getTasks()
        let filtered = filterTransactionsByYear(data.transactions)
        filtered = groupByEmployee(filtered)
        const highest = getHighestSumTotal(filtered)
        const requestObj = {
            id: data.id,
            result: highest.ids
        }
        const resp = await submitTask(requestObj)
        console.log("Response ",resp)
    }
    catch (e) {
        console.log("ERROR : ",e)
    }
}

fetchData()