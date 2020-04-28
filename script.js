/* variable declarations */
const unitFormats = ["metric", "imperial"];
const timeFormats = ["12", "24"];
let current_unitFormat = "metric";



/* promise functions */
const getWeather_dataCoords = () => {
    return new Promise(function(resolve, reject) {
        navigator.geolocation.getCurrentPosition(resolve, reject);
    });
}

const getWeather_geoFwd = (address) => {
    return geoFwdAPI(address);
}

const getWeather_ip = () => {
    return ipAPI();
}

const errorHandler = (data) => { //find all the errors and make the site behave accordingly
    console.log(data);
    switch (data.code) {
        case 2:
            //geolocation cannot connect to internet
            break;
        case 401:
            //invalid API key
            break;
        default:
            break;
    }
    //console.log("Error code:", data.code, "\nMessage:",  data.message);
    //fall back?
};

const geoFwdAPI = (address) => { //call Geo Forwarding API
    const apiKey = `74d5b9f01b4b1c640e8b2c7a401a3f33`;
    const callURL = `http://api.positionstack.com/v1/forward?access_key=${apiKey}&query=${address}&limit=1`;
    return fetch(callURL)
    .then(response => response.json())
    .then(geoFwd)
    .catch(err => { errorHandler(err) });
}

const geoFwd = (response) => { //process Geo Forwarding response, call Weather API
    let {latitude, longitude} = response.data[0];
    weatherAPI(latitude, longitude);
}

const weatherAPI = (latitude, longitude) => { //call Weather API
    const apiKey = `afc3b45d0bea226dd7cffba0f8efb229`;
    const unitFormat = `metric`;
    const callURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&units=${unitFormat}&appid=${apiKey}`;
    return fetch(callURL)
    .then(response => response.json())
    .then(renderResponse)
    .catch(err => { errorHandler(err) });
}

const ipAPI = () => {
    const callURL = `http://ip-api.com/json/?fields=status,message,query,lat,lon`;
    return fetch(callURL)
    .then(response => response.json())
    .then(ipCoordCall)
    .catch(err => { errorHandler(err) });
}

const ipCoordCall = (response) => {
    let {lat, lon} = response;
    weatherAPI(lat, lon);
}

const renderResponse = (response) => {
    appendDOM_City(response); 
    updateP_statsStorage();
};



/* data persistence functions */

const arrDefaultData = {
    default_unit: "metric",
    cities: ["Prague", "Copenhagen"]
};

if (!localStorage.weatherDash || localStorage.weatherDash === "[]") {
    localStorage.setItem("weatherDash", JSON.stringify(arrDefaultData));
}

let jData = JSON.parse(localStorage.weatherDash);

const addArr_City = (city) => {
    if (arrValidate_Length()) {
        jData.cities.push(city);
        localStorage.setItem("weatherDash", JSON.stringify(jData));
    } else {
        console.log("jData Cities is too long!");
    }
}

const removeArr_City = (name) => {
    const arr = jData.cities;
    name = titleCase(name);
    jData.cities = arr.filter(item => item != name);
    return localStorage.setItem("weatherDash", JSON.stringify(jData));
}



/* format & validator functions */

const inputFormat = (str) => {
    return str = str.trim();
}

const arrValidate_Length = () => {
    const bool = (jData.cities.length < 5);
    return bool;
}

const arrValidate_City = (city) => {
    const arr = jData.cities;
    const bool = arr.includes(city);
    return bool;
}

const timeFormat = (property, date) => {
    switch (property) {
        case "sunrise":
        case "sunset":
        case "dt":
            let newDate = new Date(date);
            let strTime = `${newDate.getHours()}.${newDate.getMinutes()}`;
            console.log(strTime);
            return strTime;
        default: break;
    }
}

const titleCase = (str) => {
    let temp = str.toLowerCase().split(" ");
    for (let i = 0; i < temp.length; i++) {
        temp[i] = temp[i][0].toUpperCase() + temp[i].slice(1);
    }
    return str = temp.join(" ");
}



/* DOM functions */
const appendDOM_City = (data) => {
    const ul_dt = document.getElementById("ul-data-tabs");
    const fragment = document.createDocumentFragment();

    const ul_current = document.querySelector("#current-weather")

    const {
        current,
        daily,
        hourly
    } = data;
    
    for (let item in current) {
        const property = item;
        let content = current[item];
        
        switch (property) {
            case "sunrise":
            case "sunset":
            case "dt":
                let newDate = new Date(content*1000);
                let strTime = `${newDate.getHours()}.${newDate.getMinutes()}`;
                content = strTime;
                break;
            default: break;
        }

        if (typeof content === "number" || typeof content === "string") {
            let p = ul_current.querySelector(`li.${property} p:first-of-type`);
            if (p) { p.textContent = content; }
        }

        if (typeof content === "object" && property === "weather") { //needs optimization
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

const appendLi_City = (data) => {
    const ul_savedCities = document.querySelector('#list-saved-cities');
    const fragment = document.createDocumentFragment();
    const li = document.createElement("li");
    const a = document.createElement("a");
    const strLowerCase = data.toLowerCase();
    const i_trash = document.createElement("i");

    i_trash.classList = "fas fa-trash alt";

    a.textContent = data;
    
    li.id = `li-${strLowerCase}`;
    
    li.appendChild(a);
    li.appendChild(i_trash);
    
    fragment.appendChild(li);
    
    ul_savedCities.appendChild(fragment);
}

const loadLi_Cities = () => {
    jData.cities.forEach(data => {
        return appendLi_City(data);
    });
}


const updateP_statsStorage = () => {
    const arrCities = jData.cities;
    const p = document.querySelector('p#stats-storage');
    p.textContent =  arrCities.length + " of 5 cities";
}



/* event listeners */

const btnSubmit = document.querySelector('#search-bar button[type="submit"]');
const inputSubmit = document.querySelector('#search-bar input[type="text"]');

btnSubmit.onclick = function() {
    let val = inputSubmit.value;
        val = inputFormat(val);
    if (arrValidate_Length() && val.length > 0 && arrValidate_City(val) === false) {
        addArr_City(val); //await success from getWeather_geoFwd()
        appendLi_City(val); //await success from getWeather_geoFwd()
        return getWeather_geoFwd(val);

    } else {
        return console.log("jData Cities is too long, or JDataCities already has the city name!");
    }
}
//undefined -- error from server -- enter a valid city name..

inputSubmit.onkeypress = function(event) {
    if (event.keyCode === 13) { btnSubmit.click(); }
}

const liCities = document.querySelector("#list-saved-cities");
liCities.onclick = function(event) {
    const elm = event.target;
    let val;
    if (elm.nodeName === "LI") {
        val = document.querySelector("#" + elm.id).querySelector("a").textContent;

    } else if (elm.nodeName === "A") {
        const parent = elm.closest("li");
        val = parent.querySelector("a").textContent;
    } else if (elm.nodeName === "I") {
        const parent = elm.closest("li");
        const id = parent.id.substring(3);
        console.log(id);
        removeArr_City(id);
        return liCities.removeChild(parent);
    }
    if (val) { return getWeather_geoFwd(val); }
}

/* script init */

getWeather_dataCoords()
.then((data) => { 
    weatherAPI(data.coords.latitude, data.coords.longitude) 
}).catch((err) => {
    return errorHandler(err);
    //add fallback --> does user want to give IP address instead? ipAPI()
});

//getWeather_geoFwd("Cheb");

loadLi_Cities();

updateP_statsStorage();