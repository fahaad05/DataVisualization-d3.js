var data;
var countries = [];
var activities = [];
var occupations = [];
var years = [];
var selectedYear = 0;
var margin = {top: 50, right: 50, bottom: 50, left: 70};
var h= 660-margin.left -margin.right;
var w= 660-margin.left -margin.right;

var firstCountry = "";
var secondCountry = "";
var xScale,
    yScale,
    xAxis,
    lineGenerator,
    xTimeScale,
    color;

var lineOpacity = "0.25";
var lineOpacityHover = "0.85";
var otherLinesOpacityHover = "0.1";
var lineStroke = "1.5px";
var lineStrokeHover = "2.5px";

var circleOpacity = "0.85";
var circleOpacityOnLineHover = "0.25"
var circleRadius = 3;
var circleRadiusHover = 6;

var duration = 250;

var symbol = d3.symbol().size(70);
var missingData = false;

var actScatt = d3.select("#activities")
                .append("svg")
                .attr("width", w + margin.right + margin.left)
                .attr("height", h + margin.top + margin.bottom);

var actChart = actScatt.append("g")
                .attr("transform", "translate(" + margin.left+ "," + margin.top + ")")
                .attr("width", w)
                .attr("height", h)
                .attr("class", "main");

var occScatt = d3.select("#occ_scatt")
                .append("svg")
                .attr("width", w + margin.right + margin.left)
                .attr("height", h + margin.top + margin.bottom);

var occChart = occScatt.append("g")
                .attr("transform", "translate(" + margin.left+ "," + margin.top + ")")
                .attr("width", w)
                .attr("height", h)
                .attr("class", "main");

var occLineChart = d3.select("#occ_lineChart")
                .append("svg")
                .attr("width", w + margin.right + margin.left)
                .attr("height", h + margin.top + margin.bottom);

var occLineChart = occLineChart.append("g")
                .attr("transform", "translate(" + margin.left+ "," + margin.top + ")")
                .attr("width", w)
                .attr("height", h)
                .attr("class", "main lines");

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


function scaling(dataset) {

    var min_xy = +d3.min(dataset, function(d) {return d.Value;});
    var max_xy = +d3.max(dataset, function(d) {return d.Value;});
    var avg_xy = +(max_xy - min_xy)/dataset.length;

    // TODO: Aggiustare un pò le scale per ottenere una visualizzazione migliore     
    xScale = d3.scaleLinear()
        .domain([min_xy-avg_xy, max_xy+avg_xy])
        .range([0, w]);

    yScale = d3.scaleLinear()
        .domain([min_xy-avg_xy, max_xy+avg_xy])
        .range([h,0]);

    //Per non avere troppi ticks negli assi
    var ticksNumb;
    if (dataset.length > 10)
        ticksNumb = 10;
    else 
        ticksNumb = dataset.length;
            
    xAxis = d3.axisBottom()
            .scale(xScale)
            .ticks(ticksNumb);

    yAxis = d3.axisLeft()
            .scale(yScale)
            .ticks(ticksNumb);

    xTimeScale = d3.scaleTime()
            .domain(d3.extent(years))
            .range([0, w]);

    lineGenerator = d3.line()
            .x(function(d) {
                return xTimeScale(d.TIME);
            })
            .y(function(d) {
                return yScale(d.Value);
            });

    xTimeAxis = d3.axisBottom()
            .scale(xTimeScale)
            .ticks(years.length);

    color = d3.scaleOrdinal(d3.schemeCategory10);

    occColor = d3.scaleOrdinal()
            .domain(occupations)
            .range(d3.schemeCategory20);
    
}


