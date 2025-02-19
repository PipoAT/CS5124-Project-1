const width = 800;
const height = 600;

// Set up the color scale for choropleth map
const colorScale = d3.scaleSequential(d3.interpolateBlues).domain([0, 100]);

// Load data for the bar charts
d3.csv('data/national_health_data_2024.csv').then(socioData => {

    // Ensure the data is properly parsed (especially numeric data)
    socioData.forEach(d => {
        d.PovertyRate = +d.PovertyRate;
        d.UnemploymentRate = +d.UnemploymentRate;
    });

    // Create the histogram for the poverty rate
    const histogramSvg = d3.select('body').append('svg')
        .attr('width', width)
        .attr('height', 300)
        .attr('class', 'histogram');

    const xScale = d3.scaleLinear().domain([0, 100]).range([0, width - 40]);
    const yScale = d3.scaleLinear().range([300, 0]);

    const histogram = d3.histogram()
        .domain(xScale.domain())
        .thresholds(xScale.ticks(20))
        .value(d => d.PovertyRate);

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
        .attr('stroke', '#fff');

    histogramSvg.append('g')
        .attr('transform', 'translate(0, 300)')
        .call(d3.axisBottom(xScale));

    histogramSvg.append('g')
        .call(d3.axisLeft(yScale));

    histogramSvg.append('text')
        .attr('x', width / 2)
        .attr('y', 20)
        .attr('text-anchor', 'middle')
        .attr('font-size', '16px')
        .text('Poverty Rate Distribution');

    // Create a scatterplot for poverty vs unemployment
    const scatterPlotSvg = d3.select('body').append('svg')
        .attr('width', width)
        .attr('height', 300)
        .attr('class', 'scatterplot')
        .attr('transform', 'translate(0, 350)');  // Move below histogram

    const scatterXScale = d3.scaleLinear().domain([0, 100]).range([0, width - 40]);
    const scatterYScale = d3.scaleLinear().domain([0, 100]).range([300, 0]);

    scatterPlotSvg.append('g')
        .selectAll('circle')
        .data(socioData)
        .enter().append('circle')
        .attr('cx', d => scatterXScale(d.PovertyRate))
        .attr('cy', d => scatterYScale(d.UnemploymentRate))
        .attr('r', 5)
        .attr('fill', '#4682B4')
        .attr('stroke', '#fff');

    scatterPlotSvg.append('g')
        .attr('transform', 'translate(0, 300)')
        .call(d3.axisBottom(scatterXScale));

    scatterPlotSvg.append('g')
        .call(d3.axisLeft(scatterYScale));

    scatterPlotSvg.append('text')
        .attr('x', width / 2)
        .attr('y', 20)
        .attr('text-anchor', 'middle')
        .attr('font-size', '16px')
        .text('Poverty vs Unemployment Rate');

    // Add dropdown to select graph type
    const graphTypeSelect = d3.select('body').append('select')
        .attr('id', 'graphType')
        .on('change', updateGraph);

    graphTypeSelect.append('option').attr('value', 'histogram').text('Poverty Rate Histogram');
    graphTypeSelect.append('option').attr('value', 'scatterplot').text('Poverty vs Unemployment');

    function updateGraph() {
        const selectedGraph = d3.select('#graphType').property('value');
        if (selectedGraph === 'histogram') {
            histogramSvg.style('display', 'block');
            scatterPlotSvg.style('display', 'none');
        } else if (selectedGraph === 'scatterplot') {
            histogramSvg.style('display', 'none');
            scatterPlotSvg.style('display', 'block');
        }
    }

    // Set initial display
    updateGraph();
});
