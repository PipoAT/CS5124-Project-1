// Define dimensions and margins
const width = 800;
const height = 600;
const margin = { top: 40, right: 20, bottom: 50, left: 75 };

// Load data
let socioData;
d3.csv('data/national_health_data_2024.csv').then(data => {
    data.forEach(d => {
        d.MedianHouseholdIncome = +d.median_household_income;
        d.EducationLessThanHighSchoolPercent = +d.education_less_than_high_school_percent;
        d.PovertyPercent = +d.poverty_perc;
        d.NoHealthInsurancePercent = +d.percent_no_heath_insurance;
    });
    socioData = data;
    initializeScatterPlot();
    updateScatterPlot('EducationLessThanHighSchoolPercent');
});

// ** Initialize Scatterplot Once **
function initializeScatterPlot() {
    d3.select('.scatterplot').remove(); // Remove any existing SVG
    const scatterPlotSvg = d3.select('body').append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .attr('class', 'scatterplot')
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    scatterPlotSvg.append('g').attr('class', 'x-axis')
        .attr('transform', `translate(0, ${height - 100})`);

    scatterPlotSvg.append('g').attr('class', 'y-axis');

    scatterPlotSvg.append('text')
        .attr('class', 'scatter-title')
        .attr('x', width / 2)
        .attr('y', -10)
        .attr('text-anchor', 'middle')
        .attr('font-size', '18px')
        .attr('font-weight', 'bold')
        .text('Scatter Plot');

    scatterPlotSvg.append('text')
        .attr('class', 'x-label')
        .attr('x', width / 2)
        .attr('y', height - 60)
        .attr('text-anchor', 'middle')
        .attr('font-size', '16px')
        .text('Median Household Income');

    scatterPlotSvg.append('text')
        .attr('class', 'y-label')
        .attr('x', -height / 2)
        .attr('y', -50)
        .attr('transform', 'rotate(-90)')
        .attr('text-anchor', 'middle')
        .attr('font-size', '16px');
}

// ** Update Scatterplot Without Duplicating Elements **
function updateScatterPlot(yAttribute) {
    const scatterPlotSvg = d3.select('.scatterplot g');

    const scatterXScale = d3.scaleLinear()
        .domain([0, d3.max(socioData, d => d.MedianHouseholdIncome)])
        .range([0, width - 40]);

    const scatterYScale = d3.scaleLinear()
        .domain([0, d3.max(socioData, d => d[yAttribute])])
        .range([height - 100, 0]);

    scatterPlotSvg.select('.x-axis')
        .call(d3.axisBottom(scatterXScale).ticks(10));

    scatterPlotSvg.select('.y-axis')
        .call(d3.axisLeft(scatterYScale).ticks(5));

    // Update y-axis label dynamically
    scatterPlotSvg.select('.y-label').text(yAttribute);

    const circles = scatterPlotSvg.selectAll('circle').data(socioData);

    circles.enter()
        .append('circle')
        .merge(circles)
        .attr('cx', d => scatterXScale(d.MedianHouseholdIncome))
        .attr('cy', d => scatterYScale(d[yAttribute]))
        .attr('r', 5)
        .attr('fill', '#4682B4')
        .attr('stroke', '#fff')
        .style('opacity', 0.7);

    circles.exit().remove();
}

