var data;
var countries = [];
var activities = [];
var occupations = [];
var years = [];

var margin,
    h,
    w;

var firstCountry,
    secondCountry,
    selectedActivity,
    selectedOccupation,
    selectedYear;

var xScale,
    yScale,
    xAxis,
    lineGenerator,
    xTimeScale,
    lines,
    color;

var lineOpacity,
    lineOpacityHover,
    otherLinesOpacityHover,
    lineStroke,
    lineStrokeHover;

var circleOpacity,
    circleOpacityOnLineHover,
    circleRadius,
    circleRadiusHover;

var textX,
    textY,
    textSize;

var symbol;

var duration,
    updateDuration;

var actScatt,
    actChart,
    legendActivities,
    occScatt,
    occChart,
    legendOccupations,
    occLineChart,
    occLineChart,
    legendOccLine;
   
/**
 * Inizializzazione delle variabili globali
 */
function globalVar() {

    selectedYear = "2002";
    margin = {top: 50, right: 50, bottom: 50, left: 70};
    h= 660-margin.left -margin.right;
    w= 660-margin.left -margin.right;

    firstCountry = "Italy";
    secondCountry = "default";
    selectedActivity = "Business economy";
    selectedOccupation = "Managers";

    color = d3.scaleOrdinal(d3.schemeCategory10)

    lineOpacity = "0.25";
    lineOpacityHover = "0.85";
    otherLinesOpacityHover = "0.1";
    lineStroke = "1.5px";
    lineStrokeHover = "2.5px";
    circleOpacity = "0.85";
    circleOpacityOnLineHover = "0.25"
    circleRadius = 3;
    circleRadiusHover = 6;

    textX = 50;
    textY = 10;
    textSize = "0.9rem";

    symbol = d3.symbol().size(65);
    
    duration = 250;
    updateDuration = 200;

    actScatt = d3.select("#activities")
                .append("svg")
                .attr("width", w + margin.right + margin.left)
                .attr("height", h + margin.top + margin.bottom);

    actChart = actScatt.append("g")
                .attr("transform", "translate(" + margin.left+ "," + margin.top + ")")
                .attr("width", w)
                .attr("height", h)
                .attr("class", "main");

    legendActivities = d3.select("#activitiesAlert").append("svg").attr("height", 250).attr("width", 450).attr("class", "pt-5");

    occScatt = d3.select("#occ_scatt")
                .append("svg")
                .attr("width", w + margin.right + margin.left)
                .attr("height", h + margin.top + margin.bottom);

    occChart = occScatt.append("g")
                .attr("transform", "translate(" + margin.left+ "," + margin.top + ")")
                .attr("width", w)
                .attr("height", h)
                .attr("class", "main");

    legendOccupations = d3.select("#occupationAlert").append("svg").attr("height", h-100).attr("width", 450).attr("class", "pt-5");

    occLineChart = d3.select("#occ_lineChart")
                .append("svg")
                .attr("width", w + margin.right + margin.left)
                .attr("height", h + margin.top + margin.bottom);

    occLineChart = occLineChart.append("g")
                .attr("transform", "translate(" + margin.left+ "," + margin.top + ")")
                .attr("width", w)
                .attr("height", h)
                .attr("class", "main lines");
           
    legendOccLine = d3.select("#genderLineChartAlert").append("svg").attr("height", 220).attr("width", 450).attr("class", "pt-5");
}



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
            .attr("id", function (d){ return d.split(" ")[0]; })
            .attr("value", function (d){ return d; })
            .attr("name", "countriesList")
            .attr("class", "custom-control-input")
    
    countriesDiv.append("label")
            .attr("class", "custom-control-label")
            .attr("for", function(d) { return d.split(" ")[0]; })
            .text(function(d) { return d;});
    
}


/**
 * Inizializzazione dei contenuti dei menu select e degli input presenti nei form del tab gender
 */
function gender_menu() {

    //Menu select per il secondo paese
    d3.select("#genderMenu").select("#secondCountrySelected")
        .selectAll(".option")
        .data(countries)
        .enter()
        .append("option")
            .attr("id", function (d){ return d.split(" ")[0]; })
            .attr("value", function(d) { return d; })
            .attr("label", function (d){ 
                
                if (d.split(" ").length > 2) {
                    if (d.split(" ")[0] == "Germany") 
                        return d.split(" ")[0];
                    else
                        return d.split(" ")[0] + " " + d.split(" ")[1];
                }
                else
                    return d.split(" ")[0];
            });

    //Menu select per gli anni
    d3.select("#genderMenu").select("#yearSelected")
        .selectAll(".option")
        .data(years)
        .enter()
        .append("option")
            .attr("id", function (d) { return "_"+d.getFullYear().toString(); })
            .attr("value", function(d) { return d.getFullYear().toString(); })
            .attr("label", function(d) { return d.getFullYear().toString();});

    //Menu select per le attività  
    d3.select("#activitiesMenu").select("#activitySelected")
        .selectAll(".option")
        .data(activities)
        .enter()
        .append("option")
        .attr("id", function(d) { return d.split(" ")[0]})
        .attr("value", function(d) { return d; })
        .attr("label", function(d) { return d; });
    
    //Menu select per le occupazioni
    d3.select("#occupationsMenu").select("#occupationSelected")
        .selectAll(".option")
        .data(occupations)
        .enter()
        .append("option")
            .attr("id", function(d,i) { return "o_"+i})
            .attr("value", function(d) { return d; })
            .attr("label", function(d) { return d; });
    
}


/**
 * Effettua il redirect per il bottone che effettua il select del secondo paese e dell'anno
 */
function countryRedirectUpdate() {

    //Leggo il secondo paese selezionato nel menu
    var secondCountrySelect = $("#secondCountrySelected :selected").val();
    var checkSelectedYear = $("#yearSelected :selected").val();

    if (secondCountrySelect != secondCountry)
        return updateCountryGenderCharts(firstCountry, secondCountrySelect, checkSelectedYear);
    

    //E' stato cambiato solamente l'anno, sono da aggiornare i due grafici delle activities e delle occupations
    if (checkSelectedYear != selectedYear){
        selectedYear = checkSelectedYear;
        var secondCountryExists = true;
        if (secondCountry == "default")
        {
            secondCountryExists = false;
            removeOldData(true, 1);
        }
        else
            removeOldData(false, 1);

        //aggiornamento dei charts corrispondenti
        updateActivitiesChart(false, false, secondCountryExists, true);
        updateOccupationsChart(false, false, secondCountryExists, true);
        return;
    }
    
}


/**
 * Effettua il redirect per il bottone che effettua il select delle attivtà
 */
function activityRedirectUpdate() {

    var checkSelectedActivity = $("#activitySelected :selected").val();

    //L'unico chart da aggiornare è quello delle occupazioni 
    if (checkSelectedActivity != selectedActivity)
    {
        var secondCountryExists = true;
        if (secondCountry == "default") {
            secondCountryExists = false;
            removeOldData(true, 2);
        }
        else
            removeOldData(false, 2);

        //aggiornamento del chart
        selectedActivity = checkSelectedActivity;
        updateOccupationsChart(true, true, secondCountryExists, false);
    }
}


/**
 * Effettua il redirect per il bottone che effettua il select dell'occupazione
 */
function occupationRedirectUpdate() {

    var checkSelectedOccupation = $("#occupationSelected :selected").val();

    //L'unico chart da aggiornare è il line chart
    if (checkSelectedOccupation != selectedOccupation)
    {
        var secondCountryExists = true;
        if (secondCountry == "default")
        {
            secondCountryExists = false;
            removeOldData(true, 3);
        }
        else
            removeOldData(false,3);

        //aggiorna il chart delle linee
        selectedOccupation = checkSelectedOccupation;
        updateLineChartsGender(true, true, secondCountryExists);
    }
}


/**
 * Calcola le operazioni di scaling iìper i dataset passati come parametri
 * @param {*} dataset Dataset di cui effettuare lo scaling
 * @param {*} secondDataset Secondo dataset di cui effettuare lo scaling in contemporanea al primo, NULL di default
 */
