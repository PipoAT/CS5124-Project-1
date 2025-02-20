const width = 800;
const height = 600;
const margin = { top: 40, right: 20, bottom: 50, left: 75 }; // Add margins

// Set up the color scale for choropleth map
const colorScale = d3.scaleSequential(d3.interpolateBlues).domain([0, 100]);

// Load data for the bar charts
d3.csv('data/national_health_data_2024.csv').then(socioData => {

    // Ensure the data is properly parsed (especially numeric data)
    socioData.forEach(d => {
        d.MedianHouseholdIncome = +d.median_household_income;
        d.EducationLessThanHighSchoolPercent = +d.education_less_than_high_school_percent;
        d.poverty_percent = +d.poverty_perc;
    });

    // Create the histogram for Median Household Income
    const histogramSvg = d3.select('body').append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', 350 + margin.top + margin.bottom)
        .attr('class', 'histogram')
        .style('margin-bottom', '30px')
        .style('display', 'inline-block')
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleLinear().domain([0, d3.max(socioData, d => d.MedianHouseholdIncome)]).range([0, width - 40]);
    const yScale = d3.scaleLinear().range([300, 0]);

    const histogram = d3.histogram()
        .domain(xScale.domain())
        .thresholds(xScale.ticks(20))
        .value(d => d.MedianHouseholdIncome);

    const bins = histogram(socioData);

    yScale.domain([0, d3.max(bins, d => d.length)]);

    histogramSvg.append('g')
        .selectAll('rect')
        .data(bins)
        .enter().append('rect')
        .attr('x', d => xScale(d.x0) + 10)
        .attr('y', d => yScale(d.length))
        .attr('width', d => xScale(d.x1) - xScale(d.x0) - 10)
        .attr('height', d => 300 - yScale(d.length))
        .attr('fill', '#4682B4')
        .attr('stroke', '#fff')
        .attr('rx', 5)
        .attr('ry', 5);

    // Add bottom axis (x-axis)
    histogramSvg.append('g')
        .attr('transform', 'translate(0, 300)')
        .call(d3.axisBottom(xScale).ticks(10))  // Adjust the number of ticks for better readability
        .attr('class', 'axis')
        .style('font-size', '14px');

    // Add left axis (y-axis)
    histogramSvg.append('g')
        .call(d3.axisLeft(yScale).ticks(5))  // Adjust the number of ticks for better readability
        .attr('class', 'axis')
        .style('font-size', '14px');

    // Title and axis labels for histogram
    histogramSvg.append('text')
        .attr('x', width / 2)
        .attr('y', -10)
        .attr('text-anchor', 'middle')
        .attr('font-size', '18px')
        .attr('font-weight', 'bold')
        .text('Median Household Income Distribution');

    histogramSvg.append('text')
        .attr('x', width / 2)
        .attr('y', 340)
        .attr('text-anchor', 'middle')
        .attr('font-size', '16px')
        .text('Median Household Income ($)');

    histogramSvg.append('text')
        .attr('x', -150)
        .attr('y', -40)
        .attr('transform', 'rotate(-90)')
        .attr('text-anchor', 'middle')
        .attr('font-size', '16px')
        .text('Frequency');

    // Create a scatterplot for Median Household Income vs Education Less Than High School Percent
    const scatterPlotSvg = d3.select('body').append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', 350 + margin.top + margin.bottom)
        .attr('class', 'scatterplot')
        .style('display', 'inline-block')
        .style('margin-bottom', '30px')  // Move below histogram
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const scatterXScale = d3.scaleLinear().domain([0, d3.max(socioData, d => d.MedianHouseholdIncome)]).range([0, width - 40]);
    const scatterYScale = d3.scaleLinear().domain([0, 100]).range([300, 0]); // Percentage scale for education

    scatterPlotSvg.append('g')
        .selectAll('circle')
        .data(socioData)
        .enter().append('circle')
        .attr('cx', d => scatterXScale(d.MedianHouseholdIncome))
        .attr('cy', d => scatterYScale(d.EducationLessThanHighSchoolPercent))
        .attr('r', 5)
        .attr('fill', '#4682B4')
        .attr('stroke', '#fff')
        .style('opacity', 0.7)
        .append('title')  // Add tooltip on hover
        .text(d => `Income: $${d.MedianHouseholdIncome} | Education < High School: ${d.EducationLessThanHighSchoolPercent}%`);

    // Add bottom axis (x-axis) for scatter plot
    scatterPlotSvg.append('g')
        .attr('transform', 'translate(0, 300)')
        .call(d3.axisBottom(scatterXScale).ticks(10))  // Adjust the number of ticks for better readability
        .attr('class', 'axis')
        .style('font-size', '14px');

    // Add left axis (y-axis) for scatter plot
    scatterPlotSvg.append('g')
        .call(d3.axisLeft(scatterYScale).ticks(5))  // Adjust the number of ticks for better readability
        .attr('class', 'axis')
        .style('font-size', '14px');

    // Title and axis labels for scatter plot
    scatterPlotSvg.append('text')
        .attr('x', width / 2)
        .attr('y', -10)
        .attr('text-anchor', 'middle')
        .attr('font-size', '18px')
        .attr('font-weight', 'bold')
        .text('Income vs Education Level');

    scatterPlotSvg.append('text')
        .attr('x', width / 2)
        .attr('y', 340)
        .attr('text-anchor', 'middle')
        .attr('font-size', '16px')
        .text('Median Household Income ($)');

    scatterPlotSvg.append('text')
        .attr('x', -150)
        .attr('y', -40)
        .attr('transform', 'rotate(-90)')
        .attr('text-anchor', 'middle')
        .attr('font-size', '16px')
        .text('Education < High School (%)');
});

