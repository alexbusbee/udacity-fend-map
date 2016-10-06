var myViewModel;

var Building = function(data) {
	this.title = data.title;
};

var ViewModel = function () {
	var self = this;
    this.campus = ko.observableArray(markers);

    this.campus().forEach(function(building, i) {
    	building.marker = pins[i];
    });

    this.query = ko.observable('');

    // Make map markers disappear when user is using search function
    this.searchResults = ko.computed(function() {
	    var q = self.query();
	    return self.campus().filter(function(building) {
	    	var match = building.title.toLowerCase().indexOf(q) >= 0;
	    	if (match) {
	    		building.marker.setVisible(true);
	    	} else {
	    		building.marker.setVisible(false);
	    	}

	        return match;
	 	});
	 });
    
    // Make map markers animate when list item clicked
    self.selectLocation = function(clickedLocation) {
    	var marker = clickedLocation.marker;
        google.maps.event.trigger(marker, 'click');
    }
};