function scaling(dataset, secondDataset = null) {

    //E' presente solo un dataset passato di cui effettuare lo scaling
    if (secondDataset == null) {
        var min_xy = +d3.min(dataset, function(d) { return d.Value;});
        var max_xy = +d3.max(dataset, function(d) { return d.Value;});
        var avg_xy = +(max_xy - min_xy)/dataset.length;

        var min_xy_males = +d3.min(dataset, function(d) {if (d.SEX == "Males") return d.Value; else return 999999999});
        var max_xy_males = +d3.max(dataset, function(d) {if (d.SEX == "Males") return d.Value; else return 0});
        var avg_xy_males = +(max_xy_males - min_xy_males)/(dataset.length/2);
        
        var min_xy_females = +d3.min(dataset, function(d) {if (d.SEX == "Females") return d.Value; else return 99999999});
        var max_xy_females = +d3.max(dataset, function(d) {if (d.SEX == "Females") return d.Value; else return 0});
        var avg_xy_females = +(max_xy_females - min_xy_females)/(dataset.length/2);
    }
    //sono stati passati due dataset di cui effettuare lo scaling
    else
    {
        var check = 0;
        check = +d3.min(dataset, function(d) { return d.Value;});
        var min_xy = +d3.min(secondDataset, function(d) { return d.Value;});
        if (check < min_xy) min_xy = check;
        check = +d3.max(dataset, function(d) { return d.Value;});
        var max_xy = +d3.max(secondDataset, function(d) { return d.Value;});
        if (check > max_xy) max_xy = check;
        var avg_xy = +(max_xy - min_xy)/dataset.length;

        check = +d3.min(dataset, function(d) {if (d.SEX == "Males") return d.Value; else return 999999999});
        var min_xy_males = +d3.min(secondDataset, function(d) {if (d.SEX == "Males") return d.Value; else return 999999999});
        if(check < min_xy_males) min_xy_males = check;
        check = +d3.max(dataset, function(d) {if (d.SEX == "Males") return d.Value; else return 0});
        var max_xy_males = +d3.max(secondDataset, function(d) {if (d.SEX == "Males") return d.Value; else return 0});
        if ( check > max_xy_males) max_xy_males = check;
        var avg_xy_males = +(max_xy_males - min_xy_males)/(dataset.length/2);
        
        check = +d3.min(dataset, function(d) {if (d.SEX == "Females") return d.Value; else return 99999999});
        var min_xy_females = +d3.min(secondDataset, function(d) {if (d.SEX == "Females") return d.Value; else return 99999999});
        if (check < min_xy_females) min_xy_females = check;
        check = +d3.max(dataset, function(d) {if (d.SEX == "Females") return d.Value; else return 0});
        var max_xy_females = +d3.max(secondDataset, function(d) {if (d.SEX == "Females") return d.Value; else return 0});
        if (check > max_xy_females) max_xy_females = check;
        var avg_xy_females = +(max_xy_females - min_xy_females)/(dataset.length/2);
    }

    //scaling 
    var checkMinValue_males;
    var checkMinValue_females;

    if ((min_xy_males-avg_xy_males) < 0) 
        checkMinValue_males = 01;
    else 
        checkMinValue_males = min_xy_males-avg_xy_males;
    
    if ((min_xy_females-avg_xy_females) < 0) 
        checkMinValue_females = 0;
    else 
        checkMinValue_females = min_xy_females-avg_xy_females;
    
    xScale = d3.scaleLinear()
        .domain([min_xy-avg_xy, max_xy+avg_xy])
        .range([0, w]);

    yScale = d3.scaleLinear()
        .domain([min_xy-avg_xy, max_xy+avg_xy])
        .range([h,0]);

    //Scale in base al genere
    xScaleMales = d3.scaleLinear()
        .domain([checkMinValue_males, max_xy_males+avg_xy_males])
        .range([0, w]);

    yScaleFemales = d3.scaleLinear()
        .domain([checkMinValue_females, max_xy_females+avg_xy_females])
        .range([h,0]);


    //Per non avere troppi ticks negli assi dovuti a risultati troppo numerosi
    var ticksNumb;
    if (dataset.length > 8 || (secondDataset != null && secondDataset.length > 8))
        ticksNumb = 8;
    else 
        ticksNumb = dataset.length;
            
    xAxis = d3.axisBottom()
            .scale(xScale)
            .ticks(ticksNumb);

    yAxis = d3.axisLeft()
            .scale(yScale)
            .ticks(ticksNumb);
    
    xAxisGender = d3.axisBottom()
            .scale(xScaleMales)
            .ticks(ticksNumb);

    yAxisGender = d3.axisLeft()
            .scale(yScaleFemales)
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
    
    occColor = d3.scaleOrdinal()
            .domain(occupations)
            .range(d3.schemeCategory20);

    actColor = d3.scaleOrdinal()
            .domain(activities)
            .range(d3.schemeCategory10);

}


/**
 * Dato un dataset raggruppa tutte le voci in base al genere
 * @param {*} dataset Dataset in esame
 * @param {String} country Paese in esame
 * @param {String} act Attività selezionata
 * @param {String} occ Occupazione selezionata
 * @param {Boolean} checkYears Check per controllare se sono da controllare tutti gli anni
 */
function getDataPerGender(dataset, country, act, occ, checkYears) {

    var malesFiltData = [];
    var femalesFiltData = [];
    var activitiesPerGenderData = [];

    malesFiltData = filterData(dataset, country, act, occ, "Males", "Total", checkYears);
    femalesFiltData = filterData(dataset, country, act, occ, "Females", "Total", checkYears);

    //Elimino gli elementi dei Males che non sono presenti nelle Females, in quanto dati invalidi
    malesFiltData.forEach(function(d,i) {
        var itemExists = false;
        femalesFiltData.forEach(function(c) {

            if (c.ISCO08 == d.ISCO08) {
                itemExists = true;
                return;
            }
        });
        if (!itemExists) {
            malesFiltData.splice(i,1);
            return;
        }
    });

    //Se i maschi e le femmine presentano degli elementi (occupations) non comuni ad entrambi oppure
    //delle date non comuni ad entrambi, rimuovo tali elementi 
    //perché non validi ai fini dell'analisi
    if ((malesFiltData.length != femalesFiltData.length)) {
        do 
        {
            //Controllo chi ha un numero di elementi maggiore
            var malesChecking = false;
            if(malesFiltData.length > femalesFiltData.length)
            {
                var subject1 = malesFiltData;
                var subject2 = femalesFiltData;
                malesChecking = true;
            }
            else 
            {
                var subject1 = femalesFiltData;
                var subject2 = malesFiltData;
            }
            //Elimino gli elementi che non sono posseduti da entrambi, perché non sarebbero validi
            subject1.forEach(function(d,i) {
                var itemExists = false;
                subject2.forEach(function(c) {
                    if(!itemExists) {

                        if (checkYears)
                        {
                            if (c.TIME.getFullYear() == d.TIME.getFullYear())
                            {
                                itemExists = true;
                                return;
                            }
                        }
                        else {
    
                            if (c.ISCO08 == d.ISCO08)
                            {
                                itemExists = true;
                                return;
                            }
                        }
                    }
                });
                if (!itemExists) {
                    subject1.splice(i,1);
                    return;
                }
            });

            //Reinizializzo gli array
            if(malesChecking) 
                malesFiltData = subject1;
            else
                femalesFiltData = subject2;

        }while(malesFiltData.length != femalesFiltData.length);
    }
    //passo tutti i risultati in unico array con due elementi, uno con le voci dei amschi e l'altro delle femmine
    activitiesPerGenderData.push(malesFiltData);
    activitiesPerGenderData.push(femalesFiltData);

    return activitiesPerGenderData;
}


/**
 * Effettua l'inizializzazione dei charts del tab dello studio del genere
 */
