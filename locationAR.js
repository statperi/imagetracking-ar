window.onload = () => {
    getCurrentLocation();
};

var ar_models = [{
    code: 'pointer',
    url: './assets/map_pointer/scene.gltf',
    scale: '5 5 5',
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

        createModel(ar_model, position);
    }


    poolbegModel();
}


function createModel(model, location) {
    let scene = document.querySelector('a-scene');
    let entity = document.createElement('a-entity');
    entity.setAttribute('gps-entity-place', `latitude: ${location.latitude}; longitude: ${location.longitude};`);

    setModel(model, entity);

    scene.appendChild(entity);


    let scale = model.scale.substr(0, 2); // model's scale

    let text = document.createElement('a-text');
    text.setAttribute('value', model.info);
    text.setAttribute('gps-entity-place', `latitude: ${location.latitude}; longitude: ${location.longitude};`);

    scaleUp(text, scale * 10)

    scene.appendChild(text);


    autoScale(entity, text);
}


function setModel(model, entity) {
    let element = $(entity);

    if (model.scale) element.attr('scale', model.scale);
    if (model.rotation) element.attr('rotation', model.rotation);
    if (model.position) element.attr('position', model.position);

    element.attr('gltf-model', model.url);
    element.attr('animation-mixer', '');
    element.attr('info', model.info);
};


function poolbegModel() {
    let poolbegModel = {
        code: 'pointer',
        url: './assets/map_pointer/scene.gltf',
        scale: '50 50 50',
        rotation: '0 180 0',
        info: 'Map Pointer'
    }

    createModel(poolbegModel, { latitude: 53.3402763, longitude: -6.189487 });
}


function autoScale(model, text) {
    setInterval(function () {
        distance = model.getAttribute('distance');

        if (distance) {
            text.setAttribute('value', model.getAttribute('info') + ' - ' + Math.trunc(distance) + ' meters');
        }

        let scale = model.getAttribute('scale');
        scaleUp(model, scale.x + 2);

    }, 15000);
}


function scaleUp(model, scale) {
    model.setAttribute('scale', scale + ' ' + scale + ' ' + scale + ' ');
}
