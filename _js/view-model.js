var viewModel = {
    markers: ko.observableArray(markers)
};

viewModel.Query = ko.observable('');

viewModel.searchResults = ko.computed(function() {
    var q = viewModel.Query();
    return markers.filter(function(i) {
        return i.title.toLowerCase().indexOf(q) >= 0;
    });
});
/*
viewModel.goToPin = ko.computed(function() {
    infowindows[this.index].open(map, markers[this.index]);
    map.panTo(markers[this.index].getPosition());
});
*/


ko.applyBindings(viewModel);