function genderStudyCharts() {
    
    var nameReplacedFirst = firstCountry.split(' ')[0];
    //Valori iniziali per caricare i grafici la prima volta
    d3.select("#countriesList").select("#"+nameReplacedFirst).attr("checked", true);
    d3.select("#yearSelected").select("#_"+selectedYear).attr("selected", true);
    d3.select("#firstCountrySelected").attr("value", firstCountry);
    d3.select("#activitySelected").select("#"+selectedActivity.split(" ")[0]).attr("selected", true);
    d3.select("#occupationSelected").select("#o_1").attr("selected", true);

    
    //===========================================================================================
    //===========================================================================================
    //================================      ACTIVITIES      =====================================
    //===========================================================================================
    //===========================================================================================

    var filtData = filterData(data, firstCountry, "allActivities", "Total", "both", "Total", false);
    filtData = removeInvalidData(filtData);
    scaling(filtData);
    
    filtDataPerGender = getDataPerGender(filtData, firstCountry, "allActivities", "Total", false);
    
    actChart.append("g")
            .attr("transform", "translate(0," + h + ")")
            .attr("class", "x axis")
            .call(xAxisGender);
    
    actChart.append("g")
            .attr("transform", "translate(0,0)")
            .attr("class", "y axis")
            .call(yAxisGender);

    actChart.append("defs").append("clipPath")
            .attr("id", "clip")
            .append("rect")
                .attr("class", "clip-rect")
                .attr("x", "0")
                .attr("y", "0")
                .attr("width", w)
                .attr("height", h);

    actChart.append("g").attr("clip-path","url(#clip)").attr("id", "clipPath")
            .selectAll(".dots")
            .data(filtDataPerGender[0])
            .enter()
            .append("g")
                .attr("class", "g actChart firstCountryPath")
                .append("path")
                    .attr("id", function(d) {
                        return nameReplacedFirst+"_"+selectedYear;
                    })
                    .attr("class", "firstCountryPath")
                    .attr("d", symbol.type( function (d){
                        return d3.symbolCircle;
                    }))
                    .attr("transform", function(d) {
                        var y;
                            filtDataPerGender[1].forEach(function(c) {
                                if (c.NACE_R2 == d.NACE_R2 && c.ISCO08 == d.ISCO08)
                                    y = c.Value;
                            })

                        return "translate("+ xScaleMales(d.Value) + ","+ yScaleFemales(y) + " )";
                    })
                    .style("stroke", function(d,i) { 
                        return actColor(d.NACE_R2);
                    })
                    .style("fill", function(d,i) { 
                        return actColor(d.NACE_R2);
                    });

    hoverin(filtDataPerGender, true, 1, filtData);

    //legenda delle activities
    legendActivities.selectAll(".legendDots")
            .data(activities)
            .enter()
            .append("circle")
                .attr("cx", 20)
                .attr("cy", function(d,i) {
                    return 20 + i*30;
                })
                .attr("r", 7)
                .style("fill", function(d) { return actColor(d)});

    legendActivities.selectAll("labels")
            .data(activities)
            .enter()
            .append("foreignObject")
                .attr("x", 40)
                .attr("y", function(d,i){ return 11 + i*30})
                .attr("width", 350)
                .attr("height", 35)
                .append("xhtml:body")
                    .style("font", "14px 'Helvetica Neue'")
                    .style("color", function(d){ return actColor(d)})
                    .html(function(d) {
                        return d;
                    });

    //alert box
    d3.select("#activitiesAlert").append("div")
            .attr("class", "alert alert-danger alert-dismissible fade")
            .text("Some data are missing in the first country")
            .attr("role", "alert")
            .attr("id", "actAlertFirst");
    
    d3.select("#activitiesAlert").append("div")
            .attr("class", "alert alert-danger alert-dismissible fade")
            .text("Some data are missing in the second country!")
            .attr("role", "alert")
            .attr("id", "actAlertSecond");
    

        
    //===========================================================================================
    //===========================================================================================
    //================================      OCCUPATION      =====================================
    //===========================================================================================
    //===========================================================================================
    
    var filtDataOccupations = filterData(data, firstCountry, selectedActivity, "allOccupations", "both", "Total", false);
    filtDataOccupations = removeInvalidData(filtDataOccupations);
    scaling(filtDataOccupations);

    filtDataOccupationsPerGender = getDataPerGender(filtDataOccupations, firstCountry, selectedActivity, "allOccupations", false);
        
    occChart.append("g")
            .attr("transform", "translate(0," + h + ")")
            .attr("class", "x axis")
            .call(xAxisGender);
    
    occChart.append("g")
            .attr("transform", "translate(0,0)")
            .attr("class", "y axis")
            .call(yAxisGender);

    occChart.append("defs").append("clipPath")
            .attr("id", "clip_occ_sel")
            .append("rect")
                .attr("class", "clip-rect")
                .attr("x", "0")
                .attr("y", "0")
                .attr("width", w)
                .attr("height", h);

    occChart.append("g").attr("clip-path","url(#clip_occ_sel)").attr("id", "cliPathOcc")
            .selectAll(".dots")
            .data(filtDataOccupationsPerGender[0])
            .enter()
            .append("g")
                .attr("class", "g occChart firstCountryPath")
                .append("path")
                    .attr("id", function(d) {
                        return nameReplacedFirst+"_"+selectedYear+"_"+activities.indexOf(selectedActivity);
                    })
                    .attr("class", "firstCountryPath")
                    .attr("d", symbol.type( function (d){
                        return d3.symbolCircle;
                    }))
                    .attr("transform", function(d) {
                        var y;
                        filtDataOccupationsPerGender[1].forEach(function(c) {
                                if (c.NACE_R2 == d.NACE_R2 && c.ISCO08 == d.ISCO08)
                                    y = c.Value;
                            })
                        return "translate("+ xScaleMales(d.Value) + ","+ yScaleFemales(y) + " )";
                    })
                    .style("stroke", function(d,i) { 
                        return occColor(d.ISCO08)
                    })
                    .style("fill", function(d,i) { 
                        return occColor(d.ISCO08)
                    });

    hoverin(filtDataOccupationsPerGender, true, 2, filtDataOccupations);

    //legenda
    legendOccupations.selectAll(".legendDots")
            .data(occupations)
            .enter()
            .append("circle")
                .attr("cx", 20)
                .attr("cy", function(d,i) {
                    return 20 + i*30;
                })
                .attr("r", 7)
                .style("fill", function(d) { return occColor(d)});

    legendOccupations.selectAll("labels")
            .data(occupations)
            .enter()
            .append("foreignObject")
                .attr("x", 40)
                .attr("y", function(d,i){ return 11 + i*30}) 
                .attr("width", 350)
                .attr("height", 35)
                .append("xhtml:body")
                    .style("font", "14px 'Helvetica Neue'")
                    .style("color", function(d){ return occColor(d)})
                    .html(function(d) {
                        return d;
                    });

    //alert box
    d3.select("#occupationAlert").append("div")
            .attr("class", "alert alert-danger alert-dismissible fade")
            .text("Some data are missing in the first country!")
            .attr("role", "alert")
            .attr("id", "occAlertFirst");
    
    d3.select("#occupationAlert").append("div")
            .attr("class", "alert alert-danger alert-dismissible fade")
            .text("Some data are missing in the second country!")
            .attr("role", "alert")
            .attr("id", "occAlertSecond");
    
    
        
    //===========================================================================================
    //===========================================================================================
    //==========================      LINE CHART OCCUPATION      ================================
    //===========================================================================================
    //===========================================================================================
    
    var filtSingleOccData = filterData(data, firstCountry, selectedActivity, selectedOccupation, "both", "Total", true);
    filtSingleOccData = removeInvalidData(filtSingleOccData);
    scaling(filtSingleOccData);
    var bothGenderFilt = getDataPerGender(filtSingleOccData, firstCountry, selectedActivity, selectedOccupation, true);    

    occLineChart.append("g")
        .attr("transform", "translate(0," + h + ")")
        .attr("class", "x axis")
        .call(xTimeAxis);
    
    occLineChart.append("g")
        .attr("transform", "translate(0,0)")
        .attr("class", "y axis")
        .call(yAxis);

    lines = occLineChart.append("g")
        .attr("class", "lines");

    lines.selectAll("line-group")
        .data(bothGenderFilt).enter()
        .append("g")
            .attr("class", "firstCountryPath")
            .append("path")
                .attr("class", "line")  
                .attr("d", function(d) {
                    return lineGenerator(d);
                })
                .style("stroke", function(d,i) { return color(i)})
                .style("opacity", lineOpacity)
        
      
      //Aggioungo i cerchi nelle linee
      lines.selectAll("circle-group")
        .data(bothGenderFilt).enter()
        .append("g")
            .attr("class", function(d,i){
                return "firstCountryCircles _"+i;
            })
            .style("fill", function(d,i) { return color(i)})
            .selectAll("circle")
            .data(function(d) { return d}).enter()
            .append("g")
                .attr("class", "circle")  
                .append("circle")
                    .attr("id", function(d) { return nameReplacedFirst+"_"+selectedYear+"_"+occupations.indexOf(selectedOccupation); })
                    .attr("cx", function(d) { return xTimeScale(d.TIME);})
                    .attr("cy", function(d) { return yScale(d.Value);})
                    .attr("r", circleRadius)
                    .style("opacity", circleOpacity)
        
    hoverin(bothGenderFilt, true, 3, filtSingleOccData);

    //legenda
    legendOccLine.selectAll(".legendDots")
            .data(bothGenderFilt)
            .enter()
            .append("circle")
                .attr("cx", 20)
                .attr("cy", function(d,i) {
                    return 20 + i*30;
                })
                .attr("r", 7)
                .style("fill", function(d,i) { return color(i)});

    legendOccLine.selectAll("labels")
            .data(bothGenderFilt)
            .enter()
            .append("foreignObject")
                .attr("x", 40)
                .attr("y", function(d,i){ return 11 + i*30}) 
                .attr("width", 400)
                .attr("height", 35)
                .append("xhtml:body")
                    .style("font", "14px 'Helvetica Neue'")
                    .style("color", function(d,i){ return color(i)})
                    .html(function(d) {
                        return d[0].GEO+", "+d[0].SEX;
                    });

    //alert box     
    d3.select("#genderLineChartAlert").append("div")
        .attr("class", "alert alert-danger alert-dismissible fade")
        .text("Some data are missing in the first country!")
        .attr("role", "alert")
        .attr("id", "occLineAlertFirst");
                
    d3.select("#genderLineChartAlert").append("div")
        .attr("class", "alert alert-danger alert-dismissible fade")
        .text("Some data are missing in the second country!")
        .attr("role", "alert")
        .attr("id", "occLineAlertSecond");

    // ad ogni cambiamento nel menu radio buttons viene renindirizzato il tutto al metodo update generale
    $("input[type='radio']").on("change", function(){
        var radioCountry = $("input[name='countriesList']:checked").val();
        updateCountryGenderCharts(radioCountry, secondCountry, selectedYear);
    });
        
}