function genderStudyCharts() {
    
    // Li passerò il paese selezionato nella lista dei radio 
    // Ci sarà un anno di default, ma può essere cambiato, quindi potrebbe
    // prendere un parametro per vedere quale è selezionato

    // PROVA PER VEDERE SE FUNZIONA, METTENDO COME PAESE 1=> ITALIA
    firstCountry = "Italy";
    selectedYear = 2002;
    //Activities Chart
    var filtData = filterData(data, firstCountry, "allActivities", "Total", "both", "Total", false);
    filtData = removeInvalidData(filtData);
    scaling(filtData);
    
    //TODO: mettere un alertbox quando ci sono dati non validi

    //ACTIVITIES Scatterplot
    actChart.append("g")
            .attr("transform", "translate(0," + h + ")")
            .attr("class", "x axis")
            .call(xAxis);
    
    actChart.append("g")
            .attr("transform", "translate(0,0)")
            .attr("class", "y axis")
            .call(yAxis);

    actChart.append("defs").append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("class", "clip-rect")
            .attr("x", "0")
            .attr("y", "0")
            .attr("width", w)
            .attr("height", h);

    actChart.append("g").attr("clip-path","url(#clip)").selectAll(".dots")
            .data(filtData)
            .enter()
            .append("path")
            .attr("d", symbol.type( function (d){
                if (d.SEX == "Males")
                    return d3.symbolSquare;
                else 
                    return d3.symbolCircle;
            }))
            .attr("transform", function(d) {
                return "translate("+ xScale(d.Value) + ", "+ yScale(d.Value) + ") rotate(45)";
            })
            .style("stroke", function(d,i) { return color(i)})
            .style("fill", "white");

    //Occupation"s Chart -> Selected year
    var filtDataOccupations = filterData(data, firstCountry, "Business economy", "allOccupations", "both", "Total", false);
    filtDataOccupations = removeInvalidData(filtDataOccupations);
    scaling(filtDataOccupations);
        

    //OCCUPATIONS Scatterplot -> Selected Year
    occChart.append("g")
            .attr("transform", "translate(0," + h + ")")
            .attr("class", "x axis")
            .call(xAxis);
    
    occChart.append("g")
            .attr("transform", "translate(0,0)")
            .attr("class", "y axis")
            .call(yAxis);

    occChart.append("defs").append("clipPath")
            .attr("id", "clip_occ_sel")
            .append("rect")
            .attr("class", "clip-rect")
            .attr("x", "0")
            .attr("y", "0")
            .attr("width", w)
            .attr("height", h);

    occChart.append("g").attr("clip-path","url(#clip_occ_sel)").selectAll(".dots")
            .data(filtDataOccupations)
            .enter()
            .append("path")
            .attr("d", symbol.type( function (d){
                if (d.SEX == "Males")
                    return d3.symbolSquare;
                else 
                    return d3.symbolCircle;
            }))
            .attr("transform", function(d) {
                return "translate("+ xScale(d.Value) + ", "+ yScale(d.Value) + ") rotate(45)";
            })
            .style("stroke", function(d,i) { 
                return occColor(d.ISCO08)
            })
            .style("fill", "white");


    //Occupation"s LineChart 
    var filtSingleOccData = filterData(data, firstCountry, "Business economy", "Managers", "both", "Total", true);
    filtSingleOccData = removeInvalidData(filtSingleOccData);
    scaling(filtSingleOccData);
    var malesFiltered = filterData(filtSingleOccData, firstCountry, "Business economy", "Managers", "Males", "Total", true);
    var femalesFiltered = filterData(filtSingleOccData, firstCountry, "Business economy", "Managers", "Females", "Total", true);
    var bothGenderFilt = [malesFiltered, femalesFiltered];
    
        

    //OCCUPATIONS LineChart
    occLineChart.append("g")
        .attr("transform", "translate(0," + h + ")")
        .attr("class", "x axis")
        .call(xTimeAxis);
    
    occLineChart.append("g")
        .attr("transform", "translate(0,0)")
        .attr("class", "y axis")
        .call(yAxis);

    let lines = occLineChart.append("g")
        .attr("class", "lines");

    lines.selectAll(".line-group")
        .data(bothGenderFilt).enter()
        .append("g")
        .attr("class", "line-group")
        .on("mouseover", function(d, i) {
            occLineChart.append("text")
              .attr("class", "title-text")
              .style("fill", color(i))        
              .text(d[0].GEO+", "+d[0].SEX)
              .attr("text-anchor", "middle")
              .attr("x", (w-margin.top)/2)
              .attr("y", 15);
          })
        .on("mouseout", function(d) {
            occLineChart.select(".title-text").remove();
          })  
        .append("path")
        .attr("class", "line")  
        .attr("d", function(d) {
            return lineGenerator(d);
        })
        .style("stroke", function(d,i) { return color(i)})
        .style("opacity", lineOpacity)
        .on("mouseover", function(d) {
            d3.selectAll(".line")
                          .style("opacity", otherLinesOpacityHover);
            d3.selectAll(".circle")
                          .style("opacity", circleOpacityOnLineHover);
            d3.select(this)
              .style("opacity", lineOpacityHover)
              .style("stroke-width", lineStrokeHover)
              .style("cursor", "pointer");
          })
        .on("mouseout", function(d) {
            d3.selectAll(".line")
                          .style("opacity", lineOpacity);
            d3.selectAll(".circle")
                          .style("opacity", circleOpacity);
            d3.select(this)
              .style("stroke-width", lineStroke)
              .style("cursor", "none");
          });
      
      
      /* Add circles in the line */
      lines.selectAll("circle-group")
        .data(bothGenderFilt).enter()
        .append("g")
        .style("fill", function(d,i) { return color(i)})
        .selectAll("circle")
        .data(function(d) { return d}).enter()
        .append("g")
        .attr("class", "circle")  
        .on("mouseover", function(d) {
            d3.select(this)     
              .style("cursor", "pointer")
              .append("text")
              .attr("class", "text")
              .text(d.Value)
              .attr("x", function(d) { return xTimeScale(d.TIME) + 5;})
              .attr("y", function(d) { return yScale(d.Value) - 10;});
          })
        .on("mouseout", function(d) {
            d3.select(this)
              .style("cursor", "none")  
              .transition()
              .duration(duration)
              .selectAll(".text").remove();
          })
        .append("circle")
        .attr("cx", function(d) { return xTimeScale(d.TIME);})
        .attr("cy", function(d) { return yScale(d.Value);})
        .attr("r", circleRadius)
        .style("opacity", circleOpacity)
        .on("mouseover", function(d) {
              d3.select(this)
                .transition()
                .duration(duration)
                .attr("r", circleRadiusHover);
            })
          .on("mouseout", function(d) {
              d3.select(this) 
                .transition()
                .duration(duration)
                .attr("r", circleRadius);  
            });

}



