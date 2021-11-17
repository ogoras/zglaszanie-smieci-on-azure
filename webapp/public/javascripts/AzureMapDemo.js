var map, datasource, client, popup, searchInput, resultsPanel, searchInputLength, centerMapOnResults;

//The minimum number of characters needed in the search input before a search is performed.
var minSearchInputLength = 3;

//The number of ms between key strokes to wait before performing a search.
var keyStrokeDelay = 150;

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
            var marker = new atlas.HtmlMarker({
                color: 'DodgerBlue',
                text: '10',
                position: [e.position[0], e.position[1]],
                popup: new atlas.Popup({
                    content: '<div style="padding:10px">Hello World</div>',
                    pixelOffset: [0, -30]
                })
            });

            map.markers.add(marker);

            //Add a click event to toggle the popup.
            map.events.add('click', marker, () => {
                marker.togglePopup();
            });
        })

    });
}