/**
 * Cancella i risultati dei precedenti charts in base al numero del "ticket" presentatogli
 * @param {Boolean} secondCountryDefault Controlla se il paese selezionato è nullo
 * @param {Number} allData Ticket per decidere quali charts eliminare
 * allData = 0: Sono da aggiornare tutti i charts
 * allData = 1: Sono da aggiornare i charts delle activities e delle occupations
 * allData = 2: E' da aggiornare il chart solo delle occupation
 * allData = 3: E' da aggiornare solo il lineChart
 * allData = 4: E' cambiato il secondo paese, gli elementi del primo non sono da cancellare
 * allData = 5: E' cambiato il primo paese, gli elementi del secondo non sono da cancellare
 */
function removeOldData(secondCountryDefault, allData = 0) {

    if ( allData != 4) {

        if (allData != 3) {
                
                if (allData != 2) 
                {
                    actChart.select("#clipPath").selectAll(".g.actChart.firstCountryPath")
                            .transition()
                            .duration(updateDuration)
                            .remove();
                }
        
                occChart.select("#cliPathOcc").selectAll(".g.occChart.firstCountryPath")
                        .transition()
                        .duration(updateDuration)
                        .remove();
        }
    
        if (allData != 1 && allData != 2)                
        {
            lines.selectAll(".firstCountryCircles").transition()
                    .duration(updateDuration)
                    .remove();
        }
    }
    
    if(secondCountryDefault == false && allData != 5) {

        if (allData != 3) {

            if (allData != 2) 
            {
                actChart.select("#clipPath").selectAll(".g.actChart.secondCountryPath")
                        .transition()
                        .duration(updateDuration)
                        .remove();
            }
        
            occChart.select("#cliPathOcc").selectAll(".g.occChart.secondCountryPath")
                    .transition()
                    .duration(updateDuration)
                    .remove();
        }
                
        if (allData != 1 && allData != 2) 
        {
            lines.selectAll(".secondCountryCircles").transition()
                .duration(updateDuration)
                .remove();
        }
    
    }
    if (allData != 1 && allData != 2) {

        lines.selectAll(".firstCountryPath").transition()
                .duration(updateDuration)
                .remove();
    
        if (!secondCountryDefault) {
            
            lines.selectAll(".secondCountryPath").transition()
                .duration(updateDuration)
                .remove();
        }
        
        legendOccLine.selectAll("circle")
                .transition()
                .duration(updateDuration)
                .remove();
    
        legendOccLine.selectAll("foreignObject")
                .transition()
                .duration(updateDuration)
                .remove();

        $("#occLineAlertFirst").removeClass('show');
        $("#occLineAlertSecond").removeClass('show');
    }

}


/**
 * Aggiorna l'input box presente in alto per la voce del primo paese selezionato
 * @param {Boolean} isFirstCountryChanged Check se il primo paese è cambiato
 */
function displayValues (isFirstCountryChanged) {

    if (isFirstCountryChanged) {

        //Visualizzazione del first Country
        if (firstCountry.split(" ").length > 2) {
            if (firstCountry.split(" ")[0] == "Germany") 
                d3.select("#firstCountrySelected").attr("value", firstCountry.split(" ")[0]);
            else
                d3.select("#firstCountrySelected").attr("value", firstCountry.split(" ")[0]+ " " + firstCountry.split(" ")[1]);
        }
        else
            d3.select("#firstCountrySelected").attr("value", firstCountry);
    }
}


/**
 * Metodo generale per l'aggiornamento dei charts
 * @param {String} firstSelectedCountry Primo paese 
 * @param {String} secondSelectedCountry Secondo paese
 * @param {Date} newSelectedYear L'anno 
 */
function updateCountryGenderCharts(firstSelectedCountry, secondSelectedCountry, newSelectedYear) {
    
    var firstCountryChanged = false;
    var secondCountryChanged = false;
    var secondCountryDefault = false;
    var yearChanged = false;
    
    //Check se il nuovo paese è lo stesso di quello precedente
    if (firstSelectedCountry != firstCountry) 
        firstCountryChanged = true; 
     
    if (secondSelectedCountry != secondCountry)
        secondCountryChanged = true; 
    else
        if (secondSelectedCountry == "default")
            secondCountryDefault = true;

    firstCountry = firstSelectedCountry;
    secondCountry = secondSelectedCountry;
    
    //Se è cambiato il primo paese aggiorno il valore nell'input box
    displayValues(firstCountryChanged);
    var secondCountryExists = true;

    //Se è stato selezionato la voce default allora non occorre far vedere il secondo paese
    if (secondCountry == "default")
        secondCountryExists = false;
    
    //Uno dei due o entrambi i paesi sono cambiati, tutti i grafici sono da aggiornare
    if (firstCountryChanged == true || secondCountryChanged == true)
    {
        if (newSelectedYear != selectedYear){
            yearChanged = true;
            selectedYear = newSelectedYear;
        }
        
        //Effettua la rimozione in base ai paesi che son cambiati
        if (firstCountryChanged == true && secondCountryChanged == true)
            removeOldData(secondCountryDefault);
        else 
        {
            if (firstCountryChanged)
                removeOldData(secondCountryDefault, 5);
            else
                removeOldData(secondCountryDefault, 4);
        }
        
        updateActivitiesChart(firstCountryChanged, secondCountryChanged, secondCountryExists, yearChanged);
        updateOccupationsChart(firstCountryChanged, secondCountryChanged, secondCountryExists, yearChanged);
        updateLineChartsGender(firstCountryChanged, secondCountryChanged, secondCountryExists, yearChanged);
        return;
    }
}


