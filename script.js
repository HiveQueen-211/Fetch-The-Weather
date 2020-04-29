/* START -- VARIABLE DECLARATIONS */
const arrDefaultData = {
    defaultUnit: "metric",
    arrCities: ["Prague", "Copenhagen"]
};

if (!localStorage.fetchTheWeather || localStorage.fetchTheWeather === "[]") {
    localStorage.setItem("fetchTheWeather", JSON.stringify(arrDefaultData));
}

let appData = JSON.parse(localStorage.fetchTheWeather);
/* END -- VARIABLE DECLARATIONS */


/* START -- DATA PERSISTENCE FUNCTIONS */
const addCityToAppData = (city) => {
    if (arrValidate_Length()) {
        appData.arrCities.push(city);

        return localStorage.setItem("fetchTheWeather", JSON.stringify(appData));
    } else {
        return handleErrors("arr");
    }
}

const removeCityFromAppData = (name) => {
    const arr = appData.arrCities;
    
    name = titleCaseString(name);
    
    appData.arrCities = arr.filter(item => item != name);

    return localStorage.setItem("fetchTheWeather", JSON.stringify(appData));
}

const arrValidate_Length = () => {
    const bool = (appData.arrCities.length < 5);
    
    return bool;
}

const arrValidate_City = (city) => {
    const arr = appData.arrCities;
    const bool = arr.includes(city);
    
    return bool;
}
/* END -- DATA PERSISTENCE FUNCTIONS */


/* START -- STRING FORMATTING FUNCTIONS */
const trimString = (str) => {
    return str = str.trim();
}

const formatTimeString = (date) => {
    let newDate = new Date(date*1000);
    let strTime = `${newDate.getHours()}.${newDate.getMinutes()}`;

    return strTime;
}

const titleCaseString = (str) => {
    let temp = str.toLowerCase().split(" ");
    
    for (let i = 0; i < temp.length; i++) {
        temp[i] = temp[i][0].toUpperCase() + temp[i].slice(1);
    }
    
    return temp.join(" ");
}

const convertUnderScoreToSpace = (str) => {
    let temp = str.split("_");

    return temp.join(" ");
}
/* END -- STRING FORMATTING FUNCTIONS */


/* START -- DOM MANIPULATION */
const appendToCurrentWeather = (data) => {
    const ul_current = document.querySelector("#current-weather");
    let frag = document.createDocumentFragment();
    
    const current = data.current;
    
    clearCurrentWeather();

    for (let item in current) {
        
        let property = item;
        let content = current[item];
        
        if (property === "dt" || property === "weather") continue;
        
        let li = document.createElement('li');
        let pData = document.createElement('p');
        let pProp = document.createElement('p');

        li.id = `current-${property}`;

        pProp.textContent = convertUnderScoreToSpace(property);
        
        if (property != "uvi") pProp.textContent = titleCaseString(pProp.textContent);
        else if (property === "uvi") pProp.textContent = pProp.textContent.toUpperCase();

        if (property === "sunrise" || property === "sunset") {
            content = formatTimeString(content);
        }
        
        if (typeof content === "number" || typeof content === "string") {
            pData.textContent = content;
        }
        
        li.appendChild(pData);
        li.appendChild(pProp);
        
        frag.appendChild(li);
    }
    
    return ul_current.appendChild(frag);
}

const clearCurrentWeather = () => {
    const ul_current = document.querySelector("#current-weather");
    
    while (ul_current.firstChild) {
        ul_current.removeChild(ul_current.lastChild);
    }

    return ul_current;
}

const appendToListSavedCities = (data) => {
    const ul_savedCities = document.querySelector('#list-saved-cities');
    const frag = document.createDocumentFragment();
    
    const li = document.createElement("li");
    const a = document.createElement("a");
    const i = document.createElement("i");
    
    const strLowerCase = data.toLowerCase();

    li.id = `li-${strLowerCase}`;
    
    a.textContent = data;
    
    i.classList = "fas fa-trash alt";
    
    li.appendChild(a);
    li.appendChild(i);
    
    frag.appendChild(li);
    
    return ul_savedCities.appendChild(frag);
}

