window.onload = () => {
    getCurrentLocation();
};

var map_pointer = () => {
    return {
        code: 'pointer',
        url: './assets/map_pointer/scene.gltf',
        scale: '1 1 1',
        text_scale: '50 50 50',
        rotation: '0 0 0',
        // position: '0 30 0',
        info: 'Pin'
    }
}

var firework = () => {
    return {
        code: 'firework',
        url: './assets/firework/scene.gltf',
        scale: '2 2 2',
        rotation: '0 0 0',
        // position: '0 30 0',
        info: 'Firework'
    }
}

var star = () => {
    return {
        code: 'star',
        url: './assets/star/scene.gltf',
        scale: '2 2 2',
        rotation: '0 0 0',
        // position: '0 30 0',
        info: 'Star'
    }
}

var phone_booth = () => {
    return {
        code: 'phone_booth',
        url: './assets/phone_booth/scene.gltf',
        scale: '5 5 5',
        text_scale: '50 50 50',
        rotation: '0 0 0',
        // position: '0 30 0',
        info: 'Phone Booth'
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

        let pointer = map_pointer();
        pointer.location = response[i];
        createEntity(pointer, true);

        //let phone = phone_booth();
        //phone.location = response[i];
        //createEntity(phone);
    }

    poolbegModel();
}


function poolbegModel() {
    let poolbegModel = {
        code: 'pointer',
        url: './assets/map_pointer/scene.gltf',
        scale: '50 50 50',
        text_scale: '500 500 500',
        position: '0 30 0',
        rotation: '0 180 0',
        info: 'Poolbeg',
        location: {
            latitude: 53.3401000,
            longitude: -6.187800
        }
    }

    createEntity(poolbegModel);
}


function createEntity(model, autoscale) {
    let scene = document.querySelector('a-scene');
    
    let entityEl = createEntityElement({
        url: model.url,
        info: model.info,
        position: model.position,
        rotation: model.rotation,
        scale: model.scale,
        location: model.location
    });
    
    let textEl = createTextElement({
        info: model.info,
        scale: model.text_scale,
        location: model.location
    });

    scene.appendChild(entityEl);
    scene.appendChild(textEl);

    refresh(entityEl, textEl, autoscale);
}


function refresh(entity, text, autoscale) {
    setInterval(function () {
        distance = entity.getAttribute('distance');
        success = entity.getAttribute('success');

        if (!distance || success == 'true')
            return;

        text.setAttribute('value', entity.getAttribute('info') + ' - ' + Math.trunc(distance) + ' meters');

        if (autoscale) {
            let scale = entity.getAttribute('scale');
            scaleUp(entity, scale.x + 0.0002);
        }

        if (Math.trunc(distance) <= 5) {
            entity.setAttribute('success', 'true');
            showSuccess(entity, text);
        }

    }, 1000);
}


function showSuccess(entity, text) {
    let scene = document.querySelector('a-scene');

    //let success = createTextElement({
    //    info: "You Are Here!!!",
    //    scale: "10 10 10",
    //    location: model.getAttribute('gps-entity-place')
    //});

    let star = star();
    star.location = entity.getAttribute('gps-entity-place');
    let success = createEntityElement(entity);

    scene.appendChild(success);

    entity.remove(); // remove current models
    text.remove();
}

function scaleUp(model, scale) {
    model.setAttribute('scale', scale + ' ' + scale + ' ' + scale + ' ');
}



function createEntityElement(config) {
    let element = document.createElement('a-entity');
    element.setAttribute('scale', config.scale);
    element.setAttribute('rotation', config.rotation);
    element.setAttribute('position', config.position);
    element.setAttribute('gltf-model', config.url);
    element.setAttribute('info', config.info);
    element.setAttribute('animation-mixer', '');
    element.setAttribute('success', 'false');
    element.setAttribute('gps-entity-place', `latitude: ${config.location.latitude}; longitude: ${config.location.longitude};`);

    element.setAttribute('gesture-handler', 'minScale: 0.25; maxScale: 10');
    element.classList.add('clickable');

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