/**
 * Aggiornamento del primo chart corrispondente alle activities
 * @param {Boolean} firstCountryChanged Se il primo paese è cambiato
 * @param {Boolean} secondCountryChanged Se il secondo paese è cambiato
 * @param {Boolean} secondCountryExists Se il secondo paese esiste oppure è la voce NONE
 * @param {Boolean} yearChanged Se l'anno è stato cambiato
 */
function updateActivitiesChart(firstCountryChanged, secondCountryChanged, secondCountryExists, yearChanged) {

    //tolgo gli alert box
    $("#actAlertFirst").removeClass('show');  
    $("#actAlertSecond").removeClass('show');  

    var selection;
    var invalidDataOne = false;
    var invalidDataTwo = false;

    var nameReplacedFirst = firstCountry.split(' ')[0];

    var filtDataFirst = filterData(data, firstCountry, "allActivities", "Total", "both", "Total", false);
    filtDataFirst = removeInvalidData(filtDataFirst);
    
    if (filtDataFirst.length == 0)
    {
        invalidDataOne = true;
        $("#actAlertFirst").addClass('show');  
    }
    else
        var filtDataPerGenderFirst = getDataPerGender(filtDataFirst, firstCountry, "allActivities", "Total", false);
    
    if (secondCountryExists) 
    {
        var nameReplacedSecond = secondCountry.split(' ')[0];
        var filtDataSecond = filterData(data, secondCountry, "allActivities", "Total", "both", "Total", false);
        filtDataSecond = removeInvalidData(filtDataSecond);
        
        if (filtDataSecond.length == 0)
        {
            invalidDataTwo = true;
            $("#actAlertSecond").addClass('show');  
        }

        if (!invalidDataTwo) 
        {
            var filtDataPerGenderSecond = getDataPerGender(filtDataSecond, secondCountry, "allActivities", "Total", false);
            if (!invalidDataOne)
                scaling(filtDataFirst, filtDataSecond);
            else
                scaling(filtDataSecond);
        }
        else
        {
            filtDataSecond = null;
            if (!invalidDataOne)
                scaling(filtDataFirst);
        }

    }
    else
    {
        if (!invalidDataOne)
            scaling(filtDataFirst);

        var filtDataSecond = null;
    }
   
    
    if (invalidDataOne == false || (invalidDataTwo == false && secondCountryExists == true)) 
    {
        actChart.select(".x.axis")
            .transition()
            .duration(10)
            .call(xAxisGender);
    
        actChart.select(".y.axis")
            .transition()
            .duration(updateDuration)
            .call(yAxisGender);

        if (!invalidDataOne) {
    
            if (firstCountryChanged == true || yearChanged == true) {
        
                //FIRST COUNTRY- Enter di nuovi elementi activities
                selection = actChart.select("#clipPath").selectAll(".dots")
                    .data(filtDataPerGenderFirst[0]);
                selection.enter()
                    .append("g")
                    .attr("class", "g actChart firstCountryPath")
                    .append("path")
                    .attr("id", function(d) {
                        return nameReplacedFirst+"_"+selectedYear;
                    })
                    .attr("class", "firstCountryPath")
                    .attr("d", symbol.type(function(d) {
                        return d3.symbolCircle; 
                    }))
                    .attr("transform", function(d) {
                        var y;
                        filtDataPerGenderFirst[1].forEach(function(c) {
                                if (c.NACE_R2 == d.NACE_R2 && c.ISCO08 == d.ISCO08)
                                    y = c.Value;
                            })
            
                        return "translate("+ w + ","+ yScaleFemales(y) + " )";
                    })
                    .style("stroke", function(d,i) { 
                        return actColor(d.NACE_R2);
                    })
                    .style("fill", function(d,i) { 
                        return actColor(d.NACE_R2);
                    });
            }
        
            //FIRST COUNTRY- Update degli elementi appena inseriti
            selection = actChart.selectAll(".g.actChart.firstCountryPath")
                .select("#"+nameReplacedFirst+"_"+selectedYear)
            selection.transition()
                .duration(updateDuration)
                .attr("transform", function(d) {
                    var y;
                    filtDataPerGenderFirst[1].forEach(function(c) {
                            if (c.NACE_R2 == d.NACE_R2 && c.ISCO08 == d.ISCO08)
                                y = c.Value;
                        })
        
                    return "translate("+ xScaleMales(d.Value) + ","+ yScaleFemales(y) + " )";
                });
        
            selection = actChart.selectAll(".g.actChart.firstCountryPath")
            selection.on("mouseover", function() { 
                    return hoverin(filtDataPerGenderFirst, true, 1, filtDataFirst, filtDataSecond);
                });
        }
    
        if (secondCountryExists == true && invalidDataTwo == false) {
    
            if (secondCountryChanged == true || yearChanged == true) {
        
                //SECOND COUNTRY- Enter Activities Chart        
                selection = actChart.select("#clipPath").selectAll(".dots")
                    .data(filtDataPerGenderSecond[0]);
                selection.enter()
                    .append("g")
                    .attr("class", "g actChart secondCountryPath")
                    .append("path")
                    .attr("id", function(d) {
                        return nameReplacedSecond+"_"+selectedYear;
                    })
                    .attr("class", "secondCountryPath")
                    .attr("d", symbol.type(function(d) {
                        return d3.symbolSquare;
                    }))
                    .attr("transform", function(d) {
                        var y;
                        filtDataPerGenderSecond[1].forEach(function(c) {
                                if (c.NACE_R2 == d.NACE_R2 && c.ISCO08 == d.ISCO08)
                                    y = c.Value;
                            })
                        return "translate("+ w + ","+ yScaleFemales(y) + " )";
                    })
                    .style("stroke", function(d,i) { 
                        return actColor(d.NACE_R2);
                    })
                    .style("fill", function(d,i) { 
                        return actColor(d.NACE_R2);
                    });
            }
            //SECOND COUNTRY- Update dei nuovi elementi
            selection = actChart.selectAll(".g.actChart.secondCountryPath").select("#"+nameReplacedSecond+"_"+selectedYear);
            selection.transition()
                .duration(updateDuration)
                .attr("transform", function(d) {
                    var y;
                    filtDataPerGenderSecond[1].forEach(function(c) {
                            if (c.NACE_R2 == d.NACE_R2 && c.ISCO08 == d.ISCO08)
                                y = c.Value;
                        })
        
                    return "translate("+ xScaleMales(d.Value) + ","+ yScaleFemales(y) + " )";
                });
            selection = actChart.selectAll(".g.actChart.secondCountryPath");
            selection.on("mouseover", function() {
                    return hoverin(filtDataPerGenderSecond, false, 1, filtDataFirst, filtDataSecond);
                });
        }
    }
        
}


/**
 * Aggiornamento del secondo chart corrispondente alle occupations
 * @param {Boolean} firstCountryChanged Se il primo paese è cambiato
 * @param {Boolean} secondCountryChanged Se il secondo paese è cambiato
 * @param {Boolean} secondCountryExists Se il secondo paese esiste oppure è NONE
 * @param {Boolean} yearChanged Se l'anno è stato cambiato
 */
