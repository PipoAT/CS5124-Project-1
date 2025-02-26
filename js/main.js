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
    createUI();
    updateScatterPlot('EducationLessThanHighSchoolPercent');
    updateHistogram('EducationLessThanHighSchoolPercent');
    updateChoropleth('EducationLessThanHighSchoolPercent');
});

// UI Controls
function createUI() {
    const controls = d3.select('body').append('div').attr('class', 'controls');
    controls.append('label').text('Select Attribute: ');
    const select = controls.append('select').attr('id', 'attribute-select');
    const attributes = [
        { key: 'EducationLessThanHighSchoolPercent', label: 'Education < High School (%)' },
        { key: 'PovertyPercent', label: 'Poverty (%)' },
        { key: 'NoHealthInsurancePercent', label: 'No Health Insurance (%)' }
    ];
    
    select.selectAll('option')
        .data(attributes)
        .enter().append('option')
        .attr('value', d => d.key)
        .text(d => d.label);

    select.on('change', function () {
        updateScatterPlot(this.value);
        updateHistogram(this.value);
        updateChoropleth(this.value);
    });
}

// Scatterplot
function updateScatterPlot(yAttribute) {
    d3.select('.scatterplot').remove();
    const scatterPlotSvg = d3.select('body').append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .attr('class', 'scatterplot')
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    
    const scatterXScale = d3.scaleLinear()
        .domain([0, d3.max(socioData, d => d.MedianHouseholdIncome)])
        .range([0, width - 40]);
    
    const scatterYScale = d3.scaleLinear()
        .domain([0, d3.max(socioData, d => d[yAttribute])])
        .range([height - 100, 0]);
    
    scatterPlotSvg.append('g')
        .selectAll('circle')
        .data(socioData)
        .enter().append('circle')
        .attr('cx', d => scatterXScale(d.MedianHouseholdIncome))
        .attr('cy', d => scatterYScale(d[yAttribute]))
        .attr('r', 5)
        .attr('fill', '#4682B4')
        .attr('stroke', '#fff')
        .style('opacity', 0.7);

    scatterPlotSvg.append('g')
        .attr('transform', `translate(0, ${height - 100})`)
        .call(d3.axisBottom(scatterXScale).ticks(10));

    scatterPlotSvg.append('g')
        .call(d3.axisLeft(scatterYScale).ticks(5));
}

// Histogram
function updateHistogram(attribute) {
    d3.select('.histogram').remove();
    const histSvg = d3.select('body').append('svg')
        .attr('width', width)
        .attr('height', height / 2)
        .attr('class', 'histogram')
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    
    const xScale = d3.scaleLinear()
        .domain([0, d3.max(socioData, d => d[attribute])])
        .range([0, width - margin.left - margin.right]);
    
    const histogram = d3.histogram()
        .value(d => d[attribute])
        .domain(xScale.domain())
        .thresholds(xScale.ticks(20));

    const bins = histogram(socioData);
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(bins, d => d.length)])
        .range([height / 2 - margin.bottom, 0]);

    histSvg.selectAll('rect')
        .data(bins)
        .enter().append('rect')
        .attr('x', d => xScale(d.x0))
        .attr('y', d => yScale(d.length))
        .attr('width', d => xScale(d.x1) - xScale(d.x0) - 1)
        .attr('height', d => height / 2 - margin.bottom - yScale(d.length))
        .attr('fill', '#4682B4');

    histSvg.append('g')
        .attr('transform', `translate(0,${height / 2 - margin.bottom})`)
        .call(d3.axisBottom(xScale));
}

// Choropleth Map
function updateChoropleth(attribute) {
    d3.select('.choropleth').remove();
    Promise.all([
        d3.json('data/counties-10m.json'),
        d3.csv('data/national_health_data_2024.csv')
    ]).then(data => {
        const geoData = topojson.feature(data[0], data[0].objects.counties);
        const countyPopulationData = data[1];
        
        // Merge population data with county geometries
        geoData.features.forEach(d => {
            for (let i = 0; i < countyPopulationData.length; i++) {
                if (d.id === countyPopulationData[i].cnty_fips) {
                    d.properties[attribute] = +countyPopulationData[i][attribute];
                }
            }
        });

        const choroplethSvg = d3.select('body').append('svg')
            .attr('width', width)
            .attr('height', height / 2)
            .attr('class', 'choropleth');

        const colorScale = d3.scaleQuantize()
            .domain([0, d3.max(countyPopulationData, d => +d[attribute])])
            .range(d3.schemeBlues[9]);

        const path = d3.geoPath();

        choroplethSvg.selectAll('path')
            .data(topojson.feature(geoData, geoData.objects.counties).features)
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
}
