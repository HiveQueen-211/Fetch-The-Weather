/* START -- VARIABLE DECLARATIONS */
const arrDefaultData = {
    settings: { temperature: "celsius", timeStandard: 24 }, 
    cities: [ "Prague", "Copenhagen" ]
};

if (!localStorage.fetchTheWeather || localStorage.fetchTheWeather === "[]") {
    localStorage.setItem("fetchTheWeather", JSON.stringify(arrDefaultData));
}

let appData = JSON.parse(localStorage.fetchTheWeather);

const sessionData = {
    location: "",
    lat: "",
    long: "",
    celsius: {
        temp: "",
        feels_like: ""
    },
    farenheit: {
        temp: "",
        feels_like: ""
    }
}

/* END -- VARIABLE DECLARATIONS */


/* START -- DATA PERSISTENCE FUNCTIONS */
const addCityToAppData = (city) => {
    if (isArrCitiesLessThanMax()) {
        appData.cities.push(city);

        return localStorage.setItem("fetchTheWeather", JSON.stringify(appData));
    } else {
        return handleErrors("arr");
    }
}

const addCurrentLocationToSessionData = (location, lat = "", long = "") => {
    if (location != sessionData.location) {
        sessionData.lat = lat;
        sessionData.long = long;
        
        return sessionData.location = location;
    } else {
        return false;
    }
}

const removeCityFromAppData = (name) => {
    const arr = appData.cities;
    
    name = titleCaseString(name);
    
    appData.cities = arr.filter(item => item != name);

    return localStorage.setItem("fetchTheWeather", JSON.stringify(appData));
}

const isArrCitiesLessThanMax = () => {
    const bool = (appData.cities.length < 5);
    
    return bool;
}

const doesCityExistInArr = (city) => {
    const arr = appData.cities;
    const bool = arr.includes(city);
    
    return bool;
}
/* END -- DATA PERSISTENCE FUNCTIONS */


/* START -- STRING FORMATTING FUNCTIONS */
const trimString = (str) => {
    return str = str.trim();
}

const formatIncomingTimeString = (date) => {
    let newDate = new Date(date*1000);
    let hours = newDate.getHours().toString();

    if (hours.length === 1) hours = `0${hours}`;

    let strTime = `${hours}.${newDate.getMinutes()}`;

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
    return `${celsius.toFixed(1)}`;
}

const convertToFarenheit = (val) => {
    const farenheit = (val - 32) * (5 / 9);
    return farenheit.toFixed(1);
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

    
    if (hour < 10 && period === "am") hour = `0${hour}`;
    
    if (hour === 12 && period === "am") hour = "00";

    if (period == "pm") hour = hour + 12;

    time[0] = hour;
    time[1] = time[1].slice(0, 2);
    
    return time = time.join(".");
}
/* END -- UNIT CONVERSION FUNCTIONS */


/* START -- DOM MANIPULATION */
const processAndAppendData = (data) => {
    const current = data.current;
    const timeStandard = appData.settings.timeStandard;
    const tempUnit = appData.settings.temperature;

    const arrIgnore = ["wind_deg", "dt", "weather", "clouds", "humidity", "dew_point", "visibility", "pressure", "wind_gust"];
    const arrMainTabProps = ["location", "temp", "feels_like", "sunrise", "sunset"];
    
    const ul_current = document.querySelector("#current-weather");
    
    let frag = document.createDocumentFragment();
    
    let li_mainTab = document.createElement('li');
        li_mainTab.id = 'main-tab';
    let ul_mainTab = document.createElement('ul');

    let li_currentLocation = document.createElement('li');
        li_currentLocation.id = 'current-location';
        
    let pLocation = document.createElement('p');
        pLocation.textContent = `${sessionData.location}`;
    
    li_currentLocation.appendChild(pLocation);

    let pLat = document.createElement('p');
        pLat.textContent = `Latitude: ${sessionData.lat.toFixed(2)}`;
    let pLong = document.createElement('p');
        pLong.textContent = `Longitude: ${sessionData.long.toFixed(2)}`;

    li_currentLocation.appendChild(pLat);
    li_currentLocation.appendChild(pLong);

    ul_mainTab.appendChild(li_currentLocation);

    clearDOMCurrentWeather();

    for (let item in current) {
        let property = item;
        let content = current[item];
        
        if (arrIgnore.includes(property)) continue;

        let li = document.createElement('li');
        let pData = document.createElement('p');
        let pProp = document.createElement('p');

        li.id = `current-${property}`;

        pProp.textContent = convertUnderScoreToSpace(property);

        if (property === "uvi") {
            pProp.textContent = pProp.textContent.toUpperCase();
        } else {
            pProp.textContent = titleCaseString(pProp.textContent);
        }

        switch (property) {
            case 'temp': {
                sessionData.celsius.temp = `${content}\xB0C`;
                sessionData.farenheit.temp = `${convertToFarenheit(content)}\xB0F`;

                break;
            }
            case 'feels_like': {
                sessionData.celsius.feels_like = `${content}\xB0C`;
                sessionData.farenheit.feels_like = `${convertToFarenheit(content)}\xB0F`;

                break;
            }
            case 'wind_speed': {
                content = content + "mph";

                break;
            }
            case 'uvi': {
                content = content + "%";

                break;
            }
            case 'sunrise':
            case 'sunset': {
                if (timeStandard === 12) {
                    content = formatIncomingTimeString(content);
                    content = convertTo12hr(content);
                } else if (timeStandard === 24) {
                    content = formatIncomingTimeString(content);
                }

                break;
            }
            default: break;
        }

        switch (tempUnit) {
            case 'celsius': {
                const celsius = sessionData.celsius;

                for (let prop in celsius) {
                    if (prop == property) {
                        content = celsius[prop];
                    }
                }

                break;   
            }
            case 'farenheit': {
                const farenheit = sessionData.farenheit;

                for (let prop in farenheit) {
                    if (prop === property) {
                        content = farenheit[prop];
                    }
                }

                break;   
            }
            default: break;
        }

        if (typeof content === "number" || typeof content === "string") {
            pData.textContent = content;
        }
        
        li.appendChild(pData);
        li.appendChild(pProp);
        
        if (arrMainTabProps.includes(property)) {
            ul_mainTab.appendChild(li);
        } else {
            frag.appendChild(li);
        }
        
    }

    li_mainTab.appendChild(ul_mainTab);
    ul_current.appendChild(li_mainTab);
    
    return ul_current.appendChild(frag);
}

