import heapq
import time
import matplotlib.pyplot as plt

# Graph creation based on problem conditions
def create_graph(N):
    graph = {i: {} for i in range(1, N + 1)}
    for i in range(1, N + 1):
        for j in range(1, N + 1):
            if i != j and abs(i - j) <= 3:
                graph[i][j] = i + j  # Weight formula
    return graph

# Dijkstra's Algorithm
def dijkstra(graph, start, end):
    pq = []  # Min-heap
    heapq.heappush(pq, (0, start))  # (distance, node)
    distances = {node: float('inf') for node in graph}
    distances[start] = 0
    repetitions = 0

    while pq:
        current_distance, current_node = heapq.heappop(pq)
        repetitions += 1
        if current_node == end:
            break
        for neighbor, weight in graph[current_node].items():
            new_distance = current_distance + weight
            if new_distance < distances[neighbor]:
                distances[neighbor] = new_distance
                heapq.heappush(pq, (new_distance, neighbor))

    return distances[end], repetitions

# A* Algorithm
def a_star(graph, start, end, heuristic):
    pq = []
    heapq.heappush(pq, (0 + heuristic(start, end), start))  # (f_score, node)
    distances = {node: float('inf') for node in graph}
    distances[start] = 0
    repetitions = 0

    while pq:
        _, current_node = heapq.heappop(pq)
        repetitions += 1
        if current_node == end:
            break
        for neighbor, weight in graph[current_node].items():
            new_distance = distances[current_node] + weight
            if new_distance < distances[neighbor]:
                distances[neighbor] = new_distance
                f_score = new_distance + heuristic(neighbor, end)
                heapq.heappush(pq, (f_score, neighbor))

    return distances[end], repetitions

# Heuristic function
def heuristic(i, j):
    return abs(j - i)

# Run experiments and compare results
def run_experiments():
    ns = [10, 50, 100, 200, 500, 1000, 2000]
    dijkstra_times = []
    a_star_times = []

    for n in ns:
        graph = create_graph(n)
        start, end = 1, n

        # Measure Dijkstra's
        start_time = time.time()
        _, d_reps = dijkstra(graph, start, end)
        dijkstra_times.append(d_reps)

        # Measure A*
        start_time = time.time()
        _, a_reps = a_star(graph, start, end, heuristic)
        a_star_times.append(a_reps)

    # Plot results
    plt.figure(figsize=(10, 6))
    plt.plot(ns, dijkstra_times, label="Dijkstra's", marker='o')
    plt.plot(ns, a_star_times, label="A*", marker='o')
    plt.xlabel('Number of Nodes (N)')
    plt.ylabel('Number of Repetitions')
    plt.title('Comparison of Running Times')
    plt.legend()
    plt.grid()
    plt.show()

# Run the experiments
run_experiments()
