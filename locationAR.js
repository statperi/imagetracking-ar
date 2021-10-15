window.onload = () => {
    getCurrentLocation();
};

var ar_models = [{
    code: 'pointer',
    url: './assets/map_pointer/scene.gltf',
    scale: '2 2 2',
    text_scale: '50 50 50',
    rotation: '0 180 0',
    info: 'Map Pointer'
}];


function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(processGetCoordinates);
    } else {
        alert("Sorry, your browser does not support HTML5 geolocation.");
    }
}


function processGetCoordinates(currentLocation) {

    var data = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude
    };

    $.ajax({
        url: 'https://4ov2cmmwri.execute-api.eu-west-1.amazonaws.com/Prod/api/coordinates',
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
        },
        crossDomain: true,
        type: 'POST',
        dataType: 'json',
        data: JSON.stringify(data),
        success: getCoordinatesSuccess,
        error: function (err) {
            alert("Could not get target locations");
        }
    });
}


var modelIndex = 0;
function getCoordinatesSuccess(response) {
    for (var i = 0; i < response.length; i++) {
        modelIndex++;

        let position = response[i];
        let newIndex = modelIndex % ar_models.length;
        let ar_model = ar_models[newIndex];

        createModel(ar_model, position, true);
    }

    poolbegModel();
}


function createModel(model, location, autoscale) {
    let scene = document.querySelector('a-scene');
    
    let entity = createModelElement({
        url: model.url,
        info: model.info,
        position: model.position,
        rotation: model.rotation,
        scale: model.scale,
        location: location
    });
    
    let text_element = createTextElement({
        info: model.info,
        scale: model.text_scale,
        location: location
    });

    scene.appendChild(entity);
    scene.appendChild(text_element);


    refresh(entity, text_element, autoscale);
}

function poolbegModel() {
    let poolbegModel = {
        code: 'pointer',
        url: './assets/map_pointer/scene.gltf',
        scale: '50 50 50',
        text_scale: '500 500 500',
        rotation: '0 180 0',
        info: 'Poolbeg'
    }

    createModel(poolbegModel, { latitude: 53.3401000, longitude: -6.187800 });
}

function refresh(model, text, autoscale) {
    setInterval(function () {
        distance = model.getAttribute('distance');

        if (distance) {
            text.setAttribute('value', model.getAttribute('info') + ' - ' + Math.trunc(distance) + ' meters');
        }

        if (autoscale) {
            let scale = model.getAttribute('scale');
            scaleUp(model, scale.x + 0.2);
        }

        if (Math.trunc(distance) < 5) {
            showSuccess(model, text);
        }

    }, 15000);
}


function showSuccess(model, text) {
    let scene = document.querySelector('a-scene');

    let success = createTextElement({
        info: "You Are Here!!!",
        scale: "10 10 10",
        location: model.getAttribute('gps-entity-place')
    });

    scene.appendChild(success);

    model.remove(); // remove current models
    text.remove();
}

function scaleUp(model, scale) {
    model.setAttribute('scale', scale + ' ' + scale + ' ' + scale + ' ');
}



function createModelElement(config) {
    let element = document.createElement('a-entity');
    element.setAttribute('scale', config.scale);
    element.setAttribute('rotation', config.rotation);
    element.setAttribute('position', config.position);
    element.setAttribute('gltf-model', config.url);
    element.setAttribute('info', config.info);
    element.setAttribute('animation-mixer', '');
    element.setAttribute('gps-entity-place', `latitude: ${config.location.latitude}; longitude: ${config.location.longitude};`);
    return element;
}

function createTextElement(config) {
    let element = document.createElement('a-text');
    element.setAttribute('value', config.info);
    element.setAttribute('scale', config.scale)
    element.setAttribute('look-at', '[gps-camera]');
    element.setAttribute('gps-entity-place', `latitude: ${config.location.latitude}; longitude: ${config.location.longitude};`);
    return element;
}

