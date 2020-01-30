// Load Csv File
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

        console.log(csv);    
    })
    
});