const loadCitiesToList = () => {
    appData.arrCities.forEach(data => {
        return appendToListSavedCities(data);
    });
}

const updateNumberOfCities = () => {
    const arr = appData.arrCities;
    const p = document.querySelector('p#stats-storage');

    return p.textContent =  arr.length + " of 5 cities";
}
/* END -- DOM MANIPULATION */


/* START -- EVENT LISTENERS */
const btnSubmit = document.querySelector('#search-bar button[type="submit"]');
btnSubmit.onclick = function() {
    let val = inputSubmit.value;
        val = trimString(val);
    
    if (arrValidate_Length() && val.length > 0 && arrValidate_City(val) === false) {
        addCityToAppData(val); //await success from callPositionStackAPI()
        appendToListSavedCities(val); //await success from callPositionStackAPI()
        
        return callPositionStackAPI(val);
    } else {
        return handleErrors("appData is too long!");
    }
}

const inputSubmit = document.querySelector('#search-bar input[type="text"]');
inputSubmit.onkeypress = function(event) {
    if (event.keyCode === 13) return btnSubmit.click(); 
}

const liSavedCities = document.querySelector("#list-saved-cities");
liSavedCities.onclick = function(event) {
    const elm = event.target;
    let val;
    
    switch(elm.nodeName) {
        case "LI": {
            val = document.querySelector("#" + elm.id).querySelector("a").textContent;
            break;
        }
        case "A": {
            const parent = elm.closest("li");
            val = parent.querySelector("a").textContent;
            break;
        }
        case "I": {
            const parent = elm.closest("li");
            const id = parent.id.substring(3);
            removeCityFromAppData(id);
            liSavedCities.removeChild(parent);
            break;
        }
        default: {
            break;
        }
    }

    if (val) return callPositionStackAPI(val);
}
/* END: EVENT LISTENERS */


/* START -- API CALLS */
const callOpenWeatherAPI = (latitude, longitude) => {
    const apiKey = `afc3b45d0bea226dd7cffba0f8efb229`;
    const unitFormat = `metric`;
    const callURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&units=${unitFormat}&appid=${apiKey}`;
    
    return fetch(callURL)
    .then(response => response.json())
    .then(renderResponse)
    .catch(err => { handleErrors(err) });
}

const callPositionStackAPI = (city) => { 
    const apiKey = `74d5b9f01b4b1c640e8b2c7a401a3f33`;
    const callURL = `http://api.positionstack.com/v1/forward?access_key=${apiKey}&query=${city}&limit=1`;
    
    return fetch(callURL)
    .then(response => response.json())
    .then(forwardResponseFromPositionStackAPI)
    .catch(err => { handleErrors(err) });
}

const callIpAPI = () => {
    const callURL = `http://ip-api.com/json/?fields=status,message,query,lat,lon`;
    
    return fetch(callURL)
    .then(response => response.json())
    .then(forwardData_ipAPI)
    .catch(err => { handleErrors(err) });
}

const forwardResponseFromPositionStackAPI = (response) => {
    let {latitude, longitude} = response.data[0];
    
    return callOpenWeatherAPI(latitude, longitude);
}

const forwardResponseFromIpAPI = (response) => {
    let {lat, lon} = response;
    
    return callOpenWeatherAPI(lat, lon);
}

const forwardResponseFromGeoLocation = () => {
    return new Promise(function(resolve, reject) {
        navigator.geolocation.getCurrentPosition(resolve, reject);
    });
}

const renderResponse = (response) => {
    updateNumberOfCities();

    return appendToCurrentWeather(response); 
};
/* END -- API CALLS */


/* START -- ERROR HANDLER */
const handleErrors = (data) => {
    console.log(data);
    switch (data.code) {
        case 2:
            //geolocation cannot connect to internet
            break;
        case 401:
            //invalid API key
            break;
        case typeof data === "string":
            //message
            break;
        default:
            break;
    }
};
/* END -- ERROR HANDLER */


/* START -- SCRIPT INITIALIZATION */
forwardResponseFromGeoLocation()
.then((data) => { 
    callOpenWeatherAPI(data.coords.latitude, data.coords.longitude) 
}).catch((err) => {
    return handleErrors(err);
});

loadCitiesToList();

updateNumberOfCities();