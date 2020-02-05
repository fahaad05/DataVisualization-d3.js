var data;
var countries = [];
var activities = [];
var occupations = [];
var selectedYear = 0;
var margin = {top: 50, right: 50, bottom: 50, left: 70};
var h= 550-margin.left -margin.right;
var w= 550-margin.left -margin.right;
var firstCountry = "";
var secondCountry = "";
var xScale,
    yScale,
    xAxScale,
    xAxis;
var symbol = d3.symbol().size(50);
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


function scaling(filtData) {

    var values = [];
    filtData.forEach(function(d) {
        values.push(d.Value);
    });
    values.sort(function(a, b){return a - b});

    var min_xy = +d3.min(filtData, function(d) {return d.Value;});
    var max_xy = +d3.max(filtData, function(d) {return d.Value;});
    var avg_xy = +(max_xy - min_xy)/filtData.length;

    // TODO: Aggiustare un pò le scale per ottenere una visualizzazione migliore 
    xScale = d3.scaleLinear()
        .domain([min_xy-avg_xy, max_xy+avg_xy])
        .range([0, w]);

    yScale = d3.scaleLinear()
        .domain([min_xy-avg_xy, max_xy+avg_xy])
        .range([h,0]);
            
    xAxis = d3.axisBottom()
            .scale(xScale)
            .ticks(values.length)

    yAxis = d3.axisLeft()
            .scale(yScale)
            .ticks(values.length);

    
}


function genderStudyCharts() {
    
    // Li passerò il paese selezionato nella lista dei radio 
    // Ci sarà un anno di default, ma può essere cambiato, quindi potrebbe
    // prendere un parametro per vedere quale è selezionato

    // PROVA PER VEDERE SE FUNZIONA, METTENDO COME PAESE 1=> ITALIA
    firstCountry = "Italy";
    selectedYear = 2002;
    var filtData = filterData(data, firstCountry, "allActivities", "Total", "both", "Total", false);
    
    //TODO: mettere un alertbox quando ci sono dati non validi
    removeInvalidData(filtData);
    scaling(filtData);

    actChart.append("g")
            .attr("transform", "translate(0," + h + ")")
            .attr("class", "x axis")
            .call(xAxis);
    
    actChart.append("g")
            .attr("transform", "translate(0,0)")
            .attr("class", "y axis")
            .call(yAxis);

    var clip = actChart.append("defs").append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("id", "clip-rect")
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
            });












    // d3.select("#xAxisActScatt")
    //             .attr("transform", "translate("+margin.left+"," + (h+125) + ")")
    //             .call(xAxis)
    //             .append("text")
    //             .attr("x", w)
    //             .attr("y", -6)
    //             .text("Males")

    // var clip = d3.select("#act_scattSvg").append("defs").append("svg:clipPath")
    //     .attr("id", "clip")
    //     .append("svg:rect")
    //     .attr("id", "clip-rect")
    //     .attr("x", "0")
    //     .attr("y", "0")
    //     .attr('width', w)
    //     .attr('height', h);

    // actScatt.attr("clip-path", "url(#clip)");
                
    // actScatt.append("rect")
    //     .attr("x", 50)
    //     .attr("y", 50)
    //     .attr("width", w+50)
    //     .attr("height", h+50);


    // actScatt.selectAll(".dots")
    //     .data(filtData)
    //     .enter()
    //     .append("path")
    //     .attr("d", symbol.type( function (d){
    //         if (d.SEX == "Males")
    //             return d3.symbolSquare;
    //         else 
    //             return d3.symbolCircle;
    //     }))
    //     .attr("transform", function(d) {
    //         return "translate("+ xScale(d.Value) + ", "+ yScale(d.Value) + ") rotate(45)";
    //     });
}


function removeInvalidData(filtData) {
    
    // Controllo di eventuali dati mancanti e rimozione di questi per una corretta visualizzazione dei charts
     for(var i=0; i<filtData.length; i++) {
        if (filtData[i].Value == ":") {
            if (!missingData)
                missingData = true;
            filtData.splice(i,1);
            i = -1;
            continue;
        }
        else
            continue;
    }
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
 * @param {String} age Fascia d'età
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
                    // Selezione di un'attività specifica
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
                        // Selezione di un'attività specifica
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
                        // Selezione di un'attività specifica
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
                            // Selezione di un'attività specifica
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
        time= +d.TIME;
        indic_se= d.INDIC_SE;
        value= d.Value.replace(".", "");
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
    genderStudyCharts();
});





