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


/* START -- UNIT CONVERSION FUNCTIONS */ 
const convertToCelsius = (val) => {
    const celsius = (val * (9 / 5)) + 32;
    return celsius.toFixed(2);
}

const convertToFarenheit = (val) => {
    const farenheit = (val - 32) * (5 / 9);
    return farenheit.toFixed(2);
}

const convertTo12hr = (val) => {
    let time = val.split(".");
    let hour = parseInt(time[0]);
    let minute = time[1];
    let period;

    if (hour <= 12) period = "am";
    
    if (hour > 12) {
        hour = hour - 12;
        period = "pm";
    }
    
    return time = hour + ":" +  minute + period;
}

const convertTo24hr = (val) => {
    const period = val.slice(-2);
    let time = val.split(":");
    let hour = parseInt(time[0]);

    
    if (hour < 10 && period === "am") hour = 0 + hour;
    
    if (hour === 12 && period === "am") hour = "00";

    if (period == "pm") hour = hour + 12;

    time[0] = hour;
    time[1] = time[1].slice(0, 2);
    
    return time = time.join(".");
}
/* END -- UNIT CONVERSION FUNCTIONS */


/* START -- DOM MANIPULATION */
const appendToCurrentWeather = (data) => {
    const ul_current = document.querySelector("#current-weather");
    let frag = document.createDocumentFragment();
    
    const current = data.current;
    
    clearDOMCurrentWeather();

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

const clearDOMCurrentWeather = () => {
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
const iToggleMenu = document.querySelector('header i');
const sectionMain = document.querySelector('#main');
const sectionControls = document.querySelector('#container-controls');
iToggleMenu.onclick = function() {
    const strClass = 'open-menu';
    const strVal = 'var(--width-container-controls)';

    
    if (sectionControls.classList.contains(strClass)) {    
        sectionControls.style.left = "-20em";
    } else {
        sectionControls.style.left = 0;
    }
    
    if (sectionMain.classList.contains(strClass)) {
        sectionMain.style.marginLeft = 0;
    } else {
        sectionMain.style.marginLeft = strVal;
    }

    sectionControls.classList.toggle(strClass);
    sectionMain.classList.toggle(strClass);
}

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
    if (confirm("Fetch The Weather with this device's IP address?")) {
        const callURL = `http://ip-api.com/json/?fields=status,message,query,lat,lon`;
        
        return fetch(callURL)
        .then(response => response.json())
        .then(forwardResponseFromIpAPI)
        .catch(err => { handleErrors(err) });
    }
    return;
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
    switch (data.code) {
        case 1:
            callIpAPI();
            break;
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
            console.log(data);
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