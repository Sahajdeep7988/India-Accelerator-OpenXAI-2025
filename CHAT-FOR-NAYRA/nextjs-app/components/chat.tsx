"use client";

import { siteConfig } from "@/config/site";
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input.trim(),
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to get response from AI");
      }

      const data = await response.json();
      const assistantMessage: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      setError(err.message);
      setTimeout(() => setError(""), 5000); // Clear error after 5 seconds
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!loading) {
        handleSend();
      }
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chat-container">
      <style jsx>{`
        .chat-container {
          display: flex;
          flex-direction: column;
          height: 100vh;
          max-width: 1200px;
          margin: 0 auto;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
        }

        .chat-header {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          padding: 1.5rem 2rem;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
          box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .logo {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 1.2rem;
        }

        .header-text h1 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 700;
          color: #1a202c;
          background: linear-gradient(135deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .header-text p {
          margin: 0.25rem 0 0 0;
          color: #718096;
          font-size: 0.875rem;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-left: auto;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #48bb78;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .status-text {
          color: #48bb78;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .messages-container::-webkit-scrollbar {
          width: 6px;
        }

        .messages-container::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }

        .messages-container::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
        }

        .message {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          max-width: 80%;
        }

        .message.user {
          align-self: flex-end;
          flex-direction: row-reverse;
        }

        .message.assistant {
          align-self: flex-start;
        }

        .message-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 0.875rem;
          flex-shrink: 0;
        }

        .message.user .message-avatar {
          background: linear-gradient(135deg, #4fd1c7, #14b8a6);
          color: white;
        }

        .message.assistant .message-avatar {
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          color: white;
        }

        .message-content {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          padding: 1rem 1.25rem;
          border-radius: 1.5rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          position: relative;
          word-wrap: break-word;
          line-height: 1.5;
        }

        .message.user .message-content {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
        }

        .message.assistant .message-content {
          background: rgba(255, 255, 255, 0.95);
          color: #1a202c;
        }

        .message-time {
          font-size: 0.75rem;
          opacity: 0.7;
          margin-top: 0.5rem;
        }

        /* Markdown Styles for AI Messages */
        .user-message-text {
          white-space: pre-wrap;
        }

        .markdown-h1 {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 1rem 0 0.75rem 0;
          color: #1a202c;
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 0.5rem;
        }

        .markdown-h2 {
          font-size: 1.375rem;
          font-weight: 600;
          margin: 1rem 0 0.75rem 0;
          color: #2d3748;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 0.25rem;
        }

        .markdown-h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0.875rem 0 0.5rem 0;
          color: #4a5568;
        }

        .markdown-h4 {
          font-size: 1.125rem;
          font-weight: 600;
          margin: 0.75rem 0 0.5rem 0;
          color: #4a5568;
        }

        .markdown-p {
          margin: 0.75rem 0;
          line-height: 1.6;
          color: #2d3748;
        }

        .markdown-strong {
          font-weight: 700;
          color: #1a202c;
        }

        .markdown-em {
          font-style: italic;
          color: #4a5568;
        }

        .markdown-inline-code {
          background: #f7fafc;
          color: #d53f8c;
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
          font-size: 0.875rem;
          border: 1px solid #e2e8f0;
        }

        .markdown-pre {
          background: #2d3748;
          color: #e2e8f0;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1rem 0;
          border-left: 4px solid #667eea;
        }

        .markdown-code-block {
          font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
          font-size: 0.875rem;
          line-height: 1.4;
        }

        .markdown-ul {
          margin: 0.75rem 0;
          padding-left: 1.5rem;
        }

        .markdown-ol {
          margin: 0.75rem 0;
          padding-left: 1.5rem;
        }

        .markdown-li {
          margin: 0.25rem 0;
          line-height: 1.5;
        }

        .markdown-blockquote {
          border-left: 4px solid #667eea;
          background: #f7fafc;
          padding: 0.75rem 1rem;
          margin: 1rem 0;
          border-radius: 0 0.375rem 0.375rem 0;
          font-style: italic;
        }

        .markdown-blockquote p {
          margin: 0;
        }

        .markdown-hr {
          border: none;
          height: 2px;
          background: linear-gradient(90deg, #667eea, #764ba2);
          margin: 1.5rem 0;
          border-radius: 1px;
        }

        .markdown-link {
          color: #667eea;
          text-decoration: underline;
          font-weight: 500;
          transition: color 0.2s ease;
        }

        .markdown-link:hover {
          color: #764ba2;
        }

        .markdown-table {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0;
          border-radius: 0.5rem;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .markdown-thead {
          background: #667eea;
          color: white;
        }

        .markdown-th {
          padding: 0.75rem;
          text-align: left;
          font-weight: 600;
        }

        .markdown-td {
          padding: 0.75rem;
          border-bottom: 1px solid #e2e8f0;
        }

        .markdown-tr:nth-child(even) {
          background: #f7fafc;
        }

        .markdown-tr:hover {
          background: #edf2f7;
        }

        .error-message {
          background: rgba(254, 226, 226, 0.95);
          color: #c53030;
          padding: 1rem;
          border-radius: 0.75rem;
          text-align: center;
          margin: 1rem 2rem;
          border: 1px solid rgba(252, 165, 165, 0.5);
        }

        .typing-indicator {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          max-width: 80%;
          align-self: flex-start;
        }

        .typing-dots {
          background: rgba(255, 255, 255, 0.95);
          padding: 1rem 1.25rem;
          border-radius: 1.5rem;
          display: flex;
          gap: 0.25rem;
        }

        .typing-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #a0aec0;
          animation: typing 1.4s infinite;
        }

        .typing-dot:nth-child(2) {
          animation-delay: 0.2s;
        }

        .typing-dot:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes typing {
          0%, 60%, 100% {
            transform: translateY(0);
          }
          30% {
            transform: translateY(-10px);
          }
        }

        .input-container {
          padding: 1.5rem 2rem 2rem;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-top: 1px solid rgba(0, 0, 0, 0.1);
        }

        .input-wrapper {
          display: flex;
          gap: 1rem;
          align-items: flex-end;
          max-width: 100%;
        }

        .input-field {
          flex: 1;
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 1.5rem;
          padding: 1rem 1.25rem;
          font-size: 1rem;
          transition: all 0.2s ease;
          resize: none;
          min-height: 50px;
          max-height: 120px;
          font-family: inherit;
        }

        .input-field:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .input-field:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .send-button {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border: none;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: 600;
          flex-shrink: 0;
        }

        .send-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
        }

        .send-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .empty-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: rgba(255, 255, 255, 0.8);
          gap: 1rem;
        }

        .empty-state-icon {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
        }

        .empty-state h3 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 600;
        }

        .empty-state p {
          margin: 0;
          opacity: 0.8;
          max-width: 400px;
          line-height: 1.6;
        }

        @media (max-width: 768px) {
          .chat-header {
            padding: 1rem;
          }
          
          .header-text h1 {
            font-size: 1.25rem;
          }
          
          .messages-container {
            padding: 1rem;
          }
          
          .message {
            max-width: 90%;
          }
          
          .input-container {
            padding: 1rem;
          }
        }
      `}</style>

      {/* Header */}
      <div className="chat-header">
        <div className="header-content">
          <div className="logo">AI</div>
          <div className="header-text">
            <h1>{siteConfig.name}</h1>
            <p>Powered by OpenxAI Platform</p>
          </div>
          <div className="status-indicator">
            <div className="status-dot"></div>
            <span className="status-text">Online</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🤖</div>
            <h3>Welcome to {siteConfig.name}</h3>
            <p>
              I'm your AI assistant, ready to help you with questions, tasks, and conversations. 
              Start by typing a message below!
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div key={message.id} className={`message ${message.role}`}>
                <div className="message-avatar">
                  {message.role === "user" ? "YOU" : "AI"}
                </div>
                <div className="message-content">
                  {message.role === "assistant" ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeHighlight]}
                      components={{
                        h1: ({ children }) => <h1 className="markdown-h1">{children}</h1>,
                        h2: ({ children }) => <h2 className="markdown-h2">{children}</h2>,
                        h3: ({ children }) => <h3 className="markdown-h3">{children}</h3>,
                        h4: ({ children }) => <h4 className="markdown-h4">{children}</h4>,
                        p: ({ children }) => <p className="markdown-p">{children}</p>,
                        strong: ({ children }) => <strong className="markdown-strong">{children}</strong>,
                        em: ({ children }) => <em className="markdown-em">{children}</em>,
                        code: ({ inline, children, ...props }: any) => 
                          inline ? (
                            <code className="markdown-inline-code">{children}</code>
                          ) : (
                            <code className="markdown-code-block">{children}</code>
                          ),
                        pre: ({ children }) => <pre className="markdown-pre">{children}</pre>,
                        ul: ({ children }) => <ul className="markdown-ul">{children}</ul>,
                        ol: ({ children }) => <ol className="markdown-ol">{children}</ol>,
                        li: ({ children }) => <li className="markdown-li">{children}</li>,
                        blockquote: ({ children }) => <blockquote className="markdown-blockquote">{children}</blockquote>,
                        hr: () => <hr className="markdown-hr" />,
                        a: ({ href, children }) => (
                          <a href={href} className="markdown-link" target="_blank" rel="noopener noreferrer">
                            {children}
                          </a>
                        ),
                        table: ({ children }) => <table className="markdown-table">{children}</table>,
                        thead: ({ children }) => <thead className="markdown-thead">{children}</thead>,
                        tbody: ({ children }) => <tbody className="markdown-tbody">{children}</tbody>,
                        tr: ({ children }) => <tr className="markdown-tr">{children}</tr>,
                        th: ({ children }) => <th className="markdown-th">{children}</th>,
                        td: ({ children }) => <td className="markdown-td">{children}</td>,
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  ) : (
                    <span className="user-message-text">{message.content}</span>
                  )}
                  <div className="message-time">
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="typing-indicator">
                <div className="message-avatar" style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}>AI</div>
                <div className="typing-dots">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Input */}
      <div className="input-container">
        <div className="input-wrapper">
          <textarea
            className="input-field"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={loading}
            placeholder="Type your message here... (Press Enter to send)"
            rows={1}
          />
          <button
            className="send-button"
            onClick={handleSend}
            disabled={loading || !input.trim()}
            title="Send message"
          >
            {loading ? "..." : "→"}
          </button>
        </div>
      </div>
    </div>
  );
}
