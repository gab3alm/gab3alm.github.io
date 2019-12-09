AFRAME.registerComponent('location-click', {
    schema: {
        active: String,
    },
    init: function (){
        const data = this.data;
        const el = this.el; //a-image
        const locationName = el.getAttribute('name');
        el.addEventListener('mouseover', (ev)=>{
            ev.stopPropagation();
            document.querySelector('#main-header').innerHTML = locationName;
        });
        el.addEventListener('mouseleave', (ev)=>{
            ev.stopPropagation();
            document.querySelector('#main-header').innerHTML = 'HEADER :)';
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
        &limit=15
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

function renderPlaces(places) {
    let scene = document.querySelector('a-scene');
    places.forEach((place) => {
        let latitude = place.location.lat;
        let longitude = place.location.lng;

        // add place name
        // let text = document.createElement('a-entity');
        // const linkValue = `href: #; title: ${place.name}; image: #marker;`;
        // text.setAttribute('scale', '1 1');
        // text.setAttribute('link', linkValue);

        // let text = document.createElement('a-link');
        // text.setAttribute('href', '#');
        // text.setAttribute('title', place.name);
        // text.setAttribute('scale', '5 5 5');
        // text.setAttribute('name', `${place.name}`);

        let text = document.createElement('a-image');
        text.setAttribute('name', `${place.name}`);
        text.setAttribute('src', '#marker');
        text.setAttribute('scale', '10 10');
        text.setAttribute('location-click', 'true');

        text.setAttribute('gps-entity-place', `latitude: ${latitude}; longitude: ${longitude};`);
        text.addEventListener('loaded', () => {
            window.dispatchEvent(new CustomEvent('gps-entity-place-loaded'))
        });

        // text.addEventListener('click', (ev)=>{
        //     ev.stopPropagation();
        //     ev.preventDefault();
        //
        //     console.log("YOU ARE CLICKING!");
        //     const name = ev.target.getAttribute('name');
        //     const mainHeader = document.querySelector('#main-header');
        //     mainHeader.innerHTML = name;
        // });

        scene.appendChild(text);
    });
}