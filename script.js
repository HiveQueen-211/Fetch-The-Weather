/* START -- VARIABLE DECLARATIONS */
const arrDefaultData = {
    defaultUnit: "metric",
    arrCities: ["Prague", "Copenhagen"]
};

if (!localStorage.weatherDash || localStorage.weatherDash === "[]") {
    localStorage.setItem("weatherDash", JSON.stringify(arrDefaultData));
}

let appData = JSON.parse(localStorage.weatherDash);
/* END -- VARIABLE DECLARATIONS */


/* START -- EVENT LISTENERS */
const btnSubmit = document.querySelector('#search-bar button[type="submit"]');
const inputSubmit = document.querySelector('#search-bar input[type="text"]');
const liSavedCities = document.querySelector("#list-saved-cities");

btnSubmit.onclick = function() {
    let val = inputSubmit.value;
        val = trimString(val);
    
    if (arrValidate_Length() && val.length > 0 && arrValidate_City(val) === false) {
        
        addCityToAppData(val); //await success from callPositionStackAPI()
        appendCityToList(val); //await success from callPositionStackAPI()
        
        return callPositionStackAPI(val);

    } else {

        return handleErrors("appData is too long!");

    }
}

inputSubmit.onkeypress = function(event) {
    if (event.keyCode === 13) return btnSubmit.click(); 
}

liSavedCities.onclick = function(event) {
    const elm = event.target;
    let val;

    if (elm.nodeName === "LI") {
        return val = document.querySelector("#" + elm.id).querySelector("a").textContent;
    
    } else if (elm.nodeName === "A") {
        const parent = elm.closest("li");
        
        return val = parent.querySelector("a").textContent;
    
    } else if (elm.nodeName === "I") {
        const parent = elm.closest("li");
        const id = parent.id.substring(3);

        removeCityFromAppData(id);
        
        return liSavedCities.removeChild(parent);
    }

    if (val) return callPositionStackAPI(val);
}
/* END: EVENT LISTENERS */


/* START -- DATA PERSISTENCE FUNCTIONS */
const addCityToAppData = (city) => {
    if (arrValidate_Length()) {
        appData.arrCities.push(city);

        return localStorage.setItem("weatherDash", JSON.stringify(appData));
    } else {
        return handleErrors("arr");
    }
}

const removeCityFromAppData = (name) => {
    const arr = appData.arrCities;
    
    name = titleCaseString(name);
    
    appData.arrCities = arr.filter(item => item != name);

    return localStorage.setItem("weatherDash", JSON.stringify(appData));
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
    
    return appendWeatherDataToDOM(response); 
};
/* END -- API CALLS */


/* START -- STRING FORMATTING FUNCTIONS */
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

const trimString = (str) => {
    return str = str.trim();
}

const formatTimeString = (property, date) => {
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
/* END -- STRING FORMATTING FUNCTIONS */


/* START -- DOM MANIPULATION */
const appendWeatherDataToDOM = (data) => {
    const ul_current = document.querySelector("#current-weather")
    const current = data.current;
    
    for (let item in current) {
        const property = item;
        let content = current[item];

        if (property === "sunrise" || property === "sunset") {
            content = formatTimeString(property, content);
        }

        if (typeof content === "number" || typeof content === "string") {
            let p = ul_current.querySelector(`li.${property} p:first-of-type`);
            
            if (p) p.textContent = content;
        }

        if (typeof content === "object" && property === "weather") {
            const ul = ul_current.querySelector('li.weather ul');
            
            const li_main = document.createElement("li");
            const li_desc = document.createElement("li"); 
            
            const p_main = document.createElement("p");
            const p_desc = document.createElement("p");
            
            const str = `Description: `;
            
            li_main.textContent = str;
            li_desc.textContent = str;

            for (let index in content) {
                const { main, description } = content[index];
                
                p_main.textContent += main;
                p_desc.textContent += description;

                if (content.indexOf(index) > -1 ||
                    content.indexOf(index) >= content.length) {
                    li_main.textContent += `, `;
                    li_desc.textContent += `, `;
                }

                li_main.appendChild(p_main);
                li_desc.appendChild(p_desc);
            }
            ul.appendChild(li_main);
            ul.appendChild(li_desc);
        }
    }

}

const appendCityToList = (data) => {
    const ul_savedCities = document.querySelector('#list-saved-cities');
    const fragment = document.createDocumentFragment();
    
    const li = document.createElement("li");
    const a = document.createElement("a");
    const i = document.createElement("i");
    
    const strLowerCase = data.toLowerCase();

    li.id = `li-${strLowerCase}`;
    
    a.textContent = data;
    
    i.classList = "fas fa-trash alt";
    
    li.appendChild(a);
    li.appendChild(i);
    
    fragment.appendChild(li);
    
    return ul_savedCities.appendChild(fragment);
}

const loadCitiesToList = () => {
    appData.arrCities.forEach(data => {
        return appendCityToList(data);
    });
}

const updateNumberOfCities = () => {
    const arr = appData.arrCities;
    const p = document.querySelector('p#stats-storage');

    return p.textContent =  arr.length + " of 5 cities";
}
/* END -- DOM MANIPULATION */


/* START -- SCRIPT INITIALIZATION */
forwardResponseFromGeoLocation()
.then((data) => { 
    callOpenWeatherAPI(data.coords.latitude, data.coords.longitude) 
}).catch((err) => {
    return handleErrors(err);
    //add fallback --> does user want to give IP city instead? callIpAPI()
});

loadCitiesToList();

updateNumberOfCities();