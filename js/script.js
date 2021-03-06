$(document).ready(function() {
	$("#form").submit(function(event) {
		event.preventDefault();
		searchOnBothSites();
	});
});

/* OBJECTS */

var ml = {
	site: "ml",
	apiUrl: "https://api.mercadolibre.com/sites/MLA/search?q=",
	apiJoin: "_",
	apiUsedSufix: "&condition=used",
	searchUrl: "http://listado.mercadolibre.com.ar/",
	searchJoin: "-",
	searchUsedSufix: "_ItemTypeID_U",
	siteSpinner: document.getElementById("spinner-ml"), 
	currentSearchAvg: 0
};

var olx = {
	site: "olx",
	apiUrl: "https://api-v2.olx.com/items?location=capitalfederal.olx.com.ar&searchTerm=",
	apiJoin: "_",
	searchUrl: "http://www.olx.com.ar/nf/search/",
	searchJoin: "%2B",
	siteSpinner: document.getElementById("spinner-olx"),
	currentSearchAvg: 0
};

function Term(rawTerm, siteObj) {
	this.apiTerm = formatTerm(rawTerm, siteObj.apiJoin);
	this.searchTerm = formatTerm(rawTerm, siteObj.searchJoin);
}


function getSearchTerm() {
	return document.getElementById("txt-term").value;
}

function formatTerm(term, join) {
	 return term.split(' ').join(join);
}

/* SEARCH FUNCTION */

function searchOnBothSites() {
	var rawTerm = getSearchTerm();
	getPricesAndDisplayAverage(olx, rawTerm);
	getPricesAndDisplayAverage(ml, rawTerm);
}

/* MANAGE PRICES */

function getPricesAndDisplayAverage(siteObj, term) {
	clearResults(siteObj.site);
	siteObj.siteSpinner.style.display = "block";
	document.getElementById(siteObj.site + "-link").style.display = "none";
	var termObj = new Term(term, siteObj);
	var usedSufix;
	if (siteObj.site == "ml" && checkUsedValue()) {
		usedSufix = siteObj.apiUsedSufix;
		console.log(usedSufix);
	} else {
		usedSufix = "";
	}
	console.log(siteObj.apiUrl + termObj.apiTerm + usedSufix);

	$.getJSON(siteObj.apiUrl + termObj.apiTerm + usedSufix, function(response){
		siteObj.siteSpinner.style.display = "none";
		if ((siteObj.site == "olx" && response.data.length > 0) || (siteObj.site =="ml" && response.results.length > 0)) {		
			var prices = getItemPrices(response, siteObj.site);
			var pricesAverage = calculatePricesAverage(prices);
			displayPricesAverage(pricesAverage, siteObj, termObj);
			setSearchLink(siteObj, termObj.searchTerm);
		} else {
			displayNoResults(siteObj.site);
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

	prices = discardExtremePrices(prices);
	return prices;
}

/* MANAGE AVERAGES */

function discardExtremePrices(prices) {
	prices.sort(function(a, b) {
		return a - b;
	});

	prices.splice(0, Math.round(prices.length*0.1));
	prices.splice(Math.round(prices.length*0.90), prices.length-Math.round(prices.length*0.90));
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

function displayPricesAverage(avgToDisplay, siteObj, termObj) {
	/* Store the avg value in the siteObj */
	siteObj.currentSearchAvg = avgToDisplay;
	/* Create and display avg in an H2 tag */
	var averageNode = document.createElement("h2");
	averageNode.setAttribute("class", "avg");
	averageNode.innerHTML = "$ " + avgToDisplay;
	var siteNode = document.getElementById(siteObj.site);
	siteNode.appendChild(averageNode);
}

/* MANAGING ELEMENTS FUNCTIONS */

function setSearchLink(siteObj, term) {
	var urlTerm;
	if (siteObj.site == "ml") {
		urlTerm = formatTerm(term, '-');
	} else if (siteObj.site == "olx") {
		urlTerm = formatTerm(term, "%2B");
	}
	var anchor = document.getElementById(siteObj.site + "-link");
	anchor.setAttribute("target", "_blank");
	anchor.setAttribute("href", siteObj.searchUrl + urlTerm + siteObj.searchUsedSufix);
	anchor.style.display = "block";
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

function checkUsedValue() {
	return document.getElementById("chk-used").checked;
}