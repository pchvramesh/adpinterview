const getTasksURL = 'https://interview.adpeai.com/api/v2/get-task'
const submitTaskURL = 'https://interview.adpeai.com/api/v2/submit-task'


//API services
const makeAPICall = async (url, options = {}) => {
    console.log(url, options)
    return fetch(url, options);
};


//Get Tasks
const getTasks = () => makeAPICall(getTasksURL).then((resp) => resp.json())

//Submit Task
const submitTask = async (requestObj) => {
    return makeAPICall(submitTaskURL, {
        method: 'POST',
        body: JSON.stringify(requestObj),
        headers: {
            'content-type': 'application/json'
        }
    })
}

//Util Functions
const filterTransactionsByYear = (data, year) => {
    return data.filter(({ timeStamp }) => timeStamp.startsWith(`${year}`))
}

const groupByEmployee = (filtered) => {
    const data = {}
    filtered.forEach(({ employee: { id }, amount, transactionID, type }) => {
        if (!data[id]) {
            data[id] = {
                sum: 0,
                ids: []
            }
        }
        data[id].sum += amount

        if (type === 'alpha') {
            data[id].ids.push(transactionID)
        }
    });

    return Object.values(data)
}

const getHighestSumTotal = (data) => {
    return data.reduce((max, obj) => (obj.sum > max.sum ? obj : max), data[0])
}


//Controller
const fetchData = async () => {
    try {
        const data = await getTasks()
        const prevYear = new Date().getFullYear() - 1
        let filtered = filterTransactionsByYear(data.transactions, prevYear)
        filtered = groupByEmployee(filtered)
        const highest = getHighestSumTotal(filtered)
        const requestObj = {
            id: data.id,
            result: highest.ids
        }
        const resp = await submitTask(requestObj)
        console.log("Response ", resp)
    }
    catch (e) {
        console.log("ERROR : ", e)
    }
}

fetchData()