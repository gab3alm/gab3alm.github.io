// const merchantSearchUrl = 'http://internal-bri-merchant-data-service-stage-52267917.us-west-2.elb.amazonaws.com:7188/merchant/search?page=0&pageSize=20&query=';
// const merchantSearchUrl = 'http://internal-bri-merchant-data-service-prod-959860708.us-west-2.elb.amazonaws.com:7188/merchant/search?page=0&pageSize=20&query=';

AFRAME.registerComponent('location-click', {
    schema: {
        active: String,
    },
    init: function (){
        const data = this.data;
        const el = this.el; //a-image
        const locationName = el.getAttribute('name');
        const businessCategory = el.getAttribute('data-category');
        el.addEventListener('mouseenter', (ev)=>{
            ev.stopPropagation();
            document.querySelector('#main-header').innerHTML = locationName;
            document.querySelector('#subheader').innerHTML = businessCategory;
        });
    },
});

window.onload = () => {
    return navigator.geolocation.getCurrentPosition(function (position) {

            // than use it to load from remote APIs some places nearby
            dynamicLoadPlaces(position.coords)
                .then((places) => {
                    renderPlaces(places);
                })
        },
        (err) => console.error('Error in retrieving position', err),
        {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 27000,
        }
    );
};

// getting places from REST APIs
function dynamicLoadPlaces(position) {
    let params = {
        radius: 300,    // search places not farther than this value (in meters)
        clientId: 'FKBJU1DV15K3RC1IZZC13MPECNSFKNYFVHN3IX521GVJXTX4',
        clientSecret: 'HDSCXQWOTR3XOVACJACSSPNJIR2KJSVG3TJOR0A0KFR2NUAX',
        version: '20300101',    // foursquare versioning, required but unuseful for this demo
    };

    // CORS Proxy to avoid CORS problems
    let corsProxy = 'https://cors-anywhere.herokuapp.com/';

    // Foursquare API
    let endpoint = `${corsProxy}https://api.foursquare.com/v2/venues/search?intent=checkin
        &ll=${position.latitude},${position.longitude}
        &radius=${params.radius}
        &client_id=${params.clientId}
        &client_secret=${params.clientSecret}
        &limit=10
        &v=${params.version}`;
    return fetch(endpoint)
        .then((res) => {
            return res.json()
                .then((resp) => {
                    return resp.response.venues;
                })
        })
        .catch((err) => {
            console.error('Error with places API', err);
        })
};

function getPlaceInfo(locationId) {
    let params = {
        clientId: 'FKBJU1DV15K3RC1IZZC13MPECNSFKNYFVHN3IX521GVJXTX4',
        clientSecret: 'HDSCXQWOTR3XOVACJACSSPNJIR2KJSVG3TJOR0A0KFR2NUAX',
        version: '20300101',    // foursquare versioning, required but unuseful for this demo
    };

    // CORS Proxy to avoid CORS problems
    let corsProxy = 'https://cors-anywhere.herokuapp.com/';

    // Foursquare API
    let endpoint = `${corsProxy}https://api.foursquare.com/v2/venues/${locationId}?
        &client_id=${params.clientId}
        &client_secret=${params.clientSecret}
        &v=${params.version}`;

    return fetch(endpoint)
        .then((res) => {
            return res.json()
                .then((resp) => {
                    return resp.response;
                })
        })
        .catch((err) => {
            console.error('Error with places API', err);
        });
}

function renderPlaces(places) {
    let scene = document.querySelector('a-scene');
    places.forEach((place) => {
        const { id, location = {}, name: locationName} = place;

        const {
            formattedAddress,
            lat: latitude,
            lng: longitude,
        } = location;

        const address = formattedAddress.join(" ");

        getPlaceInfo(id).then(data => {
            console.log("ID: ", id, " DATA: ", data);
            const { venue = {} } = data;
            const { categories = {} } = venue;
            const { name: businessCategory = '' } = categories;

            let text = document.createElement('a-image');
            text.setAttribute('name', `${place.name}`);
            text.setAttribute('src', '#marker');
            text.setAttribute('scale', '10 10');
            text.setAttribute('location-click', 'true');
            text.setAttribute('data-addr', address);
            text.setAttribute('data-category', businessCategory);

            text.setAttribute('gps-entity-place', `latitude: ${latitude}; longitude: ${longitude};`);
            text.addEventListener('loaded', () => {
                window.dispatchEvent(new CustomEvent('gps-entity-place-loaded'))
            });

            scene.appendChild(text);
        });
    });
}