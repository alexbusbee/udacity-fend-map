var pins,
    infowindow, 
    wikiRequestTimeout;

// See if Google Maps loaded correctly
function googleError() {
    alert("Google Maps failed to load.");
}


// For sorting model data alphabetically by title
function compare(el1, el2, index) {
  return el1[index] == el2[index] ? 0 : (el1[index] < el2[index] ? -1 : 1);
}

markers.sort(function(el1,el2){
  return compare(el1, el2, "title");
});

function stopAnimation(marker) {
    setTimeout(function () {
        marker.setAnimation(null);
    }, 1400);
}

var contents = [];
var infowindows = [];
var pins = [];

function initMap() {
    var map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 43.0378777, lng: -87.9306865 },
        scrollwheel: false,
        zoom: 16
    });

    infowindow = new google.maps.InfoWindow({
      maxWidth: 300
    });

    for (var i in markers) {
      if(markers.hasOwnProperty(i)) {
        var pin = new google.maps.Marker({
            position: markers[i].latLng,
            map: map,
            title: markers[i].title,
        });
        pin.setAnimation(google.maps.Animation.BOUNCE);
        stopAnimation(pin);
        pins.push(pin);
      }
    }

    // Use Wiki API to GET JSON info then output to variables
    var wikiTitles = [];
    for (var items in markers) {
      if(markers.hasOwnProperty(items)) {
        wikiTitles.push(markers[items].wiki);
      }
    }

    function getWiki() {
        var titlesString = wikiTitles.join().replace(/,(?!_)/g, "|"),
            url = "https://en.wikipedia.org/w/api.php?action=query&prop=pageprops%7Cextracts&exintro=&explaintext=&format=json&exlimit=max&utf8&callback=?&titles=" + titlesString;

        wikiRequestTimeout = setTimeout(function() {
          alert("Wikipedia is unavailable. Please try again later.");
        }, 5000);

        return $.getJSON(url);
    }

    $.when(getWiki()).then(success, fail);

    function success(json) {
        clearTimeout(wikiRequestTimeout);
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
            return compare(el1, el2, "title");
        });

        for (i in pins) {
          if(pins.hasOwnProperty(i)) {
            pins[i].index = i; // add index property
            pins[i].content = '<div class="popup_container"><h1>' + markers[i].title +
                          '</h1>' + '<p>' + wikiInfos[i].extract +
                          '</p><p><a href="https://en.wikipedia.org/wiki/' +
                          wikiTitles[i] + '">Learn more</a>.</p></div>';

            google.maps.event.addListener(pins[i], 'click', function() {
                var marker = pins[this.index];

                marker.setAnimation(google.maps.Animation.BOUNCE);

                setTimeout(function(){
                  marker.setAnimation(null);
                }, 750);

                infowindow.setContent( marker.content);

                infowindow.open(map, marker);
                map.panTo(marker.getPosition());
            });
          }
        }
    }

    function fail() {
        for (i in pins) {
          if(pins.hasOwnProperty(i)) {
            pins[i].index = i; // add index property
            pins[i].content = '<div class="popup_container"><h1>' + markers[i].title +'</h1>' + 
            '<p>Failed to retrieve Wikipedia info.</p><p>For information about this location, <a href="https://en.wikipedia.org/wiki/' + 
            wikiTitles[i] + '">please visit the Wikipedia page</a> .</p></div>';

            google.maps.event.addListener(pins[i], 'click', function() {
                var marker = pins[this.index];

                marker.setAnimation(google.maps.Animation.BOUNCE);

                setTimeout(function(){
                  marker.setAnimation(null);
                }, 750);

                infowindow.setContent( marker.content);

                infowindow.open(map, marker);
                map.panTo(marker.getPosition());
            });
          }
        }
    }

    myViewModel = new ViewModel();

    ko.applyBindings(myViewModel);
}