// Set up the color scales
const incomeColorScale = d3.scaleSequential(d3.interpolateBlues).domain([0, 100000]);
const povertyColorScale = d3.scaleSequential(d3.interpolateReds).domain([0, 100]);

// Data toggling: By default, display income data
let currentAttribute = 'Median_HH_Inc_ACS';  // Default attribute to display

// Load the data and the map
Promise.all([
    d3.json("https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json"),
    d3.csv('data/Income.csv')
]).then(([usData, socioData]) => {

    // Parse the socioData
    socioData.forEach(d => {
        d.MedianHouseholdIncome = +d.Median_HH_Inc_ACS;
        d.PovertyRate = +d.Poverty_Rate_ACS;
        // Add other attributes as necessary
    });

    // Function to draw the choropleth map
    function drawChoropleth(mapId, attribute) {
        const svg = d3.select(`#${mapId}`).append('svg')
            .attr('width', '100%')
            .attr('height', '100%');

        const projection = d3.geoAlbersUsa().scale(1000).translate([400, 300]);
        const path = d3.geoPath().projection(projection);

        // Set up the color scale based on the attribute
        const colorScale = attribute === 'Median_HH_Inc_ACS' ? incomeColorScale : povertyColorScale;

        // Prepare data for the map
        const countyData = topojson.feature(usData, usData.objects.counties).features;

        // Join the socioData to the map
        countyData.forEach(county => {
            const data = socioData.find(d => d.County === county.properties.name && d.State === county.properties.state);
            if (!county.properties.name || !county.properties.state) {
                return;
            }
            if (data) {
                county.value = data[attribute];
            } else {
                county.value = 0;
            }
        });

        // Draw the counties with color scale
        svg.selectAll('path')
            .data(countyData)
            .enter().append('path')
            .attr('d', path)
            .attr('fill', d => colorScale(d.value))
            .attr('stroke', '#fff')
            .attr('stroke-width', 0.5);

                const data = socioData.find(x => x.County === d.properties.name && x.State === d.properties.state);
                if (!d.properties.name || !d.properties.state) {
                    return;
                }
        svg.selectAll('path')
            .on('mouseover', function(event, d) {
                const data = socioData.find(x => x.County === d.properties.name && x.State === d.properties.state);
                const tooltip = d3.select('#tooltip');
                tooltip.style('visibility', 'visible')
                    .html(`County: ${d.properties.name}<br>Value: ${data ? data[attribute] : 'No Data'}`);
            })
            .on('mouseout', function() {
                d3.select('#tooltip').style('visibility', 'hidden');
            });
    }

    // Draw the two maps with default attributes
    drawChoropleth('map1', currentAttribute);
    drawChoropleth('map2', currentAttribute);

    // Toggle button function to change attributes
    window.toggleAttribute = function() {
        currentAttribute = currentAttribute === 'Median_HH_Inc_ACS' ? 'Poverty_Rate_ACS' : 'Median_HH_Inc_ACS';
        d3.select('#map1').html('');
        d3.select('#map2').html('');
        drawChoropleth('map1', currentAttribute);
        drawChoropleth('map2', currentAttribute);
    };
});

