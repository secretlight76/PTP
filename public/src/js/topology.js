/**
 * topology.js - Visual Network Topology
 * Provides interactive network visualization with drag-and-drop
 */

class NetworkTopology {
    constructor(containerId, simulation) {
        this.container = document.getElementById(containerId);
        this.simulation = simulation;
        this.nodes = new Map(); // clock.id -> {x, y, element}
        this.links = [];
        this.svg = null;
        this.isDragging = false;
        this.draggedNode = null;
        this.init();
    }

    init() {
        // Create SVG container
        this.container.innerHTML = `
            <svg id="topology-svg" style="width: 100%; height: 500px; background-color: var(--bg-secondary); border-radius: 8px; border: 1px solid var(--border-color);">
                <defs>
                    <!-- Arrow markers for connections -->
                    <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                        <polygon points="0 0, 10 3, 0 6" fill="var(--color-primary)" />
                    </marker>
                    <marker id="arrowhead-master" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                        <polygon points="0 0, 10 3, 0 6" fill="var(--color-master)" />
                    </marker>
                </defs>
                <g id="links-layer"></g>
                <g id="nodes-layer"></g>
            </svg>
            <div id="topology-legend" style="margin-top: 10px; padding: 10px; background-color: var(--bg-tertiary); border-radius: 6px;">
                <div style="font-size: 12px; color: var(--text-secondary);">
                    <strong>Légende:</strong>
                    <span style="color: var(--color-master);">● GM/Master</span> |
                    <span style="color: var(--color-slave);">● Slave</span> |
                    <span style="color: var(--color-info);">● TC</span> |
                    Glisser-déposer pour réorganiser
                </div>
            </div>
        `;

        this.svg = document.getElementById('topology-svg');
        this.linksLayer = document.getElementById('links-layer');
        this.nodesLayer = document.getElementById('nodes-layer');
    }

    addClock(clock) {
        // Auto-layout: arrange in a circle or grid
        const index = this.nodes.size;
        const total = this.simulation.clocks.length;
        const centerX = this.svg.clientWidth / 2;
        const centerY = this.svg.clientHeight / 2;
        const radius = Math.min(centerX, centerY) * 0.6;

        let x, y;
        if (total <= 6) {
            // Circular layout for small networks
            const angle = (index * 2 * Math.PI) / Math.max(total, 1);
            x = centerX + radius * Math.cos(angle - Math.PI / 2);
            y = centerY + radius * Math.sin(angle - Math.PI / 2);
        } else {
            // Grid layout for larger networks
            const cols = Math.ceil(Math.sqrt(total));
            const row = Math.floor(index / cols);
            const col = index % cols;
            x = (this.svg.clientWidth / (cols + 1)) * (col + 1);
            y = (this.svg.clientHeight / (Math.ceil(total / cols) + 1)) * (row + 1);
        }

        const node = this.createNode(clock, x, y);
        this.nodes.set(clock.id, { x, y, element: node });
        this.nodesLayer.appendChild(node);
        this.updateLinks();
    }