function updateOccupationsChart(firstCountryChanged, secondCountryChanged, secondCountryExists, yearChanged) {

    $("#occAlertFirst").removeClass('show');
    $("#occAlertSecond").removeClass('show');

    var selection;
    var invalidDataOne = false;
    var invalidDataTwo = false;

    var nameReplacedFirst = firstCountry.split(' ')[0];
    
    var filtDataOccupationsFirst = filterData(data, firstCountry, selectedActivity, "allOccupations", "both", "Total", false);
    filtDataOccupationsFirst = removeInvalidData(filtDataOccupationsFirst);

    if (filtDataOccupationsFirst.length == 0)
    {
        invalidDataOne = true;
        $("#occAlertFirst").addClass('show');
    }
    else
        var filtOccDataPerGenderFirst = getDataPerGender(filtDataOccupationsFirst, firstCountry, selectedActivity, "allOccupations", false);

    if (secondCountryExists) 
    {
        var nameReplacedSecond = secondCountry.split(' ')[0];
        var filtDataOccupationsSecond = filterData(data, secondCountry, selectedActivity, "allOccupations", "both", "Total", false);
        filtDataOccupationsSecond = removeInvalidData(filtDataOccupationsSecond);

        if (filtDataOccupationsSecond.length == 0)
        {
            invalidDataTwo = true;
            $("#occAlertSecond").addClass('show');
        }

        if (!invalidDataTwo)
        {
            var filtOccDataPerGenderSecond = getDataPerGender(filtDataOccupationsSecond, secondCountry, selectedActivity, "allOccupations", false);
            if (!invalidDataOne)
                scaling(filtDataOccupationsFirst, filtDataOccupationsSecond);
            else
                scaling(filtDataOccupationsSecond);
        }
        else
        {
            filtDataOccupationsSecond = null;
            if (!invalidDataOne)
                scaling(filtDataOccupationsFirst)
        }
        
    }
    else
    {
        if (!invalidDataOne)
            scaling(filtDataOccupationsFirst);
        
        var filtDataOccupationsSecond = null;
    }
    
    if (invalidDataOne == false || (invalidDataTwo == false && secondCountryExists == true)) {

        occChart.select(".x.axis")
            .transition()
            .duration(updateDuration)
            .call(xAxisGender);
    
        occChart.select(".y.axis")
            .transition()
            .duration(updateDuration)
            .call(yAxisGender);
    
        if (!invalidDataOne) 
        {
            if (firstCountryChanged == true || yearChanged == true) {
        
                //FIRST COUNTRY- Enter dei nuovi elementi
                selection = occChart.select("#cliPathOcc").selectAll(".dots").data(filtOccDataPerGenderFirst[0]);
                selection.enter()
                    .append("g")
                    .attr("class", "g occChart firstCountryPath")
                    .append("path")
                    .attr("id", function(d) {
                        return nameReplacedFirst+"_"+selectedYear+"_"+activities.indexOf(selectedActivity);
                    })
                    .attr("class", "firstCountryPath")
                    .attr("d", symbol.type(function(d) {
                        return d3.symbolCircle;
                    }))
                    .attr("transform", function(d) {
                        var y;
                        filtOccDataPerGenderFirst[1].forEach(function(c) {
                                if (c.NACE_R2 == d.NACE_R2 && c.ISCO08 == d.ISCO08)
                                    y = c.Value;
                            })
                        return "translate("+ w + ","+ yScaleFemales(y) + " )";
                    })
                    .style("stroke", function(d,i) { 
                        return occColor(d.ISCO08)
                    })
                    .style("fill", function(d,i) { 
                        return occColor(d.ISCO08)
                    });
            }
        
            //FIRST COUNTRY- update degli elementi 
            selection = occChart.selectAll(".g.occChart.firstCountryPath").select("#"+nameReplacedFirst+"_"+selectedYear+"_"+activities.indexOf(selectedActivity));
            selection.transition()
                .duration(updateDuration)
                .attr("transform", function(d) {
                    var y;
                    filtOccDataPerGenderFirst[1].forEach(function(c) {
                            if (c.NACE_R2 == d.NACE_R2 && c.ISCO08 == d.ISCO08)
                                y = c.Value;
                        })
        
                    return "translate("+ xScaleMales(d.Value) + ","+ yScaleFemales(y) + " )";
                });
            selection = occChart.selectAll(".g.occChart.firstCountryPath");
            selection.on("mouseover", function() {
                return hoverin(filtOccDataPerGenderFirst, true, 2, filtDataOccupationsFirst, filtDataOccupationsSecond);
            });
        }
    
        if (secondCountryExists == true && invalidDataTwo == false) 
        {
            if (secondCountryChanged == true || yearChanged == true) {
        
                //SECOND COUNTRY- Enter dei nuovi elementi
                selection = occChart.select("#cliPathOcc").selectAll(".dots")
                    .data(filtOccDataPerGenderSecond[0]);
                selection.enter()
                    .append("g")
                    .attr("class", "g occChart secondCountryPath")
                    .append("path")
                    .attr("id", function(d) {
                        return nameReplacedSecond+"_"+selectedYear+"_"+activities.indexOf(selectedActivity);
                    })
                    .attr("class", "secondCountryPath")
                    .attr("d", symbol.type(function(d) {
                        return d3.symbolSquare;
                    }))
                    .attr("transform", function(d) {
                        var y;
                        filtOccDataPerGenderSecond[1].forEach(function(c) {
                                if (c.NACE_R2 == d.NACE_R2 && c.ISCO08 == d.ISCO08)
                                    y = c.Value;
                            })
                        return "translate("+ w + ","+ yScaleFemales(y) + " )";
                    })
                    .style("stroke", function(d,i) { 
                        return occColor(d.ISCO08);
                    })
                    .style("fill", function(d,i) { 
                        return occColor(d.ISCO08);
                    });
            }
            //SECOND COUNTRY- Update degli elementi
            selection = occChart.selectAll(".g.occChart.secondCountryPath").select("#"+nameReplacedSecond+"_"+selectedYear+"_"+activities.indexOf(selectedActivity));
            selection.transition()
                .duration(updateDuration)
                .attr("transform", function(d) {
                    var y;
                    filtOccDataPerGenderSecond[1].forEach(function(c) {
                            if (c.NACE_R2 == d.NACE_R2 && c.ISCO08 == d.ISCO08)
                                y = c.Value;
                        })
        
                    return "translate("+ xScaleMales(d.Value) + ","+ yScaleFemales(y) + " )";
                });
            selection = occChart.selectAll(".g.occChart.secondCountryPath");
            selection.on("mouseover", function() {
                    return hoverin(filtOccDataPerGenderSecond, false, 2, filtDataOccupationsFirst, filtDataOccupationsSecond);
                });
        }
    }
}


/**
 * Aggiornamento del terzo chart corrispondente ai line charts delle occupations
 * @param {Boolean} firstCountryChanged Se il primo paese è cambiato 
 * @param {Boolean} secondCountryChanged Se il secondo paese è cambiato
 * @param {Boolean} secondCountryExists Se il secondo paese esiste oppure è NONE
 */
