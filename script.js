
var data;
var countries = [];

// Load Csv Data File
d3.csv("data/earn_ses_monthly_1_Data.csv", function (error, csv) {
    
    if (error) { 
        console.log(error);  //Log the error.
	throw error;
    }
    
    csv.forEach(function (d) {
        sex= d.SEX;
        geo= d.GEO;
        nace= d.NACE_R2;
        isco= d.ISCO08;
        worktime= d.WORKTIME;
        age= +d.AGE;
        time= d.TIME;
        indic_se= d.INDIC_SE;
        value= d.Value;
    })
    
    data = csv;    

    data.forEach(function(d) {
        if (!countries.includes(d.GEO)) 
            countries.push(d.GEO);
    })
    // console.log(countries);
    radioList();
});

function radioList() {
    
        
    d3.select("#countriesList").selectAll("div")
        .data(countries)
        .enter()
        .append("div")
        .attr("id", function(d) {
            return d;
        })
        .select("input").attr("type", "radio").attr("id", function (d){return d}).attr("name", "countriesList").attr("class", "custom-control-input");

}





