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
    console.log(lat, lon);
    weatherAPI(lat, lon);
}

const renderResponse = (response) => {
    //console.log(response.timezone, response.lat, response.lon);
    console.log(response);
    //appendDOM_City(response);
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

console.log(jData);

const addArr_City = (city) => {
    if (arrValidate_Length()) {
        jData.cities.push(city);
        localStorage.setItem("weatherDash", JSON.stringify(jData));
    } else {
        console.log("jData Cities is too long!");
    }
}

const removeArr_City = (name) => {
    jData.cities.splice(name, 1);
    return localStorage.setItem("weatherDash", JSON.stringify(jData));
}


/* DOM functions */
const appendDOM_City = (data) => { //function for manipulating weather data
    const ul_dt = document.getElementById("ul-data-tabs");
    const fragment = document.createDocumentFragment();

    const {
        current,
        daily,
        hourly
    } = data;
    
    const frag_current = document.createDocumentFragment();
    const li_daily = document.createDocumentFragment();
    const li_hourly = document.createDocumentFragment();
    
    let ul_current = document.createElement("ul")

    for (let item in current) {
        let li = document.createElement("li");
        
        if (typeof current[item] === "object") {
            let ul_inner = document.createElement("ul");
            for (let i in current[item]) {
                //console.log(i)
                /*let p = document.createElement("p");
                p.className = i;
                p.textContent = item[i];
                ul_inner.appendChild(p);*/
            }
            //console.log(current[item]);
        }
        else {
            let p = document.createElement("p");
            
            p.className = item;
            p.textContent = current[item];
            
            li.appendChild(p);
            ul_current.appendChild(li);
        }
    }
    //console.log(ul_current);
    //console.log(data);

}

const appendLi_City = (data) => {
    const ul_savedCities = document.querySelector('#list-saved-cities');
    const fragment = document.createDocumentFragment();
    const li = document.createElement("li");
    const a = document.createElement("a");
    const strLowerCase = data.toLowerCase();
    
    a.textContent = data;
    li.id = `li-${strLowerCase}`;
    li.appendChild(a);
    fragment.appendChild(li);
    ul_savedCities.appendChild(fragment);
}

const loadLi_Cities = () => {
    jData.cities.forEach(data => {
        return appendLi_City(data);
    });
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


/* event listeners */

const btnSubmit = document.querySelector('#search-bar button[type="submit"]');
const inputSubmit = document.querySelector('#search-bar input[type="text"]');

btnSubmit.onclick = function() {
    let val = inputSubmit.value;
        val = inputFormat(val);
    if (arrValidate_Length() && val.length > 0 && arrValidate_City(val) === false) {
        addArr_City(val);
        appendLi_City(val);
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

getWeather_geoFwd("Cheb");

loadLi_Cities();



/*  NOTE-ATO POTATO:

    - When should getWeather_geoFwd() be called?
        thinking --> When the user searches for a city in the query?

    - When should the ipAPI be called?
        + The user will click on a prompt, which will ask them for permission to use their IP address
        + If the user gives permission, ipAPI() will get data.

    - To use "in-house conversions" or not?
        thinking(y) --> limit the # of calls to an API.
                    --> if the in-house conversions are done on app, it would be more functional
                    --> if done automatically, then values can be created automatically
                    --> should I use object types?
        thinking(n) --> calling and storing everything at once will reduce necessary calculations..
    
    - Concern: I cannot get city name from OpenWeather API call. Not good for geolocation
               I can get city name from reverse geolocation, by entering it into the query
               I can get city name from ip api

    - What data should I save and store from the API? & what data should I display from the API?

    - I should put:
        + A refresh data button

    - Need to go through the errors, at some point!
*/