function updateLineChartsGender(firstCountryChanged, secondCountryChanged, secondCountryExists) {
 
    var selection;
    var invalidDataOne = false;
    var invalidDataTwo = false;
    var bothCountryData = [];
    var nameReplacedFirst = firstCountry.split(' ')[0];

    var filtDataOccupationFirst = filterData(data, firstCountry, selectedActivity, selectedOccupation, "both", "Total", true);
    filtDataOccupationFirst = removeInvalidData(filtDataOccupationFirst);
    
    if (filtDataOccupationFirst.length == 0)
       invalidDataOne = true;
    else
        var filtSingleOccDataPerGenderFirst = getDataPerGender(filtDataOccupationFirst, firstCountry, selectedActivity, selectedOccupation, true);
    
    if (filtSingleOccDataPerGenderFirst[0].length != 4)
        $("#occLineAlertFirst").addClass('show');

    if (secondCountryExists)
    {
        var nameReplacedSecond = secondCountry.split(' ')[0];
        var filtDataOccupationSecond = filterData(data, secondCountry, selectedActivity, selectedOccupation, "both", "Total", true);
        filtDataOccupationSecond = removeInvalidData(filtDataOccupationSecond);

        if (filtDataOccupationSecond.length == 0)
            invalidDataTwo = true;

        if (!invalidDataTwo)
        {
            var filtSingleOccDataPerGenderSecond = getDataPerGender(filtDataOccupationSecond, secondCountry, selectedActivity, selectedOccupation, true);
            
            if (filtSingleOccDataPerGenderSecond[0].length != 4)
                $("#occLineAlertSecond").addClass('show');
            
            if (!invalidDataOne)
            {
                scaling(filtDataOccupationFirst, filtDataOccupationSecond);
                if (filtSingleOccDataPerGenderFirst[0].length != 0) {

                    filtSingleOccDataPerGenderFirst.forEach(function(d) {
                        bothCountryData.push(d);
                    });
                }
                if (filtSingleOccDataPerGenderSecond[0].length != 0) {

                    filtSingleOccDataPerGenderSecond.forEach(function(d) {
                        bothCountryData.push(d);
                    });
                }
            }
            else
            {
                scaling(filtDataOccupationSecond);
                if (filtSingleOccDataPerGenderSecond[0].length != 0) {

                    filtSingleOccDataPerGenderSecond.forEach(function(d) {
                        bothCountryData.push(d);
                    });
                }
            }
        }
        else
        {
            if (!invalidDataOne)
            {
                scaling(filtDataOccupationFirst);
                
                if (filtSingleOccDataPerGenderFirst[0].length != 0) {

                    filtSingleOccDataPerGenderFirst.forEach(function(d) {
                        bothCountryData.push(d);
                    });
                }
            }
        }            
    }
    else
    {
        if (!invalidDataOne) 
        {
            scaling(filtDataOccupationFirst);
            if (filtSingleOccDataPerGenderFirst[0].length != 0)
            {
                filtSingleOccDataPerGenderFirst.forEach(function(d) {
                    bothCountryData.push(d);
                });
            }

        }

        var filtDataOccupationSecond = null;
    }
        
    if (invalidDataOne == false ||  (invalidDataTwo == false && secondCountryExists == true)) {

        occLineChart.select(".y.axis")
            .transition()
            .duration(updateDuration)
            .call(yAxis);
            
        if (!invalidDataOne) {
    
            //FIRST COUNTRY- Enter Lines
            selection = lines.selectAll("line-group").data(filtSingleOccDataPerGenderFirst);
            selection.enter()
                .append("g")
                .attr("class", "firstCountryPath")
                .on("mouseover", function() {
                    return hoverin(filtSingleOccDataPerGenderFirst, true, 3, filtDataOccupationFirst, filtDataOccupationSecond);
                })
                .append("path")
                .attr("class", "line")  
                .attr("d", function(d) {
                    return lineGenerator(d);
                })
                .style("stroke", function(d,i) { 
                    return color(i);
                })
                .style("opacity", lineOpacity);
    
            if (firstCountryChanged) {
                //FIRST COUNTRY- Enter Circles
                selection = lines.selectAll("circle-group").data(filtSingleOccDataPerGenderFirst);
                selection.enter()
                    .append("g")
                    .attr("class", function(d,i){
                        return "firstCountryCircles _"+i;
                    })
                    .style("fill", function(d,i) { return color(i)})
                    .selectAll("circle")
                    .data(function(d) { return d}).enter()
                    .append("g")
                    .attr("class", "circle")  
                    .append("circle")
                    .attr("id", function(d) {
                        return nameReplacedFirst+"_"+selectedYear+"_"+occupations.indexOf(selectedOccupation);
                    })
                    .attr("cx", w)
                    .attr("cy", function(d) { return yScale(d.Value);})
                    .attr("r", circleRadius)
                    .style("opacity", circleOpacity);
            }
            
            //FIRST COUNTRY- update circles
            selection = lines.selectAll(".firstCountryCircles").selectAll("#"+nameReplacedFirst+"_"+selectedYear+"_"+occupations.indexOf(selectedOccupation));
            selection.transition()
                .duration(updateDuration)
                .attr("cx", function(d) { return xTimeScale(d.TIME);})
                .attr("cy", function(d) { 
                    return yScale(d.Value);
                });
            selection = lines.selectAll(".firstCountryCircles");
            selection.on("mouseover", function() {
                return hoverin(filtSingleOccDataPerGenderFirst, true, 3, filtDataOccupationFirst, filtDataOccupationSecond);
            });
        }
    
        if (secondCountryExists == true && invalidDataTwo == false)
        {
            //SECOND COUNTRY- Enter Lines
            selection = lines.selectAll("line-group").data(filtSingleOccDataPerGenderSecond);
            selection.enter()
                .append("g")
                .attr("class", "secondCountryPath")
                .on("mouseover", function() {
                    return hoverin(filtSingleOccDataPerGenderSecond, false, 3, filtDataOccupationFirst, filtDataOccupationSecond);
                })
                .append("path")
                .attr("class", "line")  
                .attr("d", function(d) {
                    return lineGenerator(d);
                })
                .style("stroke", function(d,i) { 
                    return color(i+2);
                })
                .style("opacity", lineOpacity);
        
            if (secondCountryChanged) {
        
                //SECOND COUNTRY- Enter circles
                selection = lines.selectAll("circle-group").data(filtSingleOccDataPerGenderSecond);
                selection.enter()
                    .append("g")
                    .attr("class", function(d,i){
                        return "secondCountryCircles _"+i;
                    })
                    .style("fill", function(d,i) { 
                        return color(i+2);
                    })
                    .selectAll("circle")
                    .data(function(d) { return d}).enter()
                    .append("g")
                    .attr("class", "circle")  
                    .append("circle")
                    .attr("id", function(d) {
                        return nameReplacedSecond+"_"+selectedYear+"_"+occupations.indexOf(selectedOccupation);
                    })
                    .attr("cx", w)
                    .attr("cy", function(d) { return yScale(d.Value);})
                    .attr("r", circleRadius)
                    .style("opacity", circleOpacity);
            }
            
            //SECOND COUNTRY- update circles
            selection = lines.selectAll(".secondCountryCircles").selectAll("#"+nameReplacedSecond+"_"+selectedYear+"_"+occupations.indexOf(selectedOccupation));
            selection.transition()
                .duration(updateDuration)
                .attr("cx", function(d) { return xTimeScale(d.TIME);})
                .attr("cy", function(d) { return yScale(d.Value);});
            selection = lines.selectAll(".secondCountryCircles");
            selection.on("mouseover", function() {
                return hoverin(filtSingleOccDataPerGenderSecond, false, 3, filtDataOccupationFirst, filtDataOccupationSecond);
            });
            
        }

        if (bothCountryData.length != 0)
        {

            //Line charts legend enter
            legendOccLine.selectAll(".legendDots")
                .data(bothCountryData)
                .enter()
                .append("circle")    
                    .attr("cx", 20)
                    .attr("cy", function(d,i) {
                        return 20 + i*30;
                    })  
                    .attr("r", 7)
                    .style("fill", function(d,i) { return color(i)});
        
            legendOccLine.selectAll("labels").data(bothCountryData)
                    .enter()
                    .append("foreignObject")
                    .attr("x", 40)
                    .attr("y", function(d,i){ return 11 + i*30}) 
                    .attr("width", 400)
                    .attr("height", 35)
                    .append("xhtml:body")
                        .style("font", "14px 'Helvetica Neue'")
                        .style("color", function(d,i){ return color(i)})
                        .html(function(d) {
                            if (d.length != 0)
                                return d[0].GEO+", "+d[0].SEX;
                            else
                                return;
                        });
        }
        

    }
        
    
}


