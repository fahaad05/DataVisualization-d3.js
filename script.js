var data;
var countries = [];
var activities = [];
var occupations = [];
var w, h= 200;
var year = 0;

var actScatt = d3.select("#act_scatt")
                .append("svg")
                .attr("width", w)
                .attr("height", h)

                
/**
 * Crea una lista di input radio in base ai paesi presenti nel dataset
 */
function radioList() {
    
    var countriesDiv = d3.select("#countriesList").selectAll("div")
    .data(countries)
    .enter()
    .append("div")
    .attr("class", "custom-control custom-radio");
    
    countriesDiv.append("input")
    .attr("type", "radio")
    .attr("id", function (d){ return d; })
    .attr("name", "countriesList")
    .attr("class", "custom-control-input")
    
    countriesDiv.append("label")
    .attr("class", "custom-control-label")
    .attr("for", function(d) { return d; })
    .text(function(d) { return d;});
    
}


function genderStudyCharts() {
    
    actScatt.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", w)
        .attr("height", h);

    actScatt.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", function(d) {
            
            return aScale(d.a);
        })
        .attr("cy", function(d) {
            return h-bScale(d.b);
        })
        .attr("r", 4)

}















// Carico i file csv
d3.csv("data/earn_ses_monthly_1_Data.csv", function (error, csv) {
    
    if (error) { 
        //Log the error.
        console.log(error);  
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

        if (!activities.includes(d.NACE_R2)) 
        activities.push(d.NACE_R2);

        if (!occupations.includes(d.ISCO08)) 
        occupations.push(d.ISCO08);

    })
    // console.log(data);
    radioList();
});





