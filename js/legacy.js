$(document).ready(function() {
	$("#form").submit(function(event) {
		event.preventDefault();
		searchByKeyword();
	});
})

/* SEARCH FUNCTIONS */

function getUserInputAsQueryString() {
	 return document.getElementById("txt-term").value.split(' ').join('_');
}

function searchByKeyword() {
	var term = getUserInputAsQueryString();
	$.getJSON("https://api.mercadolibre.com/sites/MLA/search?q=" + term, function(response){
		if (response.results.length > 0) {
			console.log("Results!")
			var mlPrices = getItemPrices(response);
			var mlPricesAverage = calculatePricesAverage(mlPrices);
			displayPricesAverage(mlricesAverage);
		} else {
			console.log("No results!");
			showNoResults();
			clearSearch();
		} 
	});
}



function getItemPrices(resultsJson) {
	var prices = [];
	$.each(resultsJson.results, function(index, value){
		var currentPrice = value.price;
		prices.push(currentPrice);
	});
	return prices;
}

function calculatePricesAverage(pricesArray) {
	var sum = 0;
	for( var i = 0; i < pricesArray.length; i++ ){
	    sum += parseInt( pricesArray[i], 10 );
	}
	var avg = (sum/pricesArray.length);
	return avg;
}

/* DISPLAY UNIQUE RESULT AND LIST OF RESULTS */

function displayPricesAverage(avgToPrint) {
	var averageText = document.createElement("h2");
	averageText.setAttribute("class", "avg");
	averageText.innerHTML = avgToPrint;
	document.getElementById("olx").appendChild(averageText);
}

/*function createResultsItem(titleElement, itemObject) {
	var itemBox = document.createElement("div");
	itemBox.setAttribute("class", "item-box");
	var item = document.createElement(titleElement);
	var link = createLink(itemObject.permalink, itemObject.title);
	var thumbnail = createImg(itemObject.thumbnail);
	var price = createPrice(itemObject.price);
	item.appendChild(thumbnail);
	item.appendChild(link);
	item.appendChild(price);
	itemBox.appendChild(item);
	document.getElementById("results").appendChild(itemBox);
}

 MANAGING ELEMENTS FUNCTIONS 

function createLink(url, title) {
	var anchor = document.createElement("a");
	anchor.setAttribute("href", url);
	anchor.setAttribute("target", "_blank");
	anchor.innerHTML = title;
	return anchor;
}*/

function showNoResults() {
	$("#results").html("<h2>No results found!</h2>");
}

function clearSearch() {
	$("#txt-term").val('');
}

/*function clearResults() {
	var resultsNode = document.getElementById("results");
	while (resultsNode.firstChild) {
	    resultsNode.removeChild(resultsNode.firstChild);
	};
	console.log("cleared!");
}*/