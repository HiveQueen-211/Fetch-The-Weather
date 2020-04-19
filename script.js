//variable declarations
const unitFormats = ["metric", "imperial"];
let current_unitFormat = "metric";

let settings = {
    default_unit: "metric",   
    city_names: [
        {
            name: "Tokyo", 
            default: false
        },
        {
            name: "Copenhagen",
            default: true
        }
    ]
};


//promise functions
const getWeather_DataCoords = () => {
    return new Promise(function(resolve, reject) {
        navigator.geolocation.getCurrentPosition(resolve, reject);
    });
}

const getWeather_geoFwd = (address) => {
    return geoFwdAPI(address);
}

const errorHandler = (data) => { //find all the errors and make the site behave accordingly
    //console.log(data);
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
    console.log("Error code:", data.code, "\nMessage:",  data.message);
    //fall back?
};

const geoFwdAPI = (address) => { //call Geo Forwarding API
    const apiKey = `74d5b9f01b4b1c640e8b2c7a401a3f33`;
    const callURL = `http://api.positionstack.com/v1/forward?access_key=${apiKey}&query=${address}&limit=1`;
    fetch(callURL)
    .then(response => response.json())
    .then(geoForward)
    .catch(err => { errorHandler(err) });
}

const weatherAPI = (latitude, longitude) => { //call Weather API
    const apiKey = `afc3b45d0bea226dd7cffba0f8efb229`;
    const callURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&appid=${apiKey}`;
    fetch(callURL)
    .then(response => response.json())
    .then(renderResponse)
    .catch(err => { errorHandler(err) });
}

const geoForward = (response) => { //process Geo Forwarding response, call Weather API
    let {latitude, longitude} = response.data[0];
    weatherAPI(latitude, longitude);
}

const renderResponse = (response) => { //render api contents to DOM
    console.log("congratulations!");
    console.log(response);
    return;
};


//event listeners



//script init
if (!localStorage.weatherDash) {
    localStorage.setItem("weatherDash", JSON.stringify(settings));
}

getWeather_DataCoords()
.then((data) => { 
    weatherAPI(data.coords.latitude, data.coords.longitude) 
}).catch((err) => {
    errorHandler(err)
});

getWeather_geoFwd("Cheb");

/* NOTE-ATO POTATO */ 

//when is the API called?
//The API is called when:
//  The user searches for weather by city --> getWeather_geoFwd()
//  The user provides their GeoLocation --> getWeather_DataCoords()
//  The user has previously set a default city, and is coming back to check on their location
//      And what if the user is currently in their default city? Will Geolocation still be the default?

//How will weather from these different cities be displayed? -- How will the UI look?