const clearDOMCurrentWeather = () => {
    const ul_current = document.querySelector("#current-weather");
    
    while (ul_current.firstChild) {
        ul_current.removeChild(ul_current.lastChild);
    }

    return ul_current;
}

const ul_savedCities = document.querySelector('#list-saved-cities');
    const appendToDOMSavedCities = (data) => {
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
    appData.cities.forEach(data => {
        return appendToDOMSavedCities(data);
    });
}

const updateNumberOfCities = () => {
    const arr = appData.cities;
    const p = document.querySelector('p#stats-storage');

    return p.textContent =  arr.length + " of 5 cities";
}

const updateCheckTimeUnit = () => {
    const timeStandard = appData.settings.timeStandard;
    const parent = checkTimeUnit.closest('section');

    if (timeStandard === 24) {
        checkTimeUnit.checked = true;
        parent.classList.add('switch-right');
    } else {
        checkTimeUnit.checked = false;
    }

    return timeStandard;
}

const updateCheckTempUnit = () => {
    const tempUnit = appData.settings.temperature;
    const parent = checkTempUnit.closest('section');

    if (tempUnit === "farenheit") {
        checkTempUnit.checked = true;
        parent.classList.add('switch-right');
    } else {
        checkTempUnit.checked = false;
    }

    return tempUnit;
}

const updateTempListItems = () => {
    const tempStandard = appData.settings.temperature;
    const arrIDs = ['#current-temp', '#current-feels_like'];

    for (let i = 0; i < arrIDs.length; i++) {
        let li = document.querySelector(arrIDs[i]);
        let p = li.querySelector('p');        
        let property = arrIDs[i].substring(9);

        if (tempStandard === "celsius") {
            const dataCelsius = sessionData.celsius; 
            for (let data in dataCelsius) {
                if (data === property) {
                    p.textContent = dataCelsius[data];
                }
            }
        } else if (tempStandard === "farenheit") {
            const dataFarenheit = sessionData.farenheit;

            for (let data in dataFarenheit) {
                if (data === property) {
                    p.textContent = dataFarenheit[data];
                }
            }
        }
    }
}

const updateTimeListItems = () => {
    const timeStandard = appData.settings.timeStandard;
    const arrIDs = ['#current-sunrise', '#current-sunset'];

    for (let i = 0; i < arrIDs.length; i++) {
        let li = document.querySelector(arrIDs[i]);
        let p = li.querySelector('p');
        
        if (timeStandard === 12) {
            p.textContent = convertTo12hr(p.textContent);
        } else if (timeStandard === 24) {
            p.textContent = convertTo24hr(p.textContent);
        }
    }
}

const showError = (msg, errorCode = "") => {
    const elmErrorBar = document.querySelector('#error-bar');
    const pErrorBar = elmErrorBar.querySelector('p');

    if (errorCode) {
        pErrorBar.textContent = `ERROR ${errorCode}: ${msg}`;
    } else {
        pErrorBar.textContent = `ERROR: ${msg}`;
    }

    return elmErrorBar.style.opacity = 1;
}
/* END -- DOM MANIPULATION */


/* START -- EVENT LISTENERS */
const elmErrorBar = document.querySelector('#error-bar');
elmErrorBar.onclick = function() {
    if (elmErrorBar.style.opacity = 1) {
        elmErrorBar.style.opacity = 0; 
    }
}

