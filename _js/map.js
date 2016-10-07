var pins;

// See if Google Maps loaded correctly
setTimeout(function() {
    if (typeof google === 'object' && typeof google.maps === 'object') {
        return;
    } else {
        alert('Google Maps has failed to load. Please check your connection and try again.');
    }
}, 5000);

// For sorting model data alphabetically by title
function compare(el1, el2, index) {
  return el1[index] == el2[index] ? 0 : (el1[index] < el2[index] ? -1 : 1);
}
markers.sort(function(el1,el2){
  return compare(el1, el2, "title")
});

function toggleBounce() {
    if (this.getAnimation() !== null) {
        this.setAnimation(null);
    } else {
        this.setAnimation(google.maps.Animation.BOUNCE); 
    }
}

var contents = [];
var infowindows = [];
var pins = [];

function initMap() {
    console.log("initMap");
    var map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 43.0378777, lng: -87.9306865 },
        scrollwheel: false,
        zoom: 16
    });

    for (i in markers) {
        var pin = new google.maps.Marker({
            position: markers[i].latLng,
            map: map,
            title: markers[i].title,
        });
        pin.addListener('click', toggleBounce);        
        pins.push(pin);
    }


    // Use Wiki API to GET JSON info then output to variables
    var wikiTitles = [];
    for (items in markers) {
        wikiTitles.push(markers[items].wiki);
    };    
    function getWiki() {
        var titlesString = wikiTitles.join().replace(/,(?!_)/g, "|"),
            url = "https://en.wikipedia.org/w/api.php?action=query&prop=pageprops%7Cextracts&exintro=&explaintext=&format=json&exlimit=max&utf8&callback=?&titles=" + titlesString;
        return $.getJSON(url);
    };

    $.when(getWiki()).then(success, fail); 

    function success(json) {
        var wikiInfos = [],
            data = json.query.pages;
        $.each(data, function(key, value) {
            if (value.extract == null) {
                wikiInfos.push({
                    title: value.title,
                    extract: "No Wikipedia info for this location."
                });
            } else {
                wikiInfos.push({
                    title: value.title,
                    extract: value.extract
                });
            }
        });

        wikiInfos.sort(function(el1,el2){
            return compare(el1, el2, "title")
        });

        for (i in pins) {            
    
            pins[i].index = i; // add index property
            contents[i] = '<div class="popup_container"><h1>' + markers[i].title +'</h1>' + '<p>' + wikiInfos[i].extract + '</p><p><a href="https://en.wikipedia.org/wiki/' + wikiTitles[i] + '">Learn more</a>.</p></div>';

            infowindows[i] = new google.maps.InfoWindow({
                content: contents[i],
                maxWidth: 300
            });

            google.maps.event.addListener(pins[i], 'click', function() {
                infowindows[this.index].open(map, pins[this.index]);
                map.panTo(pins[this.index].getPosition());
            });
        };
    };

    function fail() {
        for (i in pins) {

            pins[i].index = i; // add index property
            contents[i] = '<div class="popup_container"><h1>' + markers[i].title +'</h1>' + '<p>Failed to retrieve Wikipedia info.</p><p>For information about this location, <a href="https://en.wikipedia.org/wiki/' + wikiTitles[i] + '">please visit the Wikipedia page</a> .</p></div>';

            infowindows[i] = new google.maps.InfoWindow({
                content: contents[i],
                maxWidth: 300
            });

            google.maps.event.addListener(pins[i], 'click', function() {
                infowindows[this.index].open(map, pins[this.index]);
                map.panTo(pins[this.index].getPosition());
            });
        };
    };

    myViewModel = new ViewModel();

    ko.applyBindings(myViewModel);
}; 