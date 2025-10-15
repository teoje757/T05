// Bar Chart: Energy Consumption by Screen Technology (55" TVs)
function createBarChart() {
    const container = d3.select("#bar-chart");
    container.selectAll("*").remove(); // Clear any existing content
    
    const margin = { top: 20, right: 30, bottom: 80, left: 80 };
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
    d3.csv("Ex5_TV_energy_55inchtv_byScreenType.csv").then(function(data) {
        // Process data
        data = data.map(d => ({
            screenTech: d.Screen_Tech,
            consumption: +d["Mean(Labelled energy consumption (kWh/year))"]
        }));
        
        // Clean up screen technology names for display
        data.forEach(d => {
            if (d.screenTech === "LED") {
                d.screenTech = "LCD (LED)";
            }
        });
        
        // Set up scales
        const xScale = d3.scaleBand()
            .domain(data.map(d => d.screenTech))
            .range([0, width])
            .padding(0.3);
        
        const yScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.consumption)])
            .range([height, 0])
            .nice();
        
        // Color scale
        const colorScale = d3.scaleOrdinal()
            .domain(data.map(d => d.screenTech))
            .range(["#7dd3fc", "#a78bfa", "#fbbf24"]);
        
        // Add axes
        g.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(xScale))
            .selectAll("text")
            .style("text-anchor", "middle");
        
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
            .text("Average Energy Consumption (kWh/year)");
        
        g.append("text")
            .attr("class", "axis-title")
            .attr("transform", `translate(${width / 2}, ${height + margin.bottom - 10})`)
            .style("text-anchor", "middle")
            .text("Screen Technology");
        
        // Add bars
        g.selectAll(".bar")
            .data(data)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", d => xScale(d.screenTech))
            .attr("width", xScale.bandwidth())
            .attr("y", height)
            .attr("height", 0)
            .style("fill", d => colorScale(d.screenTech))
            .on("mouseover", function(event, d) {
                d3.select(this)
                    .style("opacity", 0.9)
                    .style("stroke", "rgba(255, 255, 255, 0.8)")
                    .style("stroke-width", 3);
                
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(`
                    <strong>${d.screenTech}</strong><br/>
                    Average Consumption: ${d.consumption.toFixed(1)} kWh/year<br/>
                    (55-inch TVs only)
                `)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function() {
                d3.select(this)
                    .style("opacity", 1)
                    .style("stroke", "none");
                
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            })
            .transition()
            .duration(1000)
            .delay((d, i) => i * 200)
            .attr("y", d => yScale(d.consumption))
            .attr("height", d => height - yScale(d.consumption));
        
        // Add value labels on bars
        g.selectAll(".bar-label")
            .data(data)
            .enter().append("text")
            .attr("class", "bar-label")
            .attr("x", d => xScale(d.screenTech) + xScale.bandwidth() / 2)
            .attr("y", height)
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .style("font-weight", "bold")
            .style("fill", "#333")
            .text(d => d.consumption.toFixed(1))
            .transition()
            .duration(1000)
            .delay((d, i) => i * 200 + 800)
            .attr("y", d => yScale(d.consumption) - 5);
    });
}

// Initialize chart
createBarChart();

// Redraw on window resize
window.addEventListener('resize', function() {
    setTimeout(createBarChart, 100);
});