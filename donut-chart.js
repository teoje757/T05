// Donut Chart: Screen Technology Distribution (All Sizes)
function createDonutChart() {
    const container = d3.select("#donut-chart");
    container.selectAll("*").remove(); // Clear any existing content
    
    const containerRect = container.node().getBoundingClientRect();
    const width = containerRect.width;
    const height = 350;
    const margin = 40;
    const radius = Math.min(width, height) / 2 - margin;
    const innerRadius = radius * 0.5;
    
    const svg = container.append("svg")
        .attr("width", width)
        .attr("height", height);
    
    const g = svg.append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);
    
    // Create tooltip
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);
    
    // Load and process data
    d3.csv("Ex5_TV_energy_Allsizes_byScreenType.csv").then(function(data) {
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
        
        // Calculate total for percentages
        const total = d3.sum(data, d => d.consumption);
        data.forEach(d => {
            d.percentage = (d.consumption / total * 100);
        });
        
        // Set up color scale
        const colorScale = d3.scaleOrdinal()
            .domain(data.map(d => d.screenTech))
            .range(["#7dd3fc", "#a78bfa", "#fbbf24"]);
        
        // Create pie layout
        const pie = d3.pie()
            .value(d => d.consumption)
            .sort(null);
        
        // Create arc generator
        const arc = d3.arc()
            .innerRadius(innerRadius)
            .outerRadius(radius);
        
        const arcHover = d3.arc()
            .innerRadius(innerRadius)
            .outerRadius(radius + 10);
        
        // Create pie slices
        const arcs = g.selectAll(".arc")
            .data(pie(data))
            .enter().append("g")
            .attr("class", "arc");
        
        // Add paths
        arcs.append("path")
            .attr("d", arc)
            .style("fill", d => colorScale(d.data.screenTech))
            .style("stroke", "#fff")
            .style("stroke-width", 3)
            .style("filter", "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1))")
            .on("mouseover", function(event, d) {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("d", arcHover);
                
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(`
                    <strong>${d.data.screenTech}</strong><br/>
                    Average Consumption: ${d.data.consumption.toFixed(1)} kWh/year<br/>
                    Proportion: ${d.data.percentage.toFixed(1)}%
                `)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function(event, d) {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("d", arc);
                
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            })
            .transition()
            .duration(1000)
            .attrTween("d", function(d) {
                const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
                return function(t) {
                    return arc(interpolate(t));
                };
            });
        
        // Add percentage labels
        arcs.append("text")
            .attr("transform", function(d) {
                const centroid = arc.centroid(d);
                return `translate(${centroid})`;
            })
            .attr("text-anchor", "middle")
            .style("font-size", "14px")
            .style("font-weight", "bold")
            .style("fill", "#fff")
            .style("text-shadow", "1px 1px 2px rgba(0,0,0,0.7)")
            .text(d => `${d.data.percentage.toFixed(1)}%`)
            .style("opacity", 0)
            .transition()
            .duration(1000)
            .delay(800)
            .style("opacity", 1);
        
        // Add center text
        g.append("text")
            .attr("text-anchor", "middle")
            .attr("dy", "-0.5em")
            .style("font-size", "16px")
            .style("font-weight", "bold")
            .style("fill", "#333")
            .text("Screen Technology");
        
        g.append("text")
            .attr("text-anchor", "middle")
            .attr("dy", "1em")
            .style("font-size", "12px")
            .style("fill", "#666")
            .text("Energy Distribution");
        
        // Add legend
        const legendContainer = svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(20, 20)`);
        
        const legend = legendContainer.selectAll(".legend-item")
            .data(data)
            .enter().append("g")
            .attr("class", "legend-item")
            .attr("transform", (d, i) => `translate(0, ${i * 25})`);
        
        legend.append("rect")
            .attr("width", 15)
            .attr("height", 15)
            .style("fill", d => colorScale(d.screenTech));
        
        legend.append("text")
            .attr("x", 20)
            .attr("y", 7.5)
            .attr("dy", "0.35em")
            .style("font-size", "12px")
            .text(d => d.screenTech);
        
        legend.append("text")
            .attr("x", 20)
            .attr("y", 7.5)
            .attr("dy", "1.5em")
            .style("font-size", "10px")
            .style("fill", "#666")
            .text(d => `${d.consumption.toFixed(1)} kWh/yr`);
    });
}

// Initialize chart
createDonutChart();

// Redraw on window resize
window.addEventListener('resize', function() {
    setTimeout(createDonutChart, 100);
});