function removeInvalidData(filtData) {
    // Controllo di eventuali dati mancanti e rimozione di questi per una corretta visualizzazione dei charts
     for(var i=0; i<filtData.length; i++) {
        if (isNaN(filtData[i].Value)) {
            if   (!missingData)
                missingData = true;
            filtData.splice(i,1);
            i = -1;
            continue;
        }
        else
            continue;
    }

    var parseDate = d3.timeParse("%Y");
    filtData.forEach(function(d,i) {
        if (Object.prototype.toString.call(d.TIME) !== "[object Date]")
            filtData[i].TIME = parseDate(d.TIME);
    })

    return filtData;
}


/**
 * Dato un dataset in input, viene effettuato un filtraggio in base ai parametri
 * desiderati
 * @param {Array} dataset Dataset da filtrare
 * @param {String} country Paese
 * @param {String} act Tipo di Attività
 * @param {String} occ Occupazione
 * @param {String} gender Sesso
 * @param {String} age Fascia d"età
 * @param {Boolean} checkAllYears Dati relativi a tutti gli anni
 */
function filterData(dataset, country, act, occ, gender, age, checkAllYears) {

    var filtData = [];
    var checkBothGender = false;
    var checkAllActivities = false;
    var checkAllOccupations = false;
    var checkAllAges = false;
    
    // Per il secondo tab ci dovrei mettere il filtro per tutti gli anni (?)

    if (gender === "both")
        checkBothGender = true;
    if (act === "allActivities")
        checkAllActivities = true;
    if (occ === "allOccupations")
        checkAllOccupations = true;
    if (age === "allAges")
        checkAllAges = true;

    dataset.forEach(function (d) {
        
        //Selezione paese
        if (d.GEO.trim() === country.trim()) {
            // Selezione di entrambi i sessi
            if ((checkBothGender == true) && (d.SEX !== "Total")) {
                // Selezione di tutti gli anni
                if (checkAllYears) {
                    // Selezione di tutte le attività
                    if ((checkAllActivities == true)) {
                        // Selezione di tutte le occupazioni
                        if ((checkAllOccupations == true) && (d.ISCO08.trim() !== "Total")) {
                            // Selezione di tutte le età 
                            if ((checkAllAges == true) && (d.AGE.trim() !== "Total")) 
                                filtData.push(d);
                            else{
                                //Selezione età specifica
                                if(d.AGE.trim() === age.trim()) 
                                    filtData.push(d);
                                else
                                    return;
                            }
                        }
                        else {
                            //Selezione occupazione specifica
                            if (d.ISCO08.trim() === occ.trim()) {
                                // Selezione di tutte le età 
                                if ((checkAllAges == true) && (d.AGE.trim() !== "Total")) 
                                    filtData.push(d);
                                else{
                                    //Selezione età specifica
                                    if(d.AGE.trim() === age.trim()) 
                                        filtData.push(d);
                                    else
                                        return;
                                    }
                            }
                            else
                                return;
                        }
                    }
                    // Selezione di un"attività specifica
                    else {
                        if (d.NACE_R2.trim() === act.trim()) {
                            // Selezione di tutte le occupazioni
                            if ((checkAllOccupations == true) && (d.ISCO08.trim() !== "Total")) {
                                // Selezione di tutte le età 
                                if ((checkAllAges == true) && (d.AGE.trim() !== "Total")) 
                                    filtData.push(d);
                                //Selezione età specifica
                                else{
                                    if(d.AGE.trim() === age.trim()) 
                                        filtData.push(d);
                                    else
                                        return;
                                }
                            }
                            else {
                                //Selezione occupazione specifica
                                if (d.ISCO08.trim() === occ.trim()) {
                                    // Selezione di tutte le età 
                                    if ((checkAllAges == true) && (d.AGE.trim() !== "Total")) 
                                        filtData.push(d);
                                    //Selezione età specifica
                                    else{
                                        if(d.AGE.trim() === age.trim()) 
                                            filtData.push(d);
                                        else
                                            return;
                                        }
                                }
                                else
                                    return;
                            }
                        }
                        else 
                            return;
                    }
                }
                // Selezione di un anno specifico
                else {
                    if (d.TIME == selectedYear) {
                        // Selezione di tutte le attività
                        if ((checkAllActivities == true)) {
                            // Selezione di tutte le occupazioni
                            if ((checkAllOccupations == true) && (d.ISCO08.trim() !== "Total")) {
                                // Selezione di tutte le età 
                                if ((checkAllAges == true) && (d.AGE.trim() !== "Total")) 
                                    filtData.push(d);
                                else{
                                    //Selezione età specifica
                                    if(d.AGE.trim() === age.trim()) 
                                        filtData.push(d);
                                    else
                                        return;
                                }
                            }
                            else {
                                //Selezione occupazione specifica
                                if (d.ISCO08.trim() === occ.trim()) {
                                    // Selezione di tutte le età 
                                    if ((checkAllAges == true) && (d.AGE.trim() !== "Total")) 
                                        filtData.push(d);
                                    else{
                                        //Selezione età specifica
                                        if(d.AGE.trim() === age.trim()) 
                                            filtData.push(d);
                                        else
                                            return;
                                        }
                                }
                                else
                                    return;
                            }
                        }
                        // Selezione di un"attività specifica
                        else {
                            if (d.NACE_R2.trim() === act.trim()) {
                                // Selezione di tutte le occupazioni
                                if ((checkAllOccupations == true) && (d.ISCO08.trim() !== "Total")) {
                                    // Selezione di tutte le età 
                                    if ((checkAllAges == true) && (d.AGE.trim() !== "Total")) 
                                        filtData.push(d);
                                    //Selezione età specifica
                                    else{
                                        if(d.AGE.trim() === age.trim()) 
                                            filtData.push(d);
                                        else
                                            return;
                                    }
                                }
                                else {
                                    //Selezione occupazione specifica
                                    if (d.ISCO08.trim() === occ.trim()) {
                                        // Selezione di tutte le età 
                                        if ((checkAllAges == true) && (d.AGE.trim() !== "Total")) 
                                            filtData.push(d);
                                        //Selezione età specifica
                                        else{
                                            if(d.AGE.trim() === age.trim()) 
                                                filtData.push(d);
                                            else
                                                return;
                                            }
                                    }
                                    else
                                        return;
                                }
                            }
                            else 
                                return;
                        }
                    }
                    else 
                        return;
                            
                }
            }
            // Selezione genere specifico
            else {
                if ((checkBothGender == false) && (d.SEX === gender)){
                    // Selezione di tutti gli anni
                    if (checkAllYears) {
                        // Selezione di tutte le attività
                        if ((checkAllActivities == true)) {
                            // Selezione di tutte le occupazioni
                            if ((checkAllOccupations == true) && (d.ISCO08.trim() !== "Total")) {
                                // Selezione di tutte le età 
                                if ((checkAllAges == true) && (d.AGE.trim() !== "Total")) 
                                    filtData.push(d);
                                else{
                                    //Selezione età specifica
                                    if(d.AGE.trim() === age.trim()) 
                                        filtData.push(d);
                                    else
                                        return;
                                }
                            }
                            else {
                                //Selezione occupazione specifica
                                if (d.ISCO08.trim() === occ.trim()) {
                                    // Selezione di tutte le età 
                                    if ((checkAllAges == true) && (d.AGE.trim() !== "Total")) 
                                        filtData.push(d);
                                    else{
                                        //Selezione età specifica
                                        if(d.AGE.trim() === age.trim()) 
                                            filtData.push(d);
                                        else
                                            return;
                                        }
                                }
                                else
                                    return;
                            }
                        }
                        // Selezione di un"attività specifica
                        else {
                            if (d.NACE_R2.trim() === act.trim()) {
                                // Selezione di tutte le occupazioni
                                if ((checkAllOccupations == true) && (d.ISCO08.trim() !== "Total")) {
                                    // Selezione di tutte le età 
                                    if ((checkAllAges == true) && (d.AGE.trim() !== "Total")) 
                                        filtData.push(d);
                                    //Selezione età specifica
                                    else{
                                        if(d.AGE.trim() === age.trim()) 
                                            filtData.push(d);
                                        else
                                            return;
                                    }
                                }
                                else {
                                    //Selezione occupazione specifica
                                    if (d.ISCO08.trim() === occ.trim()) {
                                        // Selezione di tutte le età 
                                        if ((checkAllAges == true) && (d.AGE.trim() !== "Total")) 
                                            filtData.push(d);
                                        //Selezione età specifica
                                        else{
                                            if(d.AGE.trim() === age.trim()) 
                                                filtData.push(d);
                                            else
                                                return;
                                            }
                                    }
                                    else
                                        return;
                                }
                            }
                            else 
                                return;
                        }
                    }
                    // Selezione di un anno specifico
                    else {
                        if (d.TIME == selectedYear) {
                            // Selezione di tutte le attività
                            if ((checkAllActivities == true)) {
                                // Selezione di tutte le occupazioni
                                if ((checkAllOccupations == true) && (d.ISCO08.trim() !== "Total")) {
                                    // Selezione di tutte le età 
                                    if ((checkAllAges == true) && (d.AGE.trim() !== "Total")) 
                                        filtData.push(d);
                                    else{
                                        //Selezione età specifica
                                        if(d.AGE.trim() === age.trim()) 
                                            filtData.push(d);
                                        else
                                            return;
                                    }
                                }
                                else {
                                    //Selezione occupazione specifica
                                    if (d.ISCO08.trim() === occ.trim()) {
                                        // Selezione di tutte le età 
                                        if ((checkAllAges == true) && (d.AGE.trim() !== "Total")) 
                                            filtData.push(d);
                                        else{
                                            //Selezione età specifica
                                            if(d.AGE.trim() === age.trim()) 
                                                filtData.push(d);
                                            else
                                                return;
                                            }
                                    }
                                    else
                                        return;
                                }
                            }
                            // Selezione di un"attività specifica
                            else {
                                if (d.NACE_R2.trim() === act.trim()) {
                                    // Selezione di tutte le occupazioni
                                    if ((checkAllOccupations == true) && (d.ISCO08.trim() !== "Total")) {
                                        // Selezione di tutte le età 
                                        if ((checkAllAges == true) && (d.AGE.trim() !== "Total")) 
                                            filtData.push(d);
                                        //Selezione età specifica
                                        else{
                                            if(d.AGE.trim() === age.trim()) 
                                                filtData.push(d);
                                            else
                                                return;
                                        }
                                    }
                                    else {
                                        //Selezione occupazione specifica
                                        if (d.ISCO08.trim() === occ.trim()) {
                                            // Selezione di tutte le età 
                                            if ((checkAllAges == true) && (d.AGE.trim() !== "Total")) 
                                                filtData.push(d);
                                            //Selezione età specifica
                                            else{
                                                if(d.AGE.trim() === age.trim()) 
                                                    filtData.push(d);
                                                else
                                                    return;
                                                }
                                        }
                                        else
                                            return;
                                    }
                                }
                                else 
                                    return;
                        }
                        }
                        else 
                            return;
                                
                    }
                }
                else 
                    return;
            }
        }
        else    
            return;
    });

    return filtData;
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
        age= d.AGE;
        time= d.TIME;
        indic_se= d.INDIC_SE;
        value= d.Value;
    })
    
    data = csv;    

    data.forEach(function(d) {
        
        d.Value = +(d.Value.replace(".",""));
        
        if (!countries.includes(d.GEO)) 
            countries.push(d.GEO);

        if (!activities.includes(d.NACE_R2)) 
            activities.push(d.NACE_R2);

        if (!occupations.includes(d.ISCO08)) 
            occupations.push(d.ISCO08);

        if (!years.includes(d.TIME)) 
            years.push(d.TIME);
        
    });

    var parseDate = d3.timeParse("%Y");
    years.forEach(function(d,i) {
            years[i] = parseDate(d);
    })

    // console.log(data);
    radioList();
    genderStudyCharts();
});





