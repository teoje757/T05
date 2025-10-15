// Scatter Plot: Energy Consumption vs Star Rating
function createScatterPlot() {
    const container = d3.select("#scatter-chart");
    container.selectAll("*").remove(); // Clear any existing content
    
    const margin = { top: 20, right: 80, bottom: 60, left: 80 };
    const containerRect = container.node().getBoundingClientRect();
    const width = containerRect.width - margin.left - margin.right;
    const height = 350 - margin.top - margin.bottom;
    
    const svg = container.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);
    
    const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Create tooltip
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);
    
    // Load and process data
    d3.csv("Ex5_TV_energy.csv").then(function(data) {
        // Convert strings to numbers and filter out invalid data
        data = data.map(d => ({
            brand: d.brand,
            screenTech: d.screen_tech,
            screenSize: +d.screensize,
            energyConsumption: +d.energy_consumpt,
            starRating: +d.star2,
            count: +d.count
        })).filter(d => d.energyConsumption > 0 && d.starRating > 0);
        
        // Set up scales
        const xScale = d3.scaleLinear()
            .domain(d3.extent(data, d => d.starRating))
            .range([0, width])
            .nice();
        
        const yScale = d3.scaleLinear()
            .domain(d3.extent(data, d => d.energyConsumption))
            .range([height, 0])
            .nice();
        
        const colorScale = d3.scaleOrdinal()
            .domain([...new Set(data.map(d => d.screenTech))])
            .range(["#ff8a8a", "#7dd3fc", "#a78bfa", "#fbbf24", "#34d399"]);
        
        const radiusScale = d3.scaleSqrt()
            .domain(d3.extent(data, d => d.screenSize))
            .range([3, 12]);
        
        // Add axes
        g.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(xScale));
        
        g.append("g")
            .attr("class", "axis")
            .call(d3.axisLeft(yScale));
        
        // Add axis labels
        g.append("text")
            .attr("class", "axis-title")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Energy Consumption (kWh/year)");
        
        g.append("text")
            .attr("class", "axis-title")
            .attr("transform", `translate(${width / 2}, ${height + margin.bottom - 10})`)
            .style("text-anchor", "middle")
            .text("Star Rating");
        
        // Add dots
        g.selectAll(".dot")
            .data(data)
            .enter().append("circle")
            .attr("class", "dot")
            .attr("cx", d => xScale(d.starRating))
            .attr("cy", d => yScale(d.energyConsumption))
            .attr("r", d => radiusScale(d.screenSize))
            .style("fill", d => colorScale(d.screenTech))
            .style("opacity", 0.8)
            .style("stroke", "rgba(255, 255, 255, 0.8)")
            .style("stroke-width", 2)
            .on("mouseover", function(event, d) {
                d3.select(this)
                    .style("opacity", 1)
                    .attr("r", d => radiusScale(d.screenSize) + 2);
                
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(`
                    <strong>${d.brand}</strong><br/>
                    Screen: ${d.screenTech}<br/>
                    Size: ${d.screenSize}"<br/>
                    Energy: ${d.energyConsumption} kWh/year<br/>
                    Star Rating: ${d.starRating}
                `)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function(event, d) {
                d3.select(this)
                    .style("opacity", 0.8)
                    .attr("r", d => radiusScale(d.screenSize));
                
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });
        
        // Add legend
        const legend = g.selectAll(".legend")
            .data(colorScale.domain())
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", (d, i) => `translate(${width + 10}, ${i * 20 + 20})`);
        
        legend.append("circle")
            .attr("r", 6)
            .style("fill", colorScale);
        
        legend.append("text")
            .attr("x", 12)
            .attr("dy", "0.35em")
            .style("font-size", "12px")
            .text(d => d);
    });
}

// Initialize chart
createScatterPlot();

// Redraw on window resize
window.addEventListener('resize', function() {
    setTimeout(createScatterPlot, 100);
});