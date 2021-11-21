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
            subscriptionKey: ''
        }
    });

    //Wait until the map resources are ready.
    map.events.add('ready', function () {
        map.events.add('click', function (e) {
            function createMarker(){
                var marker = new atlas.HtmlMarker({
                    color: 'red',
                    position: [e.position[0], e.position[1]],
                    popup: new atlas.Popup({
                        content: '<div style="padding:10px; color: black;"><input type="radio" id="trashed" name="state" value="Trashed"><label for="trashed">Trashed</label><br><input type="radio" id="tbcleaned" name="state" value="Cleaned"><label for="tbcleaned">To be cleaned</label><br><input type="radio" id="cleaned" name="state" value="cleaned"><label for="cleaned">Clean</label><br><button type="button" class="applyButton">Save</button></div>',
                        pixelOffset: [0, -30]
                    }),
                });
                var applyChanges = function(){

                    var popup = marker.getOptions().popup;
                    var radios = htmlToElement(popup.getOptions().content).querySelectorAll('input[type="name"]');
                    if(radios[0].checked){
                        marker.setOptions({color: 'red'});
                    } else if(radios[1].checked){
                        marker.setOptions({color: 'orange'});
                    } else if(radios[2].checked){
                        marker.setOptions({color: 'green'});
                    }
                    marker.togglePopup();
                }
                map.events.add('contextmenu', marker, () => {
                    marker.togglePopup();
                    var applyButtons = document.getElementsByClassName("applyButton");
                    for (var i = 0; i < applyButtons.length; i++) {
                        applyButtons[i].addEventListener('click', applyChanges, false);
                    }
                });
                map.markers.add(marker);
            }
            var popupContent = document.createElement('div');
            popupContent.innerHTML = "Is this place littered?<br>";
            popupContent.style.setProperty('padding', '10px');
            popupContent.style.setProperty('color', 'black');
            var yesButton = document.createElement('input');
            yesButton.type = 'button';
            yesButton.value = 'Yes';
            var noButton = document.createElement('input');
            noButton.type = 'button';
            noButton.value = 'No';
            yesButton.addEventListener('click', function() {
                createMarker();
                popup.remove();
            });
            noButton.addEventListener('click', function() {
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