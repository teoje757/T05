// Line Chart: Spot Power Prices Over Time
function createLineChart() {
    const container = d3.select("#line-chart");
    container.selectAll("*").remove(); // Clear any existing content
    
    const margin = { top: 20, right: 120, bottom: 60, left: 80 };
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
    d3.csv("Ex5_ARE_Spot_Prices.csv").then(function(data) {
        // Convert data
        data = data.map(d => ({
            year: +d.Year,
            queensland: +d["Queensland ($ per megawatt hour)"],
            nsw: +d["New South Wales ($ per megawatt hour)"],
            victoria: +d["Victoria ($ per megawatt hour)"],
            sa: +d["South Australia ($ per megawatt hour)"],
            average: +d["Average Price (notTas-Snowy)"]
        }));
        
        // Set up scales
        const xScale = d3.scaleLinear()
            .domain(d3.extent(data, d => d.year))
            .range([0, width]);
        
        const yScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => Math.max(d.queensland, d.nsw, d.victoria, d.sa, d.average))])
            .range([height, 0])
            .nice();
        
        // Define line generator
        const line = d3.line()
            .x(d => xScale(d.year))
            .curve(d3.curveMonotoneX);
        
        // Add axes
        g.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));
        
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
            .text("Price ($ per MWh)");
        
        g.append("text")
            .attr("class", "axis-title")
            .attr("transform", `translate(${width / 2}, ${height + margin.bottom - 10})`)
            .style("text-anchor", "middle")
            .text("Year");
        
        // Define line data and colors
        const lines = [
            { name: "Queensland", data: data, getValue: d => d.queensland, color: "#ff6b6b", class: "line-qld" },
            { name: "NSW", data: data, getValue: d => d.nsw, color: "#4ecdc4", class: "line-nsw" },
            { name: "Victoria", data: data, getValue: d => d.victoria, color: "#45b7d1", class: "line-vic" },
            { name: "South Australia", data: data, getValue: d => d.sa, color: "#f9ca24", class: "line-sa" },
            { name: "Average", data: data, getValue: d => d.average, color: "#333", class: "line-avg" }
        ];
        
        // Add lines
        lines.forEach(lineData => {
            g.append("path")
                .datum(lineData.data)
                .attr("class", `line ${lineData.class}`)
                .attr("d", line.y(d => yScale(lineData.getValue(d))))
                .style("stroke", lineData.color)
                .style("stroke-width", lineData.name === "Average" ? 3 : 2)
                .style("fill", "none");
            
            // Add dots for interaction
            g.selectAll(`.dot-${lineData.class}`)
                .data(lineData.data.filter(d => lineData.getValue(d) > 0))
                .enter().append("circle")
                .attr("class", `dot-${lineData.class}`)
                .attr("cx", d => xScale(d.year))
                .attr("cy", d => yScale(lineData.getValue(d)))
                .attr("r", 3)
                .style("fill", lineData.color)
                .style("stroke", "#fff")
                .style("stroke-width", 2)
                .style("opacity", 0.8)
                .on("mouseover", function(event, d) {
                    d3.select(this).attr("r", 5);
                    
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", .9);
                    tooltip.html(`
                        <strong>${lineData.name}</strong><br/>
                        Year: ${d.year}<br/>
                        Price: $${lineData.getValue(d).toFixed(2)} per MWh
                    `)
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 28) + "px");
                })
                .on("mouseout", function() {
                    d3.select(this).attr("r", 3);
                    
                    tooltip.transition()
                        .duration(500)
                        .style("opacity", 0);
                });
        });
        
        // Add legend
        const legend = g.selectAll(".legend")
            .data(lines)
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", (d, i) => `translate(${width + 10}, ${i * 20 + 20})`);
        
        legend.append("line")
            .attr("x1", 0)
            .attr("x2", 15)
            .attr("y1", 0)
            .attr("y2", 0)
            .style("stroke", d => d.color)
            .style("stroke-width", d => d.name === "Average" ? 3 : 2);
        
        legend.append("text")
            .attr("x", 20)
            .attr("dy", "0.35em")
            .style("font-size", "12px")
            .text(d => d.name);
    });
}

// Initialize chart
createLineChart();

// Redraw on window resize
window.addEventListener('resize', function() {
    setTimeout(createLineChart, 100);
});