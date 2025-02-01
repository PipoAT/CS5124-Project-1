async function drawChart() {
    const jobsData = await d3.csv('data/jobs.csv');
    const peopleData = await d3.csv('data/People.csv');

    console.log("Jobs Data:", jobsData);
    console.log("People Data:", peopleData);

    // Convert to numeric values and validate
    jobsData.forEach(d => { 
        d.NumUnemployed2020 = +d.NumUnemployed2020;
        if (isNaN(d.NumUnemployed2020)) {
            console.warn("Invalid NumUnemployed2020:", d);
        }
    });

    peopleData.forEach(d => {
        d.AsianNonHispanicNum2020 = +d.AsianNonHispanicNum2020;
        d.WhiteNonHispanicNum2020 = +d.WhiteNonHispanicNum2020;
        d.BlackNonHispanicNum2020 = +d.BlackNonHispanicNum2020;
    });

    const margin = { top: 20, right: 30, bottom: 50, left: 70 },
        width = 800 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    const svg = d3.select("body")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const xMax = d3.max(jobsData, d => isNaN(d.NumUnemployed2020) ? 0 : d.NumUnemployed2020) || 1;
    const x = d3.scaleLinear()
        .domain([0, xMax * 1.1])
        .range([0, width]);

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

    const yMax = d3.max(peopleData, d => 
        Math.max(d.AsianNonHispanicNum2020, d.WhiteNonHispanicNum2020, d.BlackNonHispanicNum2020)
    ) || 1;
    const y = d3.scaleLinear()
        .domain([0, yMax * 1.1])
        .range([height, 0]);

    svg.append("g").call(d3.axisLeft(y));

    function jitter(value, range = 5) {
        return value + (Math.random() * range - range / 2);
    }

    function plotPoints(className, color, dataKey) {
        svg.selectAll(`circle.${className}`)
            .data(jobsData)
            .enter()
            .append("circle")
            .attr("class", className)
            .attr("cx", d => {
                if (isNaN(d.NumUnemployed2020)) {
                    console.error("Invalid cx value for:", d);
                    return 0; // Place invalid data at the left-most point
                }
                return jitter(x(d.NumUnemployed2020), 10);
            })
            .attr("cy", d => {
                const p = peopleData.find(p => p.id === d.id);
                return p ? y(p[dataKey]) : y(0);
            })
            .attr("r", 5)
            .style("fill", color);
    }

    plotPoints("asian", "#69b3a2", "AsianNonHispanicNum2020");
    plotPoints("white", "blue", "WhiteNonHispanicNum2020");
    plotPoints("black", "red", "BlackNonHispanicNum2020");
}

drawChart();