    createNode(clock, x, y) {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('class', 'topology-node');
        g.setAttribute('data-clock-id', clock.id);
        g.setAttribute('transform', `translate(${x},${y})`);
        g.style.cursor = 'grab';

        const color = this.getNodeColor(clock);
        const size = clock.state === ClockState.MASTER ? 50 : 40;

        // Outer circle (glow for master)
        if (clock.state === ClockState.MASTER) {
            const glow = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            glow.setAttribute('r', size + 5);
            glow.setAttribute('fill', color);
            glow.setAttribute('opacity', '0.3');
            g.appendChild(glow);
        }

        // Main circle
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('r', size);
        circle.setAttribute('fill', color);
        circle.setAttribute('stroke', 'var(--bg-primary)');
        circle.setAttribute('stroke-width', '3');
        g.appendChild(circle);

        // Icon/Type indicator
        const icon = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        icon.setAttribute('text-anchor', 'middle');
        icon.setAttribute('y', '-5');
        icon.setAttribute('fill', 'white');
        icon.setAttribute('font-size', '20');
        icon.setAttribute('font-weight', 'bold');
        icon.textContent = this.getClockIcon(clock);
        g.appendChild(icon);

        // Label
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('y', size + 20);
        label.setAttribute('fill', 'var(--text-primary)');
        label.setAttribute('font-size', '12');
        label.setAttribute('font-weight', 'bold');
        label.textContent = clock.id;
        g.appendChild(label);

        // Version indicator
        const version = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        version.setAttribute('text-anchor', 'middle');
        version.setAttribute('y', size + 35);
        version.setAttribute('fill', 'var(--text-secondary)');
        version.setAttribute('font-size', '10');
        version.textContent = `PTPv${clock.version}`;
        g.appendChild(version);

        // Delete button (top-right corner)
        const deleteBtn = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        deleteBtn.setAttribute('class', 'delete-btn');
        deleteBtn.setAttribute('transform', `translate(${size - 10}, ${-size + 10})`);
        deleteBtn.style.cursor = 'pointer';
        deleteBtn.style.opacity = '0.7';

        const deleteBg = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        deleteBg.setAttribute('r', '12');
        deleteBg.setAttribute('fill', 'var(--color-error)');
        deleteBg.setAttribute('stroke', 'white');
        deleteBg.setAttribute('stroke-width', '2');
        deleteBtn.appendChild(deleteBg);

        const deleteIcon = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        deleteIcon.setAttribute('text-anchor', 'middle');
        deleteIcon.setAttribute('y', '4');
        deleteIcon.setAttribute('fill', 'white');
        deleteIcon.setAttribute('font-size', '14');
        deleteIcon.setAttribute('font-weight', 'bold');
        deleteIcon.textContent = '✕';
        deleteBtn.appendChild(deleteIcon);

        // Delete button click handler
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (window.uiManager) {
                window.uiManager.removeClock(clock.id);
            }
        });

        // Show/hide delete button on hover
        deleteBtn.addEventListener('mouseenter', () => {
            deleteBtn.style.opacity = '1';
            deleteBg.setAttribute('r', '14');
        });
        deleteBtn.addEventListener('mouseleave', () => {
            deleteBtn.style.opacity = '0.7';
            deleteBg.setAttribute('r', '12');
        });

        g.appendChild(deleteBtn);

        // Drag handlers
        this.addDragHandlers(g);

        return g;
    }

    getNodeColor(clock) {
        if (clock.state === ClockState.MASTER) return 'var(--color-master)';
        if (clock.state === ClockState.SLAVE) return 'var(--color-slave)';
        if (clock.type === ClockType.TRANSPARENT_CLOCK_P2P || clock.type === ClockType.TRANSPARENT_CLOCK_E2E) {
            return 'var(--color-info)';
        }
        if (clock.type === ClockType.BOUNDARY_CLOCK) return 'var(--color-passive)';
        return 'var(--text-tertiary)';
    }

    getClockIcon(clock) {
        if (clock.state === ClockState.MASTER) return '★';
        if (clock.type === ClockType.GRANDMASTER_GPS) return '🛰';
        if (clock.type === ClockType.GRANDMASTER_ATOMIC) return '⚛';
        if (clock.type === ClockType.BOUNDARY_CLOCK) return '◆';
        if (clock.type === ClockType.TRANSPARENT_CLOCK_P2P || clock.type === ClockType.TRANSPARENT_CLOCK_E2E) {
            return '▣';
        }
        return '○';
    }

    addDragHandlers(node) {
        const clockId = node.getAttribute('data-clock-id');
        let startX, startY, offsetX, offsetY;
        let hasMoved = false;
        let mouseDownX, mouseDownY;

        node.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.draggedNode = node;
            hasMoved = false;
            node.style.cursor = 'grabbing';

            // Store mouse down position to detect if it's a click or drag
            mouseDownX = e.clientX;
            mouseDownY = e.clientY;

            const transform = node.getAttribute('transform');
            const match = transform.match(/translate\(([-\d.]+),([-\d.]+)\)/);
            if (match) {
                startX = parseFloat(match[1]);
                startY = parseFloat(match[2]);
            }

            const rect = this.svg.getBoundingClientRect();
            offsetX = e.clientX - rect.left - startX;
            offsetY = e.clientY - rect.top - startY;

            e.preventDefault();
        });

        const onMouseMove = (e) => {
            if (!this.isDragging || this.draggedNode !== node) return;

            // Check if mouse has moved significantly (threshold: 5px)
            const dx = Math.abs(e.clientX - mouseDownX);
            const dy = Math.abs(e.clientY - mouseDownY);
            if (dx > 5 || dy > 5) {
                hasMoved = true;
            }

            const rect = this.svg.getBoundingClientRect();
            const newX = e.clientX - rect.left - offsetX;
            const newY = e.clientY - rect.top - offsetY;

            node.setAttribute('transform', `translate(${newX},${newY})`);

            const nodeData = this.nodes.get(clockId);
            if (nodeData) {
                nodeData.x = newX;
                nodeData.y = newY;
            }

            this.updateLinks();
        };

        const onMouseUp = () => {
            if (this.draggedNode === node) {
                // If didn't move, it's a click -> select the clock
                if (!hasMoved) {
                    this.selectClock(clockId);
                }

                this.isDragging = false;
                this.draggedNode = null;
                hasMoved = false;
                node.style.cursor = 'grab';
            }
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }

    selectClock(clockId) {
        // Find the clock in simulation
        const clock = this.simulation.clocks.find(c => c.id === clockId);
        if (!clock) return;

        // Call the UI manager's selectClock method
        // We need to access the uiManager through window
        if (window.uiManager) {
            window.uiManager.selectClock(clock);
        }
    }

    updateNode(clock) {
        const nodeData = this.nodes.get(clock.id);
        if (!nodeData) return;

        // Remove old node and create new one
        nodeData.element.remove();
        const newNode = this.createNode(clock, nodeData.x, nodeData.y);
        nodeData.element = newNode;
        this.nodesLayer.appendChild(newNode);
        this.updateLinks();
    }

    removeNode(clockId) {
        const nodeData = this.nodes.get(clockId);
        if (nodeData) {
            nodeData.element.remove();
            this.nodes.delete(clockId);
            this.updateLinks();
        }
    }

    updateLinks() {
        // Clear existing links
        this.linksLayer.innerHTML = '';
        this.links = [];

        // Draw links from slaves to their master
        this.simulation.clocks.forEach(clock => {
            if (clock.masterClock && clock.state === ClockState.SLAVE) {
                this.drawLink(clock.id, clock.masterClock.id, clock.version);
            }
        });
    }

    drawLink(fromId, toId, version) {
        const fromNode = this.nodes.get(fromId);
        const toNode = this.nodes.get(toId);

        if (!fromNode || !toNode) return;

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', fromNode.x);
        line.setAttribute('y1', fromNode.y);
        line.setAttribute('x2', toNode.x);
        line.setAttribute('y2', toNode.y);
        line.setAttribute('stroke', version === 1 ? 'var(--color-passive)' : 'var(--color-master)');
        line.setAttribute('stroke-width', '2');
        line.setAttribute('stroke-dasharray', version === 1 ? '5,5' : 'none');
        line.setAttribute('marker-end', 'url(#arrowhead-master)');
        line.setAttribute('opacity', '0.6');

        this.linksLayer.appendChild(line);
        this.links.push({ from: fromId, to: toId, element: line });
    }

    clear() {
        this.nodes.clear();
        this.links = [];
        this.linksLayer.innerHTML = '';
        this.nodesLayer.innerHTML = '';
    }

    // Animate a message flowing from one node to another
    animateMessage(fromId, toId, messageType, duration = 1000) {
        const fromNode = this.nodes.get(fromId);
        const toNode = this.nodes.get(toId);

        if (!fromNode || !toNode) return;

        // Create animated circle
        const message = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        message.setAttribute('r', '6');
        message.setAttribute('fill', this.getMessageColor(messageType));
        message.setAttribute('cx', fromNode.x);
        message.setAttribute('cy', fromNode.y);

        // Add label
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', fromNode.x);
        label.setAttribute('y', fromNode.y - 10);
        label.setAttribute('fill', 'var(--text-primary)');
        label.setAttribute('font-size', '10');
        label.setAttribute('font-weight', 'bold');
        label.textContent = messageType;

        this.svg.appendChild(message);
        this.svg.appendChild(label);

        // Animate
        const startTime = Date.now();
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            const x = fromNode.x + (toNode.x - fromNode.x) * progress;
            const y = fromNode.y + (toNode.y - fromNode.y) * progress;

            message.setAttribute('cx', x);
            message.setAttribute('cy', y);
            label.setAttribute('x', x);
            label.setAttribute('y', y - 10);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                setTimeout(() => {
                    message.remove();
                    label.remove();
                }, 200);
            }
        };

        requestAnimationFrame(animate);
    }

    getMessageColor(messageType) {
        const colors = {
            'ANNOUNCE': 'var(--color-warning)',
            'SYNC': 'var(--color-success)',
            'DELAY_REQ': 'var(--color-info)',
            'DELAY_RESP': 'var(--color-primary)'
        };
        return colors[messageType] || 'var(--color-slave)';
    }
}

// Export for browser use
if (typeof window !== 'undefined') {
    window.NetworkTopology = NetworkTopology;
}
