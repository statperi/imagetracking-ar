window.onload = () => {
    getCurrentLocation();
};

var Pointer = () => {
    return {
        code: 'pointer',
        url: './assets/map_pointer/scene.gltf',
        scale: '1 1 1',
        lookAt: '[camera]',
        gestureConfig: 'minScale: 0.25; maxScale: 10',
        info: 'Pin',
        text: {
            scale: '40 40 40',
            lookAt: '[camera]',
            gestureConfig: 'minScale: 0.25; maxScale: 10',
            text: 'Pin'
        }
    }
}

var Star = () => {
    return {
        code: 'star',
        url: './assets/star/scene.gltf',
        scale: '5 5 5',
        rotation: '0 0 0',
        // position: '0 30 0',
        lookAt: '[camera]',
        gestureConfig: 'minScale: 0.25; maxScale: 10',
        info: 'Star'
    }
}


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

function getCoordinatesSuccess(response) {
    for (var i = 0; i < response.length; i++) {
        let pointer = Pointer();
        pointer.location = pointer.text.location = {
            latitude: response[i].latitude,
            longitude: response[i].longitude
        };

        pointer.info = pointer.text.text = response[i].name + '\n' + response[i].description;

        if (response[i].description == "Open: Now") pointer.text.color = "#008000";
        else                                        pointer.text.color = "#FF0000";
        

        createEntity(pointer, true);
    }

    // poolbegEntity();
}

function poolbegEntity() {
    let poolbegModel = Pointer();

    poolbegModel.info = 'Poolbeg';
    poolbegModel.scale = '50 50 50';
    poolbegModel.text = {
        text: 'Poolbeg',
        scale: '500 500 500',
    }

    poolbegModel.location = {
        latitude: 53.3401000,
        longitude: -6.187800
    };

    createEntity(poolbegModel);
}

function createEntity(model, autoscale) {
    let scene = document.querySelector('a-scene');

    let entityEl = createEntityElement(model);
    scene.appendChild(entityEl);

    if (model.text) {
        let textEl = createTextElement(model.text);
        scene.appendChild(textEl);
        refresh(entityEl, textEl, autoscale);
    }
}

function refresh(entity, text, autoscale) {
    var intervalId =
        setInterval(function () {
            distance = entity.getAttribute('distance');

            if (!distance)
                return;

            text.setAttribute('value', entity.getAttribute('info') + ' - ' + Math.trunc(distance) + ' meters');

            if (autoscale) {
                let scale = calculateScale(distance);
                setScale(entity, scale);
                setScale(text, scale * 10);
            }

            if (Math.trunc(distance) <= 30) {
                clearInterval(entity.getAttribute('intervalId'));
                showSuccess(entity, text);
            }

        }, 1000);

    entity.setAttribute('intervalId', intervalId);
}

function showSuccess(entity, text) {
    let star = Star();
    entity.setAttribute('scale', star.scale);
    entity.setAttribute('gltf-model', star.url);
    entity.setAttribute('info', star.info);
    entity.removeAttribute('gesture-handler');

    text.remove();
}

function setScale(model, scale) {
    model.setAttribute('scale', scale + ' ' + scale + ' ' + scale + ' ');
}

function calculateScale(distance) {
    let scale = 1;

    if (distance > 100) scale = 4;
    if (distance > 200) scale = 8;
    if (distance > 500) scale = 16;
    if (distance > 1000) scale = 20;
    if (distance > 3000) scale = 50;
    if (distance > 5000) scale = 70;

    return scale;
}

function createEntityElement(config) {
    let element = document.createElement('a-entity');
    element.setAttribute('scale', config.scale);
    //element.setAttribute('rotation', config.rotation);
    element.setAttribute('position', config.position);
    element.setAttribute('gltf-model', config.url);
    element.setAttribute('info', config.info);
    element.setAttribute('animation-mixer', '');
    element.setAttribute('success', 'false');
    element.setAttribute('gps-entity-place', `latitude: ${config.location.latitude}; longitude: ${config.location.longitude};`);

    if (config.lookAt == '[camera]') {
        element.setAttribute('look-at', '[camera]');
    }
    else if (config.gestureConfig) {
        element.setAttribute('gesture-handler', config.gestureConfig);
        element.classList.add('clickable');
    }

    return element;
}

function createTextElement(config) {
    let element = document.createElement('a-text');
    element.setAttribute('value', config.text);
    element.setAttribute('scale', config.scale)
    element.setAttribute('look-at', '[gps-camera]');
    element.setAttribute('gps-entity-place', `latitude: ${config.location.latitude}; longitude: ${config.location.longitude};`);

    if (config.color) {
        element.setAttribute('color', config.color);
    }

    if (config.lookAt == '[camera]') {
        element.setAttribute('look-at', '[camera]');
    }
    else if (config.gestureConfig) {
        element.setAttribute('gesture-handler', 'minScale: 0.25; maxScale: 10');
        element.classList.add('clickable');
    }
    

    return element;
}

