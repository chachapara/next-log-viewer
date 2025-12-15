"use client";
import { useEffect, useState } from "react";

const styles = {
  container: {
    minHeight: "100vh",
    width: "100%",
    backgroundColor: "#f3f4f6",
    padding: "24px",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  filterContainer: {
    display: "flex",
    gap: "12px",
    marginBottom: "16px",
    flexWrap: "wrap",
  },
  button: {
    padding: "8px 16px",
    borderRadius: "8px",
    fontWeight: "500",
    border: "2px solid",
    cursor: "pointer",
    fontSize: "14px",
    transition: "all 0.2s",
  },
  buttonActive: {
    backgroundColor: "#2563eb",
    color: "white",
    borderColor: "#2563eb",
  },
  buttonInactive: {
    backgroundColor: "white",
    color: "#1f2937",
    borderColor: "#d1d5db",
  },
  logsContainer: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "16px",
    height: "calc(100vh - 180px)",
    overflowY: "auto",
    border: "1px solid #e5e7eb",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  logItem: {
    padding: "12px",
    marginBottom: "12px",
    borderRadius: "8px",
    border: "1px solid",
    fontSize: "14px",
    lineHeight: "1.5",
  },
  logInfo: {
    backgroundColor: "#f0f9ff",
    borderColor: "#93c5fd",
    color: "#1e3a8a",
  },
  logWarn: {
    backgroundColor: "#fffbeb",
    borderColor: "#fde047",
    color: "#a16207",
  },
  logError: {
    backgroundColor: "#fef2f2",
    borderColor: "#fca5a5",
    color: "#b91c1c",
  },
  logType: {
    fontWeight: "600",
    marginRight: "8px",
  },
  emptyState: {
    color: "#6b7280",
    textAlign: "center",
    padding: "40px 20px",
    fontSize: "14px",
  },
};

export default function LogViewer({ api = "/api/log-stream" }) {
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const eventSource = new EventSource(api);
    
    eventSource.onopen = () => {
      setIsConnected(true);
      console.log("Connected to log stream");
    };
    
    eventSource.onmessage = (event) => {
      if (!event.data) return;
      try {
        const log = JSON.parse(event.data);
        setLogs((prev) => [...prev, log]);
      } catch (err) {
        console.error("Error parsing log:", err);
      }
    };
    
    eventSource.onerror = (error) => {
      console.error("EventSource error:", error);
      setIsConnected(false);
    };
    
    return () => {
      eventSource.close();
      setIsConnected(false);
    };
  }, [api]);

  const filteredLogs =
    filter === "ALL" ? logs : logs.filter((log) => log.type === filter);

  const getLogStyle = (type) => {
    switch (type) {
      case "ERROR":
        return { ...styles.logItem, ...styles.logError };
      case "WARN":
        return { ...styles.logItem, ...styles.logWarn };
      default:
        return { ...styles.logItem, ...styles.logInfo };
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.filterContainer}>
        {["ALL", "INFO", "WARN", "ERROR"].map((item) => (
          <button
            key={item}
            onClick={() => setFilter(item)}
            style={{
              ...styles.button,
              ...(filter === item ? styles.buttonActive : styles.buttonInactive),
            }}
            onMouseEnter={(e) => {
              if (filter !== item) {
                e.target.style.backgroundColor = "#f9fafb";
              }
            }}
            onMouseLeave={(e) => {
              if (filter !== item) {
                e.target.style.backgroundColor = "white";
              }
            }}
          >
            {item}
          </button>
        ))}
        
        <div style={{ 
          marginLeft: "auto", 
          display: "flex", 
          alignItems: "center", 
          gap: "8px",
          fontSize: "14px",
          color: "#6b7280",
        }}>
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: isConnected ? "#10b981" : "#ef4444",
            }}
          />
          {isConnected ? "Connected" : "Disconnected"}
        </div>
      </div>

      <div style={styles.logsContainer}>
        {filteredLogs.length === 0 ? (
          <div style={styles.emptyState}>
            {isConnected 
              ? "No logs yet. Waiting for log events..."
              : "Connecting to log stream..."}
          </div>
        ) : (
          filteredLogs.map((log, index) => (
            <div key={index} style={getLogStyle(log.type)}>
              <span style={styles.logType}>{log.type}</span>
              <span>— {log.message}</span>
              {log.time && (
                <span style={{ 
                  float: "right", 
                  fontSize: "12px", 
                  opacity: 0.7 
                }}>
                  {new Date(log.time).toLocaleTimeString()}
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}