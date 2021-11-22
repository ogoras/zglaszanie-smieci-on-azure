var map, datasource, client, popup, searchInput, resultsPanel, searchInputLength, centerMapOnResults;

//The minimum number of characters needed in the search input before a search is performed.
var minSearchInputLength = 3;

//The number of ms between key strokes to wait before performing a search.
var keyStrokeDelay = 150;

function htmlToElement(html) {
    var template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
}

function GetMap() {
    //Initialize a map instance.
    map = new atlas.Map('myMap', {
        center: [-118.270293, 34.039737],
        zoom: 2,
        view: 'Auto',

        //Add authentication details for connecting to Azure Maps.
        authOptions: {
            //Use Azure Active Directory authentication.
            //                    authType: 'anonymous',
            //                    clientId: '04ec075f-3827-4aed-9975-d56301a2d663', //Your Azure Active Directory client id for accessing your Azure Maps account.
            //                    getToken: function (resolve, reject, map) {
            //URL to your authentication service that retrieves an Azure Active Directory Token.
            //                        var tokenServiceUrl = "https://azuremapscodesamples.azurewebsites.net/Common/TokenService.ashx";

            //                        fetch(tokenServiceUrl).then(r => r.text()).then(token => resolve(token));
            //                    }

            //Alternatively, use an Azure Maps key. Get an Azure Maps key at https://azure.com/maps. NOTE: The primary key should be used as the key.
            authType: 'subscriptionKey',
            subscriptionKey: subscriptionKey
        }
    });

    function createMarker(pos0, pos1, givenid, givenstate) {
        radio = pos0.toString().concat(" ").concat(pos1.toString());
        var content = document.createElement('div');
        content.style.setProperty('padding', '15px');
        content.style.setProperty('color', 'black');
        var option1 = document.createElement('input');
        option1.type = 'radio';
        option1.id = 'littered';
        option1.name = radio;
        content.appendChild(option1);
        var label1 = document.createElement('label');
        label1.setAttribute('for', 'littered')
        label1.innerText = 'Littered';
        content.appendChild(label1);
        content.appendChild(document.createElement('br'));
        var option2 = document.createElement('input');
        option2.type = 'radio';
        option2.id = 'tbcleaned';
        option2.name = radio;
        content.appendChild(option2);
        var label2 = document.createElement('label');
        label2.setAttribute('for', 'tbcleaned')
        label2.innerText = 'To Be cleaned';
        content.appendChild(label2);
        content.appendChild(document.createElement('br'));
        var option3 = document.createElement('input');
        option3.type = 'radio';
        option3.id = 'cleaned';
        option3.name = radio;
        content.appendChild(option3);
        var label3 = document.createElement('label');
        label3.setAttribute('for', 'cleaned')
        label3.innerText = 'Cleaned';
        content.appendChild(label3);
        content.appendChild(document.createElement('br'));
        var saveButton = document.createElement('input');
        saveButton.type = 'button';
        saveButton.value = 'Save';
        saveButton.addEventListener('click', function () {
            var radios = content.querySelectorAll('input[type=radio]');
            if (radios[0].checked) {
                const put1 = new XMLHttpRequest();
                const url1 = '/points/'.concat(marker.properties.id);
                put1.open("PUT", url1);
                put1.setRequestHeader("Content-Type", "application/json");
                var data = JSON.stringify({ "state": 0 });
                put1.send(data);
                marker.setOptions({ color: 'red' });
            } else if (radios[1].checked) {
                const put2 = new XMLHttpRequest();
                const url2 = '/points/'.concat(marker.properties.id);
                put2.open("PUT", url2);
                put2.setRequestHeader("Content-Type", "application/json");
                var data = JSON.stringify({ "state": 1 });
                put2.send(data);
                marker.setOptions({ color: 'orange' });
            } else if (radios[2].checked) {
                const put3 = new XMLHttpRequest();
                const url3 = '/points/'.concat(marker.properties.id);
                put3.open("DELETE", url3);
                put3.setRequestHeader("Content-Type", "application/json");
                put3.responseType = 'text';
                put3.onreadystatechange = function () {
                    if (put3.readyState === XMLHttpRequest.DONE) {
                        var status = put3.status;
                        if (status === 0 || (status >= 200 && status < 400)) {
                            marker.setOptions({ color: 'green' });
                            marker.setOptions({ popup: new atlas.Popup({
                                content: "<div style='padding: 10px; color: black;'>Dziękujemy za pomoc naszej planecie!</div>",
                                pixelOffset: [0, -30]
                            }),})
                            marker.togglePopup();
                            setTimeout(function(){ map.markers.remove(marker); }, 3000);
                        } else {
                            // Oh no! There has been an error with the request!
                        }
                    }
                };
                put3.send();
            }
            marker.togglePopup();
        });
        content.appendChild(saveButton);
        var marker = new atlas.HtmlMarker({
            color: 'red',
            position: [pos0, pos1],
            popup: new atlas.Popup({
                content: content,
                pixelOffset: [0, -30]
            }),
        });
        marker.properties = {
            id: givenid,
            state: givenstate
        }
        if (marker.properties.state == 0) {
            marker.setOptions({ color: 'red' });
        } else if (marker.properties.state == 1) {
            marker.setOptions({ color: 'orange' })
        }
        map.events.add('contextmenu', marker, () => {
            marker.togglePopup();
        });
        map.markers.add(marker);
    }
    map.events.add('ready', function () {
        const get = new XMLHttpRequest();
        const url = '/points'
        get.open("GET", url);
        get.setRequestHeader("Content-Type", "application/json");
        get.onreadystatechange = function () {
            if (get.readyState === XMLHttpRequest.DONE) {
                var status = get.status;
                if (status === 0 || (status >= 200 && status < 400)) {
                    allPoints = JSON.parse(get.responseText);
                    for (let i = 0; i < allPoints.length; i++) {
                        positions = allPoints[i]['coordinates'].split(" ");
                        id = allPoints[i]['id'];
                        state = allPoints[i]['state'];
                        createMarker(positions[0], positions[1], id, state);
                    }
                } else {
                    // Oh no! There has been an error with the request!
                }
            }
        };
        get.send();
        map.events.add('click', function (e) {
            x = e.position[0];
            y = e.position[1];
            var popupContent = document.createElement('div');
            popupContent.innerHTML = "Is this place littered?<br>";
            popupContent.style.setProperty('padding', '15px');
            popupContent.style.setProperty('color', 'black');
            var yesButton = document.createElement('input');
            yesButton.type = 'button';
            yesButton.value = 'Yes';
            yesButton.style.setProperty('margin-right', '10px');
            var noButton = document.createElement('input');
            noButton.type = 'button';
            noButton.value = 'No';
            yesButton.addEventListener('click', function () {
                radio = e.position[0].toString().concat(" ").concat(e.position[1].toString());
                const Http = new XMLHttpRequest();
                const url = '/points'
                Http.open("POST", url);
                Http.setRequestHeader("Content-Type", "application/json");
                var data = JSON.stringify({ "coordinates": radio });
                Http.onreadystatechange = function () {
                    if (Http.readyState === XMLHttpRequest.DONE) {
                        var status = Http.status;
                        if (status === 0 || (status >= 200 && status < 400)) {
                            createMarker(x, y, Http.responseText, 0);
                        } else {
                            // Oh no! There has been an error with the request!
                        }
                    }
                };
                Http.send(data);
                popup.remove();
            });
            noButton.addEventListener('click', function () {
                popup.remove();
            });
            popupContent.appendChild(yesButton);
            popupContent.appendChild(noButton);
            var popup = new atlas.Popup({
                content: popupContent,
                position: [e.position[0], e.position[1]],
            });
            popup.open(map);
        });
    });
}