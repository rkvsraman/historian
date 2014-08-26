var sortObj = function(object){
	sortable = [];
	for (var item in object){
      	sortable.push([item, object[item]]);
	}

 	sortable.sort(function(a, b) {return a[1] - b[1]});

    console.log(' Sortable %j',sortable);

	// sortable.sort(function(a, b) {return a[1] - b[1]})
	 // vehiclesSortedBySpeed =  dojox.lang.functional.map(sortable, function(i) {return i[0]})
	items_sorted_by_val = _.map(sortable, function(i){ return i[0]});

	return items_sorted_by_val;

}

