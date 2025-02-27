class ChoroplethMap {
  /**
   * Class constructor with basic configuration
   * @param {Object} _config - Configuration options
   * @param {Array} _data - Data for the map
   */
  constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 1000,
      containerHeight: _config.containerHeight || 500,
      margin: _config.margin || { top: 10, right: 10, bottom: 10, left: 10 },
      tooltipPadding: 10,
      legendBottom: 50,
      legendLeft: 50,
      legendRectHeight: 12,
      legendRectWidth: 150,
    };
    
    this.data = _data;
    this.us = _data;
    this.active = d3.select(null);

    this.initVis();
  }

  /**
   * Initialize visualization, scales, and axes
   */
  initVis() {
    let vis = this;

    // Calculate inner chart size
    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    // Create SVG container
    vis.svg = d3.select(vis.config.parentElement)
      .append('svg')
      .attr('width', vis.config.containerWidth)
      .attr('height', vis.config.containerHeight);

    // Append background rectangle (fixed dimensions)
    vis.svg.append('rect')
      .attr('class', 'background')
      .attr('width', vis.config.containerWidth)
      .attr('height', vis.config.containerHeight)
      .on('click', () => vis.reset());

    // Define projection and path generator
    vis.projection = d3.geoAlbersUsa()
      .translate([vis.width / 2, vis.height / 2])
      .scale(1000); // Adjusted scale for better visibility

    vis.path = d3.geoPath().projection(vis.projection);

    // Ensure pop property exists before creating the color scale
    let popValues = vis.data.objects.counties.geometries.map(d => d.properties.pop || 0);
    vis.colorScale = d3.scaleLinear()
      .domain(d3.extent(popValues))
      .range(['#cfe2f2', '#0d306b'])
      .interpolate(d3.interpolateHcl);

    // Append main group element
    vis.g = vis.svg.append("g")
      .attr("transform", `translate(${vis.config.margin.left}, ${vis.config.margin.top})`);

    // Create tooltip element
    vis.tooltip = d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('padding', '10px')
      .style('background', 'white')
      .style('border', '1px solid #ccc')
      .style('border-radius', '4px')
      .style('pointer-events', 'none')
      .style('opacity', 0);

    console.log("DATA", vis.data);

    // Draw counties
    vis.counties = vis.g.append("g")
      .attr("id", "counties")
      .selectAll("path")
      .data(topojson.feature(vis.us, vis.us.objects.counties).features)
      .enter().append("path")
      .attr("d", vis.path)
      .attr("fill", d => vis.colorScale(d.properties.income || 0)) // Use income data for color scale
      .on('mouseover', (event, d) => {
      vis.tooltip.transition().duration(200).style('opacity', 1);
      vis.tooltip.html(`
        County: ${d.properties.name || 'N/A'}<br>
        Median Household Income: $${d.properties.income || 'N/A'}<br>
        Poverty: ${d.properties.poverty || 'N/A'}<br>
        Education Level: ${d.properties.education || 'N/A'}
      `)
        .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')
        .style('top', (event.pageY + vis.config.tooltipPadding) + 'px');
      })
      .on('mouseout', () => {
      vis.tooltip.transition().duration(200).style('opacity', 0);
      });

    // Draw state borders
    vis.g.append("path")
      .datum(topojson.mesh(vis.us, vis.us.objects.states, (a, b) => a !== b))
      .attr("id", "state-borders")
      .attr("d", vis.path);

    // Debugging logs
    console.log('Choropleth Map Initialized');
    console.log('Data:', vis.us);
  }

  /**
   * Reset zoom when background is clicked
   */
  reset() {
    this.active.classed("active", false);
    this.active = d3.select(null);
    this.g.transition().duration(750).attr("transform", "");
  }
}
