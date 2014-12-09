$(document).ready(function() {
	$("#form").submit(function(event) {
		event.preventDefault();
		searchOnBothSites();
	});
});

/* SITE OBJECTS */

var ml = {
	site: "ml",
	apiUrl: "https://api.mercadolibre.com/sites/MLA/search?q=",
	searchUrl: "",
}

/* SEARCH FUNCTIONS */

function formatUserInput(join) {
	 return document.getElementById("txt-term").value.split(' ').join(join);
}

function searchOnBothSites() {
	var term = formatUserInput('_');
	/*Podría pasar el filtro como un parámetro, pero dejo este hack (url + term + filtro como unico parámetro) 
	porque no se puede filtrar una búsqueda global por usados en OLX*/
	getPricesAndDisplayAverage("http://api-v2.olx.com/items?location=capitalfederal.olx.com.ar&searchTerm=" + term, "olx", "http://www.olx.com.ar/nf/search/", term);
	getPricesAndDisplayAverage("https://api.mercadolibre.com/sites/MLA/search?q=" + term + "&condition=used",  "ml", "http://listado.mercadolibre.com.ar/", term);
}

function getPricesAndDisplayAverage(url, site, searchUrl, term) {
	clearResults(site);
	$.getJSON(url, function(response){
		if ((site == "olx" && response.data.length > 0) || (site =="ml" && response.results.length > 0)) {		
			var prices = getItemPrices(response, site);
			var pricesAverage = calculatePricesAverage(prices);
			displayPricesAverage(pricesAverage, site, searchUrl, term);
		} else {
			console.log("No Results on " + site);
			displayNoResults(site);
		}
	});
}

function getItemPrices(resultsJson, site) {
	var prices = [];
	if (site == "ml") {
		$.each(resultsJson.results, function(index, value){
			var currentPrice = value.price;
			prices.push(currentPrice);
		});
	} else if (site == "olx") {
		$.each(resultsJson.data, function(index, value){
			if (value.price != null) {
				var currentPrice = value.price.amount;
				prices.push(currentPrice);
			}
		});
	}
	return prices;		
}

function calculatePricesAverage(pricesArray) {
	var sum = 0;
	for( var i = 0; i < pricesArray.length; i++ ){
	    sum += pricesArray[i];
	}
	var avg = Math.round((sum/pricesArray.length) * 100) / 100;	
	return avg;
}

/* DISPLAY UNIQUE RESULT AND LIST OF RESULTS */

function displayPricesAverage(avgToDisplay, site, searchUrl, term) {
	var averageNode = document.createElement("h2");
	averageNode.setAttribute("class", "avg");
	averageNode.innerHTML = "$ " + avgToDisplay;
	var siteNode = document.getElementById(site);
	siteNode.appendChild(averageNode);
	setSearchLink(searchUrl, site, term);
}


/* MANAGING ELEMENTS FUNCTIONS */

function setSearchLink(searchUrl, site, term) {
	var urlTerm;
	if (site == "ml") {
		urlTerm = formatUserInput('-');
	} else if (site == "olx") {
		urlTerm = formatUserInput("%2B");
	}
	var anchor = document.getElementById(site + "-link");
	anchor.setAttribute("target", "_blank");
	anchor.setAttribute("href", searchUrl + urlTerm);
}

function displayNoResults(site) {
	var noResultsNode = document.createElement("h2");
	noResultsNode.innerHTML = "No hay resultados!";
	var siteNode = document.getElementById(site);
	siteNode.appendChild(noResultsNode);	
}

function clearSearch() {
	$("#txt-term").val('');
}

function clearResults(site) {
	/* Remove the average numbers*/
	var resultsNode = document.getElementById(site);
    resultsNode.removeChild(resultsNode.lastChild);
    /* Clean link url */
    var siteLink = document.getElementById(site + '-link');
    siteLink.removeAttribute("target");
    siteLink.setAttribute("href", "#");
}