/**
 * Si occupa di attribuire le proprietà onmouseover e onmouseout ai vari componenti dei charts
 * @param {*} dataset Dataset in esame
 * @param {Boolean} isFirstCountry Se si tratta del secondo paese oppure no
 * @param {Number} id Il numero del chart di cui effettuare le operazioni di hoverin
 * @param {*} firstScaleDataset Il primo dataset per effettuare lo scaling
 * @param {*} secondScaleDataset Il secondo dataset per effettuare lo scaling
 */
function hoverin (dataset, isFirstCountry, id, firstScaleDataset, secondScaleDataset = null)
{   
    //hover scatterplot activities
    if (id == 1)
    {
        var selectedData;
        if (isFirstCountry) 
            selectedData = actChart.selectAll(".g.actChart.firstCountryPath");
        else
            selectedData = actChart.selectAll(".g.actChart.secondCountryPath");
        
        selectedData.data(dataset[0])
                .on("mouseover", function(d,i) {
                    if (secondScaleDataset == null) 
                        scaling(firstScaleDataset);
                    else
                        scaling(firstScaleDataset, secondScaleDataset);

                    d3.select(this)     
                    .style("cursor", "pointer")
                    .append("text")
                    .attr("class", "text")
                    .attr("fill", function(d) {
                        return actColor(d.NACE_R2);
                    })
                    .text(function(d) {
                            
                        var y;
                        dataset[1].forEach(function(c) {
                            if (c.NACE_R2 == d.NACE_R2 && c.ISCO08 == d.ISCO08)
                                y = c.Value;
                        })  
                        
                        if (d.GEO.split(" ").length > 2) {
                            if (d.GEO.split(" ")[0] == "Germany") 
                                return d.GEO.toUpperCase().split(" ")[0]+ " Males:"+d.Value+", Females:"+y;
                            else
                                return d.GEO.toUpperCase().split(" ")[0] + " " + d.GEO.toUpperCase().split(" ")[1]+ " Males:"+d.Value+", Females:"+y;
                        }
                        else
                            return d.GEO.toUpperCase().split(" ")[0]+ " Males:"+d.Value+", Females:"+y;
                    
                    })
                    .attr("text-anchor", "middle")
                    .attr("x", (w-margin.top)/2)
                    .attr("y", 15)
                    .attr("font-size", textSize);
                })
                .on("mouseout", function(d) {
                
                    d3.select(this)
                        .style("cursor", "none")  
                        .transition()
                        .duration(duration)
                        .selectAll(".text").remove();
                });    
        
    }

    //hover scatterplot occupations
    if (id == 2) 
    {
        var selectedData;
        if (isFirstCountry) 
            selectedData = occChart.selectAll(".g.occChart.firstCountryPath");
        else
            selectedData = occChart.selectAll(".g.occChart.secondCountryPath");
        
        selectedData.data(dataset[0])
                    .on("mouseover", function(d) {
                        
                        if (secondScaleDataset == null) 
                            scaling(firstScaleDataset);
                        else
                            scaling(firstScaleDataset, secondScaleDataset);

                        d3.select(this)     
                        .style("cursor", "pointer")
                        .append("text")
                        .attr("class", "text")
                        .attr("fill", function(d) {
                            return occColor(d.ISCO08);
                        })
                        .text(function(d) {
                            
                            var y;
                            dataset[1].forEach(function(c) {
                                if (c.NACE_R2 == d.NACE_R2 && c.ISCO08 == d.ISCO08)
                                    y = c.Value;
                            })  
                            
                            if (d.GEO.split(" ").length > 2) {
                                if (d.GEO.split(" ")[0] == "Germany") 
                                    return d.GEO.toUpperCase().split(" ")[0]+ " Males:"+d.Value+", Females:"+y;
                                else
                                    return d.GEO.toUpperCase().split(" ")[0] + " " + d.GEO.toUpperCase().split(" ")[1]+ " Males:"+d.Value+", Females:"+y;
                            }
                            else
                                return d.GEO.toUpperCase().split(" ")[0]+ " Males:"+d.Value+", Females:"+y;
                        
                        })
                        .attr("text-anchor", "middle")
                        .attr("x", (w-margin.top)/2)
                        .attr("y", 15)
                        .attr("font-size", textSize);

                    })
                    .on("mouseout", function(d) {
                    
                        d3.select(this)
                            .style("cursor", "none")  
                            .transition()
                            .duration(duration)
                            .selectAll(".text").remove();

                    })    
    }

    //hover lineChart e circles gender
    if (id == 3) 
    {
        //Line hover text
        var selectedData;
        if (isFirstCountry) 
            selectedData = lines.selectAll(".firstCountryPath");
        else
            selectedData = lines.selectAll(".secondCountryPath");
        
        selectedData.data(dataset)
            .on("mouseover", function(d, i) {
                var c;
                if (!isFirstCountry) 
                    c = i+2;
                else 
                    c = i;
                
                occLineChart.append("text")
                .attr("class", "title-text")
                .style("fill", color(c))        
                .text(d[0].GEO+", "+d[0].SEX)
                .attr("text-anchor", "middle")
                .attr("x", (w-margin.top)/2)
                .attr("y", 15);
            })
            .on("mouseout", function(d) {
                occLineChart.select(".title-text").remove();
            })  

        //Line hover
        if (isFirstCountry) 
            selectedData = lines.selectAll(".firstCountryPath").select(".line");
        else
            selectedData = lines.selectAll(".secondCountryPath").select(".line");

        selectedData.data(dataset)
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
        
        //circle text hover Males
        if (isFirstCountry) 
            selectedData = lines.selectAll(".firstCountryCircles._0").selectAll(".circle");
        else
            selectedData = lines.selectAll(".secondCountryCircles._0").selectAll(".circle");
        
        selectedData.data(dataset[0])
                    .on("mouseover", function(d) {

                        if (secondScaleDataset == null) 
                            scaling(firstScaleDataset);
                        else
                            scaling(firstScaleDataset, secondScaleDataset);

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
                    });

        //circle text hover Femles
        if (isFirstCountry) 
            selectedData = lines.selectAll(".firstCountryCircles._1").selectAll(".circle");
        else
            selectedData = lines.selectAll(".secondCountryCircles._1").selectAll(".circle");
        
        selectedData.data(dataset[1])
                    .on("mouseover", function(d) {

                        if (secondScaleDataset == null) 
                            scaling(firstScaleDataset);
                        else
                            scaling(firstScaleDataset, secondScaleDataset);

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
                    });

        
        if (isFirstCountry) 
            selectedData = lines.selectAll(".firstCountryCircles").selectAll("circle");
        else
            selectedData = lines.selectAll(".secondCountryCircles").selectAll("circle");
            
        selectedData.on("mouseover", function(d) {
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
}


/**
 * Si occupa di cancellare dal dataset passato in input tutte le voci il cui campo "Value" ha un valore non definito
 * E si occupa anche di effettuare il parsing delle voci in "TIME" in oggetti DATE
 * @param {} filtData Dataset in esame 
 */
function removeInvalidData(filtData) {
    // Controllo di eventuali dati mancanti e rimozione di questi per una corretta visualizzazione dei charts
     for(var i=0; i<filtData.length; i++) {
        if (isNaN(filtData[i].Value)) {
            filtData.splice(i,1);
            i = -1;
            continue;
        }
        else
            continue;
    }

    //Parsing delle date
    var parseDate = d3.timeParse("%Y");
    filtData.forEach(function(d,i) {
        //Non parsa due volte un oggetto data
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
                    if ((d.TIME == selectedYear) || ((Object.prototype.toString.call(d.TIME) === "[object Date]") && (d.TIME.getFullYear() == selectedYear))) {
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
                        if ((d.TIME == selectedYear) || ((Object.prototype.toString.call(d.TIME) === "[object Date]") && (d.TIME.getFullYear() == selectedYear))) {
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


/**
 * Parsing del dataset e chiamata delle funzioni iniziali
 */
d3.csv("data/earn_ses_monthly_1_Data.csv", function (error, csv) {
    
    globalVar();

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

        if (!occupations.includes(d.ISCO08) && d.ISCO08 != "Total") 
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
    gender_menu();
    genderStudyCharts();
});