const iToggleMenu = document.querySelector('#toggle-aside');
iToggleMenu.onclick = function() {
    const strClass = 'open-menu';
    
    sectionMain.classList.toggle(strClass);
    asideControls.classList.toggle(strClass);
}

const iCloseMenu = document.querySelector('#container-controls .i-close');
iCloseMenu.onclick = function() {
    const strClass = 'open-menu';
    
    sectionMain.classList.remove(strClass);
    asideControls.classList.remove(strClass);
}

const sectionMain = document.querySelector('#main');
const asideControls = document.querySelector('#container-controls');

const checkTempUnit = document.querySelector('#unit-temp');
checkTempUnit.onclick = function() {
    const checked = checkTempUnit.checked;
    const parent = checkTempUnit.closest('section');

    if (checked) {
        appData.settings.temperature = "farenheit";
        localStorage.setItem("fetchTheWeather", JSON.stringify(appData));
        parent.classList.add('switch-right');

        return updateTempListItems();
    } else if (!checked) {
        appData.settings.temperature = "celsius";
        localStorage.setItem("fetchTheWeather", JSON.stringify(appData));
        parent.classList.remove('switch-right');

        return updateTempListItems();
    }
}

const checkTimeUnit = document.querySelector('#unit-time');
checkTimeUnit.onclick = function() {
    const checked = checkTimeUnit.checked;
    const parent = checkTimeUnit.closest('section');

    if (checked) {
        appData.settings.timeStandard = 24;
        localStorage.setItem("fetchTheWeather", JSON.stringify(appData));
        parent.classList.add('switch-right');

        return updateTimeListItems();
    } else if (!checked) {
        appData.settings.timeStandard = 12;
        localStorage.setItem("fetchTheWeather", JSON.stringify(appData));
        parent.classList.remove('switch-right');

        return updateTimeListItems();
    }
}

const btnFetchByGeo = document.querySelector('#fetch-by-Geo'); 
btnFetchByGeo.onclick = function() {
    if (sessionData.location != "Geolocation") {
        forwardResponseFromGeoLocation()
        .then((data) => { 
            const lat = data.coords.latitude;
            const long = data.coords.longitude;

            addCurrentLocationToSessionData('Geolocation', lat, long);
            callOpenWeatherAPI(lat, long); 
        }).catch((err) => {
            return handleErrors(err);
        });
    } else return;
}

const btnFetchByIp = document.querySelector('#fetch-by-ip');
btnFetchByIp.onclick = function() {
    if (sessionData.location != "ip") {
        return callIpAPI();
    } else return;
}

const btnSubmit = document.querySelector('#search-bar button[type="submit"]');
btnSubmit.onclick = function() {
    let val = inputSubmit.value;
        val = trimString(val);

    if (val === sessionData.location) return;

    if (isArrCitiesLessThanMax() && val.length > 0) {
        return callPositionStackAPI(val);
    } else {
        return handleErrors("Max number of cities reached");
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
            updateNumberOfCities();
            liSavedCities.removeChild(parent);
            break;
        }
        default: {
            break;
        }
    }

    if (val === sessionData.location) return;

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
    .then(forwardResponseFromIpAPI)
    .catch(err => { handleErrors(err) });
}

const forwardResponseFromPositionStackAPI = (response) => {
    let {latitude, longitude, name } = response.data[0];
    
    addCurrentLocationToSessionData(name, latitude, longitude);

    if (doesCityExistInArr(name) === false) {
        addCityToAppData(name);
        appendToDOMSavedCities(name);
    }
    
    return callOpenWeatherAPI(latitude, longitude);
}

const forwardResponseFromIpAPI = (response) => {
    let {lat, lon} = response;
    
    addCurrentLocationToSessionData('IP Address', lat, lon);

    return callOpenWeatherAPI(lat, lon);
}

const forwardResponseFromGeoLocation = () => {
    return new Promise(function(resolve, reject) {
        navigator.geolocation.getCurrentPosition(resolve, reject);
    });
}

const renderResponse = (response) => {
    updateNumberOfCities();

    return processAndAppendData(response); 
};
/* END -- API CALLS */


/* START -- ERROR HANDLER */
const handleErrors = (data) => {
    switch (data.code) {
        case 1:
            if (confirm("Fetch The Weather with this device's IP address?")) callIpAPI();
            break;
        case 2:
            showError("Geolocation cannot connect to the internet", data.code);
            break;
        case 401:
            showError("Invalid API Key", data.code);
            break;
        case typeof data === "string":
            showError(data);
            break;
        default:
            showError("Something went wrong");
            break;
    }
};
/* END -- ERROR HANDLER */


/* START -- SCRIPT INITIALIZATION */
forwardResponseFromGeoLocation()
.then((data) => { 
    const lat = data.coords.latitude;
    const long = data.coords.longitude;

    addCurrentLocationToSessionData('Geolocation', lat, long);
    callOpenWeatherAPI(lat, long); 
}).catch((err) => {
    return handleErrors(err);
});

updateCheckTimeUnit();
updateCheckTempUnit();

loadCitiesToList();
updateNumberOfCities();