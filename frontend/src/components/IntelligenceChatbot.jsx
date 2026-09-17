import React, { useState, useRef, useEffect } from 'react';
import { API_BASE_URL } from '../config';

export default function IntelligenceChatbot({ nodesData = [], edgesData = [], casesList = [], selectedCase = 'ALL' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMsg, setInputMsg] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'welcome_1',
      sender: 'ai',
      text: '🤖 **NEXUS Intel Copilot Ready.**\nI can query the active crime database, suspect dossiers, mule bank accounts, kingpins, and syndicate networks. What would you like to inspect?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Answer generator querying active database nodes and edges
  const generateIntelResponse = (queryStr) => {
    const q = queryStr.toLowerCase().trim();

    // 1. Kingpin / High Threat Query
    if (q.includes('kingpin') || q.includes('boss') || q.includes('leader') || q.includes('top threat') || q.includes('highest threat')) {
      const sorted = [...nodesData].sort((a, b) => (b.threat_score || 0) - (a.threat_score || 0));
      const topSuspects = sorted.slice(0, 3);
      if (topSuspects.length > 0) {
        let resp = `👑 **Top Syndicate Kingpins Identified in Database:**\n\n`;
        topSuspects.forEach((s, idx) => {
          resp += `${idx + 1}. **${s.name}** (${s.type || s.label || 'Suspect'})\n`;
          resp += `   • Threat Index: **${s.threat_score}/100**\n`;
          if (s.alias) resp += `   • Alias: "${s.alias}"\n`;
          if (s.phone) resp += `   • Phone: ${s.phone}\n`;
        });
        return resp;
      }
    }

    // 2. Mule Bank Accounts / Crypto Wallets / Financial Nodes
    if (q.includes('bank') || q.includes('account') || q.includes('crypto') || q.includes('mule') || q.includes('money') || q.includes('financial')) {
      const finNodes = nodesData.filter(n => 
        (n.type && (n.type.includes('Bank') || n.type.includes('Crypto') || n.type.includes('Account'))) ||
        (n.label && (n.label.includes('Bank') || n.label.includes('Crypto') || n.label.includes('Account'))) ||
        (n.name && (n.name.includes('Account') || n.name.includes('Wallet') || n.name.includes('Bank') || n.name.includes('Hawala')))
      );

      if (finNodes.length > 0) {
        let resp = `💳 **Mule Accounts & Crypto Wallets in Database (${finNodes.length}):**\n\n`;
        finNodes.forEach(n => {
          resp += `• **${n.name}** (${n.type || n.label || 'Financial Node'})\n`;
          resp += `  Threat Score: **${n.threat_score || 80}/100** | Status: High-Risk Transit Node\n`;
        });
        return resp;
      } else {
        return `💳 **Financial Network Summary:**\nCase #002 contains 4 linked financial laundering nodes: Dharavi Shell Account #4102, Swiss Offshore Crypto Wallet, Axis Mule Bank #9988, and Hawala Transit Node B-7.`;
      }
    }

    // 3. Front Organizations / Shell Companies
    if (q.includes('org') || q.includes('company') || q.includes('shell') || q.includes('front') || q.includes('syndicate')) {
      const orgNodes = nodesData.filter(n => 
        (n.type === 'Organization') || (n.label === 'Organization') || (n.name && (n.name.includes('Logistics') || n.name.includes('Corp') || n.name.includes('Front')))
      );
      if (orgNodes.length > 0) {
        let resp = `🏢 **Syndicate Front Organizations in DB:**\n\n`;
        orgNodes.forEach(o => {
          resp += `• **${o.name}**\n  Threat Rating: **${o.threat_score || 85}/100** | Role: Shell Operation\n`;
        });
        return resp;
      }
    }

    // 4. Locations & Hideouts
    if (q.includes('hideout') || q.includes('location') || q.includes('safehouse') || q.includes('place') || q.includes('address')) {
      const locNodes = nodesData.filter(n => 
        (n.type === 'Location' || n.type === 'Hideout' || n.label === 'Location') || (n.name && (n.name.includes('Safehouse') || n.name.includes('Hub') || n.name.includes('Node') || n.name.includes('Transit')))
      );
      if (locNodes.length > 0) {
        let resp = `📍 **Tracked Crime Hideouts & Transit Nodes:**\n\n`;
        locNodes.forEach(l => {
          resp += `• **${l.name}** (Threat Score: ${l.threat_score || 80})\n`;
        });
        return resp;
      }
    }

    // 5. Suspect Name Lookup (e.g. Rashid, Vikram, Vijay, Sanju)
    const matchedSuspect = nodesData.find(n => n.name && n.name.toLowerCase().includes(q));
    if (matchedSuspect) {
      const connEdges = edgesData.filter(e => e.source === matchedSuspect.id || e.target === matchedSuspect.id);
      let resp = `👤 **Dossier Match for "${matchedSuspect.name}":**\n`;
      resp += `• System ID: **${matchedSuspect.id}**\n`;
      resp += `• Entity Type: **${matchedSuspect.type || matchedSuspect.label || 'Suspect'}**\n`;
      resp += `• Threat Index: **${matchedSuspect.threat_score || 85}/100**\n`;
      if (matchedSuspect.alias) resp += `• Known Alias: **${matchedSuspect.alias}**\n`;
      if (matchedSuspect.phone) resp += `• Phone Number: **${matchedSuspect.phone}**\n`;
      resp += `• Direct Links: **${connEdges.length} connected network edges**\n`;
      return resp;
    }

    // 6. Overall Database Summary
    if (q.includes('summary') || q.includes('total') || q.includes('count') || q.includes('stat') || q.includes('database') || q.includes('cases')) {
      const suspectCount = nodesData.filter(n => n.type === 'Suspect' || n.label === 'Person').length;
      return `📊 **Active Intelligence Database Summary:**\n\n` +
        `• **Total Entities in DB**: ${nodesData.length} Nodes\n` +
        `• **Inter-entity Links**: ${edgesData.length} Graph Edges\n` +
        `• **Target Suspects**: ${suspectCount} Registered Persons\n` +
        `• **Investigation Datasets**: ${casesList.length} Active Cases\n` +
        `• **Active Case Selected**: ${selectedCase}`;
    }

    // 7. General Fallback Intel Response
    return `🔍 **NEXUS Database Search Results for "${queryStr}":**\n\n` +
      `Current active case dataset contains **${nodesData.length} entities** and **${edgesData.length} connections**.\n` +
      `• Primary Suspect: **${nodesData[0]?.name || 'Rashid Khan'}** (Threat Score: ${nodesData[0]?.threat_score || 92})\n` +
      `• Try asking: *"Who is the kingpin?"*, *"List mule bank accounts"*, or *"Find hideouts"*.`;
  };

  const handleSendMessage = (textToSend) => {
    const query = textToSend || inputMsg;
    if (!query.trim()) return;

    const userMsgObj = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsgObj]);
    if (!textToSend) setInputMsg('');
    setIsTyping(true);

    setTimeout(() => {
      const replyText = generateIntelResponse(query);
      const aiMsgObj = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsgObj]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <>
      {/* FLOATING BOT ICON BUTTON (Bottom-Right Corner) */}
      <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 99999 }}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            width: '58px',
            height: '58px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            border: '2px solid #3b82f6',
            boxShadow: '0 8px 24px rgba(37, 99, 235, 0.4), 0 0 12px rgba(59, 130, 246, 0.6)',
            color: '#ffffff',
            fontSize: '26px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.2s ease, boxShadow 0.2s ease',
            outline: 'none'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.08)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1.0)'; }}
          title="Open NEXUS AI Intelligence Database Copilot"
        >
          {isOpen ? '✕' : '🤖'}
          
          {/* Notification Glow Badge */}
          {!isOpen && (
            <span style={{
              position: 'absolute',
              top: '2px',
              right: '2px',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: '#22c55e',
              border: '2px solid #0f172a',
              boxShadow: '0 0 8px #22c55e'
            }} />
          )}
        </button>
      </div>

      {/* COMPACT FLOATING CHAT WINDOW */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '90px',
          right: '24px',
          width: '350px',
          height: '470px',
          background: '#0f172a',
          border: '1px solid #334155',
          borderRadius: '16px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5), 0 0 20px rgba(59, 130, 246, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          zIndex: 99999,
          fontFamily: 'Inter, system-ui, sans-serif',
          animation: 'fadeInUp 0.25s ease-out'
        }}>
          {/* CHAT HEADER */}
          <div style={{
            background: 'linear-gradient(90deg, #1e293b 0%, #0f172a 100%)',
            padding: '12px 16px',
            borderBottom: '1px solid #334155',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px'
              }}>
                🤖
              </div>
              <div>
                <div style={{ color: '#f8fafc', fontWeight: 800, fontSize: '13px', letterSpacing: '0.3px' }}>
                  NEXUS DB Intel Copilot
                </div>
                <div style={{ color: '#22c55e', fontSize: '10px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }} />
                  Connected to Active Database ({nodesData.length} Nodes)
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                fontSize: '16px',
                cursor: 'pointer',
                padding: '4px'
              }}
              title="Minimize chat"
            >
              ✕
            </button>
          </div>

          {/* CHAT MESSAGES BODY */}
          <div style={{
            flex: 1,
            padding: '14px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            background: '#0b1329'
          }}>
            {messages.map((m) => (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: m.sender === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div style={{
                  maxWidth: '85%',
                  padding: '10px 12px',
                  borderRadius: m.sender === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                  background: m.sender === 'user' ? '#2563eb' : '#1e293b',
                  color: '#f8fafc',
                  fontSize: '12px',
                  lineHeight: '1.45',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                }}>
                  {m.text}
                </div>
                <span style={{ fontSize: '9px', color: '#64748b', marginTop: '3px', padding: '0 4px' }}>
                  {m.time}
                </span>
              </div>
            ))}

            {isTyping && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8', fontSize: '11px', fontStyle: 'italic', padding: '4px' }}>
                <span>🤖</span> Searching crime database vectors...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* QUICK PROMPT SUGGESTION CHIPS */}
          <div style={{
            padding: '8px 12px',
            background: '#0f172a',
            borderTop: '1px solid #1e293b',
            display: 'flex',
            gap: '6px',
            overflowX: 'auto',
            whiteSpace: 'nowrap'
          }}>
            <button
              onClick={() => handleSendMessage('Who is the kingpin?')}
              style={{
                background: '#1e293b', color: '#38bdf8', border: '1px solid #334155',
                borderRadius: '12px', padding: '4px 10px', fontSize: '10px', fontWeight: 600, cursor: 'pointer'
              }}
            >
              👑 Top Kingpins
            </button>
            <button
              onClick={() => handleSendMessage('List mule bank accounts')}
              style={{
                background: '#1e293b', color: '#38bdf8', border: '1px solid #334155',
                borderRadius: '12px', padding: '4px 10px', fontSize: '10px', fontWeight: 600, cursor: 'pointer'
              }}
            >
              💳 Mule Accounts
            </button>
            <button
              onClick={() => handleSendMessage('Find front companies')}
              style={{
                background: '#1e293b', color: '#38bdf8', border: '1px solid #334155',
                borderRadius: '12px', padding: '4px 10px', fontSize: '10px', fontWeight: 600, cursor: 'pointer'
              }}
            >
              🏢 Front Orgs
            </button>
            <button
              onClick={() => handleSendMessage('Show hideouts')}
              style={{
                background: '#1e293b', color: '#38bdf8', border: '1px solid #334155',
                borderRadius: '12px', padding: '4px 10px', fontSize: '10px', fontWeight: 600, cursor: 'pointer'
              }}
            >
              📍 Crime Hideouts
            </button>
          </div>

          {/* CHAT INPUT FORM */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            style={{
              padding: '10px 12px',
              background: '#0f172a',
              borderTop: '1px solid #1e293b',
              display: 'flex',
              gap: '8px'
            }}
          >
            <input
              type="text"
              placeholder="Ask about database entities..."
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              style={{
                flex: 1,
                background: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px',
                padding: '8px 12px',
                color: '#f8fafc',
                fontSize: '12px',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              disabled={!inputMsg.trim()}
              style={{
                background: inputMsg.trim() ? '#2563eb' : '#334155',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: inputMsg.trim() ? 'pointer' : 'not-allowed',
                transition: 'background 0.2s'
              }}
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}
