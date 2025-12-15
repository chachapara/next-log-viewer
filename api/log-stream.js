// log-stream.js (in your npm package)
import { EventEmitter } from "events";

const emitter = new EventEmitter();

// Increase max listeners to avoid warnings
emitter.setMaxListeners(100);

export function pushLog(type, message) {
  console.log(`[LOG] ${type}: ${message}`);
  emitter.emit("log", { type, message, time: Date.now() });
}

// For Next.js App Router (Next.js 13+)
export function sseLogHandler(request) {
  console.log("New SSE connection established");
  
  const encoder = new TextEncoder();
  let isClosed = false;

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      try {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ 
            type: "INFO", 
            message: "Connected to log stream", 
            time: Date.now() 
          })}\n\n`)
        );
      } catch (err) {
        console.error("Error sending initial message:", err);
      }

      // Set up log listener
      const listener = (log) => {
        if (isClosed) return;
        
        try {
          const data = `data: ${JSON.stringify(log)}\n\n`;
          controller.enqueue(encoder.encode(data));
        } catch (err) {
          console.error("Error encoding log:", err);
        }
      };

      emitter.on("log", listener);

      // Keep-alive heartbeat (every 15 seconds)
      const heartbeat = setInterval(() => {
        if (isClosed) {
          clearInterval(heartbeat);
          return;
        }
        
        try {
          controller.enqueue(encoder.encode(": heartbeat\n\n"));
        } catch (err) {
          console.error("Heartbeat error:", err);
          clearInterval(heartbeat);
        }
      }, 15000);

      // Handle client disconnect
      request.signal.addEventListener("abort", () => {
        console.log("Client disconnected");
        isClosed = true;
        clearInterval(heartbeat);
        emitter.off("log", listener);
        
        try {
          controller.close();
        } catch (err) {
          // Controller already closed
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

// For Next.js Pages Router (Next.js 12 and below)
export function sseLogHandlerPages(req, res) {
  console.log("New SSE connection established (Pages Router)");

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");

  // Send initial connection message
  res.write(`data: ${JSON.stringify({ 
    type: "INFO", 
    message: "Connected to log stream", 
    time: Date.now() 
  })}\n\n`);

  const listener = (log) => {
    try {
      res.write(`data: ${JSON.stringify(log)}\n\n`);
    } catch (err) {
      console.error("Error writing log:", err);
    }
  };

  emitter.on("log", listener);

  // Keep-alive heartbeat
  const heartbeat = setInterval(() => {
    try {
      res.write(": heartbeat\n\n");
    } catch (err) {
      clearInterval(heartbeat);
    }
  }, 15000);

  // Handle client disconnect
  req.on("close", () => {
    console.log("Client disconnected");
    clearInterval(heartbeat);
    emitter.off("log", listener);
    res.end();
  });
}