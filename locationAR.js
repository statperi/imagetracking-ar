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
    let entity = document.createElement('a-entity');

    entity.setAttribute('scale', model.scale);
    entity.setAttribute('rotation', model.rotation);
    entity.setAttribute('position', model.position);
    entity.setAttribute('gltf-model', model.url);
    entity.setAttribute('info', model.info);
    entity.setAttribute('animation-mixer', '');
    entity.setAttribute('gps-entity-place', `latitude: ${location.latitude}; longitude: ${location.longitude};`);

    scene.appendChild(entity);


    // let scale = model.scale.substr(0, 2); // model's scale

    let text = document.createElement('a-text');
    text.setAttribute('value', model.info);
    text.setAttribute('look-at', '[gps-camera]');
    text.setAttribute('gps-entity-place', `latitude: ${location.latitude}; longitude: ${location.longitude};`);
    text.setAttribute('scale', model.text_scale)

    //scaleUp(text, scale * 10)

    scene.appendChild(text);

    refresh(entity, text, autoscale);
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

    }, 15000);
}


function scaleUp(model, scale) {
    model.setAttribute('scale', scale + ' ' + scale + ' ' + scale + ' ');
}