// ** Initialize Histogram Once **
function initializeHistogram() {
    d3.select('.histogram').remove(); // Remove any existing SVG

    const histSvg = d3.select('body').append('svg')
        .attr('width', histWidth + histMargin.left + histMargin.right)
        .attr('height', histHeight + histMargin.top + histMargin.bottom)
        .attr('class', 'histogram')
        .append('g')
        .attr('transform', `translate(${histMargin.left},${histMargin.top})`);

    histSvg.append('g').attr('class', 'x-axis')
        .attr('transform', `translate(0, ${histHeight - 100})`);

    histSvg.append('g').attr('class', 'y-axis');

    histSvg.append('text')
        .attr('class', 'hist-title')
        .attr('x', histWidth / 2)
        .attr('y', -10)
        .attr('text-anchor', 'middle')
        .attr('font-size', '18px')
        .attr('font-weight', 'bold')
        .text('Histogram');

    histSvg.append('text')
        .attr('class', 'x-label')
        .attr('x', histWidth / 2)
        .attr('y', histHeight - 60)
        .attr('text-anchor', 'middle')
        .attr('font-size', '16px');

    histSvg.append('text')
        .attr('class', 'y-label')
        .attr('x', -histHeight / 2)
        .attr('y', -50)
        .attr('transform', 'rotate(-90)')
        .attr('text-anchor', 'middle')
        .attr('font-size', '16px');
}

// ** Update Histogram Without Duplicating Elements **
function updateHistogram(attribute) {
    const histSvg = d3.select('.histogram g');

    const histXScale = d3.scaleLinear()
        .domain([0, d3.max(socioData, d => d[attribute])])
        .range([0, histWidth - 40]);

    const histogram = d3.histogram()
        .value(d => d[attribute])
        .domain(histXScale.domain())
        .thresholds(histXScale.ticks(20));

    const bins = histogram(socioData);

    const histYScale = d3.scaleLinear()
        .domain([0, d3.max(bins, d => d.length)])
        .range([histHeight - 100, 0]);

    histSvg.select('.x-axis')
        .call(d3.axisBottom(histXScale).ticks(10));

    histSvg.select('.y-axis')
        .call(d3.axisLeft(histYScale).ticks(5));

    histSvg.select('.x-label').text(attribute);
    
    const bars = histSvg.selectAll('rect').data(bins);

    bars.enter()
        .append('rect')
        .merge(bars)
        .attr('x', d => histXScale(d.x0))
        .attr('y', d => histYScale(d.length))
        .attr('width', d => Math.max(1, histXScale(d.x1) - histXScale(d.x0) - 1))
        .attr('height', d => histHeight - 100 - histYScale(d.length))
        .attr('fill', '#4682B4')
        .style('opacity', 0.7);

    bars.exit().remove();
}


// Choropleth Map

d3.select('.choropleth').remove();
Promise.all([
    d3.json('data/counties-10m.json'),
    d3.csv('data/national_health_data_2024.csv')
]).then(data => {
    const geoData = data[0];
    const countyPopulationData = data[1];
    console.log("County pop data:", countyPopulationData[0]);
    
    // Merge population data with county geometries
    geoData.objects.counties.geometries.forEach(d => {
        for (let i = 0; i < countyPopulationData.length; i++) {
            if (String(d.id) === countyPopulationData[i].cnty_fips) {
                d.properties.income = +countyPopulationData[i].median_household_income;
                d.properties.poverty = +countyPopulationData[i].poverty_perc;
                d.properties.education = +countyPopulationData[i].education_less_than_high_school_percent;
            }
        }
    });

    const choroplethSvg = d3.select('body').append('svg')
        .attr('class', 'choropleth');

    const colorScale = d3.scaleQuantize()
        .domain([0, d3.max(countyPopulationData, d => +d[attribute])])
        .range(d3.schemeBlues[9]);

    const path = d3.geoPath();
    console.log(geoData);
    choroplethSvg.selectAll('path')
        .data(geoData, geoData.objects.counties)
        .enter().append('path')
        .attr('d', path)
        .attr('fill', d => colorScale(d.properties[attribute]))
        .attr('stroke', '#fff')
        .attr('stroke-width', 0.5)
        .transition()  // Ensure transition is applied after elements are added
        .duration(1000)
        .attr('fill', d => colorScale(d.properties[attribute]));

    const choroplethMap = new ChoroplethMap({ 
        parentElement: '.viz',   
    }, geoData);

}).catch(error => console.error(error));

